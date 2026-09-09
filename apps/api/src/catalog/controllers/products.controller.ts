import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ProductsService, CreateProductDto, AddMediaDto } from '../services/products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';
import { CatalogStatus } from '@restaurant/database';

@Controller('v1/admin/catalog/products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(@Inject(ProductsService) private productsService: ProductsService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_CATALOG)
  listProducts(
    @Query('category_id') categoryId?: string,
    @Query('status') status?: CatalogStatus,
    @Query('featured') featured?: string,
  ) {
    return this.productsService.listProducts({
      category_id: categoryId,
      status,
      featured: featured !== undefined ? featured === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions(Permission.VIEW_CATALOG)
  getProduct(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_CATALOG)
  createProduct(@Body() body: CreateProductDto) {
    return this.productsService.createProduct(body);
  }

  @Put(':id')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  updateProduct(@Param('id') id: string, @Body() body: Partial<CreateProductDto>) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Post(':id/media')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  addMedia(@Param('id') id: string, @Body() body: AddMediaDto) {
    return this.productsService.addMedia(id, body);
  }

  @Delete(':id/media/:mediaId')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  removeMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
    return this.productsService.removeMedia(id, mediaId);
  }
}
