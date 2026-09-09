import { Module } from '@nestjs/common';
import { StaffService } from './services/staff.service';
import { StaffController } from './controllers/staff.controller';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RbacModule, AuthModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
