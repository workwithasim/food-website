import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  controllers: [
    CrmController,
    ReviewsController,
    SupportController,
    FavoritesController,
  ],
  providers: [
    CrmService,
    ReviewsService,
    SupportService,
    FavoritesService,
  ],
  exports: [
    CrmService,
    ReviewsService,
    SupportService,
    FavoritesService,
  ],
})
export class CrmModule {}
