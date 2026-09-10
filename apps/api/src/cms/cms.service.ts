import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '../tenancy/tenant.context';

@Injectable()
export class CmsService {
  constructor(
    @Inject(DatabaseService) private db: DatabaseService,
    @Inject(ClsService) private cls: ClsService<TenantContext>,
  ) {}

  async listActiveBanners(tenantId?: string) {
    const tid = tenantId || this.cls.get('tenantId');
    return this.db.banner.findMany({
      where: { ...(tid ? { tenant_id: tid } : {}), is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }
}
