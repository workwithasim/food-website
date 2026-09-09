import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface CreateAuditLogDto {
  actorId: string;
  actorType?: 'STAFF' | 'SYSTEM' | 'CUSTOMER' | 'RIDER';
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private db: DatabaseService) {}

  async log(tenantId: string, dto: CreateAuditLogDto) {
    if (!dto.action || !dto.entityType || !dto.entityId) {
      throw new BadRequestException('action, entityType, and entityId are required');
    }

    return this.db.auditLog.create({
      data: {
        tenant_id: tenantId,
        actor_id: dto.actorId,
        actor_type: dto.actorType || 'STAFF',
        action: dto.action,
        entity_type: dto.entityType,
        entity_id: dto.entityId,
        details: dto.details ?? null,
        ip_address: dto.ipAddress,
        user_agent: dto.userAgent,
      },
    });
  }

  async list(
    tenantId: string,
    filter?: {
      entityType?: string;
      entityId?: string;
      actorId?: string;
      action?: string;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = { tenant_id: tenantId };
    if (filter?.entityType) where.entity_type = filter.entityType;
    if (filter?.entityId) where.entity_id = filter.entityId;
    if (filter?.actorId) where.actor_id = filter.actorId;
    if (filter?.action) where.action = { contains: filter.action, mode: 'insensitive' };

    if (filter?.fromDate || filter?.toDate) {
      where.created_at = {};
      if (filter.fromDate) where.created_at.gte = filter.fromDate;
      if (filter.toDate) where.created_at.lte = filter.toDate;
    }

    const [items, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.db.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
