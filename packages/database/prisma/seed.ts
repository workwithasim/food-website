import { PrismaClient, TenantStatus, DomainType, DomainStatus, UserStatus, MembershipStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development data...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default-tenant' },
    update: {},
    create: {
      name: 'Acme Restaurant Co',
      slug: 'default-tenant',
      status: TenantStatus.ACTIVE,
      default_currency: 'PKR',
      default_locale: 'en-PK',
      timezone: 'Asia/Karachi',
    },
  });

  // Create tenant domain
  await prisma.tenantDomain.upsert({
    where: { hostname: 'acme.localhost' },
    update: {},
    create: {
      tenant_id: tenant.id,
      hostname: 'acme.localhost',
      type: DomainType.SUBDOMAIN,
      status: DomainStatus.VERIFIED,
      is_primary: true,
      verified_at: new Date(),
    },
  });

  // Create tenant settings
  await prisma.tenantSettings.upsert({
    where: { tenant_id: tenant.id },
    update: {},
    create: {
      tenant_id: tenant.id,
      restaurant_display_name: 'Acme Dining',
      order_prefix: 'ACM',
      theme_json: { primary_color: '#000000' },
      checkout_json: {},
      notification_json: {},
      seo_json: {},
    },
  });

  // Create platform user
  const user = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for dev
      email: 'admin@acme.com',
      display_name: 'Admin User',
      status: UserStatus.ACTIVE,
    },
  });

  // Create membership
  await prisma.tenantMembership.upsert({
    where: {
      tenant_id_user_id: {
        tenant_id: tenant.id,
        user_id: user.id,
      },
    },
    update: {},
    create: {
      tenant_id: tenant.id,
      user_id: user.id,
      status: MembershipStatus.ACTIVE,
    },
  });

  // Create branch
  // Using Prisma's Raw query for PostGIS points since Unsupported types cannot be created natively via prisma client
  const branchCount = await prisma.branch.count({
    where: { tenant_id: tenant.id, code: 'MAIN' },
  });

  let branchId = '';

  if (branchCount === 0) {
    const [{ id }] = await prisma.$queryRaw<[{ id: string }]>`
      INSERT INTO branches (id, tenant_id, name, code, status, address_line, city, timezone, accepts_delivery, accepts_pickup, location, updated_at)
      VALUES (
        gen_random_uuid(),
        ${tenant.id}::uuid,
        'Main Branch',
        'MAIN',
        'ACTIVE',
        '123 Food Street',
        'Karachi',
        'Asia/Karachi',
        true,
        true,
        ST_SetSRID(ST_MakePoint(67.0011, 24.8607), 4326),
        NOW()
      )
      RETURNING id;
    `;
    branchId = id;
  } else {
    const existing = await prisma.branch.findFirst({
      where: { tenant_id: tenant.id, code: 'MAIN' },
    });
    branchId = existing!.id;
  }

  // Create user assignment
  if (branchCount === 0) {
    await prisma.userBranchAssignment.upsert({
      where: {
        tenant_id_user_id_branch_id: {
          tenant_id: tenant.id,
          user_id: user.id,
          branch_id: branchId,
        },
      },
      update: {},
      create: {
        tenant_id: tenant.id,
        user_id: user.id,
        branch_id: branchId,
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
