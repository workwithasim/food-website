import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SupportService, CreateSupportTicketDto } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async createTicket(@Request() req: any, @Body() dto: CreateSupportTicketDto) {
    const tenantId = req.user.tenantId;
    const customerId = req.user.customerId || req.user.id;
    return this.supportService.createTicket(tenantId, customerId, dto);
  }

  @Get()
  async listTickets(
    @Request() req: any,
    @Query('customerId') customerId?: string,
    @Query('status') status?: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.supportService.listTickets(tenantId, {
      customerId: req.user.customerId || customerId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  async getTicket(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.supportService.getTicket(tenantId, id);
  }

  @Post(':id/messages')
  async addMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    const tenantId = req.user.tenantId;
    const isCustomer = !!req.user.customerId;
    const senderType = isCustomer ? 'CUSTOMER' : 'STAFF';
    const senderId = isCustomer ? req.user.customerId : req.user.id;
    return this.supportService.addMessage(
      tenantId,
      id,
      { senderType, senderId },
      message,
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.supportService.updateStatus(tenantId, id, status);
  }
}
