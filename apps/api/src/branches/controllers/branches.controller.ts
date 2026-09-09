import { Controller, Get, Post, Put, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { BranchesService, CreateBranchDto } from '../services/branches.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';

@Controller('v1/admin/branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchesController {
  constructor(@Inject(BranchesService) private branchesService: BranchesService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_BRANCHES)
  async listBranches() {
    return this.branchesService.listBranches();
  }

  @Get(':id')
  @RequirePermissions(Permission.VIEW_BRANCHES)
  async getBranch(@Param('id') id: string) {
    return this.branchesService.getBranch(id);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_BRANCHES)
  async createBranch(@Body() body: CreateBranchDto) {
    return this.branchesService.createBranch(body);
  }

  @Put(':id')
  @RequirePermissions(Permission.MANAGE_BRANCHES)
  async updateBranch(@Param('id') id: string, @Body() body: Partial<CreateBranchDto>) {
    return this.branchesService.updateBranch(id, body);
  }

  @Put(':id/hours')
  @RequirePermissions(Permission.MANAGE_BRANCHES)
  async updateHours(@Param('id') id: string, @Body() body: { hours: any[] }) {
    return this.branchesService.updateHours(id, body.hours);
  }

  @Put(':id/special-hours')
  @RequirePermissions(Permission.MANAGE_BRANCHES)
  async updateSpecialHours(@Param('id') id: string, @Body() body: { special_hours: any[] }) {
    return this.branchesService.updateSpecialHours(id, body.special_hours);
  }
}
