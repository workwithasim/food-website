import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { CatalogStatus } from '@restaurant/database';
import { randomUUID } from 'crypto';

export interface CreateProductDto {
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  base_price_minor: number;
  currency_code: string;
  status?: CatalogStatus;
  preparation_time_minutes?: number;
  featured?: boolean;
  metadata_json?: object;
}

export interface AddMediaDto {
  media_url: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
}

@Injectable()
export class ProductsService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async listProducts(filters?: { category_id?: string; status?: CatalogStatus; featured?: boolean }) {
    return this.db.product.findMany({
      where: {
        tenant_id: this.tenantId,
        deleted_at: null,
        ...(filters?.category_id && { category_id: filters.category_id }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.featured !== undefined && { featured: filters.featured }),
      },
      include: { 
        media: { orderBy: { sort_order: 'asc' } }, 
        category: true,
        variants: { where: { status: 'ACTIVE' }, orderBy: { sort_order: 'asc' } }
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async getProduct(id: string) {
    const product = await this.db.product.findUnique({
      where: { id },
      include: { media: { orderBy: { sort_order: 'asc' } }, category: true },
    });
    if (!product || product.tenant_id !== this.tenantId || product.deleted_at) {
      throw new NotFoundException('Product not found');
    }
    return this.serializeProduct(product);
  }

  async getProductBySlug(slug: string) {
    const product = await this.db.product.findUnique({
      where: { tenant_id_slug: { tenant_id: this.tenantId, slug } },
      include: { 
        media: { orderBy: { sort_order: 'asc' } }, 
        category: true,
        variants: { where: { status: 'ACTIVE' }, orderBy: { sort_order: 'asc' } },
        modifier_groups: {
          orderBy: { sort_order: 'asc' },
          include: {
            modifier_group: {
              include: {
                modifiers: { where: { status: 'ACTIVE' }, orderBy: { sort_order: 'asc' } }
              }
            }
          }
        }
      },
    });
    if (!product || product.deleted_at || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }
    return this.serializeProduct(product);
  }

  async createProduct(dto: CreateProductDto) {
    const existing = await this.db.product.findFirst({
      where: { tenant_id: this.tenantId, slug: dto.slug, deleted_at: null },
    });
    if (existing) throw new ConflictException(`Slug "${dto.slug}" already in use`);

    const product = await this.db.product.create({
      data: {
        id: randomUUID(),
        tenant_id: this.tenantId,
        category_id: dto.category_id,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        base_price_minor: BigInt(dto.base_price_minor),
        currency_code: dto.currency_code,
        status: dto.status ?? 'DRAFT',
        preparation_time_minutes: dto.preparation_time_minutes,
        featured: dto.featured ?? false,
        metadata_json: dto.metadata_json !== undefined ? (dto.metadata_json ?? 'JsonNull') : undefined,
      },
      include: { media: true, category: true },
    });
    return this.serializeProduct(product);
  }

  async updateProduct(id: string, dto: Partial<CreateProductDto>) {
    await this.getProduct(id);

    if (dto.slug) {
      const conflict = await this.db.product.findFirst({
        where: { tenant_id: this.tenantId, slug: dto.slug, deleted_at: null, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" already in use`);
    }

    const product = await this.db.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category_id && { category_id: dto.category_id }),
        ...(dto.base_price_minor !== undefined && { base_price_minor: BigInt(dto.base_price_minor) }),
        ...(dto.currency_code && { currency_code: dto.currency_code }),
        ...(dto.status && { status: dto.status }),
        ...(dto.preparation_time_minutes !== undefined && { preparation_time_minutes: dto.preparation_time_minutes }),
        ...(dto.featured !== undefined && { featured: dto.featured }),
        ...(dto.metadata_json !== undefined && { metadata_json: dto.metadata_json }),
      },
      include: { media: true, category: true },
    });
    return this.serializeProduct(product);
  }

  async deleteProduct(id: string) {
    await this.getProduct(id);
    await this.db.product.update({ where: { id }, data: { deleted_at: new Date() } });
    return { success: true };
  }

  async addMedia(productId: string, dto: AddMediaDto) {
    await this.getProduct(productId);

    // If this is primary, unset others
    if (dto.is_primary) {
      await this.db.productMedia.updateMany({
        where: { product_id: productId },
        data: { is_primary: false },
      });
    }

    return this.db.productMedia.create({
      data: {
        id: randomUUID(),
        tenant_id: this.tenantId,
        product_id: productId,
        media_url: dto.media_url,
        alt_text: dto.alt_text,
        sort_order: dto.sort_order ?? 0,
        is_primary: dto.is_primary ?? false,
      },
    });
  }

  async removeMedia(productId: string, mediaId: string) {
    await this.getProduct(productId);
    await this.db.productMedia.deleteMany({
      where: { id: mediaId, product_id: productId },
    });
    return { success: true };
  }

  // Serialize BigInt fields
  private serializeProduct(p: any) {
    return {
      ...p,
      base_price_minor: Number(p.base_price_minor),
    };
  }
}
