import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class SessionService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async createSession(
    entityType: 'user' | 'customer',
    entityId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const rawToken = this.generateToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.db.refreshSession.create({
      data: {
        tenant_id: this.tenantId,
        user_id: entityType === 'user' ? entityId : null,
        customer_id: entityType === 'customer' ? entityId : null,
        token_hash: tokenHash,
        expires_at: expiresAt,
        user_agent: userAgent,
        ip_address: ipAddress,
      },
    });

    return rawToken;
  }

  async verifyAndRotateSession(
    rawToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ entityType: 'user' | 'customer'; entityId: string; newRawToken: string }> {
    const tokenHash = this.hashToken(rawToken);

    const session = await this.db.refreshSession.findFirst({
      where: {
        tenant_id: this.tenantId,
        token_hash: tokenHash,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or invalid');
    }

    if (session.is_revoked) {
      // Possible token theft, could revoke ALL sessions for this user here.
      // For now, just deny.
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expires_at < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    // Revoke old session
    await this.db.refreshSession.update({
      where: { id: session.id },
      data: { is_revoked: true, updated_at: new Date() },
    });

    const entityType = session.user_id ? 'user' : 'customer';
    const entityId = session.user_id || session.customer_id;

    if (!entityId) {
      throw new UnauthorizedException('Invalid session owner');
    }

    // Create new session
    const newRawToken = await this.createSession(entityType, entityId, userAgent, ipAddress);

    return { entityType, entityId, newRawToken };
  }

  async revokeSession(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.db.refreshSession.updateMany({
      where: {
        tenant_id: this.tenantId,
        token_hash: tokenHash,
      },
      data: { is_revoked: true },
    });
  }

  async getActiveSessions(entityType: 'user' | 'customer', entityId: string) {
    return this.db.refreshSession.findMany({
      where: {
        tenant_id: this.tenantId,
        ...(entityType === 'user' ? { user_id: entityId } : { customer_id: entityId }),
        is_revoked: false,
        expires_at: { gt: new Date() },
      },
      select: {
        id: true,
        user_agent: true,
        ip_address: true,
        created_at: true,
        expires_at: true,
      },
    });
  }
}
