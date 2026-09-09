import { Controller, Post, Body, Req, UnauthorizedException, HttpCode, Get, UseGuards, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../../database/database.service';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { OtpService } from '../services/otp.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('v1/storefront/auth')
export class CustomerAuthController {
  constructor(
    @Inject(DatabaseService) private db: DatabaseService,
    @Inject(AuthService) private authService: AuthService,
    @Inject(SessionService) private sessionService: SessionService,
    @Inject(OtpService) private otpService: OtpService,
    @Inject(ClsService) private cls: ClsService<TenantContext>,
  ) {}

  private get tenantId() {
    return this.cls.get('tenantId');
  }

  @Post('login')
  @HttpCode(200)
  async loginWithPassword(@Body() body: any, @Req() req: Request) {
    const { email, password } = body;
    
    if (!email || !password) {
      throw new UnauthorizedException('Email and password required');
    }

    const customer = await this.db.customer.findUnique({
      where: {
        tenant_id_email: { tenant_id: this.tenantId, email },
      },
    });

    if (!customer || !customer.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.authService.verifyPassword(password, customer.password_hash);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const rawRefreshToken = await this.sessionService.createSession(
      'customer',
      customer.id,
      req.headers['user-agent'],
      req.ip,
    );

    const accessToken = this.authService.generateAccessToken({
      sub: customer.id,
      type: 'customer',
      tenantId: this.tenantId,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
      },
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshSession(@Body() body: any, @Req() req: Request) {
    const { refreshToken } = body;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const { entityType, entityId, newRawToken } = await this.sessionService.verifyAndRotateSession(
      refreshToken,
      req.headers['user-agent'],
      req.ip,
    );

    if (entityType !== 'customer') {
      throw new UnauthorizedException('Invalid session type');
    }

    const accessToken = this.authService.generateAccessToken({
      sub: entityId,
      type: entityType,
      tenantId: this.tenantId,
    });

    return {
      accessToken,
      refreshToken: newRawToken,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: any) {
    const { refreshToken } = body;
    if (refreshToken) {
      await this.sessionService.revokeSession(refreshToken);
    }
    return { success: true };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: Request) {
    const user: any = (req as any).user;
    if (user.type !== 'customer') {
      throw new UnauthorizedException('Only customers can access this');
    }

    const sessions = await this.sessionService.getActiveSessions('customer', user.sub);
    return { sessions };
  }

  @Post('otp/request')
  @HttpCode(200)
  async requestOtp(@Body() body: any) {
    const { phone } = body;
    if (!phone) {
      throw new UnauthorizedException('Phone number required');
    }

    await this.otpService.createChallenge(phone);
    return { success: true, message: 'OTP sent successfully' };
  }

  @Post('otp/verify')
  @HttpCode(200)
  async verifyOtp(@Body() body: any, @Req() req: Request) {
    const { phone, code } = body;
    
    if (!phone || !code) {
      throw new UnauthorizedException('Phone and code required');
    }

    await this.otpService.verifyChallenge(phone, code);

    // Upsert customer
    let customer = await this.db.customer.findUnique({
      where: {
        tenant_id_phone: { tenant_id: this.tenantId, phone },
      },
    });

    if (!customer) {
      customer = await this.db.customer.create({
        data: {
          tenant_id: this.tenantId,
          phone,
          first_name: 'Customer',
          is_verified: true,
        },
      });
    }

    const rawRefreshToken = await this.sessionService.createSession(
      'customer',
      customer.id,
      req.headers['user-agent'],
      req.ip,
    );

    const accessToken = this.authService.generateAccessToken({
      sub: customer.id,
      type: 'customer',
      tenantId: this.tenantId,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      customer: {
        id: customer.id,
        phone: customer.phone,
        firstName: customer.first_name,
      },
    };
  }
}
