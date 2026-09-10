import { Controller, Get, Put, Body, Inject } from '@nestjs/common';
import { TenancyService } from './tenancy.service';

@Controller('v1/storefront/config')
export class TenancyController {
  constructor(
    @Inject(TenancyService) private readonly tenancyService: TenancyService
  ) {}

  @Get()
  async getConfig() {
    return this.tenancyService.getStorefrontConfig();
  }

  @Put('settings')
  async updateSettings(@Body() body: any) {
    return this.tenancyService.updateStorefrontSettings(body);
  }
}
