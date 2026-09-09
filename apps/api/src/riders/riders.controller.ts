import { Controller, Get, Post, Query, Body, Request, UseGuards } from '@nestjs/common';
import { RidersService } from './riders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('riders')
@UseGuards(JwtAuthGuard)
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get('available')
  async getAvailable(@Request() req: any, @Query('branchId') branchId: string) {
    return this.ridersService.getAvailableRiders(req.user.tenantId, branchId);
  }

  @Post('location')
  async updateLocation(@Request() req: any, @Body() body: { lat: number, lng: number }) {
    return this.ridersService.updateLocation(req.user.tenantId, req.user.id, body.lat, body.lng);
  }
}
