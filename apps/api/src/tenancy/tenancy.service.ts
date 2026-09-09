import { Injectable, Inject } from '@nestjs/common';
import { TenantScopedRepository } from './tenant-scoped.repository';
import { DatabaseService } from '../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenancyService extends TenantScopedRepository {
  constructor(
    @Inject(DatabaseService) db: DatabaseService,
    @Inject(ClsService) cls: ClsService<TenantContext>,
  ) {
    super(db, cls);
  }

  async getStorefrontConfig() {
    const tenantId = this.tenantId;

    const [settings, features, tenant] = await Promise.all([
      this.db.tenantSettings.findUnique({ where: { tenant_id: tenantId } }),
      this.db.tenantFeature.findMany({ where: { tenant_id: tenantId } }),
      this.db.tenant.findUnique({ where: { id: tenantId } }),
    ]);

    return {
      tenant: {
        id: tenant?.id,
        name: tenant?.name,
        default_currency: tenant?.default_currency,
      },
      settings,
      features: features.reduce((acc, f) => {
        acc[f.feature_key] = f.enabled;
        return acc;
      }, {} as Record<string, boolean>),
    };
  }
}
