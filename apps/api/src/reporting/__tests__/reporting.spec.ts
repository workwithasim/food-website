import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReportingService } from '../reporting.service';
import { AuditService } from '../../audit/audit.service';

describe('Phase 22: Reporting & Audit Business Logic', () => {
  let reportingService: ReportingService;
  let auditService: AuditService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      order: {
        findMany: vi.fn(),
        groupBy: vi.fn(),
      },
      branch: {
        findMany: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    reportingService = new ReportingService(mockDb);
    auditService = new AuditService(mockDb);
  });

  describe('Query Bounding & Validation', () => {
    it('rejects invalid date formats', async () => {
      await expect(
        reportingService.getSalesReport(
          'tenant-1',
          { startDate: 'not-a-date', endDate: '2026-09-10' },
          { role: 'OWNER' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when startDate is after endDate', async () => {
      await expect(
        reportingService.getSalesReport(
          'tenant-1',
          { startDate: '2026-10-01', endDate: '2026-09-01' },
          { role: 'OWNER' },
        ),
      ).rejects.toThrow('startDate must be before or equal to endDate');
    });

    it('enforces large range bounding: rejects ranges exceeding 366 days', async () => {
      await expect(
        reportingService.getSalesReport(
          'tenant-1',
          { startDate: '2024-01-01', endDate: '2026-01-01' }, // 2 years
          { role: 'OWNER' },
        ),
      ).rejects.toThrow('Date range cannot exceed 366 days');
    });
  });

  describe('Branch Permission Enforcement', () => {
    it('allows OWNER to view reports across branches', async () => {
      mockDb.order.findMany.mockResolvedValue([]);
      const result = await reportingService.getSalesReport(
        'tenant-1',
        { startDate: '2026-09-01', endDate: '2026-09-10', branchId: 'branch-99' },
        { role: 'OWNER', branchId: null },
      );
      expect(result).toBeDefined();
    });

    it('forbids branch manager from requesting report for a different branch', async () => {
      await expect(
        reportingService.getSalesReport(
          'tenant-1',
          { startDate: '2026-09-01', endDate: '2026-09-10', branchId: 'branch-other' },
          { role: 'BRANCH_MANAGER', branchId: 'branch-my-own' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Financial Reconciliation & Accuracy', () => {
    it('calculates gross, net, discounts, and refunds accurately from underlying orders', async () => {
      mockDb.order.findMany.mockResolvedValue([
        {
          id: 'ord-1',
          order_number: 'ORD-001',
          status: 'DELIVERED',
          payment_status: 'PAID',
          subtotal_minor: BigInt(5000),
          grand_total_minor: BigInt(5500),
          paid_minor: BigInt(5500),
          refunded_minor: BigInt(500), // 500 refunded
          item_discount_minor: BigInt(200),
          promotion_discount_minor: BigInt(300),
          coupon_discount_minor: BigInt(0),
          delivery_fee_minor: BigInt(500),
          tax_minor: BigInt(500),
          tip_minor: BigInt(0),
          created_at: new Date('2026-09-05T12:00:00Z'),
        },
      ]);

      const report = await reportingService.getSalesReport(
        'tenant-1',
        { startDate: '2026-09-01', endDate: '2026-09-10' },
        { role: 'ADMIN' },
      );

      expect(report.summary.totalOrders).toBe(1);
      expect(report.summary.completedOrders).toBe(1);
      expect(report.summary.grossSalesMinor).toBe('5500');
      expect(report.summary.totalRefundsMinor).toBe('500');
      expect(report.summary.netSalesMinor).toBe('5000'); // 5500 - 500
      expect(report.summary.totalDiscountsMinor).toBe('500'); // 200 + 300
    });

    it('detects and flags order calculation discrepancies in financial reconciliation', async () => {
      mockDb.order.findMany.mockResolvedValue([
        {
          id: 'ord-mismatch',
          order_number: 'ORD-ERR',
          subtotal_minor: BigInt(1000),
          delivery_fee_minor: BigInt(200),
          service_fee_minor: BigInt(0),
          tax_minor: BigInt(100),
          tip_minor: BigInt(0),
          item_discount_minor: BigInt(0),
          promotion_discount_minor: BigInt(0),
          coupon_discount_minor: BigInt(0),
          grand_total_minor: BigInt(9999), // Mismatch! Expected 1000 + 200 + 100 = 1300
          paid_minor: BigInt(9999),
          refunded_minor: BigInt(0),
        },
      ]);

      const reconciliation = await reportingService.runFinancialReconciliation(
        'tenant-1',
        { startDate: '2026-09-01', endDate: '2026-09-10' },
        { role: 'OWNER' },
      );

      expect(reconciliation.hasDiscrepancies).toBe(true);
      expect(reconciliation.discrepanciesCount).toBe(1);
      expect(reconciliation.discrepancies[0]?.expectedTotal).toBe('1300');
      expect(reconciliation.discrepancies[0]?.actualTotal).toBe('9999');
    });
  });

  describe('Immutable Audit Logging', () => {
    it('creates audit record and prevents missing required fields', async () => {
      await expect(
        auditService.log('tenant-1', {
          actorId: 'staff-1',
          action: '',
          entityType: 'ORDER',
          entityId: 'ord-1',
        }),
      ).rejects.toThrow('action, entityType, and entityId are required');

      mockDb.auditLog.create.mockResolvedValue({
        id: 'audit-1',
        tenant_id: 'tenant-1',
        actor_id: 'staff-1',
        action: 'ORDER_REFUND',
        entity_type: 'ORDER',
        entity_id: 'ord-1',
      });

      const res = await auditService.log('tenant-1', {
        actorId: 'staff-1',
        action: 'ORDER_REFUND',
        entityType: 'ORDER',
        entityId: 'ord-1',
        details: { amountMinor: 500, reason: 'Customer cancellation' },
      });

      expect(res).toBeDefined();
      expect(mockDb.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenant_id: 'tenant-1',
          action: 'ORDER_REFUND',
          entity_type: 'ORDER',
          entity_id: 'ord-1',
        }),
      });
    });
  });
});
