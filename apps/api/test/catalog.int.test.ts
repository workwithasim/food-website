import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Permission } from '../src/rbac/permissions.enum';

describe('Catalog Core (Integration)', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let tenantId: string;
  let ownerToken: string;
  let hostHeader: string;
  let categoryId: string;
  let productId: string;
  let branchId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    db = app.get<DatabaseService>(DatabaseService);

    // Seed tenant
    tenantId = randomUUID();
    const slug = `catalog-${Date.now()}`;
    await db.tenant.create({
      data: {
        id: tenantId,
        name: 'Catalog Test Tenant',
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

    // Seed owner user
    const ownerId = randomUUID();
    const ownerEmail = `cat-owner-${Date.now()}@test.com`;
    await db.user.create({
      data: {
        id: ownerId,
        email: ownerEmail,
        password_hash: await bcrypt.hash('Password123!', 10),
        display_name: 'Cat Owner',
        status: 'ACTIVE',
      },
    });

    // Seed role with all catalog permissions
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
    ownerToken = loginRes.body.accessToken;

    // Create a branch for branch catalog tests
    branchId = randomUUID();
    await db.$executeRawUnsafe(`
      INSERT INTO "branches" ("id","tenant_id","name","code","status","address_line","city","timezone","location","accepts_delivery","accepts_pickup","created_at","updated_at")
      VALUES ($1::uuid, $2::uuid, 'Test Branch', 'TB', 'ACTIVE', '1 Test St', 'Test City', 'UTC', ST_GeogFromText('POINT(0 0)'), true, true, NOW(), NOW())
    `, branchId, tenantId);
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Categories ─────────────────────────────────────────────────────────────

  describe('Categories', () => {
    it('should create a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/admin/catalog/categories')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Burgers', slug: 'burgers', status: 'ACTIVE', sort_order: 1 })
        .expect(201);

      categoryId = res.body.id;
      expect(res.body.name).toBe('Burgers');
      expect(res.body.slug).toBe('burgers');
    });

    it('should reject duplicate slug', async () => {
      await request(app.getHttpServer())
        .post('/v1/admin/catalog/categories')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Burgers 2', slug: 'burgers' })
        .expect(409);
    });

    it('should list categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/admin/catalog/categories')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should update a category', async () => {
      const res = await request(app.getHttpServer())
        .put(`/v1/admin/catalog/categories/${categoryId}`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Classic Burgers' })
        .expect(200);

      expect(res.body.name).toBe('Classic Burgers');
    });
  });

  // ─── Products ────────────────────────────────────────────────────────────────

  describe('Products', () => {
    it('should create a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/admin/catalog/products')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          category_id: categoryId,
          name: 'Classic Cheeseburger',
          slug: 'classic-cheeseburger',
          description: 'A juicy classic',
          base_price_minor: 999,
          currency_code: 'USD',
          status: 'ACTIVE',
          featured: true,
        })
        .expect(201);

      productId = res.body.id;
      expect(res.body.base_price_minor).toBe(999);
      expect(res.body.featured).toBe(true);
    });

    it('should add media to a product', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/admin/catalog/products/${productId}/media`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ media_url: 'https://example.com/burger.jpg', alt_text: 'Burger', is_primary: true })
        .expect(201);

      expect(res.body.is_primary).toBe(true);
    });

    it('should only return ACTIVE products on public catalog', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/catalog/products')
        .set('Host', hostHeader)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((p: any) => expect(p.status).toBe('ACTIVE'));
    });

    it('should fetch product by slug on public catalog', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/catalog/products/classic-cheeseburger')
        .set('Host', hostHeader)
        .expect(200);

      expect(res.body.slug).toBe('classic-cheeseburger');
    });

    it('should return 404 for draft products on public catalog', async () => {
      // Create a draft product
      await request(app.getHttpServer())
        .post('/v1/admin/catalog/products')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          category_id: categoryId,
          name: 'Secret Burger',
          slug: 'secret-burger',
          base_price_minor: 500,
          currency_code: 'USD',
          status: 'DRAFT',
        });

      await request(app.getHttpServer())
        .get('/v1/catalog/products/secret-burger')
        .set('Host', hostHeader)
        .expect(404);
    });
  });

  // ─── Branch Catalog ─────────────────────────────────────────────────────────

  describe('Branch Catalog Overrides', () => {
    it('should set branch product as sold_out', async () => {
      const res = await request(app.getHttpServer())
        .put(`/v1/admin/branches/${branchId}/catalog/${productId}`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ sold_out: true, price_override_minor: 1199 })
        .expect(200);

      expect(res.body.sold_out).toBe(true);
    });

    it('should return branch catalog with overrides applied', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/admin/branches/${branchId}/catalog`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const overridden = res.body.find((p: any) => p.id === productId);
      expect(overridden).toBeDefined();
      expect(overridden.sold_out).toBe(true);
      expect(overridden.effective_price_minor).toBe(1199);
    });
  });
});
