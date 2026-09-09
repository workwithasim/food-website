import { Controller, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post('assign')
  async assign(@Request() req: any, @Body() body: { orderId: string, riderId: string }) {
    return this.deliveriesService.assignRider(req.user.tenantId, body.orderId, body.riderId);
  }

  @Post(':id/accept')
  async accept(@Request() req: any, @Param('id') id: string) {
    return this.deliveriesService.acceptDelivery(id, req.user.id);
  }

  @Post(':id/deliver')
  async deliver(@Request() req: any, @Param('id') id: string) {
    return this.deliveriesService.markDelivered(id, req.user.id);
  }
}
