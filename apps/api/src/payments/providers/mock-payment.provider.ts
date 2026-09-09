import { Injectable } from '@nestjs/common';
import { PaymentProvider, PaymentIntentOptions, PaymentIntentResult, RefundOptions, RefundResult } from '../interfaces/payment-provider.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async createIntent(options: PaymentIntentOptions): Promise<PaymentIntentResult> {
    return {
      provider_payment_id: `mock_pi_${randomBytes(8).toString('hex')}`,
      client_secret: `mock_secret_${randomBytes(8).toString('hex')}`,
      redirect_url: `https://mock.payment.com/checkout?amount=${options.amount_minor}`
    };
  }

  verifyWebhook(_payload: string, signature: string): boolean {
    // In a real provider, verify HMAC signature
    // For mock, any string containing 'valid' as signature is fine
    return signature.includes('valid');
  }

  async refund(_options: RefundOptions): Promise<RefundResult> {
    return {
      provider_refund_id: `mock_re_${randomBytes(8).toString('hex')}`,
      status: 'SUCCEEDED'
    };
  }
}
