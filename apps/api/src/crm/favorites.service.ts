import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FavoritesService {
  constructor(private db: DatabaseService) {}

  async addFavorite(tenantId: string, customerId: string, productId: string) {
    const product = await this.db.product.findFirst({
      where: { id: productId, tenant_id: tenantId, deleted_at: null },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.db.customerFavorite.upsert({
      where: {
        customer_id_product_id: { customer_id: customerId, product_id: productId },
      },
      create: {
        tenant_id: tenantId,
        customer_id: customerId,
        product_id: productId,
      },
      update: {},
      include: {
        product: {
          include: {
            media: {
              where: { is_primary: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  async removeFavorite(tenantId: string, customerId: string, productId: string) {
    return this.db.customerFavorite.deleteMany({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        product_id: productId,
      },
    });
  }

  async listFavorites(tenantId: string, customerId: string) {
    return this.db.customerFavorite.findMany({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        product: { deleted_at: null },
      },
      include: {
        product: {
          include: {
            media: {
              where: { is_primary: true },
              take: 1,
            },
            variants: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
