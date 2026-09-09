import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { CategoriesService, CreateCategoryDto } from '../services/categories.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { RequirePermissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/permissions.enum';

@Controller('v1/admin/catalog/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoriesController {
  constructor(@Inject(CategoriesService) private categoriesService: CategoriesService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_CATALOG)
  listCategories() {
    return this.categoriesService.listCategories();
  }

  @Get(':id')
  @RequirePermissions(Permission.VIEW_CATALOG)
  getCategory(@Param('id') id: string) {
    return this.categoriesService.getCategory(id);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_CATALOG)
  createCategory(@Body() body: CreateCategoryDto) {
    return this.categoriesService.createCategory(body);
  }

  @Put(':id')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  updateCategory(@Param('id') id: string, @Body() body: Partial<CreateCategoryDto>) {
    return this.categoriesService.updateCategory(id, body);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_CATALOG)
  deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
