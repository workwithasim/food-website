import { Controller, Get, Inject } from '@nestjs/common';
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
}
