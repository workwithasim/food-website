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

  async updateStorefrontSettings(body: any) {
    const tenantId = this.tenantId;
    const existing = await this.db.tenantSettings.findUnique({ where: { tenant_id: tenantId } });
    
    const existingTheme = (existing?.theme_json as any) || {};
    const updatedTheme = {
      ...existingTheme,
      ...(body.theme_json || {}),
      ...(body.primary_color ? { primary_color: body.primary_color } : {}),
      ...(body.secondary_color ? { secondary_color: body.secondary_color } : {}),
      ...(body.brand_name ? { brand_name: body.brand_name } : {}),
      ...(body.tagline ? { tagline: body.tagline } : {}),
      ...(body.hotline ? { hotline: body.hotline } : {}),
      ...(body.logo_url ? { logo_url: body.logo_url } : {}),
      ...(body.footer_text ? { footer_text: body.footer_text } : {}),
      ...(body.copyright ? { copyright: body.copyright } : {}),
      ...(body.social_links ? { social_links: body.social_links } : {}),
      ...(body.google_maps_api_key !== undefined ? { google_maps_api_key: body.google_maps_api_key } : {}),
      ...(body.delivery_hours !== undefined ? { delivery_hours: body.delivery_hours } : {}),
    };

    await this.db.tenantSettings.upsert({
      where: { tenant_id: tenantId },
      update: {
        restaurant_display_name: body.restaurant_display_name || body.name || existing?.restaurant_display_name || 'Cheezious',
        support_phone: body.support_phone || body.hotline || existing?.support_phone,
        support_email: body.support_email || existing?.support_email,
        theme_json: updatedTheme,
      },
      create: {
        tenant_id: tenantId,
        restaurant_display_name: body.restaurant_display_name || body.name || 'Cheezious',
        support_phone: body.support_phone || body.hotline || '051 111 446 699',
        support_email: body.support_email || 'support@cheezious.com',
        order_prefix: 'CHZ',
        theme_json: updatedTheme,
        checkout_json: {},
        notification_json: {},
        seo_json: {},
      }
    });

    if (body.restaurant_display_name || body.name) {
      await this.db.tenant.update({
        where: { id: tenantId },
        data: { name: body.restaurant_display_name || body.name }
      });
    }

    return this.getStorefrontConfig();
  }
}
