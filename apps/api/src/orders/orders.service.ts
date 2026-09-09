import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../tenancy/tenant.context';
import { TenantScopedRepository } from '../tenancy/tenant-scoped.repository';
import { PricingService } from '../pricing/pricing.service';
import { PaymentsService } from '../payments/services/payments.service';
import { randomBytes } from 'crypto';

export interface CreateOrderDto {
  cart_id: string;
  branch_id: string;
  idempotency_key: string;
  payment_method?: 'COD' | 'ONLINE'; // default to ONLINE
  customer_name?: string;
  customer_phone?: string;
  customer_note?: string;
  channel?: 'WEB' | 'MOBILE' | 'POS' | 'QR';
}

@Injectable()
export class OrdersService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
    private pricingService: PricingService,
    private paymentsService: PaymentsService,
  ) {
    super(db, cls);
  }

  async createOrder(dto: CreateOrderDto) {
    const { cart_id, branch_id, idempotency_key } = dto;
    
    // 1. Check idempotency
    const existingIdem = await this.db.idempotencyKey.findUnique({
      where: {
        tenant_id_actor_scope_operation_idempotency_key: {
          tenant_id: this.tenantId,
          actor_scope: 'guest', // In reality, fetch from auth context
          operation: 'create_order',
          idempotency_key,
        }
      }
    });

    if (existingIdem) {
      if (existingIdem.status === 'COMPLETED' && existingIdem.response_body) {
        return existingIdem.response_body as any; // return the already created order
      }
      throw new ConflictException('Order creation is already in progress for this idempotency key');
    }

    // 2. Validate Cart and Quote
    const quote = await this.pricingService.calculateQuote({ cart_id, branch_id });
    
    const cart = await this.db.cart.findFirst({
      where: { id: cart_id, tenant_id: this.tenantId },
      include: {
        items: {
          include: {
            modifiers: { include: { modifier: true } },
            product: true,
            variant: true,
          }
        }
      }
    });

    if (!cart) throw new BadRequestException('Cart not found');
    if (cart.status !== 'ACTIVE') throw new BadRequestException('Cart is not active');

    // Generate Order Number
    const orderNumber = `ORD-${randomBytes(4).toString('hex').toUpperCase()}`;

    // Perform transaction
    const result = await this.db.$transaction(async (tx) => {
      // Record idempotency as IN_PROGRESS
      const idem = await tx.idempotencyKey.create({
        data: {
          tenant_id: this.tenantId,
          actor_scope: 'guest',
          operation: 'create_order',
          idempotency_key,
          status: 'IN_PROGRESS',
        }
      });

      // Create Order
      const order = await tx.order.create({
        data: {
          tenant_id: this.tenantId,
          branch_id,
          customer_id: cart.customer_id,
          order_number: orderNumber,
          channel: dto.channel || 'WEB',
          fulfillment_type: cart.fulfillment_method,
          status: 'PLACED',
          payment_status: 'PENDING',
          currency_code: quote.currency_code,
          subtotal_minor: quote.subtotal_minor,
          tax_minor: quote.tax_minor,
          delivery_fee_minor: quote.delivery_fee_minor,
          service_fee_minor: quote.service_fee_minor,
          grand_total_minor: quote.grand_total_minor,
          customer_name_snapshot: dto.customer_name || 'Guest Customer',
          customer_phone_snapshot: dto.customer_phone || '0000000000',
          customer_note: dto.customer_note,
          placed_at: new Date(),
        }
      });

      // Create Order Items and Modifiers
      for (const item of cart.items) {
        const basePrice = item.variant ? item.variant.price_minor : item.product.base_price_minor;
        let lineTotal = basePrice;
        for (const mod of item.modifiers) {
          lineTotal += mod.modifier.price_delta_minor;
        }

        await tx.orderItem.create({
          data: {
            tenant_id: this.tenantId,
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product.name,
            variant_name: item.variant?.name,
            unit_price_minor: basePrice,
            quantity: item.quantity,
            line_subtotal_minor: basePrice,
            line_total_minor: lineTotal,
            modifiers: {
              create: item.modifiers.map(m => ({
                tenant_id: this.tenantId,
                modifier_id: m.modifier_id,
                modifier_name: m.modifier.name,
                unit_price_delta_minor: m.modifier.price_delta_minor,
                quantity: 1,
                total_minor: m.modifier.price_delta_minor
              }))
            }
          }
        });
      }

      // History
      await tx.orderStatusHistory.create({
        data: {
          tenant_id: this.tenantId,
          order_id: order.id,
          to_status: 'PLACED',
          actor_type: 'CUSTOMER',
          source: 'WEB_CHECKOUT'
        }
      });

      // Outbox Event
      await tx.outboxEvent.create({
        data: {
          tenant_id: this.tenantId,
          aggregate_type: 'Order',
          aggregate_id: order.id,
          event_type: 'ORDER_PLACED',
          payload: { order_id: order.id, status: 'PLACED' },
          status: 'PENDING'
        }
      });

      // Disable Cart
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: 'CONVERTED' }
      });

      // Update idempotency
      await tx.idempotencyKey.update({
        where: { id: idem.id },
        data: {
          status: 'COMPLETED',
          response_body: order as any
        }
      });

      return order;
    });

    // 4. Create Payment (outside transaction or inside, but our payment service expects the order to be passed. Since we used a transaction and payment creates its own records, it's safer to do this outside if payment service calls intent creation which is an external API call).
    const paymentResult = await this.paymentsService.createPaymentForOrder(
      result,
      dto.payment_method || 'ONLINE'
    );

    return { order: result, payment: paymentResult };
  }

  async getOrder(orderId: string) {
    return this.db.order.findFirst({
      where: { id: orderId, tenant_id: this.tenantId },
      include: {
        items: {
          include: { modifiers: true }
        },
        history: {
          orderBy: { created_at: 'desc' }
        }
      }
    });
  }

  async getCustomerHistory(customerId?: string) {
    if (!customerId) return [];
    return this.db.order.findMany({
      where: { tenant_id: this.tenantId, customer_id: customerId },
      orderBy: { created_at: 'desc' }
    });
  }
}
