import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CmsService {
  constructor(private db: DatabaseService) {}

  async listActiveBanners(tenantId: string) {
    return this.db.banner.findMany({
      where: { tenant_id: tenantId, is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }
}
