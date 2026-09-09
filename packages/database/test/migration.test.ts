import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/index';

describe('Database Migration & Connection', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to the database and query a seed tenant', async () => {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'default-tenant' },
    });
    
    expect(tenant).toBeDefined();
    expect(tenant?.name).toBe('Acme Restaurant Co');
  });

  it('should execute a PostGIS raw query', async () => {
    const result = await prisma.$queryRaw<[{ postgis_full_version: string }]>`SELECT postgis_full_version();`;
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].postgis_full_version).toContain('POSTGIS=');
  });
});
