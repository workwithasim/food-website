import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PricingService, CheckoutQuoteDto } from '../pricing/pricing.service';

@Controller('api/v1/checkout')
export class CheckoutController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('quote')
  @HttpCode(200)
  async getQuote(@Body() dto: CheckoutQuoteDto) {
    return this.pricingService.calculateQuote(dto);
  }
}
