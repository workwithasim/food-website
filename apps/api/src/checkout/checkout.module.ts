import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
