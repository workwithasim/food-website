import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';

export interface UpsertBranchProductDto {
  enabled?: boolean;
  sold_out?: boolean;
  price_override_minor?: number;
  preparation_time_override?: number;
  available_from?: string;
  available_until?: string;
}

@Injectable()
export class BranchProductsService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async getBranchCatalog(branchId: string) {
    // Get all active products for this tenant and merge branch overrides
    const [products, overrides] = await Promise.all([
      this.db.product.findMany({
        where: { tenant_id: this.tenantId, deleted_at: null, status: 'ACTIVE' },
        include: { media: { orderBy: { sort_order: 'asc' }, take: 1 }, category: true },
        orderBy: { created_at: 'asc' },
      }),
      this.db.branchProduct.findMany({
        where: { tenant_id: this.tenantId, branch_id: branchId },
      }),
    ]);

    const overrideMap = new Map(overrides.map(o => [o.product_id, o]));

    return products.map(p => {
      const override = overrideMap.get(p.id);
      return {
        ...p,
        base_price_minor: Number(p.base_price_minor),
        // branch-level overrides
        enabled: override ? override.enabled : true,
        sold_out: override ? override.sold_out : false,
        effective_price_minor: override?.price_override_minor
          ? Number(override.price_override_minor)
          : Number(p.base_price_minor),
        preparation_time_override: override?.preparation_time_override ?? null,
      };
    });
  }

  async upsertBranchProduct(branchId: string, productId: string, dto: UpsertBranchProductDto) {
    return this.db.branchProduct.upsert({
      where: { tenant_id_branch_id_product_id: { tenant_id: this.tenantId, branch_id: branchId, product_id: productId } },
      update: {
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.sold_out !== undefined && { sold_out: dto.sold_out }),
        ...(dto.price_override_minor !== undefined && { price_override_minor: BigInt(dto.price_override_minor) }),
        ...(dto.preparation_time_override !== undefined && { preparation_time_override: dto.preparation_time_override }),
        ...(dto.available_from !== undefined && { available_from: dto.available_from ? new Date(dto.available_from) : null }),
        ...(dto.available_until !== undefined && { available_until: dto.available_until ? new Date(dto.available_until) : null }),
      },
      create: {
        tenant_id: this.tenantId,
        branch_id: branchId,
        product_id: productId,
        enabled: dto.enabled ?? true,
        sold_out: dto.sold_out ?? false,
        price_override_minor: dto.price_override_minor ? BigInt(dto.price_override_minor) : null,
        preparation_time_override: dto.preparation_time_override,
        available_from: dto.available_from ? new Date(dto.available_from) : null,
        available_until: dto.available_until ? new Date(dto.available_until) : null,
      },
    });
  }
}
