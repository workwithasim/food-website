import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reporting')
@UseGuards(JwtAuthGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('sales')
  async getSales(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.reportingService.getSalesReport(tenantId, { startDate, endDate, branchId }, req.user);
  }

  @Get('revenue/by-branch')
  async getRevenueByBranch(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.reportingService.getRevenueByBranch(tenantId, { startDate, endDate, branchId }, req.user);
  }

  @Get('operations/sla')
  async getOperationsSla(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.reportingService.getOperationsSla(tenantId, { startDate, endDate, branchId }, req.user);
  }

  @Get('customers/cohorts')
  async getCustomerCohorts(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.reportingService.getCustomerCohorts(tenantId, { startDate, endDate });
  }

  @Get('reconciliation')
  async getReconciliation(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.reportingService.runFinancialReconciliation(tenantId, { startDate, endDate, branchId }, req.user);
  }
}
