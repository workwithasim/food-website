import { Controller, Get, Post, Put, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { DeliveryZonesService, CreateDeliveryZoneDto } from '../services/delivery-zones.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';

@Controller('v1/admin/branches/:branchId/zones')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DeliveryZonesController {
  constructor(@Inject(DeliveryZonesService) private deliveryZonesService: DeliveryZonesService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_BRANCHES)
  async listZones(@Param('branchId') branchId: string) {
    return this.deliveryZonesService.listZones(branchId);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_BRANCHES)
  async createZone(@Param('branchId') branchId: string, @Body() body: CreateDeliveryZoneDto) {
    return this.deliveryZonesService.createZone(branchId, body);
  }

  @Put(':zoneId')
  @RequirePermissions(Permission.MANAGE_BRANCHES)
  async updateZone(
    @Param('branchId') branchId: string, 
    @Param('zoneId') zoneId: string, 
    @Body() body: Partial<CreateDeliveryZoneDto>
  ) {
    return this.deliveryZonesService.updateZone(branchId, zoneId, body);
  }
}
