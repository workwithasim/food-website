import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TenancyModule (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 400 when host header is completely missing', async () => {
    // In express, standard req always has host if HTTP/1.1 is strictly enforced
    // but we can test missing by overriding
    const res = await request(app.getHttpServer())
      .get('/v1/storefront/config')
      .set('Host', ''); // removing standard host
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Host header is (missing|invalid)/);
  });

  it('should return 404 for an unknown domain', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/storefront/config')
      .set('Host', 'unknown.example.com');
    
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Unknown tenant domain');
  });

  it('should return 200 and tenant config for a known domain', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/storefront/config')
      .set('Host', 'acme.localhost'); // seed script creates this
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tenant');
    expect(res.body.tenant).toHaveProperty('name', 'Acme Restaurant Co');
    expect(res.body).toHaveProperty('settings');
    expect(res.body.settings).toHaveProperty('restaurant_display_name', 'Acme Dining');
    expect(res.body).toHaveProperty('features');
  });
});
