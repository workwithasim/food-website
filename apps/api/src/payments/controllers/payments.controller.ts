import { Controller, Post, Headers, Param, Body, BadRequestException } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook/:provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Headers('stripe-signature') signature: string, // example header, adapt as needed
    @Body() body: any
  ) {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }

    // Usually webhooks provide a unique event ID and type in the body
    const eventId = body.id || body.event_id;
    const eventType = body.type || body.event_type;

    if (!eventId || !eventType) {
      throw new BadRequestException('Invalid payload structure');
    }

    return this.paymentsService.processWebhook(
      provider,
      eventId,
      eventType,
      body,
      signature
    );
  }
}
