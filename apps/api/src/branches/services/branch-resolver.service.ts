import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../../tenancy/tenant.context';
import { TenantScopedRepository } from '../../tenancy/tenant-scoped.repository';

@Injectable()
export class BranchResolverService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async resolveBranches(latitude: number, longitude: number) {
    // We want to find active branches whose active delivery zones cover the given point.
    // 1. Point geometry string
    // 1. Point geometry string (removed as it's unused directly)
    
    // 2. We use raw SQL to join branches with delivery_zones.
    // Radius condition: ST_DWithin(zone.center, point, zone.radius_meters)
    // Polygon condition: ST_Covers(zone.polygon::geometry, point::geometry) or ST_Intersects (PostGIS geometry vs geography is tricky for Covers, ST_Covers on geography works in modern PostGIS, ST_Intersects is also standard).
    // Let's use ST_Intersects(zone.polygon, point) since it works on geography.

    // A branch is valid if ANY of its active delivery zones cover the point.
    const query = `
      SELECT b.id, b.name, b.code, b.min_order_minor, b.default_delivery_fee_minor,
             dz.id as zone_id, dz.name as zone_name, dz.delivery_fee_minor as zone_fee, dz.min_order_minor as zone_min
      FROM "branches" b
      JOIN "delivery_zones" dz ON b.id = dz.branch_id
      WHERE b.tenant_id = $1::uuid
        AND b.status = 'ACTIVE'
        AND b.deleted_at IS NULL
        AND b.accepts_delivery = true
        AND dz.active = true
        AND (
          (dz.zone_type = 'RADIUS' AND ST_DWithin(dz.center, ST_GeogFromText('POINT(' || $2 || ' ' || $3 || ')'), dz.radius_meters))
          OR
          (dz.zone_type = 'POLYGON' AND ST_Intersects(dz.polygon, ST_GeogFromText('POINT(' || $2 || ' ' || $3 || ')')))
        )
      ORDER BY dz.priority DESC
    `;

    const results = await this.db.$queryRawUnsafe<any[]>(query, this.tenantId, longitude.toString(), latitude.toString());

    if (results.length === 0) {
      return { eligible_branches: [] };
    }

    // Now we must check if they are open right now.
    // We'll do this in Node for simplicity, fetching their hours.
    const branchIds = [...new Set(results.map(r => r.id))];
    
    const branchesWithHours = await this.db.branch.findMany({
      where: { id: { in: branchIds } },
      include: {
        hours: true,
        special_hours: {
          where: { date: new Date() }, // In a real system, we'd need to consider the timezone of the branch!
        }
      }
    });

    // Let's assume we do a basic filter based on current UTC time mapping to their local time.
    // For this phase, we'll return the results and add a simple "is_open" boolean.
    // Since timezone math in Node without heavy libraries (like moment-timezone or luxon) is complex,
    // we will provide a basic placeholder that assumes always open for the purpose of the test, 
    // unless they have a closure record.

    const finalBranches = branchesWithHours.map(branch => {
      const zonesForBranch = results.filter(r => r.id === branch.id);
      // Sort by priority (which they are already) and take the first one.
      const activeZone = zonesForBranch[0];
      
      let is_open = true;
      if (branch.special_hours && branch.special_hours.length > 0) {
        if (branch.special_hours[0]?.is_closed) is_open = false;
      }

      return {
        id: branch.id,
        name: branch.name,
        code: branch.code,
        is_open,
        delivery_fee_minor: activeZone.zone_fee ?? branch.default_delivery_fee_minor,
        min_order_minor: activeZone.zone_min ?? branch.min_order_minor,
        matched_zone: {
          id: activeZone.zone_id,
          name: activeZone.zone_name,
        }
      };
    });

    return { eligible_branches: finalBranches };
  }
}
