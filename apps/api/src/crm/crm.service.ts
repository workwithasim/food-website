import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface CustomerMetrics {
  totalSpentMinor: bigint;
  orderCount: number;
  averageOrderValueMinor: bigint;
  lastOrderDate: Date | null;
}

@Injectable()
export class CrmService {
  constructor(private db: DatabaseService) {}

  async listCustomers(
    tenantId: string,
    query?: {
      search?: string;
      tagId?: string;
      isBlocked?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { tenant_id: tenantId };
    if (query?.isBlocked !== undefined) {
      whereClause.is_blocked = query.isBlocked;
    }
    if (query?.tagId) {
      whereClause.tags = { some: { tag_id: query.tagId } };
    }
    if (query?.search) {
      whereClause.OR = [
        { first_name: { contains: query.search, mode: 'insensitive' } },
        { last_name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.db.customer.findMany({
        where: whereClause,
        include: {
          tags: { include: { tag: true } },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.db.customer.count({ where: whereClause }),
    ]);

    // Compute basic tenant-scoped metrics for each customer
    const customerIds = customers.map((c) => c.id);
    const orders = await this.db.order.findMany({
      where: {
        tenant_id: tenantId,
        customer_id: { in: customerIds },
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
      select: {
        customer_id: true,
        grand_total_minor: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const metricsMap = new Map<string, { totalSpent: bigint; count: number; lastDate: Date | null }>();
    for (const order of orders) {
      if (!order.customer_id) continue;
      const current = metricsMap.get(order.customer_id) || { totalSpent: BigInt(0), count: 0, lastDate: null };
      current.totalSpent += BigInt(order.grand_total_minor);
      current.count += 1;
      if (!current.lastDate) {
        current.lastDate = order.created_at;
      }
      metricsMap.set(order.customer_id, current);
    }

    const items = customers.map((c) => {
      const stats = metricsMap.get(c.id) || { totalSpent: BigInt(0), count: 0, lastDate: null };
      const avgAov = stats.count > 0 ? stats.totalSpent / BigInt(stats.count) : BigInt(0);
      return {
        id: c.id,
        tenant_id: c.tenant_id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        is_verified: c.is_verified,
        is_blocked: c.is_blocked,
        blocked_reason: c.blocked_reason,
        blocked_at: c.blocked_at,
        created_at: c.created_at,
        tags: c.tags.map((t) => t.tag),
        metrics: {
          totalSpentMinor: stats.totalSpent.toString(),
          orderCount: stats.count,
          averageOrderValueMinor: avgAov.toString(),
          lastOrderDate: stats.lastDate,
        },
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCustomerDetail(
    tenantId: string,
    customerId: string,
    actor?: { userId?: string; canViewPii?: boolean },
  ) {
    const customer = await this.db.customer.findFirst({
      where: { id: customerId, tenant_id: tenantId },
      include: {
        tags: { include: { tag: true } },
        favorites: { include: { product: true } },
        reviews: { take: 10, orderBy: { created_at: 'desc' } },
        support_tickets: { take: 5, orderBy: { created_at: 'desc' } },
        audit_logs: { take: 10, orderBy: { created_at: 'desc' } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Tenant-scoped lifetime metrics
    const orders = await this.db.order.findMany({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
      select: {
        grand_total_minor: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    let totalSpent = BigInt(0);
    for (const ord of orders) {
      totalSpent += BigInt(ord.grand_total_minor);
    }
    const orderCount = orders.length;
    const avgAov = orderCount > 0 ? totalSpent / BigInt(orderCount) : BigInt(0);
    const lastOrderDate = orders.length > 0 ? (orders[0]?.created_at ?? null) : null;

    // Privacy-aware PII masking
    const canViewPii = actor?.canViewPii ?? false;
    let email = customer.email;
    let phone = customer.phone;

    if (!canViewPii) {
      if (email) {
        const parts = email.split('@');
        const userPart = parts[0] || '';
        const domain = parts[1] || '';
        email = `${userPart.slice(0, 1)}***@${domain}`;
      }
      if (phone) {
        phone = `***-***-${phone.slice(-4)}`;
      }
    } else if (actor?.userId) {
      // Log unmasked PII view access audit
      await this.db.customerAuditLog.create({
        data: {
          tenant_id: tenantId,
          customer_id: customerId,
          actor_id: actor.userId,
          action: 'VIEW_PII',
          reason: 'Authorized staff accessed customer PII',
        },
      });
    }

    return {
      ...customer,
      email,
      phone,
      tags: customer.tags.map((t) => t.tag),
      metrics: {
        totalSpentMinor: totalSpent.toString(),
        orderCount,
        averageOrderValueMinor: avgAov.toString(),
        lastOrderDate,
      },
    };
  }

  async blockCustomer(tenantId: string, customerId: string, actorUserId: string, reason: string) {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('A reason is required to block a customer');
    }

    const customer = await this.db.customer.findFirst({
      where: { id: customerId, tenant_id: tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const updated = await this.db.$transaction(async (tx) => {
      const c = await tx.customer.update({
        where: { id: customerId },
        data: {
          is_blocked: true,
          blocked_reason: reason,
          blocked_at: new Date(),
          blocked_by_user_id: actorUserId,
        },
      });

      await tx.customerAuditLog.create({
        data: {
          tenant_id: tenantId,
          customer_id: customerId,
          actor_id: actorUserId,
          action: 'BLOCK',
          reason,
        },
      });

      return c;
    });

    return updated;
  }

  async unblockCustomer(tenantId: string, customerId: string, actorUserId: string, reason?: string) {
    const customer = await this.db.customer.findFirst({
      where: { id: customerId, tenant_id: tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const updated = await this.db.$transaction(async (tx) => {
      const c = await tx.customer.update({
        where: { id: customerId },
        data: {
          is_blocked: false,
          blocked_reason: null,
          blocked_at: null,
          blocked_by_user_id: null,
        },
      });

      await tx.customerAuditLog.create({
        data: {
          tenant_id: tenantId,
          customer_id: customerId,
          actor_id: actorUserId,
          action: 'UNBLOCK',
          reason: reason || 'Unblocked by staff',
        },
      });

      return c;
    });

    return updated;
  }

  async createTag(tenantId: string, name: string, color?: string) {
    return this.db.customerTag.create({
      data: {
        tenant_id: tenantId,
        name: name.trim(),
        color: color || '#3B82F6',
      },
    });
  }

  async listTags(tenantId: string) {
    return this.db.customerTag.findMany({
      where: { tenant_id: tenantId },
      include: {
        _count: { select: { assignments: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async assignTag(tenantId: string, customerId: string, tagId: string) {
    const [customer, tag] = await Promise.all([
      this.db.customer.findFirst({ where: { id: customerId, tenant_id: tenantId } }),
      this.db.customerTag.findFirst({ where: { id: tagId, tenant_id: tenantId } }),
    ]);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!tag) throw new NotFoundException('Tag not found');

    return this.db.customerTagAssignment.upsert({
      where: {
        tag_id_customer_id: { tag_id: tagId, customer_id: customerId },
      },
      create: {
        tag_id: tagId,
        customer_id: customerId,
      },
      update: {},
    });
  }

  async removeTag(tenantId: string, customerId: string, tagId: string) {
    const customer = await this.db.customer.findFirst({
      where: { id: customerId, tenant_id: tenantId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    return this.db.customerTagAssignment.deleteMany({
      where: {
        tag_id: tagId,
        customer_id: customerId,
      },
    });
  }
}
