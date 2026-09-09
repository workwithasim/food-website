import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ProductVariantsService, CreateVariantDto, UpdateVariantDto } from '../services/product-variants.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';

@Controller('v1/admin/catalog')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductVariantsController {
  constructor(@Inject(ProductVariantsService) private readonly variantsService: ProductVariantsService) {}

  @Get('products/:productId/variants')
  @RequirePermissions(Permission.VIEW_CATALOG)
  async listVariants(@Param('productId') productId: string) {
    return this.variantsService.listVariants(productId);
  }

  @Post('products/:productId/variants')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.variantsService.createVariant(productId, dto);
  }

  @Put('products/:productId/variants/:variantId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.variantsService.updateVariant(variantId, dto);
  }

  @Delete('products/:productId/variants/:variantId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  async deleteVariant(@Param('variantId') variantId: string) {
    return this.variantsService.deleteVariant(variantId);
  }
}
