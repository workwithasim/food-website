import { Controller, Post, Body, Req, UnauthorizedException, HttpCode, Get, UseGuards, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../../database/database.service';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('v1/admin/auth')
export class StaffAuthController {
  constructor(
    @Inject(DatabaseService) private db: DatabaseService,
    @Inject(AuthService) private authService: AuthService,
    @Inject(SessionService) private sessionService: SessionService,
    @Inject(ClsService) private cls: ClsService<TenantContext>,
  ) {}

  private get tenantId() {
    return this.cls.get('tenantId');
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: any, @Req() req: Request) {
    const { email, password } = body;
    
    if (!email || !password) {
      throw new UnauthorizedException('Email and password required');
    }

    const user = await this.db.user.findFirst({
      where: { email },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'DISABLED') {
      throw new UnauthorizedException('Account disabled');
    }

    // Verify tenant membership
    const membership = await this.db.tenantMembership.findUnique({
      where: {
        tenant_id_user_id: { tenant_id: this.tenantId, user_id: user.id },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials or no access to this tenant');
    }

    const isValid = await this.authService.verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const rawRefreshToken = await this.sessionService.createSession(
      'user',
      user.id,
      req.headers['user-agent'],
      req.ip,
    );

    const accessToken = this.authService.generateAccessToken({
      sub: user.id,
      type: 'user',
      tenantId: this.tenantId,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
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

    if (entityType !== 'user') {
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
    if (user.type !== 'user') {
      throw new UnauthorizedException('Only staff can access this');
    }

    const sessions = await this.sessionService.getActiveSessions('user', user.sub);
    return { sessions };
  }
}
