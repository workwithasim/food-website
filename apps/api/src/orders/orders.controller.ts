import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';

@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('history')
  async getCustomerHistory(@Req() req: any) {
    // In a real scenario, extract customer ID from token
    const customerId = req.user?.id; 
    return this.ordersService.getCustomerHistory(customerId);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
}
