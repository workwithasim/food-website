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

    // 2. Validate Branch Status and Delivery Hours
    const branch = await this.db.branch.findUnique({
      where: { id: branch_id },
    });
    if (!branch || branch.tenant_id !== this.tenantId) {
      throw new BadRequestException('Selected branch was not found.');
    }
    if (branch.status !== 'ACTIVE') {
      throw new BadRequestException(`Branch ${branch.name} is currently not accepting orders.`);
    }

    const tenantSettings = await this.db.tenantSettings.findUnique({
      where: { tenant_id: this.tenantId },
    });
    const theme = (tenantSettings?.theme_json as any) || {};
    const deliveryHours = theme.delivery_hours || {
      open: '11:00',
      close: '03:00',
      is_accepting_orders: true,
    };

    if (deliveryHours.is_accepting_orders === false) {
      throw new BadRequestException(
        deliveryHours.closed_message || 'Restaurant is currently not accepting online delivery orders.'
      );
    }

    if (deliveryHours.open && deliveryHours.close) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: branch.timezone || 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date());

      const hourStr = parts.find((p) => p.type === 'hour')?.value || '12';
      const minStr = parts.find((p) => p.type === 'minute')?.value || '00';
      const currentMin = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);

      const [openH, openM] = deliveryHours.open.split(':').map((v: string) => parseInt(v, 10));
      const [closeH, closeM] = deliveryHours.close.split(':').map((v: string) => parseInt(v, 10));

      const openMin = (isNaN(openH) ? 11 : openH) * 60 + (isNaN(openM) ? 0 : openM);
      const closeMin = (isNaN(closeH) ? 3 : closeH) * 60 + (isNaN(closeM) ? 0 : closeM);

      let isWithinHours = false;
      if (closeMin < openMin) {
        // Crosses midnight (e.g. 11:00 AM to 03:00 AM)
        isWithinHours = currentMin >= openMin || currentMin < closeMin;
      } else {
        isWithinHours = currentMin >= openMin && currentMin < closeMin;
      }

      if (!isWithinHours) {
        throw new BadRequestException(
          deliveryHours.closed_message ||
            `Online delivery is currently closed. Operating delivery hours are ${deliveryHours.open} to ${deliveryHours.close} (PKT).`
        );
      }
    }

    // 3. Validate Cart and Quote
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

    return { order: this.serializeOrder(result), payment: paymentResult };
  }

  private isValidUuid(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  }

  private serializeOrder(order: any) {
    if (!order) return null;
    return {
      ...order,
      subtotal_minor: order.subtotal_minor != null ? Number(order.subtotal_minor) : 0,
      tax_minor: order.tax_minor != null ? Number(order.tax_minor) : 0,
      delivery_fee_minor: order.delivery_fee_minor != null ? Number(order.delivery_fee_minor) : 0,
      service_fee_minor: order.service_fee_minor != null ? Number(order.service_fee_minor) : 0,
      grand_total_minor: order.grand_total_minor != null ? Number(order.grand_total_minor) : 0,
      items: (order.items || []).map((item: any) => ({
        ...item,
        unit_price_minor: item.unit_price_minor != null ? Number(item.unit_price_minor) : 0,
        line_subtotal_minor: item.line_subtotal_minor != null ? Number(item.line_subtotal_minor) : 0,
        line_total_minor: item.line_total_minor != null ? Number(item.line_total_minor) : 0,
        modifiers: (item.modifiers || []).map((m: any) => ({
          ...m,
          unit_price_delta_minor: m.unit_price_delta_minor != null ? Number(m.unit_price_delta_minor) : 0,
          total_minor: m.total_minor != null ? Number(m.total_minor) : 0,
        }))
      }))
    };
  }

  async getOrder(orderId: string) {
    const whereClause: any = { tenant_id: this.tenantId };
    if (this.isValidUuid(orderId)) {
      whereClause.OR = [{ id: orderId }, { order_number: orderId }];
    } else {
      whereClause.order_number = orderId;
    }

    const order = await this.db.order.findFirst({
      where: whereClause,
      include: {
        items: {
          include: { modifiers: true }
        },
        history: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    return this.serializeOrder(order);
  }

  async getCustomerHistory(customerId?: string) {
    if (!customerId) return [];
    const orders = await this.db.order.findMany({
      where: { tenant_id: this.tenantId, customer_id: customerId },
      orderBy: { created_at: 'desc' }
    });
    return orders.map(o => this.serializeOrder(o));
  }
}
