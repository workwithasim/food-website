import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import * as bcrypt from 'bcryptjs';

describe('Authentication (Integration)', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let tenantId: string;
  let staffUserId: string;
  let customerId: string;
  const staffEmail = 'staff.test@acme.com';
  const staffPassword = 'StaffPassword123!';
  const customerEmail = 'customer.test@acme.com';
  const customerPhone = '1234567890';
  const customerPassword = 'CustomerPassword123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    db = app.get<DatabaseService>(DatabaseService);

    // 1. Get Acme tenant
    const tenant = await db.tenant.findFirst();
    if (!tenant) throw new Error('Seeded tenant not found');
    tenantId = tenant.id;

    // 2. Create staff user
    const hashedStaffPassword = await bcrypt.hash(staffPassword, 10);
    const staff = await db.user.create({
      data: {
        email: staffEmail,
        display_name: 'Test Staff',
        password_hash: hashedStaffPassword,
        status: 'ACTIVE',
        memberships: {
          create: {
            tenant_id: tenantId,
            status: 'ACTIVE',
          },
        },
      },
    });
    staffUserId = staff.id;

    // 3. Create customer
    const hashedCustomerPassword = await bcrypt.hash(customerPassword, 10);
    const customer = await db.customer.create({
      data: {
        tenant_id: tenantId,
        email: customerEmail,
        phone: customerPhone,
        first_name: 'Test',
        last_name: 'Customer',
        password_hash: hashedCustomerPassword,
        is_verified: true,
      },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    if (staffUserId) await db.user.delete({ where: { id: staffUserId } });
    if (customerId) await db.customer.delete({ where: { id: customerId } });
    await app.close();
  });

  describe('Staff Auth', () => {
    it('should login a staff user with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/admin/auth/login')
        .set('Host', 'acme.localhost')
        .send({
          email: staffEmail,
          password: staffPassword,
        });
      
      if (response.status !== 200) {
        console.error('STAFF LOGIN ERROR:', response.body);
      }
      expect(response.status).toBe(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(staffEmail);
    });

    it('should fail to login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/v1/admin/auth/login')
        .set('Host', 'acme.localhost')
        .send({
          email: staffEmail,
          password: 'WrongPassword!',
        })
        .expect(401);
    });
  });

  describe('Customer Auth', () => {
    it('should login a customer with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/storefront/auth/login')
        .set('Host', 'acme.localhost')
        .send({
          email: customerEmail,
          password: customerPassword,
        })
        .expect(200).catch(err => { console.error("RESPONSE:", response?.body || err); throw err; });

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.customer).toBeDefined();
      expect(response.body.customer.email).toBe(customerEmail);
    });

    it('should refresh a valid session', async () => {
      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/v1/storefront/auth/login')
        .set('Host', 'acme.localhost')
        .send({
          email: customerEmail,
          password: customerPassword,
        });

      const refreshToken = loginResponse.body.refreshToken;

      // Refresh
      const refreshResponse = await request(app.getHttpServer())
        .post('/v1/storefront/auth/refresh')
        .set('Host', 'acme.localhost')
        .send({
          refreshToken,
        })
        .expect(200).catch(err => { console.error("RESPONSE:", response?.body || err); throw err; });

      expect(refreshResponse.body.accessToken).toBeDefined();
      expect(refreshResponse.body.refreshToken).toBeDefined();
      expect(refreshResponse.body.refreshToken).not.toBe(refreshToken);
    });
    
    it('should request OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/storefront/auth/otp/request')
        .set('Host', 'acme.localhost')
        .send({
          phone: customerPhone,
        })
        .expect(200).catch(err => { console.error("RESPONSE:", response?.body || err); throw err; });
        
      expect(response.body.success).toBe(true);
    });
  });
});
