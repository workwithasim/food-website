import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../tenancy/tenant.context';
import { TenantScopedRepository } from '../tenancy/tenant-scoped.repository';
import { FulfillmentMethod } from '@restaurant/database';

export interface AddItemDto {
  product_id: string;
  variant_id?: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
}

@Injectable()
export class CartService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async getCart(identifier: { customerId?: string; guestToken?: string }) {
    if (!identifier.customerId && !identifier.guestToken) return null;

    return this.db.cart.findFirst({
      where: {
        tenant_id: this.tenantId,
        status: 'ACTIVE',
        OR: [
          ...(identifier.customerId ? [{ customer_id: identifier.customerId }] : []),
          ...(identifier.guestToken ? [{ guest_token: identifier.guestToken }] : []),
        ]
      },
      include: {
        items: {
          include: {
            modifiers: true,
          },
          orderBy: { created_at: 'asc' }
        }
      }
    });
  }

  async createCart(identifier: { customerId?: string; guestToken?: string }, method: FulfillmentMethod = 'DELIVERY') {
    return this.db.cart.create({
      data: {
        tenant_id: this.tenantId,
        customer_id: identifier.customerId,
        guest_token: identifier.guestToken,
        fulfillment_method: method,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      }
    });
  }

  async addItem(identifier: { customerId?: string; guestToken?: string }, dto: AddItemDto) {
    let cartId: string;
    const cart = await this.getCart(identifier);
    if (!cart) {
      const newCart = await this.createCart(identifier);
      cartId = newCart.id;
    } else {
      cartId = cart.id;
    }

    // Validate product exists and is ACTIVE
    const product = await this.db.product.findFirst({
      where: { id: dto.product_id, tenant_id: this.tenantId, status: 'ACTIVE', deleted_at: null },
      include: { variants: true, modifier_groups: { include: { modifier_group: { include: { modifiers: true } } } } }
    });

    if (!product) throw new NotFoundException('Product not found or inactive');

    // If variant is required/provided, validate it
    if (product.variants.length > 0) {
      if (!dto.variant_id) throw new BadRequestException('Variant is required for this product');
      const variant = product.variants.find(v => v.id === dto.variant_id && v.status === 'ACTIVE');
      if (!variant) throw new BadRequestException('Invalid or inactive variant');
    }

    // Check modifiers
    if (dto.modifiers && dto.modifiers.length > 0) {
      const allowedModIds = product.modifier_groups.flatMap(g => g.modifier_group.modifiers.map(m => m.id));
      for (const modId of dto.modifiers) {
        if (!allowedModIds.includes(modId)) {
          throw new BadRequestException(`Modifier ${modId} is not valid for this product`);
        }
      }
    }

    // Check if identical item already exists (same product, variant, modifiers, and notes)
    // For simplicity, we just add a new line item in this phase unless it perfectly matches
    // But since it's a bit complex, we'll just insert a new CartItem for now.
    
    return this.db.cartItem.create({
      data: {
        cart_id: cartId,
        product_id: dto.product_id,
        variant_id: dto.variant_id,
        quantity: dto.quantity,
        notes: dto.notes,
        modifiers: dto.modifiers ? {
          create: dto.modifiers.map(modId => ({ modifier_id: modId }))
        } : undefined
      }
    });
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.db.cartItem.delete({ where: { id: itemId, cart_id: cartId } });
    }
    return this.db.cartItem.update({
      where: { id: itemId, cart_id: cartId },
      data: { quantity }
    });
  }

  async removeItem(cartId: string, itemId: string) {
    return this.db.cartItem.delete({
      where: { id: itemId, cart_id: cartId }
    });
  }

  async mergeCarts(guestToken: string, customerId: string) {
    const guestCart = await this.getCart({ guestToken });
    const userCart = await this.getCart({ customerId });

    if (!guestCart) return userCart;

    if (!userCart) {
      // Just assign the guest cart to the user
      return this.db.cart.update({
        where: { id: guestCart.id },
        data: { customer_id: customerId, guest_token: null }
      });
    }

    // Move all items from guest cart to user cart
    await this.db.cartItem.updateMany({
      where: { cart_id: guestCart.id },
      data: { cart_id: userCart.id }
    });

    // Delete guest cart
    await this.db.cart.delete({ where: { id: guestCart.id } });

    return this.getCart({ customerId });
  }
}
