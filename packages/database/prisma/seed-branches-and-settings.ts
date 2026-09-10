import { PrismaClient, BranchStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Authentic Cheezious Branches & Store Settings ---');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    throw new Error('No tenant found in database');
  }

  // 1. Update Tenant Settings
  await prisma.tenantSettings.upsert({
    where: { tenant_id: tenant.id },
    update: {
      restaurant_display_name: 'Cheezious',
      support_phone: '051 111 446 699',
      support_email: 'support@cheezious.com',
      order_prefix: 'CHZ',
      theme_json: {
        primary_color: '#F15B25',
        secondary_color: '#FFC107',
        brand_name: 'Cheezious',
        tagline: 'World of Flavors & Cheezy Treats',
        hotline: '051 111 446 699',
        logo_url: 'https://cheezious.com/cheezious.svg',
        footer_text: 'Cheezious is one of the fastest-growing food chains in Pakistan, delivering oven-fresh pizzas, crunchy bazinga burgers, and cheesy delights across twin cities and beyond.',
        copyright: `© ${new Date().getFullYear()} Cheezious Pakistan. All Rights Reserved.`,
        social_links: {
          facebook: 'https://facebook.com/cheezious',
          instagram: 'https://instagram.com/cheeziouspakistan',
          tiktok: 'https://tiktok.com/@cheezious_pk'
        }
      },
    },
    create: {
      tenant_id: tenant.id,
      restaurant_display_name: 'Cheezious',
      support_phone: '051 111 446 699',
      support_email: 'support@cheezious.com',
      order_prefix: 'CHZ',
      theme_json: {
        primary_color: '#F15B25',
        secondary_color: '#FFC107',
        brand_name: 'Cheezious',
        tagline: 'World of Flavors & Cheezy Treats',
        hotline: '051 111 446 699',
        logo_url: 'https://cheezious.com/cheezious.svg',
        footer_text: 'Cheezious is one of the fastest-growing food chains in Pakistan, delivering oven-fresh pizzas, crunchy bazinga burgers, and cheesy delights across twin cities and beyond.',
        copyright: `© ${new Date().getFullYear()} Cheezious Pakistan. All Rights Reserved.`,
        social_links: {
          facebook: 'https://facebook.com/cheezious',
          instagram: 'https://instagram.com/cheeziouspakistan',
          tiktok: 'https://tiktok.com/@cheezious_pk'
        }
      },
      checkout_json: {},
      notification_json: {},
      seo_json: {},
    },
  });

  // 2. Update or Seed Authentic Branches
  const branchesData = [
    {
      code: 'ISB-F10',
      name: 'F-10 Markaz Branch',
      city: 'Islamabad',
      address_line: 'Plot 12-B, F-10 Markaz, Islamabad',
      phone: '051 111 446 699',
      status: BranchStatus.ACTIVE,
      accepts_delivery: true,
      accepts_pickup: true,
      timezone: 'Asia/Karachi',
    },
    {
      code: 'ISB-BLUE',
      name: 'Blue Area Branch',
      city: 'Islamabad',
      address_line: 'Beverly Centre, Blue Area, Jinnah Avenue, Islamabad',
      phone: '051 280 4466',
      status: BranchStatus.ACTIVE,
      accepts_delivery: true,
      accepts_pickup: true,
      timezone: 'Asia/Karachi',
    },
    {
      code: 'ISB-I8',
      name: 'I-8 Markaz Branch',
      city: 'Islamabad',
      address_line: 'Shop 4-6, Time Square Mall, I-8 Markaz, Islamabad',
      phone: '051 486 2211',
      status: BranchStatus.ACTIVE,
      accepts_delivery: true,
      accepts_pickup: true,
      timezone: 'Asia/Karachi',
    },
    {
      code: 'RWP-SAD',
      name: 'Saddar Cantt Branch',
      city: 'Rawalpindi',
      address_line: 'Haider Road, Saddar, Rawalpindi Cantt',
      phone: '051 556 3399',
      status: BranchStatus.ACTIVE,
      accepts_delivery: true,
      accepts_pickup: true,
      timezone: 'Asia/Karachi',
    },
    {
      code: 'RWP-COMM',
      name: 'Commercial Market Branch',
      city: 'Rawalpindi',
      address_line: 'Satellite Town, Commercial Market, Rawalpindi',
      phone: '051 441 5522',
      status: BranchStatus.ACTIVE,
      accepts_delivery: true,
      accepts_pickup: true,
      timezone: 'Asia/Karachi',
    },
    {
      code: 'LHR-MM',
      name: 'MM Alam Road Branch',
      city: 'Lahore',
      address_line: '14-C1, MM Alam Road, Gulberg III, Lahore',
      phone: '042 357 8899',
      status: BranchStatus.ACTIVE,
      accepts_delivery: true,
      accepts_pickup: true,
      timezone: 'Asia/Karachi',
    },
  ];

  for (const b of branchesData) {
    const existing = await prisma.branch.findFirst({
      where: { tenant_id: tenant.id, code: b.code },
    });

    if (existing) {
      await prisma.branch.update({
        where: { id: existing.id },
        data: {
          name: b.name,
          city: b.city,
          address_line: b.address_line,
          phone: b.phone,
          status: b.status,
          accepts_delivery: b.accepts_delivery,
          accepts_pickup: b.accepts_pickup,
        },
      });
    } else {
      await prisma.$executeRawUnsafe(`
        INSERT INTO branches (
          id, tenant_id, name, code, status, phone, address_line, city, timezone,
          location, accepts_delivery, accepts_pickup, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          '${tenant.id}'::uuid,
          '${b.name}',
          '${b.code}',
          '${b.status}',
          '${b.phone}',
          '${b.address_line}',
          '${b.city}',
          '${b.timezone}',
          ST_SetSRID(ST_MakePoint(73.0479, 33.6844), 4326),
          ${b.accepts_delivery},
          ${b.accepts_pickup},
          NOW(),
          NOW()
        );
      `);
    }
  }

  console.log('--- Successfully seeded Branches & Store Settings ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
