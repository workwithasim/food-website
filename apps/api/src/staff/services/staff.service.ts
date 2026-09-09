import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';


@Injectable()
export class StaffService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async listStaff() {
    return this.db.tenantMembership.findMany({
      where: { tenant_id: this.tenantId },
      include: {
        user: {
          select: { id: true, email: true, display_name: true, status: true },
        },
        roles: {
          include: { role: { select: { id: true, name: true, key: true } } },
        },
      },
    });
  }

  async inviteStaff(email: string, displayName: string, roleIds: string[]) {
    // 1. Check if user already exists
    let user = await this.db.user.findFirst({ where: { email } });

    if (!user) {
      user = await this.db.user.create({
        data: {
          email,
          display_name: displayName,
          status: 'INVITED',
        },
      });
    }

    // 2. Check membership
    let membership = await this.db.tenantMembership.findUnique({
      where: {
        tenant_id_user_id: {
          tenant_id: this.tenantId,
          user_id: user.id,
        },
      },
    });

    if (membership) {
      throw new BadRequestException('User is already a staff member');
    }

    // 3. Create membership and roles
    membership = await this.db.tenantMembership.create({
      data: {
        tenant_id: this.tenantId,
        user_id: user.id,
        status: 'ACTIVE', // or INVITED
        roles: {
          create: roleIds.map((rId) => ({
            role_id: rId,
          })),
        },
      },
    });

    return membership;
  }

  async updateRoles(userId: string, roleIds: string[]) {
    const membership = await this.db.tenantMembership.findUnique({
      where: {
        tenant_id_user_id: {
          tenant_id: this.tenantId,
          user_id: userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Staff member not found');
    }

    // Delete existing roles
    await this.db.membershipRole.deleteMany({
      where: { membership_id: membership.id },
    });

    // Add new roles
    await this.db.membershipRole.createMany({
      data: roleIds.map((roleId) => ({
        membership_id: membership.id,
        role_id: roleId,
      })),
    });

    return { success: true };
  }

  async updateBranches(userId: string, branchIds: string[]) {
    // Delete existing
    await this.db.userBranchAssignment.deleteMany({
      where: {
        tenant_id: this.tenantId,
        user_id: userId,
      },
    });

    if (branchIds.length > 0) {
      await this.db.userBranchAssignment.createMany({
        data: branchIds.map((branchId) => ({
          tenant_id: this.tenantId,
          user_id: userId,
          branch_id: branchId,
        })),
      });
    }

    return { success: true };
  }
}
