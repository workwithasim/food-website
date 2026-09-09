import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  { key: 'manage_staff', description: 'Manage staff members' },
  { key: 'view_staff', description: 'View staff members' },
  { key: 'manage_branches', description: 'Manage branch locations' },
  { key: 'view_branches', description: 'View branch locations' },
  { key: 'manage_catalog', description: 'Manage menu catalog and products' },
  { key: 'view_catalog', description: 'View menu catalog and products' },
  { key: 'manage_categories', description: 'Manage catalog categories' },
  { key: 'view_categories', description: 'View catalog categories' },
  { key: 'manage_products', description: 'Manage products' },
  { key: 'view_products', description: 'View products' },
  { key: 'manage_orders', description: 'Manage live and past orders' },
  { key: 'view_orders', description: 'View orders' },
  { key: 'manage_settings', description: 'Manage restaurant settings' },
  { key: 'view_settings', description: 'View restaurant settings' },
];

async function main() {
  console.log('Seeding roles and permissions...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    throw new Error('No tenant found in database');
  }

  // 1. Seed Permissions
  const permMap = new Map<string, string>();
  for (const p of ALL_PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.description },
      create: { key: p.key, description: p.description },
    });
    permMap.set(p.key, perm.id);
  }

  // 2. Seed Admin Role
  let adminRole = await prisma.role.findFirst({
    where: { tenant_id: tenant.id, name: 'Admin' },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        tenant_id: tenant.id,
        key: 'admin',
        name: 'Admin',
        is_system: true,
      },
    });
  }

  // 3. Link All Permissions to Admin Role
  for (const permId of permMap.values()) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: permId,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: permId,
      },
    });
  }

  // 4. Link Admin Role to the default user's membership
  const membership = await prisma.tenantMembership.findFirst({
    where: { tenant_id: tenant.id, user_id: '00000000-0000-0000-0000-000000000001' },
  });

  if (membership) {
    await prisma.membershipRole.upsert({
      where: {
        membership_id_role_id: {
          membership_id: membership.id,
          role_id: adminRole.id,
        },
      },
      update: {},
      create: {
        membership_id: membership.id,
        role_id: adminRole.id,
      },
    });
  }

  console.log('Roles and permissions seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
