import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Permission } from '../src/rbac/permissions.enum';

describe('RBAC & Staff (Integration)', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let tenantId: string;
  let ownerId: string; // The owner has MANAGE_STAFF and VIEW_STAFF
  let ownerToken: string;

  let memberId: string; // The restricted user has VIEW_STAFF but NOT MANAGE_STAFF
  let memberToken: string;

  let ownerRoleId: string;
  let memberRoleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    db = app.get<DatabaseService>(DatabaseService);
    
    // Create tenant
    tenantId = randomUUID();
    await db.tenant.create({
      data: {
        id: tenantId,
        name: 'RBAC Test Tenant',
        slug: `rbac-${Date.now()}`,
        status: 'ACTIVE',
        default_currency: 'USD',
        default_locale: 'en-US',
        timezone: 'UTC',
      },
    });

    // Create domains
    await db.tenantDomain.create({
      data: {
        tenant_id: tenantId,
        hostname: `rbac-${Date.now()}.platform.local`,
        type: 'SUBDOMAIN',
        status: 'VERIFIED',
        is_primary: true,
      },
    });

    // Create users
    ownerId = randomUUID();
    const ownerEmail = `owner-${Date.now()}@test.com`;
    await db.user.create({
      data: {
        id: ownerId,
        email: ownerEmail,
        password_hash: await bcrypt.hash('Password123!', 10),
        display_name: 'Owner User',
        status: 'ACTIVE',
      },
    });

    memberId = randomUUID();
    const memberEmail = `member-${Date.now()}@test.com`;
    await db.user.create({
      data: {
        id: memberId,
        email: memberEmail,
        password_hash: await bcrypt.hash('Password123!', 10),
        display_name: 'Member User',
        status: 'ACTIVE',
      },
    });

    // Create Roles & Permissions
    ownerRoleId = randomUUID();
    await db.role.create({
      data: {
        id: ownerRoleId,
        tenant_id: tenantId,
        key: 'owner',
        name: 'Owner',
        is_system: false,
      },
    });

    memberRoleId = randomUUID();
    await db.role.create({
      data: {
        id: memberRoleId,
        tenant_id: tenantId,
        key: 'restricted',
        name: 'Restricted',
        is_system: false,
      },
    });

    // We assume the permissions strings exist or we can just insert them here safely.
    // If they don't exist, Prisma will fail, so we should upsert them.
    for (const perm of Object.values(Permission)) {
      await db.permission.upsert({
        where: { key: perm },
        update: {},
        create: { key: perm, description: perm },
      });
    }

    // Connect Owner Role to Permissions (MANAGE_STAFF, VIEW_STAFF)
    const ownerPerms = await db.permission.findMany({ where: { key: { in: [Permission.MANAGE_STAFF, Permission.VIEW_STAFF] } }});
    for (const p of ownerPerms) {
      await db.rolePermission.create({ data: { role_id: ownerRoleId, permission_id: p.id }});
    }

    // Connect Member Role to Permissions (VIEW_STAFF only)
    const memberPerms = await db.permission.findMany({ where: { key: { in: [Permission.VIEW_STAFF] } }});
    for (const p of memberPerms) {
      await db.rolePermission.create({ data: { role_id: memberRoleId, permission_id: p.id }});
    }

    // Create Tenant Memberships
    const ownerMembership = await db.tenantMembership.create({
      data: { tenant_id: tenantId, user_id: ownerId, status: 'ACTIVE' },
    });
    await db.membershipRole.create({
      data: { membership_id: ownerMembership.id, role_id: ownerRoleId },
    });

    const memberMembership = await db.tenantMembership.create({
      data: { tenant_id: tenantId, user_id: memberId, status: 'ACTIVE' },
    });
    await db.membershipRole.create({
      data: { membership_id: memberMembership.id, role_id: memberRoleId },
    });

    // Login Owner
    const domain = await db.tenantDomain.findFirst({ where: { tenant_id: tenantId }});
    const hostHeader = domain!.hostname;

    const ownerRes = await request(app.getHttpServer())
      .post('/v1/admin/auth/login')
      .set('Host', hostHeader)
      .send({ email: ownerEmail, password: 'Password123!' });
    ownerToken = ownerRes.body.accessToken;

    const memberRes = await request(app.getHttpServer())
      .post('/v1/admin/auth/login')
      .set('Host', hostHeader)
      .send({ email: memberEmail, password: 'Password123!' });
    memberToken = memberRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Staff CRUD with RBAC', () => {
    let hostHeader: string;

    beforeAll(async () => {
      const domain = await db.tenantDomain.findFirst({ where: { tenant_id: tenantId }});
      hostHeader = domain!.hostname;
    });

    it('should allow Owner to view staff', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/admin/staff')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should allow Member to view staff', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/admin/staff')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);
    });

    it('should NOT allow Member to invite staff (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/v1/admin/staff/invite')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          email: 'new-user@test.com',
          display_name: 'New User',
          role_ids: [memberRoleId]
        })
        .expect(403);
    });

    it('should allow Owner to invite staff', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/admin/staff/invite')
        .set('Host', hostHeader)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: 'new-user@test.com',
          display_name: 'New User',
          role_ids: [memberRoleId]
        })
        .expect(201);
      
      expect(response.body.user_id).toBeDefined();
      expect(response.body.status).toBe('ACTIVE');
    });
  });
});
