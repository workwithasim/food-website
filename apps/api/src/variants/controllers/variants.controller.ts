import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { VariantsService, CreateVariantDto, CreateModifierGroupDto, CreateModifierDto } from '../services/variants.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';

// ─── Products: Variants ─────────────────────────────────────────────────────

@Controller('v1/admin/catalog/products/:productId')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VariantsController {
  constructor(@Inject(VariantsService) private variantsService: VariantsService) {}

  @Get('full')
  @RequirePermissions(Permission.VIEW_CATALOG)
  getProductFull(@Param('productId') productId: string) {
    return this.variantsService.getProductWithModifiers(productId);
  }

  @Get('variants')
  @RequirePermissions(Permission.VIEW_CATALOG)
  listVariants(@Param('productId') productId: string) {
    return this.variantsService.listVariants(productId);
  }

  @Post('variants')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  createVariant(@Param('productId') productId: string, @Body() body: CreateVariantDto) {
    return this.variantsService.createVariant(productId, body);
  }

  @Put('variants/:variantId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  updateVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() body: Partial<CreateVariantDto>,
  ) {
    return this.variantsService.updateVariant(productId, variantId, body);
  }

  @Delete('variants/:variantId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  deleteVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.variantsService.deleteVariant(productId, variantId);
  }

  // ─── Product ↔ Modifier Group Links ────────────────────────────────────────

  @Post('modifier-groups/:groupId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  attachModifierGroup(
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
    @Body('sort_order') sortOrder: number,
  ) {
    return this.variantsService.attachModifierGroupToProduct(productId, groupId, sortOrder);
  }

  @Delete('modifier-groups/:groupId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  detachModifierGroup(
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.variantsService.detachModifierGroupFromProduct(productId, groupId);
  }
}

// ─── Modifier Groups ─────────────────────────────────────────────────────────

@Controller('v1/admin/catalog/modifier-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ModifierGroupsController {
  constructor(@Inject(VariantsService) private variantsService: VariantsService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_CATALOG)
  listModifierGroups() {
    return this.variantsService.listModifierGroups();
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_CATALOG)
  createModifierGroup(@Body() body: CreateModifierGroupDto) {
    return this.variantsService.createModifierGroup(body);
  }

  @Put(':groupId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  updateModifierGroup(@Param('groupId') groupId: string, @Body() body: Partial<CreateModifierGroupDto>) {
    return this.variantsService.updateModifierGroup(groupId, body);
  }

  @Delete(':groupId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  deleteModifierGroup(@Param('groupId') groupId: string) {
    return this.variantsService.deleteModifierGroup(groupId);
  }

  // ─── Modifiers inside a group ───────────────────────────────────────────────

  @Post(':groupId/modifiers')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  createModifier(@Param('groupId') groupId: string, @Body() body: CreateModifierDto) {
    return this.variantsService.createModifier(groupId, body);
  }

  @Put(':groupId/modifiers/:modifierId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  updateModifier(
    @Param('groupId') groupId: string,
    @Param('modifierId') modifierId: string,
    @Body() body: Partial<CreateModifierDto>,
  ) {
    return this.variantsService.updateModifier(groupId, modifierId, body);
  }

  @Delete(':groupId/modifiers/:modifierId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  deleteModifier(
    @Param('groupId') groupId: string,
    @Param('modifierId') modifierId: string,
  ) {
    return this.variantsService.deleteModifier(groupId, modifierId);
  }
}
