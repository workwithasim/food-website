import { Controller, Get, Post, Put, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';

@Controller('v1/admin/staff')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StaffController {
  constructor(@Inject(StaffService) private staffService: StaffService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_STAFF)
  async listStaff() {
    return this.staffService.listStaff();
  }

  @Post('invite')
  @RequirePermissions(Permission.MANAGE_STAFF)
  async inviteStaff(@Body() body: { email: string; display_name: string; role_ids: string[] }) {
    return this.staffService.inviteStaff(body.email, body.display_name, body.role_ids);
  }

  @Put(':id/roles')
  @RequirePermissions(Permission.MANAGE_STAFF)
  async updateRoles(@Param('id') userId: string, @Body() body: { role_ids: string[] }) {
    return this.staffService.updateRoles(userId, body.role_ids);
  }

  @Put(':id/branches')
  @RequirePermissions(Permission.MANAGE_STAFF, Permission.MANAGE_BRANCHES)
  async updateBranches(@Param('id') userId: string, @Body() body: { branch_ids: string[] }) {
    return this.staffService.updateBranches(userId, body.branch_ids);
  }
}
