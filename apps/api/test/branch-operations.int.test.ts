import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Permission } from '../src/rbac/permissions.enum';

describe('Branch Operations (Integration)', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let tenantId: string;
  let ownerId: string;
  let ownerToken: string;
  let ownerRoleId: string;
  let branchId: string;
  let hostHeader: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    db = app.get<DatabaseService>(DatabaseService);
    
    tenantId = randomUUID();
    await db.tenant.create({
      data: {
        id: tenantId,
        name: 'Branch Test Tenant',
        slug: `branch-${Date.now()}`,
        status: 'ACTIVE',
        default_currency: 'USD',
        default_locale: 'en-US',
        timezone: 'UTC',
      },
    });

    hostHeader = `branch-${Date.now()}.platform.local`;
    await db.tenantDomain.create({
      data: {
        tenant_id: tenantId,
        hostname: hostHeader,
        type: 'SUBDOMAIN',
        status: 'VERIFIED',
        is_primary: true,
      },
    });

    ownerId = randomUUID();
    const ownerEmail = `branch-owner-${Date.now()}@test.com`;
    await db.user.create({
      data: {
        id: ownerId,
        email: ownerEmail,
        password_hash: await bcrypt.hash('Password123!', 10),
        display_name: 'Branch Owner',
        status: 'ACTIVE',
      },
    });

    ownerRoleId = randomUUID();
    await db.role.create({
      data: { id: ownerRoleId, tenant_id: tenantId, key: 'branch_owner', name: 'Branch Owner', is_system: false },
    });

    for (const perm of Object.values(Permission)) {
      await db.permission.upsert({
        where: { key: perm },
        update: {},
        create: { key: perm, description: perm },
      });
    }

    const perms = await db.permission.findMany({ where: { key: { in: [Permission.MANAGE_BRANCHES, Permission.VIEW_BRANCHES] } }});
    for (const p of perms) {
      await db.rolePermission.create({ data: { role_id: ownerRoleId, permission_id: p.id }});
    }

    const ownerMembership = await db.tenantMembership.create({
      data: { tenant_id: tenantId, user_id: ownerId, status: 'ACTIVE' },
    });
    await db.membershipRole.create({
      data: { membership_id: ownerMembership.id, role_id: ownerRoleId },
    });

    const ownerRes = await request(app.getHttpServer())
      .post('/v1/admin/auth/login')
      .set('Host', hostHeader)
      .send({ email: ownerEmail, password: 'Password123!' });
    ownerToken = ownerRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Branch CRUD', () => {
    it('should create a branch with PostGIS location', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/admin/branches')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Main Branch',
          code: 'MAIN',
          status: 'ACTIVE',
          address_line: '123 Test St',
          city: 'Test City',
          timezone: 'UTC',
          latitude: 40.7128,
          longitude: -74.0060, // NYC
          accepts_delivery: true,
          accepts_pickup: true
        })
        .expect(201);
      
      branchId = response.body.id;
      expect(branchId).toBeDefined();
    });
  });

  describe('Delivery Zones', () => {
    it('should create a radius delivery zone', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/admin/branches/${branchId}/zones`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Zone A - Radius',
          zone_type: 'RADIUS',
          radius_meters: 5000,
          center: { latitude: 40.7128, longitude: -74.0060 },
          delivery_fee_minor: 500,
          priority: 1,
          active: true
        })
        .expect(201);
      
      expect(response.body.id).toBeDefined();
    });

    it('should create a polygon delivery zone', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/admin/branches/${branchId}/zones`)
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Zone B - Polygon',
          zone_type: 'POLYGON',
          polygon: [
            { latitude: 40.7, longitude: -74.1 },
            { latitude: 40.8, longitude: -74.1 },
            { latitude: 40.8, longitude: -73.9 },
            { latitude: 40.7, longitude: -73.9 }
          ],
          delivery_fee_minor: 800,
          priority: 2, // higher priority
          active: true
        })
        .expect(201);
      
      expect(response.body.id).toBeDefined();
    });
  });

  describe('Customer Resolvers', () => {
    it('should resolve branch based on customer location within Polygon', async () => {
      // 40.75, -74.05 is inside the polygon above!
      const response = await request(app.getHttpServer())
        .get(`/v1/branches/resolve?lat=40.75&lng=-74.05`)
        .set('Host', hostHeader)
        .expect(200);

      expect(response.body.eligible_branches.length).toBeGreaterThan(0);
      expect(response.body.eligible_branches[0].id).toBe(branchId);
      expect(response.body.eligible_branches[0].matched_zone.name).toBe('Zone B - Polygon');
    });

    it('should not resolve branch for location outside zones', async () => {
      // 34.05, -118.24 is LA (way outside NYC zones)
      const response = await request(app.getHttpServer())
        .get(`/v1/branches/resolve?lat=34.05&lng=-118.24`)
        .set('Host', hostHeader)
        .expect(200);

      expect(response.body.eligible_branches.length).toBe(0);
    });
  });
});
