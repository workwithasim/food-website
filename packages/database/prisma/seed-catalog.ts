import { PrismaClient, CatalogStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding menu catalog...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    throw new Error('No tenant found in DB');
  }

  // 1. Create Categories
  const categoriesData = [
    { name: 'Burgers', slug: 'burgers', sort_order: 1 },
    { name: 'Pizza', slug: 'pizza', sort_order: 2 },
    { name: 'Sides', slug: 'sides', sort_order: 3 },
    { name: 'Drinks', slug: 'drinks', sort_order: 4 },
    { name: 'Desserts', slug: 'desserts', sort_order: 5 },
  ];

  const catMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: {
        tenant_id_slug: {
          tenant_id: tenant.id,
          slug: cat.slug,
        },
      },
      update: { name: cat.name, status: CatalogStatus.ACTIVE },
      create: {
        tenant_id: tenant.id,
        name: cat.name,
        slug: cat.slug,
        sort_order: cat.sort_order,
        status: CatalogStatus.ACTIVE,
      },
    });
    catMap[cat.name] = created.id;
  }

  // 2. Create Products
  const productsData = [
    {
      name: 'Mighty Zinger',
      slug: 'mighty-zinger',
      description: 'Double crunchy chicken fillet with spicy mayo, fresh lettuce, and cheese in a toasted sesame bun.',
      category: 'Burgers',
      price: 85000, // Rs 850 in minor units (paisa)
      status: CatalogStatus.ACTIVE,
      featured: true,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Loaded Fries',
      slug: 'loaded-fries',
      description: 'Crispy skin-on french fries loaded with melted cheddar cheese, jalapeños, and secret sauce.',
      category: 'Sides',
      price: 45000,
      status: CatalogStatus.ACTIVE,
      featured: true,
      image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Pepsi Can',
      slug: 'pepsi-can',
      description: 'Chilled 330ml refreshing carbonated soft drink.',
      category: 'Drinks',
      price: 15000,
      status: CatalogStatus.ACTIVE,
      featured: false,
      image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Chicken Fajita Pizza (L)',
      slug: 'chicken-fajita-pizza',
      description: 'Traditional pizza dough with fajita chicken chunks, bell peppers, onions, and rich mozzarella.',
      category: 'Pizza',
      price: 189000,
      status: CatalogStatus.ACTIVE,
      featured: true,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Chocolate Lava Cake',
      slug: 'chocolate-lava-cake',
      description: 'Decadent warm chocolate cake with a molten chocolate center.',
      category: 'Desserts',
      price: 55000,
      status: CatalogStatus.ACTIVE,
      featured: false,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    },
  ];

  for (const p of productsData) {
    const categoryId = catMap[p.category];
    const product = await prisma.product.upsert({
      where: {
        tenant_id_slug: {
          tenant_id: tenant.id,
          slug: p.slug,
        },
      },
      update: {
        name: p.name,
        description: p.description,
        base_price_minor: BigInt(p.price),
        status: p.status,
        featured: p.featured,
        category_id: categoryId,
      },
      create: {
        tenant_id: tenant.id,
        category_id: categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        base_price_minor: BigInt(p.price),
        currency_code: 'PKR',
        status: p.status,
        featured: p.featured,
      },
    });

    // Create media
    await prisma.productMedia.deleteMany({ where: { product_id: product.id } });
    await prisma.productMedia.create({
      data: {
        tenant_id: tenant.id,
        product_id: product.id,
        media_url: p.image,
        alt_text: p.name,
        sort_order: 0,
      },
    });
  }

  console.log(`Seeded ${productsData.length} products and ${categoriesData.length} categories successfully!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
