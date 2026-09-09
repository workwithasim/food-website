import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ReportFilterDto {
  branchId?: string;
  startDate: string;
  endDate: string;
}

@Injectable()
export class ReportingService {
  constructor(private db: DatabaseService) {}

  private validateDateRange(startDateStr: string, endDateStr: string): { start: Date; end: Date } {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Expected ISO strings (YYYY-MM-DD)');
    }

    if (start > end) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }

    // Acceptance Criteria: Large ranges bounded (max 366 days)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 366) {
      throw new BadRequestException('Date range cannot exceed 366 days');
    }

    return { start, end };
  }

  private validateBranchAccess(user: any, requestedBranchId?: string): string | undefined {
    if (user.role === 'OWNER' || user.role === 'ADMIN' || !user.branchId) {
      return requestedBranchId;
    }
    // Acceptance Criteria: Branch filters honor permissions
    if (requestedBranchId && requestedBranchId !== user.branchId) {
      throw new ForbiddenException('You do not have access to reports for this branch');
    }
    return user.branchId;
  }

  async getSalesReport(tenantId: string, filter: ReportFilterDto, user: any) {
    const { start, end } = this.validateDateRange(filter.startDate, filter.endDate);
    const branchId = this.validateBranchAccess(user, filter.branchId);

    const where: any = {
      tenant_id: tenantId,
      created_at: { gte: start, lte: end },
    };
    if (branchId) {
      where.branch_id = branchId;
    }

    const orders = await this.db.order.findMany({
      where,
      select: {
        id: true,
        order_number: true,
        status: true,
        payment_status: true,
        subtotal_minor: true,
        grand_total_minor: true,
        paid_minor: true,
        refunded_minor: true,
        item_discount_minor: true,
        promotion_discount_minor: true,
        coupon_discount_minor: true,
        delivery_fee_minor: true,
        tax_minor: true,
        tip_minor: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });

    let grossSalesMinor = BigInt(0);
    let netSalesMinor = BigInt(0);
    let totalRefundsMinor = BigInt(0);
    let totalDiscountsMinor = BigInt(0);
    let completedOrders = 0;
    let cancelledOrders = 0;

    for (const ord of orders) {
      const discounts =
        BigInt(ord.item_discount_minor) +
        BigInt(ord.promotion_discount_minor) +
        BigInt(ord.coupon_discount_minor);
      totalDiscountsMinor += discounts;

      if (ord.status === 'CANCELLED' || ord.status === 'REJECTED') {
        cancelledOrders++;
        continue;
      }

      if (ord.status === 'DELIVERED' || ord.payment_status === 'PAID') {
        completedOrders++;
        grossSalesMinor += BigInt(ord.grand_total_minor);
        const refunds = BigInt(ord.refunded_minor);
        totalRefundsMinor += refunds;
        netSalesMinor += BigInt(ord.grand_total_minor) - refunds;
      }
    }

    const averageOrderValueMinor =
      completedOrders > 0 ? grossSalesMinor / BigInt(completedOrders) : BigInt(0);

    return {
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      summary: {
        totalOrders: orders.length,
        completedOrders,
        cancelledOrders,
        grossSalesMinor: grossSalesMinor.toString(),
        netSalesMinor: netSalesMinor.toString(),
        totalDiscountsMinor: totalDiscountsMinor.toString(),
        totalRefundsMinor: totalRefundsMinor.toString(),
        averageOrderValueMinor: averageOrderValueMinor.toString(),
      },
    };
  }

  async getRevenueByBranch(tenantId: string, filter: ReportFilterDto, user: any) {
    const { start, end } = this.validateDateRange(filter.startDate, filter.endDate);
    const branchId = this.validateBranchAccess(user, filter.branchId);

    const where: any = {
      tenant_id: tenantId,
      created_at: { gte: start, lte: end },
      status: { notIn: ['CANCELLED', 'REJECTED'] },
    };
    if (branchId) where.branch_id = branchId;

    const [orders, branches] = await Promise.all([
      this.db.order.findMany({
        where,
        select: {
          branch_id: true,
          grand_total_minor: true,
          refunded_minor: true,
        },
      }),
      this.db.branch.findMany({
        where: { tenant_id: tenantId, ...(branchId ? { id: branchId } : {}) },
        select: { id: true, name: true, code: true },
      }),
    ]);

    const branchMap = new Map(branches.map((b) => [b.id, b]));
    const resultMap = new Map<string, { orderCount: number; grossMinor: bigint; refundMinor: bigint }>();

    for (const ord of orders) {
      const cur = resultMap.get(ord.branch_id) || {
        orderCount: 0,
        grossMinor: BigInt(0),
        refundMinor: BigInt(0),
      };
      cur.orderCount++;
      cur.grossMinor += BigInt(ord.grand_total_minor);
      cur.refundMinor += BigInt(ord.refunded_minor);
      resultMap.set(ord.branch_id, cur);
    }

    const breakdown = Array.from(resultMap.entries()).map(([bId, stat]) => {
      const bInfo = branchMap.get(bId);
      return {
        branchId: bId,
        branchName: bInfo?.name || 'Unknown',
        branchCode: bInfo?.code || '',
        orderCount: stat.orderCount,
        grossSalesMinor: stat.grossMinor.toString(),
        netSalesMinor: (stat.grossMinor - stat.refundMinor).toString(),
        refundsMinor: stat.refundMinor.toString(),
      };
    });

    return breakdown;
  }

  async getOperationsSla(tenantId: string, filter: ReportFilterDto, user: any) {
    const { start, end } = this.validateDateRange(filter.startDate, filter.endDate);
    const branchId = this.validateBranchAccess(user, filter.branchId);

    const where: any = {
      tenant_id: tenantId,
      created_at: { gte: start, lte: end },
      status: 'DELIVERED',
    };
    if (branchId) where.branch_id = branchId;

    const orders = await this.db.order.findMany({
      where,
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        history: {
          select: {
            to_status: true,
            created_at: true,
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    let totalPrepMinutes = 0;
    let prepCount = 0;
    let slaBreaches = 0;

    for (const ord of orders) {
      const confirmed = ord.history.find((h) => h.to_status === 'CONFIRMED' || h.to_status === 'PREPARING');
      const ready = ord.history.find((h) => h.to_status === 'READY');

      if (confirmed && ready) {
        const prepMin = Math.round((ready.created_at.getTime() - confirmed.created_at.getTime()) / 60000);
        if (prepMin >= 0) {
          totalPrepMinutes += prepMin;
          prepCount++;
          if (prepMin > 30) {
            slaBreaches++;
          }
        }
      }
    }

    const averagePrepTimeMinutes = prepCount > 0 ? Math.round(totalPrepMinutes / prepCount) : 0;

    return {
      totalDeliveredOrdersSampled: orders.length,
      averagePrepTimeMinutes,
      slaBreachesCount: slaBreaches,
      slaComplianceRate: prepCount > 0 ? Number((((prepCount - slaBreaches) / prepCount) * 100).toFixed(1)) : 100,
    };
  }

  async getCustomerCohorts(tenantId: string, filter: ReportFilterDto) {
    const { start, end } = this.validateDateRange(filter.startDate, filter.endDate);

    const ordersInPeriod = await this.db.order.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: start, lte: end },
        status: { notIn: ['CANCELLED', 'REJECTED'] },
        customer_id: { not: null },
      },
      select: {
        customer_id: true,
        created_at: true,
      },
    });

    const distinctCustomerIds = Array.from(new Set(ordersInPeriod.map((o) => o.customer_id as string)));

    const firstOrders = await this.db.order.groupBy({
      by: ['customer_id'],
      where: {
        tenant_id: tenantId,
        customer_id: { in: distinctCustomerIds },
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
      _min: {
        created_at: true,
      },
    });

    let newCustomers = 0;
    let returningCustomers = 0;

    for (const fo of firstOrders) {
      if (fo._min.created_at && fo._min.created_at >= start && fo._min.created_at <= end) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    }

    return {
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
      totalActiveCustomers: distinctCustomerIds.length,
      newCustomers,
      returningCustomers,
    };
  }

  async runFinancialReconciliation(tenantId: string, filter: ReportFilterDto, user: any) {
    const { start, end } = this.validateDateRange(filter.startDate, filter.endDate);
    const branchId = this.validateBranchAccess(user, filter.branchId);

    const where: any = {
      tenant_id: tenantId,
      created_at: { gte: start, lte: end },
    };
    if (branchId) where.branch_id = branchId;

    const orders = await this.db.order.findMany({
      where,
      select: {
        id: true,
        order_number: true,
        subtotal_minor: true,
        item_discount_minor: true,
        promotion_discount_minor: true,
        coupon_discount_minor: true,
        delivery_fee_minor: true,
        service_fee_minor: true,
        tax_minor: true,
        tip_minor: true,
        grand_total_minor: true,
        paid_minor: true,
        refunded_minor: true,
      },
    });

    let discrepancies: Array<{ orderId: string; orderNumber: string; expectedTotal: string; actualTotal: string }> = [];

    for (const ord of orders) {
      const subtotal = BigInt(ord.subtotal_minor);
      const delivery = BigInt(ord.delivery_fee_minor);
      const service = BigInt(ord.service_fee_minor);
      const tax = BigInt(ord.tax_minor);
      const tip = BigInt(ord.tip_minor);
      const discount =
        BigInt(ord.item_discount_minor) +
        BigInt(ord.promotion_discount_minor) +
        BigInt(ord.coupon_discount_minor);

      const calculatedGrandTotal = subtotal + delivery + service + tax + tip - discount;
      const actualGrandTotal = BigInt(ord.grand_total_minor);

      if (calculatedGrandTotal !== actualGrandTotal) {
        discrepancies.push({
          orderId: ord.id,
          orderNumber: ord.order_number,
          expectedTotal: calculatedGrandTotal.toString(),
          actualTotal: actualGrandTotal.toString(),
        });
      }
    }

    return {
      auditedOrderCount: orders.length,
      hasDiscrepancies: discrepancies.length > 0,
      discrepanciesCount: discrepancies.length,
      discrepancies,
    };
  }
}
