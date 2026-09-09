import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseService } from '../src/database/database.service';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Permission } from '../src/rbac/permissions.enum';

describe('Variants & Modifiers (Integration)', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let tenantId: string;
  let branchId: string;
  let productId: string;
  let adminToken: string;
  let hostHeader: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    db = app.get(DatabaseService);

    // Setup tenant, branch, admin, product
    tenantId = randomUUID();
    const slug = `variant-${Date.now()}`;
    await db.tenant.create({
      data: {
        id: tenantId,
        name: 'Variant Test Tenant',
        slug,
        status: 'ACTIVE',
        default_currency: 'USD',
        default_locale: 'en-US',
        timezone: 'UTC',
      },
    });

    hostHeader = `${slug}.platform.local`;
    await db.tenantDomain.create({
      data: {
        tenant_id: tenantId,
        hostname: hostHeader,
        type: 'SUBDOMAIN',
        status: 'VERIFIED',
        is_primary: true,
      },
    });

    const ownerId = randomUUID();
    const ownerEmail = `var-owner-${Date.now()}@test.com`;
    await db.user.create({
      data: {
        id: ownerId,
        email: ownerEmail,
        password_hash: await bcrypt.hash('Password123!', 10),
        display_name: 'Var Owner',
        status: 'ACTIVE',
      },
    });

    const roleId = randomUUID();
    await db.role.create({
      data: { id: roleId, tenant_id: tenantId, key: 'catalog_owner', name: 'Catalog Owner', is_system: false },
    });

    const catalogPerms = [Permission.MANAGE_CATALOG, Permission.VIEW_CATALOG];
    for (const perm of catalogPerms) {
      await db.permission.upsert({
        where: { key: perm },
        update: {},
        create: { key: perm, description: perm },
      });
    }
    const perms = await db.permission.findMany({ where: { key: { in: catalogPerms } } });
    for (const p of perms) {
      await db.rolePermission.create({ data: { role_id: roleId, permission_id: p.id } });
    }

    const membership = await db.tenantMembership.create({
      data: { tenant_id: tenantId, user_id: ownerId, status: 'ACTIVE' },
    });
    await db.membershipRole.create({ data: { membership_id: membership.id, role_id: roleId } });

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/v1/admin/auth/login')
      .set('Host', hostHeader)
      .send({ email: ownerEmail, password: 'Password123!' });
    adminToken = loginRes.body.accessToken;

    const catRes = await request(app.getHttpServer())
      .post('/v1/admin/catalog/categories')
      .set('Host', hostHeader)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Variant Category',
        slug: `variant-cat-${Date.now()}`,
      });

    const prodRes = await request(app.getHttpServer())
      .post('/v1/admin/catalog/products')
      .set('Host', hostHeader)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category_id: catRes.body.id,
        name: 'Configurable Product',
        slug: `conf-prod-${Date.now()}`,
        base_price_minor: 1000,
        currency_code: 'USD',
      });
    console.log('Product creation res status:', prodRes.status, 'body:', prodRes.body);
    productId = prodRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Variants', () => {
    let variantId: string;

    it('should create a variant', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/admin/catalog/products/${productId}/variants`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Large',
          price_minor: 1500,
        });

      console.log('Variant creation res status:', res.status, 'body:', res.body);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Large');
      expect(res.body.price_minor).toBe(1500);
      variantId = res.body.id;
    });

    it('should list variants for product', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/admin/catalog/products/${productId}/variants`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(variantId);
    });
  });

  describe('Modifiers', () => {
    let groupId: string;
    let modifierId: string;

    it('should create a modifier group', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/admin/catalog/modifier-groups')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Extra Toppings',
          min_select: 0,
          max_select: 3,
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Extra Toppings');
      groupId = res.body.id;
    });

    it('should create a modifier', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/admin/catalog/modifier-groups/${groupId}/modifiers`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Cheese',
          price_delta_minor: 200,
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Cheese');
      modifierId = res.body.id;
    });

    it('should assign modifier group to product', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/admin/catalog/products/${productId}/modifier-groups`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          modifier_group_id: groupId,
          sort_order: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.product_id).toBe(productId);
      expect(res.body.modifier_group_id).toBe(groupId);
    });
  });
});
