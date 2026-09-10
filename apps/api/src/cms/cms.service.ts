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

  private async getTenantId(tenantId?: string): Promise<string> {
    const tid = tenantId || this.cls.get('tenantId');
    if (tid) return tid;
    const t = await this.db.tenant.findFirst();
    return t?.id || '71f22de3-3cac-4b45-989f-c23f3107d27f';
  }

  async listActiveBanners(tenantId?: string) {
    const tid = await this.getTenantId(tenantId);
    return this.db.banner.findMany({
      where: { tenant_id: tid, is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }

  async listAllBanners(tenantId?: string) {
    const tid = await this.getTenantId(tenantId);
    return this.db.banner.findMany({
      where: { tenant_id: tid },
      orderBy: { sort_order: 'asc' },
    });
  }

  async createBanner(data: any, tenantId?: string) {
    const tid = await this.getTenantId(tenantId);
    return this.db.banner.create({
      data: {
        tenant_id: tid,
        title: data.title || 'Special Promotion',
        image_url: data.image_url,
        target_url: data.target_url || data.link_url || '/#menu',
        sort_order: data.sort_order != null ? Number(data.sort_order) : 0,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      }
    });
  }

  async updateBanner(id: string, data: any) {
    return this.db.banner.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.image_url ? { image_url: data.image_url } : {}),
        ...(data.target_url || data.link_url ? { target_url: data.target_url || data.link_url } : {}),
        ...(data.sort_order != null ? { sort_order: Number(data.sort_order) } : {}),
        ...(data.is_active !== undefined ? { is_active: Boolean(data.is_active) } : {}),
      }
    });
  }

  async deleteBanner(id: string) {
    return this.db.banner.delete({
      where: { id }
    });
  }
}
