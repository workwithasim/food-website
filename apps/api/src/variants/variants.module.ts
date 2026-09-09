import { Module } from '@nestjs/common';
import { VariantsService } from './services/variants.service';
import { VariantsController, ModifierGroupsController } from './controllers/variants.controller';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [AuthModule, RbacModule],
  controllers: [VariantsController, ModifierGroupsController],
  providers: [VariantsService],
  exports: [VariantsService],
})
export class VariantsModule {}
