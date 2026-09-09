import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../services/rbac.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../permissions.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private reflector: Reflector,
    @Inject(RbacService) private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Route doesn't require any specific permissions
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // JwtAuthGuard should have populated request.user
    if (!user || !user.sub) {
      return false; 
    }

    // Check if the user has the required permissions in the current tenant
    // Note: RbacService inherently uses ClsService to know the current tenant context
    return this.rbacService.checkPermissions(user.sub, requiredPermissions);
  }
}
