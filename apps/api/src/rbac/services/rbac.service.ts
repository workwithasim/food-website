import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { Permission } from '../permissions.enum';

@Injectable()
export class RbacService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  /**
   * Checks if a user has all the requested permissions within the current tenant context.
   */
  async checkPermissions(userId: string, requiredPermissions: Permission[]): Promise<boolean> {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required
    }

    // A single query to find if the user has a membership with roles that satisfy the permissions
    // Note: Since Prisma doesn't have an easy "has all these values in an array" for relations in a single simple findFirst,
    // we can fetch the user's permissions for the tenant and check in memory, or use a specific query.
    // Given permissions are small, fetching the user's permissions in the tenant is very fast.
    const membership = await this.db.tenantMembership.findUnique({
      where: {
        tenant_id_user_id: {
          tenant_id: this.tenantId,
          user_id: userId,
        },
        status: 'ACTIVE',
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return false; // Not an active member of this tenant
    }

    const userPermissions = new Set<string>();
    
    for (const membershipRole of membership.roles) {
      for (const rolePermission of membershipRole.role.permissions) {
        userPermissions.add(rolePermission.permission.key);
      }
    }

    // Ensure the user has ALL required permissions
    return requiredPermissions.every((reqPerm) => userPermissions.has(reqPerm));
  }

  /**
   * Throws ForbiddenException if the user lacks any of the required permissions.
   */
  async requirePermissions(userId: string, requiredPermissions: Permission[]): Promise<void> {
    const hasAccess = await this.checkPermissions(userId, requiredPermissions);
    if (!hasAccess) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
