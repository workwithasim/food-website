import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('promotions')
@UseGuards(JwtAuthGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  async listPromotions(@Request() req: any) {
    return this.promotionsService.listPromotions(req.user.tenantId);
  }
}
