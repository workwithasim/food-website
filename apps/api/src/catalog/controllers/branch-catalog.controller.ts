import { Controller, Get, Put, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { BranchProductsService, UpsertBranchProductDto } from '../services/branch-products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';

@Controller('v1/admin/branches/:branchId/catalog')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchCatalogController {
  constructor(@Inject(BranchProductsService) private branchProductsService: BranchProductsService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_CATALOG)
  getBranchCatalog(@Param('branchId') branchId: string) {
    return this.branchProductsService.getBranchCatalog(branchId);
  }

  @Put(':productId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  upsertBranchProduct(
    @Param('branchId') branchId: string,
    @Param('productId') productId: string,
    @Body() body: UpsertBranchProductDto,
  ) {
    return this.branchProductsService.upsertBranchProduct(branchId, productId, body);
  }
}
