import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../tenancy/tenant.context';
import { TenantScopedRepository } from '../tenancy/tenant-scoped.repository';

export interface CheckoutQuoteDto {
  cart_id: string;
  branch_id?: string;
}

@Injectable()
export class PricingService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async calculateQuote(dto: CheckoutQuoteDto) {
    const cart = await this.db.cart.findFirst({
      where: { id: dto.cart_id, tenant_id: this.tenantId },
      include: {
        items: {
          include: {
            modifiers: true,
            product: { include: { branch_overrides: true } },
            variant: true,
          }
        }
      }
    });

    if (!cart) throw new BadRequestException('Cart not found');
    if (cart.status !== 'ACTIVE') throw new BadRequestException('Cart is no longer active');
    if (cart.items.length === 0) throw new BadRequestException('Cart is empty');

    const targetBranchId = dto.branch_id || cart.branch_id;
    if (!targetBranchId) throw new BadRequestException('A branch is required to calculate quote');

    // Fetch branch info
    const branch = await this.db.branch.findFirst({
      where: { id: targetBranchId, tenant_id: this.tenantId, status: 'ACTIVE', deleted_at: null }
    });
    if (!branch) throw new BadRequestException('Branch not found or inactive');
    if (cart.fulfillment_method === 'DELIVERY' && !branch.accepts_delivery) {
      throw new BadRequestException('Branch does not accept delivery');
    }
    if (cart.fulfillment_method === 'PICKUP' && !branch.accepts_pickup) {
      throw new BadRequestException('Branch does not accept pickup');
    }

    let subtotalMinor = 0n;

    // Fetch all modifiers at once for quick lookup
    const allModifierIds = cart.items.flatMap(item => item.modifiers.map(m => m.modifier_id));
    const modifiersData = await this.db.modifier.findMany({
      where: { id: { in: allModifierIds }, tenant_id: this.tenantId }
    });
    const modifierMap = new Map(modifiersData.map(m => [m.id, m.price_delta_minor]));

    // Calculate subtotal
    for (const item of cart.items) {
      let basePrice = item.variant ? item.variant.price_minor : item.product.base_price_minor;
      
      // Apply branch override if any
      const override = item.product.branch_overrides.find(o => o.branch_id === targetBranchId);
      if (override && override.price_override_minor !== null) {
        basePrice = override.price_override_minor;
      }
      
      let itemTotal = basePrice;
      for (const mod of item.modifiers) {
        const modPrice = modifierMap.get(mod.modifier_id) || 0n;
        itemTotal += modPrice;
      }
      subtotalMinor += itemTotal * BigInt(item.quantity);
    }

    // Simplified logic: 10% tax, flat delivery fee if delivery
    // In reality, this should be configurable per tenant/branch in settings
    const taxRate = 0.10;
    const taxMinor = BigInt(Math.round(Number(subtotalMinor) * taxRate));
    
    let deliveryFeeMinor = 0n;
    if (cart.fulfillment_method === 'DELIVERY') {
      deliveryFeeMinor = branch.default_delivery_fee_minor || 500n; // fallback to 5.00
    }

    const serviceFeeMinor = 100n; // flat 1.00 service fee

    const grandTotalMinor = subtotalMinor + taxMinor + deliveryFeeMinor + serviceFeeMinor;

    return {
      subtotal_minor: Number(subtotalMinor),
      tax_minor: Number(taxMinor),
      delivery_fee_minor: Number(deliveryFeeMinor),
      service_fee_minor: Number(serviceFeeMinor),
      grand_total_minor: Number(grandTotalMinor),
      currency_code: cart.items[0]?.product.currency_code || 'USD',
      branch_id: branch.id,
      fulfillment_method: cart.fulfillment_method,
    };
  }
}
