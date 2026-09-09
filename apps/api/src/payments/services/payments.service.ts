import { Injectable, Inject, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaymentProvider } from '../interfaces/payment-provider.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(DatabaseService) private db: DatabaseService,
    @Inject('PAYMENT_PROVIDER') private provider: PaymentProvider
  ) {}

  async processWebhook(providerName: string, eventId: string, eventType: string, payload: any, signature: string) {
    if (!this.provider.verifyWebhook(JSON.stringify(payload), signature)) {
      throw new Error('Invalid signature');
    }

    // 1. Idempotency / Deduplication check
    const existing = await this.db.paymentWebhookEvent.findUnique({
      where: {
        provider_provider_event_id: {
          provider: providerName,
          provider_event_id: eventId,
        }
      }
    });

    if (existing) {
      if (existing.processing_status === 'PROCESSED') {
        return { message: 'Already processed' };
      }
      // If pending/failed, we could potentially retry. For now, just continue if not processed.
    } else {
      await this.db.paymentWebhookEvent.create({
        data: {
          provider: providerName,
          provider_event_id: eventId,
          event_type: eventType,
          payload_redacted: payload as any,
          processing_status: 'PENDING'
        }
      });
    }

    // 2. Business Logic mapping
    try {
      if (eventType === 'payment_intent.succeeded') {
        const paymentIntentId = payload.data?.object?.id;
        
        const payment = await this.db.payment.findFirst({
          where: { provider_payment_id: paymentIntentId }
        });

        if (payment && payment.status !== 'PAID') {
          await this.db.$transaction(async (tx) => {
            // Mark payment as PAID
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'PAID',
                paid_at: new Date()
              }
            });

            // Update order payment status
            await tx.order.update({
              where: { id: payment.order_id },
              data: { payment_status: 'PAID', paid_minor: payment.amount_minor }
            });
            
            // Mark webhook event PROCESSED
            await tx.paymentWebhookEvent.update({
              where: { provider_provider_event_id: { provider: providerName, provider_event_id: eventId } },
              data: { processing_status: 'PROCESSED', processed_at: new Date() }
            });
          });
          this.logger.log(`Payment ${payment.id} succeeded via webhook.`);
        }
      }

      return { received: true };
    } catch (e) {
      // Mark failed
      await this.db.paymentWebhookEvent.update({
        where: { provider_provider_event_id: { provider: providerName, provider_event_id: eventId } },
        data: { processing_status: 'FAILED' }
      });
      throw e;
    }
  }

  // Called directly by the Order engine
  async createPaymentForOrder(order: any, method: string, providerName: string = 'mock') {
    if (method === 'COD') {
      // Create COD payment (PENDING)
      return this.db.payment.create({
        data: {
          tenant_id: order.tenant_id,
          order_id: order.id,
          provider: 'CASH',
          method: 'COD',
          status: 'PENDING',
          amount_minor: order.grand_total_minor,
          currency_code: order.currency_code
        }
      });
    } else {
      // Online Payment Intent
      const intentResult = await this.provider.createIntent({
        amount_minor: order.grand_total_minor,
        currency: order.currency_code,
        order_id: order.id,
        customer_id: order.customer_id
      });

      const payment = await this.db.payment.create({
        data: {
          tenant_id: order.tenant_id,
          order_id: order.id,
          provider: providerName,
          method: 'ONLINE',
          status: 'PENDING',
          amount_minor: order.grand_total_minor,
          currency_code: order.currency_code,
          provider_payment_id: intentResult.provider_payment_id
        }
      });

      // Record Attempt
      await this.db.paymentAttempt.create({
        data: {
          tenant_id: order.tenant_id,
          payment_id: payment.id,
          provider_attempt_id: intentResult.provider_payment_id,
          status: 'INITIALIZED',
          amount_minor: order.grand_total_minor
        }
      });

      return { payment, intentResult };
    }
  }
}
