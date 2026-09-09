import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';
import { randomUUID } from 'crypto';

export interface CreateDeliveryZoneDto {
  name: string;
  zone_type: 'RADIUS' | 'POLYGON' | 'AREA_CODE';
  polygon?: Array<{ latitude: number, longitude: number }>;
  radius_meters?: number;
  center?: { latitude: number, longitude: number };
  area_codes?: string[];
  delivery_fee_minor: number;
  min_order_minor?: number;
  priority: number;
  active: boolean;
}

@Injectable()
export class DeliveryZonesService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async listZones(branchId: string) {
    return this.db.deliveryZone.findMany({
      where: { tenant_id: this.tenantId, branch_id: branchId },
      orderBy: { priority: 'desc' },
    });
  }

  async createZone(branchId: string, dto: CreateDeliveryZoneDto) {
    const id = randomUUID();

    let polygonWkt: string | null = null;
    let centerWkt: string | null = null;

    if (dto.zone_type === 'POLYGON' && dto.polygon && dto.polygon.length > 2) {
      // Ensure the polygon is closed
      const coords = [...dto.polygon];
      const first = coords[0]!;
      const last = coords[coords.length - 1]!;
      if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
        coords.push(first); // close the ring
      }
      
      const pointString = coords.map(c => `${c.longitude} ${c.latitude}`).join(', ');
      // The schema specifies MultiPolygon
      polygonWkt = `MULTIPOLYGON(((${pointString})))`;
    }

    if (dto.zone_type === 'RADIUS' && dto.center) {
      centerWkt = `POINT(${dto.center.longitude} ${dto.center.latitude})`;
    }

    await this.db.$executeRawUnsafe(`
      INSERT INTO "delivery_zones" (
        "id", "tenant_id", "branch_id", "name", "zone_type", "polygon", "radius_meters", "center",
        "area_codes", "delivery_fee_minor", "min_order_minor", "priority", "active"
      ) VALUES (
        $1::uuid, $2::uuid, $3::uuid, $4, $5::"ZoneType",
        ${polygonWkt ? `ST_GeogFromText('${polygonWkt}')` : 'NULL'},
        $6,
        ${centerWkt ? `ST_GeogFromText('${centerWkt}')` : 'NULL'},
        $7,
        $8,
        $9,
        $10,
        $11
      )
    `, id, this.tenantId, branchId, dto.name, dto.zone_type, dto.radius_meters || null, dto.area_codes || null, dto.delivery_fee_minor, dto.min_order_minor || null, dto.priority, dto.active);

    const created = await this.db.deliveryZone.findUnique({ where: { id } });
    if (created) {
      return {
        ...created,
        delivery_fee_minor: Number(created.delivery_fee_minor),
        min_order_minor: created.min_order_minor ? Number(created.min_order_minor) : null,
      };
    }
    return created;
  }

  async updateZone(branchId: string, zoneId: string, dto: Partial<CreateDeliveryZoneDto>) {
    const zone = await this.db.deliveryZone.findUnique({
      where: { id: zoneId, tenant_id: this.tenantId, branch_id: branchId },
    });

    if (!zone) {
      throw new NotFoundException('Delivery zone not found');
    }

    let polygonWkt: string | null = null;
    let centerWkt: string | null = null;

    if (dto.zone_type === 'POLYGON' && dto.polygon && dto.polygon.length > 2) {
      const coords = [...dto.polygon];
      const first = coords[0]!;
      const last = coords[coords.length - 1]!;
      if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
        coords.push(first);
      }
      const pointString = coords.map(c => `${c.longitude} ${c.latitude}`).join(', ');
      polygonWkt = `MULTIPOLYGON(((${pointString})))`;
    } else if (dto.zone_type === 'RADIUS' && dto.center) {
      centerWkt = `POINT(${dto.center.longitude} ${dto.center.latitude})`;
    }

    // Dynamic update is tricky with raw SQL, so we update conditionally or construct the query.
    // Given the complexity of PostGIS types, we'll build the raw query.
    
    // We update fields if provided.
    // But since this is just an admin CRUD, replacing the row is often easier.
    // For simplicity, we'll do an executeRaw updating all scalar fields via Prisma and spatial fields conditionally.
    
    await this.db.$executeRaw`
      UPDATE "delivery_zones" SET
        "name" = COALESCE(${dto.name}, "name"),
        "zone_type" = COALESCE(${dto.zone_type}::"ZoneType", "zone_type"),
        "radius_meters" = COALESCE(${dto.radius_meters}, "radius_meters"),
        "area_codes" = COALESCE(${dto.area_codes}, "area_codes"),
        "delivery_fee_minor" = COALESCE(${dto.delivery_fee_minor}, "delivery_fee_minor"),
        "min_order_minor" = COALESCE(${dto.min_order_minor}, "min_order_minor"),
        "priority" = COALESCE(${dto.priority}, "priority"),
        "active" = COALESCE(${dto.active}, "active")
      WHERE "id" = ${zoneId}::uuid AND "tenant_id" = ${this.tenantId}::uuid
    `;

    if (polygonWkt) {
      await this.db.$executeRawUnsafe(`
        UPDATE "delivery_zones" SET "polygon" = ST_GeogFromText('${polygonWkt}')
        WHERE "id" = '${zoneId}' AND "tenant_id" = '${this.tenantId}'
      `);
    }

    if (centerWkt) {
      await this.db.$executeRawUnsafe(`
        UPDATE "delivery_zones" SET "center" = ST_GeogFromText('${centerWkt}')
        WHERE "id" = '${zoneId}' AND "tenant_id" = '${this.tenantId}'
      `);
    }

    return this.db.deliveryZone.findUnique({ where: { id: zoneId } });
  }
}
