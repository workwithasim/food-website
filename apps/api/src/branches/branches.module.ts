import { Module } from '@nestjs/common';
import { BranchesService } from './services/branches.service';
import { BranchesController } from './controllers/branches.controller';
import { DeliveryZonesService } from './services/delivery-zones.service';
import { DeliveryZonesController } from './controllers/delivery-zones.controller';
import { BranchResolverService } from './services/branch-resolver.service';
import { BranchResolverController } from './controllers/branch-resolver.controller';
import { PublicBranchesController } from './controllers/public-branches.controller';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RbacModule, AuthModule],
  controllers: [
    BranchesController,
    PublicBranchesController,
    DeliveryZonesController,
    BranchResolverController
  ],
  providers: [
    BranchesService,
    DeliveryZonesService,
    BranchResolverService
  ],
  exports: [BranchesService],
})
export class BranchesModule {}
