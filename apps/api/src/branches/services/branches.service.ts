import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { randomUUID } from 'crypto';

export interface CreateBranchDto {
  name: string;
  code: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  phone?: string;
  address_line: string;
  city: string;
  timezone: string;
  latitude: number;
  longitude: number;
  min_order_minor?: number;
  default_delivery_fee_minor?: number;
  accepts_delivery: boolean;
  accepts_pickup: boolean;
  preparation_time_minutes?: number;
}

@Injectable()
export class BranchesService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  private serializeBranch(b: any) {
    if (!b) return null;
    return {
      ...b,
      min_order_minor: b.min_order_minor != null ? Number(b.min_order_minor) : null,
      default_delivery_fee_minor: b.default_delivery_fee_minor != null ? Number(b.default_delivery_fee_minor) : null,
    };
  }

  async listBranches(onlyActive: boolean = false) {
    const [branches, coords] = await Promise.all([
      this.db.branch.findMany({
        where: {
          tenant_id: this.tenantId,
          deleted_at: null,
          ...(onlyActive ? { status: 'ACTIVE' } : {})
        },
        orderBy: { created_at: 'asc' },
      }),
      this.db.$queryRaw<Array<{ id: string; lat: number | null; lng: number | null }>>`
        SELECT id, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
        FROM "branches" WHERE "tenant_id" = ${this.tenantId}::uuid
      `.catch(() => [])
    ]);

    const coordMap = new Map<string, { lat: number | null; lng: number | null }>();
    if (Array.isArray(coords)) {
      coords.forEach(c => coordMap.set(c.id, { lat: c.lat, lng: c.lng }));
    }

    return branches.map(b => {
      const coord = coordMap.get(b.id);
      return {
        ...this.serializeBranch(b),
        latitude: coord?.lat ?? null,
        longitude: coord?.lng ?? null,
      };
    });
  }

  async getBranch(id: string) {
    const branch = await this.db.branch.findUnique({
      where: { id },
      include: {
        hours: true,
        special_hours: true,
      },
    });

    if (!branch || branch.tenant_id !== this.tenantId || branch.deleted_at) {
      throw new NotFoundException('Branch not found');
    }

    return this.serializeBranch(branch);
  }

  async createBranch(dto: CreateBranchDto) {
    // We must use raw query or Prisma extension to handle geography inserts.
    // Prisma now supports some basic postgis extensions but raw SQL is often safest for complex spatial insertions.
    // Let's use Prisma raw query for the insert, and then fetch it back using Prisma ORM.

    const id = randomUUID();

    await this.db.$executeRaw`
      INSERT INTO "branches" (
        "id", "tenant_id", "name", "code", "status", "phone", "address_line", "city", "timezone",
        "location", "min_order_minor", "default_delivery_fee_minor", "accepts_delivery", "accepts_pickup", "preparation_time_minutes",
        "created_at", "updated_at"
      ) VALUES (
        ${id}::uuid, ${this.tenantId}::uuid, ${dto.name}, ${dto.code}, ${dto.status}::"BranchStatus", ${dto.phone || null}, ${dto.address_line}, ${dto.city}, ${dto.timezone},
        ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)::geography, 
        ${dto.min_order_minor || null}, ${dto.default_delivery_fee_minor || null}, ${dto.accepts_delivery}, ${dto.accepts_pickup}, ${dto.preparation_time_minutes || null},
        NOW(), NOW()
      )
    `;

    return this.getBranch(id);
  }

  async updateBranch(id: string, dto: Partial<CreateBranchDto>) {
    await this.getBranch(id); // ensures it exists and belongs to tenant

    // For simplicity, we just update all fields using raw if location is provided, or Prisma if not.
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      await this.db.$executeRaw`
        UPDATE "branches" SET
          "name" = COALESCE(${dto.name}, "name"),
          "status" = COALESCE(${dto.status}::"BranchStatus", "status"),
          "phone" = COALESCE(${dto.phone}, "phone"),
          "address_line" = COALESCE(${dto.address_line}, "address_line"),
          "city" = COALESCE(${dto.city}, "city"),
          "timezone" = COALESCE(${dto.timezone}, "timezone"),
          "location" = ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)::geography,
          "min_order_minor" = COALESCE(${dto.min_order_minor}, "min_order_minor"),
          "default_delivery_fee_minor" = COALESCE(${dto.default_delivery_fee_minor}, "default_delivery_fee_minor"),
          "accepts_delivery" = COALESCE(${dto.accepts_delivery}, "accepts_delivery"),
          "accepts_pickup" = COALESCE(${dto.accepts_pickup}, "accepts_pickup"),
          "preparation_time_minutes" = COALESCE(${dto.preparation_time_minutes}, "preparation_time_minutes"),
          "updated_at" = NOW()
        WHERE "id" = ${id}::uuid AND "tenant_id" = ${this.tenantId}::uuid
      `;
    } else {
      // standard update
      const data: any = { ...dto };
      delete data.latitude;
      delete data.longitude;

      await this.db.branch.update({
        where: { id },
        data,
      });
    }

    return this.getBranch(id);
  }

  async updateHours(branchId: string, hours: Array<{ day_of_week: number, open_time: string, close_time: string, crosses_midnight: boolean, is_closed: boolean }>) {
    await this.getBranch(branchId);

    // Delete existing hours
    await this.db.branchHour.deleteMany({
      where: { branch_id: branchId },
    });

    // We must format times appropriately for Prisma (e.g. 1970-01-01T10:00:00.000Z)
    // The schema specifies DateTime @db.Time
    // We will parse "HH:mm:ss" strings from frontend into arbitrary date ISO strings that Prisma can cast to TIME
    const mappedHours = hours.map(h => ({
      tenant_id: this.tenantId,
      branch_id: branchId,
      day_of_week: h.day_of_week,
      open_time: new Date(`1970-01-01T${h.open_time}Z`),
      close_time: new Date(`1970-01-01T${h.close_time}Z`),
      crosses_midnight: h.crosses_midnight,
      is_closed: h.is_closed,
    }));

    await this.db.branchHour.createMany({
      data: mappedHours,
    });

    return { success: true };
  }

  async updateSpecialHours(branchId: string, specialHours: Array<{ date: string, open_time?: string, close_time?: string, is_closed: boolean, reason?: string }>) {
    await this.getBranch(branchId);

    await this.db.branchSpecialHour.deleteMany({
      where: { branch_id: branchId },
    });

    const mappedSpecialHours = specialHours.map(h => ({
      tenant_id: this.tenantId,
      branch_id: branchId,
      date: new Date(h.date),
      open_time: h.open_time ? new Date(`1970-01-01T${h.open_time}Z`) : null,
      close_time: h.close_time ? new Date(`1970-01-01T${h.close_time}Z`) : null,
      is_closed: h.is_closed,
      reason: h.reason,
    }));

    await this.db.branchSpecialHour.createMany({
      data: mappedSpecialHours,
    });

    return { success: true };
  }

  async deleteBranch(id: string) {
    await this.getBranch(id);
    return this.db.branch.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}
