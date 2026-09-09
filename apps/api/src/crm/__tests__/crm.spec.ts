import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ReviewsService } from '../reviews.service';
import { CrmService } from '../crm.service';

describe('Phase 21: CRM & Reviews Business Logic', () => {
  let reviewsService: ReviewsService;
  let crmService: CrmService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      order: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      orderReview: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      customer: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      customerAuditLog: {
        create: vi.fn(),
      },
      customerTag: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      customerTagAssignment: {
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockDb)),
    };

    reviewsService = new ReviewsService(mockDb);
    crmService = new CrmService(mockDb);
  });

  describe('Reviews Acceptance Criteria', () => {
    it('rejects rating if not between 1 and 5', async () => {
      await expect(
        reviewsService.createReview('tenant-1', 'cust-1', {
          orderId: 'order-1',
          foodRating: 6,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('strictly enforces: only DELIVERED orders can be reviewed', async () => {
      mockDb.order.findFirst.mockResolvedValue({
        id: 'order-1',
        tenant_id: 'tenant-1',
        customer_id: 'cust-1',
        branch_id: 'branch-1',
        status: 'CONFIRMED', // NOT DELIVERED
        review: null,
      });

      await expect(
        reviewsService.createReview('tenant-1', 'cust-1', {
          orderId: 'order-1',
          foodRating: 5,
        }),
      ).rejects.toThrow('Only delivered orders can be reviewed');
    });

    it('prevents duplicate reviews for the same order', async () => {
      mockDb.order.findFirst.mockResolvedValue({
        id: 'order-1',
        tenant_id: 'tenant-1',
        customer_id: 'cust-1',
        branch_id: 'branch-1',
        status: 'DELIVERED',
        review: { id: 'rev-1', food_rating: 4 }, // Already reviewed
      });

      await expect(
        reviewsService.createReview('tenant-1', 'cust-1', {
          orderId: 'order-1',
          foodRating: 5,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates review successfully when order is DELIVERED', async () => {
      mockDb.order.findFirst.mockResolvedValue({
        id: 'order-1',
        tenant_id: 'tenant-1',
        customer_id: 'cust-1',
        branch_id: 'branch-1',
        status: 'DELIVERED',
        review: null,
      });

      mockDb.orderReview.create.mockResolvedValue({
        id: 'rev-new',
        order_id: 'order-1',
        food_rating: 5,
        rider_rating: 5,
        comment: 'Great meal and swift rider!',
      });

      const result = await reviewsService.createReview('tenant-1', 'cust-1', {
        orderId: 'order-1',
        foodRating: 5,
        riderRating: 5,
        comment: 'Great meal and swift rider!',
      });

      expect(result).toBeDefined();
      expect(result.food_rating).toBe(5);
      expect(mockDb.orderReview.create).toHaveBeenCalled();
    });
  });

  describe('Customer Block & Audit Controls', () => {
    it('requires a reason to block a customer', async () => {
      await expect(
        crmService.blockCustomer('tenant-1', 'cust-1', 'staff-1', '   '),
      ).rejects.toThrow('A reason is required to block a customer');
    });

    it('blocks customer and creates an audit log entry', async () => {
      mockDb.customer.findFirst.mockResolvedValue({
        id: 'cust-1',
        tenant_id: 'tenant-1',
        is_blocked: false,
      });
      mockDb.customer.update.mockResolvedValue({
        id: 'cust-1',
        is_blocked: true,
        blocked_reason: 'Fraudulent activity',
      });

      const result = await crmService.blockCustomer(
        'tenant-1',
        'cust-1',
        'staff-1',
        'Fraudulent activity',
      );

      expect(result.is_blocked).toBe(true);
      expect(mockDb.customerAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'BLOCK',
          reason: 'Fraudulent activity',
          actor_id: 'staff-1',
        }),
      });
    });

    it('unblocks customer and creates an audit log entry', async () => {
      mockDb.customer.findFirst.mockResolvedValue({
        id: 'cust-1',
        tenant_id: 'tenant-1',
        is_blocked: true,
      });
      mockDb.customer.update.mockResolvedValue({
        id: 'cust-1',
        is_blocked: false,
      });

      const result = await crmService.unblockCustomer(
        'tenant-1',
        'cust-1',
        'staff-1',
        'Resolved dispute',
      );

      expect(result.is_blocked).toBe(false);
      expect(mockDb.customerAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'UNBLOCK',
          reason: 'Resolved dispute',
          actor_id: 'staff-1',
        }),
      });
    });
  });

  describe('Privacy-Aware Customer View', () => {
    it('masks email and phone for unprivileged staff', async () => {
      mockDb.customer.findFirst.mockResolvedValue({
        id: 'cust-1',
        tenant_id: 'tenant-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+15551234567',
        tags: [],
        favorites: [],
        reviews: [],
        support_tickets: [],
        audit_logs: [],
      });
      mockDb.order.findMany.mockResolvedValue([]);

      const result = await crmService.getCustomerDetail('tenant-1', 'cust-1', {
        canViewPii: false,
      });

      expect(result.email).toBe('j***@example.com');
      expect(result.phone).toBe('***-***-4567');
      expect(mockDb.customerAuditLog.create).not.toHaveBeenCalled();
    });

    it('reveals unmasked PII and logs audit entry for authorized staff', async () => {
      mockDb.customer.findFirst.mockResolvedValue({
        id: 'cust-1',
        tenant_id: 'tenant-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+15551234567',
        tags: [],
        favorites: [],
        reviews: [],
        support_tickets: [],
        audit_logs: [],
      });
      mockDb.order.findMany.mockResolvedValue([]);

      const result = await crmService.getCustomerDetail('tenant-1', 'cust-1', {
        userId: 'admin-1',
        canViewPii: true,
      });

      expect(result.email).toBe('john.doe@example.com');
      expect(result.phone).toBe('+15551234567');
      expect(mockDb.customerAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'VIEW_PII',
          actor_id: 'admin-1',
        }),
      });
    });
  });
});
