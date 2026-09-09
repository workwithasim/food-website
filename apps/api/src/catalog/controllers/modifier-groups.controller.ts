import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { 
  ModifierGroupsService, 
  CreateModifierGroupDto, 
  UpdateModifierGroupDto,
  CreateModifierDto,
  UpdateModifierDto,
  ProductModifierGroupDto
} from '../services/modifier-groups.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';

@Controller('v1/admin/catalog')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ModifierGroupsController {
  constructor(@Inject(ModifierGroupsService) private readonly modifierGroupsService: ModifierGroupsService) {}

  // Modifier Groups
  @Get('modifier-groups')
  @RequirePermissions(Permission.VIEW_CATALOG)
  async listModifierGroups() {
    return this.modifierGroupsService.listModifierGroups();
  }

  @Get('modifier-groups/:groupId')
  @RequirePermissions(Permission.VIEW_CATALOG)
  async getModifierGroup(@Param('groupId') groupId: string) {
    return this.modifierGroupsService.getModifierGroup(groupId);
  }

  @Post('modifier-groups')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async createModifierGroup(@Body() dto: CreateModifierGroupDto) {
    return this.modifierGroupsService.createModifierGroup(dto);
  }

  @Put('modifier-groups/:groupId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async updateModifierGroup(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateModifierGroupDto,
  ) {
    return this.modifierGroupsService.updateModifierGroup(groupId, dto);
  }

  @Delete('modifier-groups/:groupId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async deleteModifierGroup(@Param('groupId') groupId: string) {
    return this.modifierGroupsService.deleteModifierGroup(groupId);
  }

  // Modifiers
  @Post('modifier-groups/:groupId/modifiers')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async createModifier(
    @Param('groupId') groupId: string,
    @Body() dto: CreateModifierDto,
  ) {
    return this.modifierGroupsService.createModifier(groupId, dto);
  }

  @Put('modifier-groups/:groupId/modifiers/:modifierId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async updateModifier(
    @Param('modifierId') modifierId: string,
    @Body() dto: UpdateModifierDto,
  ) {
    return this.modifierGroupsService.updateModifier(modifierId, dto);
  }

  @Delete('modifier-groups/:groupId/modifiers/:modifierId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async deleteModifier(@Param('modifierId') modifierId: string) {
    return this.modifierGroupsService.deleteModifier(modifierId);
  }

  // Product Assignments
  @Get('products/:productId/modifier-groups')
  @RequirePermissions(Permission.VIEW_CATALOG)
  async listProductModifierGroups(@Param('productId') productId: string) {
    return this.modifierGroupsService.listProductModifierGroups(productId);
  }

  @Post('products/:productId/modifier-groups')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async assignModifierGroupToProduct(
    @Param('productId') productId: string,
    @Body() dto: ProductModifierGroupDto,
  ) {
    return this.modifierGroupsService.assignModifierGroupToProduct(productId, dto);
  }

  @Delete('products/:productId/modifier-groups/:groupId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async removeModifierGroupFromProduct(
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.modifierGroupsService.removeModifierGroupFromProduct(productId, groupId);
  }
}
