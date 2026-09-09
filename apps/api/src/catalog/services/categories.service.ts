import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { CatalogStatus } from '@restaurant/database';
import { randomUUID } from 'crypto';

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order?: number;
  status?: CatalogStatus;
  available_from?: string;
  available_until?: string;
}

@Injectable()
export class CategoriesService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async listCategories() {
    return this.db.category.findMany({
      where: { tenant_id: this.tenantId, deleted_at: null },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
      include: {
        children: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
        },
      },
    });
  }

  async getCategory(id: string) {
    const cat = await this.db.category.findUnique({
      where: { id },
      include: { children: { where: { deleted_at: null } }, products: { where: { deleted_at: null, status: 'ACTIVE' } } },
    });
    if (!cat || cat.tenant_id !== this.tenantId || cat.deleted_at) {
      throw new NotFoundException('Category not found');
    }
    return cat;
  }

  async createCategory(dto: CreateCategoryDto) {
    // Check slug uniqueness
    const existing = await this.db.category.findUnique({
      where: { tenant_id_slug: { tenant_id: this.tenantId, slug: dto.slug } },
    });
    if (existing && !existing.deleted_at) {
      throw new ConflictException(`Slug "${dto.slug}" is already in use`);
    }

    return this.db.category.create({
      data: {
        id: randomUUID(),
        tenant_id: this.tenantId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        image_url: dto.image_url,
        parent_id: dto.parent_id,
        sort_order: dto.sort_order ?? 0,
        status: dto.status ?? 'DRAFT',
        available_from: dto.available_from ? new Date(dto.available_from) : null,
        available_until: dto.available_until ? new Date(dto.available_until) : null,
      },
    });
  }

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>) {
    await this.getCategory(id);

    if (dto.slug) {
      const conflict = await this.db.category.findFirst({
        where: {
          tenant_id: this.tenantId,
          slug: dto.slug,
          deleted_at: null,
          NOT: { id },
        },
      });
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" is already in use`);
    }

    return this.db.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.image_url !== undefined && { image_url: dto.image_url }),
        ...(dto.parent_id !== undefined && { parent_id: dto.parent_id }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
        ...(dto.status && { status: dto.status }),
        ...(dto.available_from !== undefined && { available_from: dto.available_from ? new Date(dto.available_from) : null }),
        ...(dto.available_until !== undefined && { available_until: dto.available_until ? new Date(dto.available_until) : null }),
      },
    });
  }

  async deleteCategory(id: string) {
    await this.getCategory(id);
    await this.db.category.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    return { success: true };
  }
}
