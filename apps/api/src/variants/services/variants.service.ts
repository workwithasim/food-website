import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { randomUUID } from 'crypto';

export interface CreateVariantDto {
  name: string;
  sku?: string;
  price_minor: number;
  sort_order?: number;
}

export interface CreateModifierGroupDto {
  name: string;
  min_select?: number;
  max_select?: number;
  required?: boolean;
}

export interface CreateModifierDto {
  name: string;
  price_delta_minor?: number;
  sort_order?: number;
}

@Injectable()
export class VariantsService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  // ─── Variants ─────────────────────────────────────────────────────────────

  async listVariants(productId: string) {
    return this.db.productVariant.findMany({
      where: { tenant_id: this.tenantId, product_id: productId },
      orderBy: { sort_order: 'asc' },
    });
  }

  async createVariant(productId: string, dto: CreateVariantDto) {
    // Ensure product belongs to tenant
    const product = await this.db.product.findUnique({ where: { id: productId } });
    if (!product || product.tenant_id !== this.tenantId || product.deleted_at) {
      throw new NotFoundException('Product not found');
    }

    const variant = await this.db.productVariant.create({
      data: {
        id: randomUUID(),
        tenant_id: this.tenantId,
        product_id: productId,
        name: dto.name,
        sku: dto.sku,
        price_minor: BigInt(dto.price_minor),
        sort_order: dto.sort_order ?? 0,
        status: 'ACTIVE',
      },
    });

    return { ...variant, price_minor: Number(variant.price_minor) };
  }

  async updateVariant(productId: string, variantId: string, dto: Partial<CreateVariantDto>) {
    const existing = await this.db.productVariant.findFirst({
      where: { id: variantId, product_id: productId, tenant_id: this.tenantId },
    });
    if (!existing) throw new NotFoundException('Variant not found');

    const updated = await this.db.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.price_minor !== undefined && { price_minor: BigInt(dto.price_minor) }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
      },
    });

    return { ...updated, price_minor: Number(updated.price_minor) };
  }

  async deleteVariant(productId: string, variantId: string) {
    const existing = await this.db.productVariant.findFirst({
      where: { id: variantId, product_id: productId, tenant_id: this.tenantId },
    });
    if (!existing) throw new NotFoundException('Variant not found');

    await this.db.productVariant.delete({ where: { id: variantId } });
    return { success: true };
  }

  // ─── Modifier Groups ──────────────────────────────────────────────────────

  async listModifierGroups() {
    return this.db.modifierGroup.findMany({
      where: { tenant_id: this.tenantId, status: 'ACTIVE' },
      include: { modifiers: { where: { status: 'ACTIVE' }, orderBy: { sort_order: 'asc' } } },
      orderBy: { created_at: 'asc' },
    });
  }

  async createModifierGroup(dto: CreateModifierGroupDto) {
    // Validate min/max rules
    const min = dto.min_select ?? 0;
    const max = dto.max_select ?? 1;
    if (min < 0) throw new BadRequestException('min_select must be >= 0');
    if (max < min) throw new BadRequestException('max_select must be >= min_select');
    if (dto.required && min < 1) throw new BadRequestException('required groups must have min_select >= 1');

    return this.db.modifierGroup.create({
      data: {
        id: randomUUID(),
        tenant_id: this.tenantId,
        name: dto.name,
        min_select: min,
        max_select: max,
        required: dto.required ?? false,
        status: 'ACTIVE',
      },
    });
  }

  async updateModifierGroup(groupId: string, dto: Partial<CreateModifierGroupDto>) {
    const existing = await this.db.modifierGroup.findFirst({
      where: { id: groupId, tenant_id: this.tenantId },
    });
    if (!existing) throw new NotFoundException('Modifier group not found');

    const min = dto.min_select ?? existing.min_select;
    const max = dto.max_select ?? existing.max_select;
    if (max < min) throw new BadRequestException('max_select must be >= min_select');

    return this.db.modifierGroup.update({
      where: { id: groupId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.min_select !== undefined && { min_select: dto.min_select }),
        ...(dto.max_select !== undefined && { max_select: dto.max_select }),
        ...(dto.required !== undefined && { required: dto.required }),
      },
    });
  }

  async deleteModifierGroup(groupId: string) {
    const existing = await this.db.modifierGroup.findFirst({
      where: { id: groupId, tenant_id: this.tenantId },
    });
    if (!existing) throw new NotFoundException('Modifier group not found');
    await this.db.modifierGroup.update({ where: { id: groupId }, data: { status: 'INACTIVE' } });
    return { success: true };
  }

  // ─── Modifiers ────────────────────────────────────────────────────────────

  async createModifier(groupId: string, dto: CreateModifierDto) {
    const group = await this.db.modifierGroup.findFirst({
      where: { id: groupId, tenant_id: this.tenantId },
    });
    if (!group) throw new NotFoundException('Modifier group not found');

    const modifier = await this.db.modifier.create({
      data: {
        id: randomUUID(),
        tenant_id: this.tenantId,
        modifier_group_id: groupId,
        name: dto.name,
        price_delta_minor: BigInt(dto.price_delta_minor ?? 0),
        sort_order: dto.sort_order ?? 0,
        status: 'ACTIVE',
      },
    });

    return { ...modifier, price_delta_minor: Number(modifier.price_delta_minor) };
  }

  async updateModifier(groupId: string, modifierId: string, dto: Partial<CreateModifierDto>) {
    const existing = await this.db.modifier.findFirst({
      where: { id: modifierId, modifier_group_id: groupId, tenant_id: this.tenantId },
    });
    if (!existing) throw new NotFoundException('Modifier not found');

    const updated = await this.db.modifier.update({
      where: { id: modifierId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.price_delta_minor !== undefined && { price_delta_minor: BigInt(dto.price_delta_minor) }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
      },
    });

    return { ...updated, price_delta_minor: Number(updated.price_delta_minor) };
  }

  async deleteModifier(groupId: string, modifierId: string) {
    const existing = await this.db.modifier.findFirst({
      where: { id: modifierId, modifier_group_id: groupId, tenant_id: this.tenantId },
    });
    if (!existing) throw new NotFoundException('Modifier not found');
    await this.db.modifier.update({ where: { id: modifierId }, data: { status: 'INACTIVE' } });
    return { success: true };
  }

  // ─── Product ↔ Modifier Group Links ──────────────────────────────────────

  async attachModifierGroupToProduct(productId: string, groupId: string, sortOrder = 0) {
    return this.db.productModifierGroup.upsert({
      where: {
        tenant_id_product_id_modifier_group_id: {
          tenant_id: this.tenantId,
          product_id: productId,
          modifier_group_id: groupId,
        },
      },
      update: { sort_order: sortOrder },
      create: {
        tenant_id: this.tenantId,
        product_id: productId,
        modifier_group_id: groupId,
        sort_order: sortOrder,
      },
    });
  }

  async detachModifierGroupFromProduct(productId: string, groupId: string) {
    await this.db.productModifierGroup.delete({
      where: {
        tenant_id_product_id_modifier_group_id: {
          tenant_id: this.tenantId,
          product_id: productId,
          modifier_group_id: groupId,
        },
      },
    });
    return { success: true };
  }

  async getProductWithModifiers(productId: string) {
    const product = await this.db.product.findUnique({
      where: { id: productId },
      include: {
        variants: { where: { status: 'ACTIVE' }, orderBy: { sort_order: 'asc' } },
        modifier_groups: {
          orderBy: { sort_order: 'asc' },
          include: {
            modifier_group: {
              include: {
                modifiers: { where: { status: 'ACTIVE' }, orderBy: { sort_order: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!product || product.tenant_id !== this.tenantId || product.deleted_at) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      base_price_minor: Number(product.base_price_minor),
      variants: product.variants.map(v => ({ ...v, price_minor: Number(v.price_minor) })),
      modifier_groups: product.modifier_groups.map(pmg => ({
        sort_order: pmg.sort_order,
        ...pmg.modifier_group,
        modifiers: pmg.modifier_group.modifiers.map(m => ({
          ...m,
          price_delta_minor: Number(m.price_delta_minor),
        })),
      })),
    };
  }
}
