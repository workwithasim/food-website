import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { randomInt, createHash } from 'crypto';

@Injectable()
export class OtpService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  private hashOtp(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
  }

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async createChallenge(identifier: string): Promise<string> {
    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);

    // In a real application, we would send the OTP via SMS or email here.
    console.log(`[DEV ONLY] Mock sending OTP ${otp} to ${identifier}`);

    // Delete any existing active challenge for this identifier
    await this.db.otpChallenge.deleteMany({
      where: {
        tenant_id: this.tenantId,
        identifier: identifier,
      },
    });

    const challenge = await this.db.otpChallenge.create({
      data: {
        tenant_id: this.tenantId,
        identifier: identifier,
        otp_hash: otpHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    return challenge.id;
  }

  async verifyChallenge(identifier: string, code: string): Promise<boolean> {
    const otpHash = this.hashOtp(code);

    const challenge = await this.db.otpChallenge.findFirst({
      where: {
        tenant_id: this.tenantId,
        identifier: identifier,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!challenge) {
      throw new BadRequestException('No active OTP challenge found');
    }

    if (challenge.is_verified) {
      throw new BadRequestException('Challenge already verified');
    }

    if (challenge.expires_at < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (challenge.attempts >= 5) {
      throw new BadRequestException('Maximum attempts reached. Please request a new OTP');
    }

    if (challenge.otp_hash !== otpHash) {
      await this.db.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: challenge.attempts + 1 },
      });
      throw new BadRequestException('Invalid OTP');
    }

    await this.db.otpChallenge.update({
      where: { id: challenge.id },
      data: { is_verified: true },
    });

    return true;
  }
}
