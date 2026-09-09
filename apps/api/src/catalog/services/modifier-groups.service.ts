import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { VariantStatus } from '@restaurant/database';

export interface CreateModifierGroupDto {
  name: string;
  min_select?: number;
  max_select?: number;
  required?: boolean;
  status?: VariantStatus;
}

export interface UpdateModifierGroupDto {
  name?: string;
  min_select?: number;
  max_select?: number;
  required?: boolean;
  status?: VariantStatus;
}

export interface CreateModifierDto {
  name: string;
  price_delta_minor: number;
  status?: VariantStatus;
  sort_order?: number;
}

export interface UpdateModifierDto {
  name?: string;
  price_delta_minor?: number;
  status?: VariantStatus;
  sort_order?: number;
}

export interface ProductModifierGroupDto {
  modifier_group_id: string;
  sort_order?: number;
}

@Injectable()
export class ModifierGroupsService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  // Modifier Groups
  async listModifierGroups() {
    const tenantId = this.tenantId;
    return this.db.modifierGroup.findMany({
      where: { tenant_id: tenantId },
      include: {
        modifiers: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });
  }

  async getModifierGroup(id: string) {
    const tenantId = this.tenantId;
    const group = await this.db.modifierGroup.findUnique({
      where: { id, tenant_id: tenantId },
      include: {
        modifiers: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });
    if (!group) throw new NotFoundException('Modifier group not found');
    return group;
  }

  async createModifierGroup(dto: CreateModifierGroupDto) {
    const tenantId = this.tenantId;
    return this.db.modifierGroup.create({
      data: {
        tenant_id: tenantId,
        name: dto.name,
        min_select: dto.min_select ?? 0,
        max_select: dto.max_select ?? 1,
        required: dto.required ?? false,
        status: dto.status ?? VariantStatus.ACTIVE,
      },
    });
  }

  async updateModifierGroup(id: string, dto: UpdateModifierGroupDto) {
    const tenantId = this.tenantId;
    const group = await this.db.modifierGroup.findUnique({
      where: { id, tenant_id: tenantId },
    });
    if (!group) throw new NotFoundException('Modifier group not found');

    return this.db.modifierGroup.update({
      where: { id },
      data: {
        name: dto.name,
        min_select: dto.min_select,
        max_select: dto.max_select,
        required: dto.required,
        status: dto.status,
      },
    });
  }

  async deleteModifierGroup(id: string) {
    const tenantId = this.tenantId;
    const group = await this.db.modifierGroup.findUnique({
      where: { id, tenant_id: tenantId },
    });
    if (!group) throw new NotFoundException('Modifier group not found');

    await this.db.modifierGroup.delete({ where: { id } });
    return { success: true };
  }

  // Modifiers
  async createModifier(groupId: string, dto: CreateModifierDto) {
    const tenantId = this.tenantId;
    const group = await this.db.modifierGroup.findUnique({
      where: { id: groupId, tenant_id: tenantId },
    });
    if (!group) throw new NotFoundException('Modifier group not found');

    return this.db.modifier.create({
      data: {
        tenant_id: tenantId,
        modifier_group_id: groupId,
        name: dto.name,
        price_delta_minor: dto.price_delta_minor,
        status: dto.status ?? VariantStatus.ACTIVE,
        sort_order: dto.sort_order ?? 0,
      },
    });
  }

  async updateModifier(modifierId: string, dto: UpdateModifierDto) {
    const tenantId = this.tenantId;
    const modifier = await this.db.modifier.findUnique({
      where: { id: modifierId, tenant_id: tenantId },
    });
    if (!modifier) throw new NotFoundException('Modifier not found');

    return this.db.modifier.update({
      where: { id: modifierId },
      data: {
        name: dto.name,
        price_delta_minor: dto.price_delta_minor,
        status: dto.status,
        sort_order: dto.sort_order,
      },
    });
  }

  async deleteModifier(modifierId: string) {
    const tenantId = this.tenantId;
    const modifier = await this.db.modifier.findUnique({
      where: { id: modifierId, tenant_id: tenantId },
    });
    if (!modifier) throw new NotFoundException('Modifier not found');

    await this.db.modifier.delete({ where: { id: modifierId } });
    return { success: true };
  }

  // Product Assignments
  async assignModifierGroupToProduct(productId: string, dto: ProductModifierGroupDto) {
    const tenantId = this.tenantId;

    // Verify product exists
    const product = await this.db.product.findUnique({
      where: { id: productId, tenant_id: tenantId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Verify group exists
    const group = await this.db.modifierGroup.findUnique({
      where: { id: dto.modifier_group_id, tenant_id: tenantId },
    });
    if (!group) throw new NotFoundException('Modifier group not found');

    return this.db.productModifierGroup.upsert({
      where: {
        tenant_id_product_id_modifier_group_id: {
          tenant_id: tenantId,
          product_id: productId,
          modifier_group_id: dto.modifier_group_id,
        },
      },
      update: {
        sort_order: dto.sort_order ?? 0,
      },
      create: {
        tenant_id: tenantId,
        product_id: productId,
        modifier_group_id: dto.modifier_group_id,
        sort_order: dto.sort_order ?? 0,
      },
    });
  }

  async removeModifierGroupFromProduct(productId: string, groupId: string) {
    const tenantId = this.tenantId;
    try {
      await this.db.productModifierGroup.delete({
        where: {
          tenant_id_product_id_modifier_group_id: {
            tenant_id: tenantId,
            product_id: productId,
            modifier_group_id: groupId,
          },
        },
      });
      return { success: true };
    } catch (e) {
      throw new NotFoundException('Assignment not found');
    }
  }

  async listProductModifierGroups(productId: string) {
    const tenantId = this.tenantId;
    return this.db.productModifierGroup.findMany({
      where: {
        tenant_id: tenantId,
        product_id: productId,
      },
      include: {
        modifier_group: {
          include: {
            modifiers: {
              orderBy: { sort_order: 'asc' },
            },
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });
  }
}
