import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('customers')
  async listCustomers(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('tagId') tagId?: string,
    @Query('isBlocked') isBlocked?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.crmService.listCustomers(tenantId, {
      search,
      tagId,
      isBlocked: isBlocked !== undefined ? isBlocked === 'true' : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('customers/:id')
  async getCustomerDetail(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    const canViewPii = req.user.role === 'OWNER' || req.user.role === 'ADMIN' || req.user.permissions?.includes('customers:pii');
    return this.crmService.getCustomerDetail(tenantId, id, {
      userId: req.user.id,
      canViewPii,
    });
  }

  @Post('customers/:id/block')
  async blockCustomer(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.crmService.blockCustomer(tenantId, id, req.user.id, reason);
  }

  @Post('customers/:id/unblock')
  async unblockCustomer(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.crmService.unblockCustomer(tenantId, id, req.user.id, reason);
  }

  @Get('tags')
  async listTags(@Request() req: any) {
    return this.crmService.listTags(req.user.tenantId);
  }

  @Post('tags')
  async createTag(
    @Request() req: any,
    @Body('name') name: string,
    @Body('color') color?: string,
  ) {
    return this.crmService.createTag(req.user.tenantId, name, color);
  }

  @Post('customers/:id/tags')
  async assignTag(
    @Request() req: any,
    @Param('id') customerId: string,
    @Body('tagId') tagId: string,
  ) {
    return this.crmService.assignTag(req.user.tenantId, customerId, tagId);
  }

  @Delete('customers/:id/tags/:tagId')
  async removeTag(
    @Request() req: any,
    @Param('id') customerId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.crmService.removeTag(req.user.tenantId, customerId, tagId);
  }
}
