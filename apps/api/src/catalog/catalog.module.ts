import { Module } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';
import { BranchProductsService } from './services/branch-products.service';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';
import { PublicCatalogController } from './controllers/public-catalog.controller';
import { BranchCatalogController } from './controllers/branch-catalog.controller';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [AuthModule, RbacModule],
  controllers: [
    CategoriesController,
    ProductsController,
    PublicCatalogController,
    BranchCatalogController,
  ],
  providers: [
    CategoriesService,
    ProductsService,
    BranchProductsService,
  ],
  exports: [ProductsService, CategoriesService],
})
export class CatalogModule {}
