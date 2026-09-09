import { Module } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { TenancyController } from './tenancy.controller';

import { TenantMiddleware } from './tenant.middleware';

@Module({
  controllers: [TenancyController],
  providers: [TenancyService, TenantMiddleware],
  exports: [TenancyService, TenantMiddleware],
})
export class TenancyModule {}
