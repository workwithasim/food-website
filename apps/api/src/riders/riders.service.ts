import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RidersService {
  constructor(private db: DatabaseService) {}

  async getAvailableRiders(tenantId: string, branchId: string) {
    return this.db.riderProfile.findMany({
      where: {
        tenant_id: tenantId,
        current_branch_id: branchId,
        status: 'AVAILABLE',
      },
      include: {
        user: {
          select: { id: true, display_name: true, phone: true },
        },
      },
    });
  }

  async updateLocation(tenantId: string, riderId: string, lat: number, lng: number) {
    // In a real app, this might insert into DeliveryLocationLog if on active delivery.
    // Here we just update the last known location in RiderProfile
    return this.db.$executeRaw`
      UPDATE rider_profiles 
      SET last_location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          location_updated_at = NOW()
      WHERE tenant_id = ${tenantId}::uuid AND user_id = ${riderId}::uuid
    `;
  }
}
