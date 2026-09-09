export interface PaymentIntentOptions {
  amount_minor: bigint;
  currency: string;
  order_id: string;
  customer_id?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  provider_payment_id: string;
  client_secret?: string;
  redirect_url?: string;
}

export interface RefundOptions {
  payment_id: string;
  provider_payment_id: string;
  amount_minor: bigint;
  reason: string;
}

export interface RefundResult {
  provider_refund_id: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
}

export interface PaymentProvider {
  createIntent(options: PaymentIntentOptions): Promise<PaymentIntentResult>;
  verifyWebhook(payload: string, signature: string): boolean;
  refund(options: RefundOptions): Promise<RefundResult>;
}
