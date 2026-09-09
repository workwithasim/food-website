import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { VariantStatus } from '@restaurant/database';

export interface CreateVariantDto {
  name: string;
  sku?: string;
  price_minor: number;
  status?: VariantStatus;
  sort_order?: number;
}

export interface UpdateVariantDto {
  name?: string;
  sku?: string;
  price_minor?: number;
  status?: VariantStatus;
  sort_order?: number;
}

@Injectable()
export class ProductVariantsService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }


  async listVariants(productId: string) {
    const tenantId = this.tenantId;
    return this.db.productVariant.findMany({
      where: {
        tenant_id: tenantId,
        product_id: productId,
      },
      orderBy: {
        sort_order: 'asc',
      },
    });
  }

  async createVariant(productId: string, dto: CreateVariantDto) {
    const tenantId = this.tenantId;
    
    // verify product belongs to tenant
    const product = await this.db.product.findUnique({
      where: { id: productId, tenant_id: tenantId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.db.productVariant.create({
      data: {
        tenant_id: tenantId,
        product_id: productId,
        name: dto.name,
        sku: dto.sku,
        price_minor: dto.price_minor,
        status: dto.status ?? VariantStatus.ACTIVE,
        sort_order: dto.sort_order ?? 0,
      },
    });
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    const tenantId = this.tenantId;
    
    const variant = await this.db.productVariant.findUnique({
      where: { id: variantId, tenant_id: tenantId },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.db.productVariant.update({
      where: { id: variantId },
      data: {
        name: dto.name,
        sku: dto.sku,
        price_minor: dto.price_minor,
        status: dto.status,
        sort_order: dto.sort_order,
      },
    });
  }

  async deleteVariant(variantId: string) {
    const tenantId = this.tenantId;
    
    const variant = await this.db.productVariant.findUnique({
      where: { id: variantId, tenant_id: tenantId },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    await this.db.productVariant.delete({
      where: { id: variantId },
    });
    return { success: true };
  }
}
