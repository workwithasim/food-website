import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface CreateOrderReviewDto {
  orderId: string;
  foodRating: number;
  riderRating?: number;
  comment?: string;
}

@Injectable()
export class ReviewsService {
  constructor(private db: DatabaseService) {}

  async createReview(tenantId: string, customerId: string, dto: CreateOrderReviewDto) {
    if (dto.foodRating < 1 || dto.foodRating > 5) {
      throw new BadRequestException('Food rating must be between 1 and 5');
    }
    if (dto.riderRating !== undefined && (dto.riderRating < 1 || dto.riderRating > 5)) {
      throw new BadRequestException('Rider rating must be between 1 and 5');
    }

    const order = await this.db.order.findFirst({
      where: {
        id: dto.orderId,
        tenant_id: tenantId,
        customer_id: customerId,
      },
      include: {
        review: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or does not belong to customer');
    }

    // Strict rule: Only delivered orders reviewable
    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Only delivered orders can be reviewed');
    }

    // Prevent duplicate reviews
    if (order.review) {
      throw new ConflictException('A review has already been submitted for this order');
    }

    return this.db.orderReview.create({
      data: {
        tenant_id: tenantId,
        order_id: dto.orderId,
        customer_id: customerId,
        branch_id: order.branch_id,
        food_rating: dto.foodRating,
        rider_rating: dto.riderRating,
        comment: dto.comment,
      },
      include: {
        customer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  async listReviews(
    tenantId: string,
    filter?: {
      branchId?: string;
      customerId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = { tenant_id: tenantId };
    if (filter?.branchId) where.branch_id = filter.branchId;
    if (filter?.customerId) where.customer_id = filter.customerId;

    const [reviews, total] = await Promise.all([
      this.db.orderReview.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          order: {
            select: {
              id: true,
              order_number: true,
              created_at: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.db.orderReview.count({ where }),
    ]);

    return {
      items: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBranchRatingSummary(tenantId: string, branchId: string) {
    const reviews = await this.db.orderReview.findMany({
      where: {
        tenant_id: tenantId,
        branch_id: branchId,
      },
      select: {
        food_rating: true,
        rider_rating: true,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageFoodRating: 0,
        averageRiderRating: 0,
      };
    }

    let foodSum = 0;
    let riderSum = 0;
    let riderCount = 0;

    for (const r of reviews) {
      foodSum += r.food_rating;
      if (r.rider_rating !== null && r.rider_rating !== undefined) {
        riderSum += r.rider_rating;
        riderCount++;
      }
    }

    return {
      totalReviews: reviews.length,
      averageFoodRating: Number((foodSum / reviews.length).toFixed(1)),
      averageRiderRating: riderCount > 0 ? Number((riderSum / riderCount).toFixed(1)) : 0,
    };
  }
}
