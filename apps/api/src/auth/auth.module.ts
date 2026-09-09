import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { TenancyModule } from '../tenancy/tenancy.module';

import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { OtpService } from './services/otp.service';

import { CustomerAuthController } from './controllers/customer-auth.controller';
import { StaffAuthController } from './controllers/staff-auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Global()
@Module({
  imports: [
    DatabaseModule,
    TenancyModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'super-secret-dev-key'),
        signOptions: { expiresIn: '15m' }, // Short-lived access tokens
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CustomerAuthController, StaffAuthController],
  providers: [AuthService, SessionService, OtpService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
