import { Controller, Get, Post, Put, Delete, Body, Param, Req, Inject, UnauthorizedException } from '@nestjs/common';
import { CartService, AddItemDto } from './cart.service';

@Controller('v1/cart')
export class CartController {
  constructor(
    @Inject(CartService) private cartService: CartService,
  ) {}

  private getIdentifiers(req: any) {
    const customerId = req.user?.sub;
    const guestToken = req.headers['x-guest-token'] as string | undefined;
    return { customerId, guestToken };
  }

  @Get()
  async getCart(@Req() req: any) {
    const ids = this.getIdentifiers(req);
    const cart = await this.cartService.getCart(ids);
    return cart || { items: [] };
  }

  @Post('items')
  async addItem(@Req() req: any, @Body() dto: AddItemDto) {
    const ids = this.getIdentifiers(req);
    if (!ids.customerId && !ids.guestToken) {
      throw new UnauthorizedException('Must provide authentication or X-Guest-Token header');
    }
    await this.cartService.addItem(ids, dto);
    return this.cartService.getCart(ids);
  }

  @Put('items/:itemId')
  async updateItem(@Req() req: any, @Param('itemId') itemId: string, @Body('quantity') quantity: number) {
    const ids = this.getIdentifiers(req);
    const cart = await this.cartService.getCart(ids);
    if (!cart) throw new UnauthorizedException('Cart not found');
    await this.cartService.updateItemQuantity(cart.id, itemId, quantity);
    return this.cartService.getCart(ids);
  }

  @Delete('items/:itemId')
  async removeItem(@Req() req: any, @Param('itemId') itemId: string) {
    const ids = this.getIdentifiers(req);
    const cart = await this.cartService.getCart(ids);
    if (!cart) throw new UnauthorizedException('Cart not found');
    await this.cartService.removeItem(cart.id, itemId);
    return this.cartService.getCart(ids);
  }

  @Post('merge')
  async mergeCart(@Req() req: any, @Body('guest_token') guestToken: string) {
    const customerId = req.user?.sub;
    if (!customerId) throw new UnauthorizedException('Must be logged in to merge cart');
    if (!guestToken) return this.cartService.getCart({ customerId });
    return this.cartService.mergeCarts(guestToken, customerId);
  }
}
