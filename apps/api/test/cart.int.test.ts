import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { randomUUID } from 'crypto';

describe('Cart API (Integration)', () => {
  let app: INestApplication;
  let db: DatabaseService;
  
  let tenantDomain = `cart-tenant-${Date.now()}.com`;
  let tenantId: string;
  let productId: string;
  let variantId: string;
  let modifierId: string;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    db = moduleFixture.get(DatabaseService);
    
    await app.init();

    // 1. Create a tenant and domain
    const tenant = await db.tenant.create({
      data: {
        name: 'Cart Tenant',
        slug: `cart-tenant-${Date.now()}`,
        status: 'ACTIVE',
        default_currency: 'USD',
        default_locale: 'en',
        timezone: 'UTC',
        domains: {
          create: { hostname: tenantDomain, type: 'CUSTOM', status: 'VERIFIED', is_primary: true }
        }
      }
    });
    tenantId = tenant.id;

    // 2. Create a Category and Product with Variants & Modifiers
    const category = await db.category.create({
      data: {
        tenant_id: tenantId,
        name: 'Burgers',
        slug: `burgers-${Date.now()}`,
        status: 'ACTIVE'
      }
    });

    const product = await db.product.create({
      data: {
        tenant_id: tenantId,
        category_id: category.id,
        name: 'Cheeseburger',
        slug: `cheeseburger-${Date.now()}`,
        base_price_minor: 1000,
        currency_code: 'USD',
        status: 'ACTIVE',
        variants: {
          create: [
            { tenant_id: tenantId, name: 'Single', price_minor: 1000, status: 'ACTIVE' },
            { tenant_id: tenantId, name: 'Double', price_minor: 1500, status: 'ACTIVE' }
          ]
        }
      },
      include: { variants: true }
    });
    productId = product.id;
    variantId = product.variants.find(v => v.name === 'Double')!.id;

    const modGroup = await db.modifierGroup.create({
      data: {
        tenant_id: tenantId,
        name: 'Add-ons',
        min_select: 0,
        max_select: 2,
        status: 'ACTIVE',
        modifiers: {
          create: [
            { tenant_id: tenantId, name: 'Extra Cheese', price_delta_minor: 200, status: 'ACTIVE' }
          ]
        },
        products: {
          create: { tenant_id: tenantId, product_id: productId }
        }
      },
      include: { modifiers: true }
    });
    modifierId = modGroup.modifiers[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  const guestToken = randomUUID();
  let cartItemId: string;

  it('should get an empty cart or null', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/cart')
      .set('Host', tenantDomain)
      .set('X-Guest-Token', guestToken);
      
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it('should add an item to the cart', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/cart/items')
      .set('Host', tenantDomain)
      .set('X-Guest-Token', guestToken)
      .send({
        product_id: productId,
        variant_id: variantId,
        quantity: 2,
        modifiers: [modifierId],
        notes: 'No pickles'
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.items).toHaveLength(1);
    
    cartItemId = res.body.items[0].id;
    expect(res.body.items[0].product_id).toBe(productId);
    expect(res.body.items[0].variant_id).toBe(variantId);
    expect(res.body.items[0].quantity).toBe(2);
    expect(res.body.items[0].modifiers).toHaveLength(1);
    expect(res.body.items[0].modifiers[0].modifier_id).toBe(modifierId);
  });

  it('should update item quantity', async () => {
    const res = await request(app.getHttpServer())
      .put(`/v1/cart/items/${cartItemId}`)
      .set('Host', tenantDomain)
      .set('X-Guest-Token', guestToken)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(3);
  });

  it('should remove an item if quantity is set to 0', async () => {
    const res = await request(app.getHttpServer())
      .put(`/v1/cart/items/${cartItemId}`)
      .set('Host', tenantDomain)
      .set('X-Guest-Token', guestToken)
      .send({ quantity: 0 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});
