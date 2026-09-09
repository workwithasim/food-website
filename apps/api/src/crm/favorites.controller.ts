import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async listFavorites(@Request() req: any) {
    const tenantId = req.user.tenantId;
    const customerId = req.user.customerId || req.user.id;
    return this.favoritesService.listFavorites(tenantId, customerId);
  }

  @Post(':productId')
  async addFavorite(@Request() req: any, @Param('productId') productId: string) {
    const tenantId = req.user.tenantId;
    const customerId = req.user.customerId || req.user.id;
    return this.favoritesService.addFavorite(tenantId, customerId, productId);
  }

  @Delete(':productId')
  async removeFavorite(@Request() req: any, @Param('productId') productId: string) {
    const tenantId = req.user.tenantId;
    const customerId = req.user.customerId || req.user.id;
    return this.favoritesService.removeFavorite(tenantId, customerId, productId);
  }
}
