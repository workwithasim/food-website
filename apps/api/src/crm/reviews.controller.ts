import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService, CreateOrderReviewDto } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(@Request() req: any, @Body() dto: CreateOrderReviewDto) {
    const tenantId = req.user.tenantId;
    const customerId = req.user.customerId || req.user.id;
    return this.reviewsService.createReview(tenantId, customerId, dto);
  }

  @Get()
  async listReviews(
    @Request() req: any,
    @Query('branchId') branchId?: string,
    @Query('customerId') customerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.reviewsService.listReviews(tenantId, {
      branchId,
      customerId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('branches/:branchId/summary')
  async getBranchSummary(
    @Request() req: any,
    @Param('branchId') branchId: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.reviewsService.getBranchRatingSummary(tenantId, branchId);
  }
}
