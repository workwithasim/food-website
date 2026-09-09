import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CategoriesService } from '../services/categories.service';

@Controller('v1/catalog')
export class PublicCatalogController {
  constructor(
    @Inject(ProductsService) private productsService: ProductsService,
    @Inject(CategoriesService) private categoriesService: CategoriesService,
  ) {}

  @Get('categories')
  async listPublicCategories() {
    const all = await this.categoriesService.listCategories();
    // Public: only ACTIVE
    return all.filter(c => c.status === 'ACTIVE');
  }

  @Get('products')
  listPublicProducts(@Query('category_id') categoryId?: string, @Query('featured') featured?: string) {
    return this.productsService.listProducts({
      status: 'ACTIVE',
      category_id: categoryId,
      featured: featured !== undefined ? featured === 'true' : undefined,
    });
  }

  @Get('products/:slug')
  getPublicProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }
}
