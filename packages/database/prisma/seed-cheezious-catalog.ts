import { PrismaClient, CatalogStatus, VariantStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Cheezious-Style Catalog & Banners Seeding ---');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    throw new Error('No tenant found in database');
  }

  // 1. Update Tenant Settings to Cheezious Branding (Brand name, Theme colors, Tagline)
  await prisma.tenantSettings.upsert({
    where: { tenant_id: tenant.id },
    update: {
      restaurant_display_name: 'Cheezious',
      order_prefix: 'CHZ',
      theme_json: {
        primary_color: '#F15B25',
        secondary_color: '#FFC107',
        brand_name: 'Cheezious',
        tagline: 'World of Flavors & Cheezy Treats',
        hotline: '051 111 446 699',
        logo_url: 'https://cheezious.com/cheezious.svg',
      },
    },
    create: {
      tenant_id: tenant.id,
      restaurant_display_name: 'Cheezious',
      order_prefix: 'CHZ',
      theme_json: {
        primary_color: '#F15B25',
        secondary_color: '#FFC107',
        brand_name: 'Cheezious',
        tagline: 'World of Flavors & Cheezy Treats',
        hotline: '051 111 446 699',
        logo_url: 'https://cheezious.com/cheezious.svg',
      },
      checkout_json: {},
      notification_json: {},
      seo_json: {},
    },
  });

  // 2. Seed Hero Promotional Banners
  const bannersData = [
    {
      title: 'Somewhat Local — Taste the Authentic Pakistani Spices',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&auto=format&fit=crop&q=80',
      target_url: '/#somewhat-local',
      sort_order: 1,
    },
    {
      title: 'Crown Crust & Cheezy Stuffed — Melt in Every Bite',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&auto=format&fit=crop&q=80',
      target_url: '/#pizza-deals',
      sort_order: 2,
    },
    {
      title: 'Bazinga Crunch Burgers — Crispy, Juicy & Extra Saucy',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&auto=format&fit=crop&q=80',
      target_url: '/#burgers',
      sort_order: 3,
    },
    {
      title: 'Cheezy Sticks & Loaded Gourmet Fries — The Ultimate Sides',
      image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=1400&auto=format&fit=crop&q=80',
      target_url: '/#sides',
      sort_order: 4,
    },
  ];

  await prisma.banner.deleteMany({ where: { tenant_id: tenant.id } });
  for (const b of bannersData) {
    await prisma.banner.create({
      data: {
        id: randomUUID(),
        tenant_id: tenant.id,
        title: b.title,
        image_url: b.image_url,
        target_url: b.target_url,
        is_active: true,
        sort_order: b.sort_order,
      },
    });
  }
  console.log(`Seeded ${bannersData.length} hero promotional banners.`);

  // 3. Seed Modifier Groups (Sizes, Crusts, and Add-ons)
  const sizeGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      tenant_id: tenant.id,
      name: 'Choose Size',
      min_select: 1,
      max_select: 1,
      required: true,
      status: VariantStatus.ACTIVE,
      modifiers: {
        create: [
          { tenant_id: tenant.id, name: 'Regular (10")', price_delta_minor: BigInt(0), sort_order: 1 },
          { tenant_id: tenant.id, name: 'Large (13")', price_delta_minor: BigInt(55000), sort_order: 2 },
          { tenant_id: tenant.id, name: 'Jumbo (16")', price_delta_minor: BigInt(95000), sort_order: 3 },
        ],
      },
    },
    include: { modifiers: true },
  });

  const crustGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      tenant_id: tenant.id,
      name: 'Choose Crust',
      min_select: 1,
      max_select: 1,
      required: false,
      status: VariantStatus.ACTIVE,
      modifiers: {
        create: [
          { tenant_id: tenant.id, name: 'Pan Crust', price_delta_minor: BigInt(0), sort_order: 1 },
          { tenant_id: tenant.id, name: 'Stuffed Crust with Kebab', price_delta_minor: BigInt(22000), sort_order: 2 },
          { tenant_id: tenant.id, name: 'Crown Crust with Cream Cheese', price_delta_minor: BigInt(25000), sort_order: 3 },
          { tenant_id: tenant.id, name: 'Ultra Thin Italian Crust', price_delta_minor: BigInt(0), sort_order: 4 },
        ],
      },
    },
    include: { modifiers: true },
  });

  const addOnsGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      tenant_id: tenant.id,
      name: 'Add-ons & Dips',
      min_select: 0,
      max_select: 4,
      required: false,
      status: VariantStatus.ACTIVE,
      modifiers: {
        create: [
          { tenant_id: tenant.id, name: 'Extra Mozzarella Cheese', price_delta_minor: BigInt(15000), sort_order: 1 },
          { tenant_id: tenant.id, name: 'Garlic Herb Mayo Dip', price_delta_minor: BigInt(6000), sort_order: 2 },
          { tenant_id: tenant.id, name: 'Ranch Sauce Dip', price_delta_minor: BigInt(6000), sort_order: 3 },
          { tenant_id: tenant.id, name: 'Spicy Peri Peri Dip', price_delta_minor: BigInt(6000), sort_order: 4 },
          { tenant_id: tenant.id, name: 'Pepsi Can (330ml)', price_delta_minor: BigInt(12000), sort_order: 5 },
        ],
      },
    },
    include: { modifiers: true },
  });

  const burgerAddOnsGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      tenant_id: tenant.id,
      name: 'Customize Your Burger',
      min_select: 0,
      max_select: 3,
      required: false,
      status: VariantStatus.ACTIVE,
      modifiers: {
        create: [
          { tenant_id: tenant.id, name: 'Extra Melted Cheddar Slice', price_delta_minor: BigInt(8000), sort_order: 1 },
          { tenant_id: tenant.id, name: 'Extra Jalapeños & Pickles', price_delta_minor: BigInt(5000), sort_order: 2 },
          { tenant_id: tenant.id, name: 'Make It A Meal (Fries + Soft Drink)', price_delta_minor: BigInt(25000), sort_order: 3 },
        ],
      },
    },
    include: { modifiers: true },
  });

  console.log('Seeded Modifier Groups (Sizes, Crusts, Add-ons).');

  // 4. Seed Categories
  const categoriesData = [
    { name: 'Somewhat Local', slug: 'somewhat-local', sort_order: 1 },
    { name: 'Pizza Deals', slug: 'pizza-deals', sort_order: 2 },
    { name: 'Cheezy Treats', slug: 'cheezy-treats', sort_order: 3 },
    { name: 'Thin Crust Pizza', slug: 'thin-crust-pizza', sort_order: 4 },
    { name: 'Burgers', slug: 'burgers', sort_order: 5 },
    { name: 'Sides', slug: 'sides', sort_order: 6 },
    { name: 'Desserts', slug: 'desserts', sort_order: 7 },
    { name: 'Beverages', slug: 'beverages', sort_order: 8 },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: {
        tenant_id_slug: { tenant_id: tenant.id, slug: cat.slug },
      },
      update: { name: cat.name, sort_order: cat.sort_order, status: CatalogStatus.ACTIVE },
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
  console.log(`Seeded ${categoriesData.length} categories.`);

  // 5. Seed Products
  const products = [
    // --- Somewhat Local ---
    {
      name: 'Chicken Tikka Pizza',
      slug: 'chicken-tikka-pizza',
      category: 'Somewhat Local',
      description: 'Traditional pizza topped with marinated chicken tikka chunks, sliced onions, and melted mozzarella on spicy pizza sauce.',
      price: 135000,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80',
      isPizza: true,
    },
    {
      name: 'Chicken Fajita Pizza',
      slug: 'chicken-fajita-pizza',
      category: 'Somewhat Local',
      description: 'Rich tomato sauce, tender fajita chicken, crunchy bell peppers, sweet red onions, and mozzarella cheese.',
      price: 139000,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&auto=format&fit=crop&q=80',
      isPizza: true,
    },
    {
      name: 'Bihari Kebab Pizza',
      slug: 'bihari-kebab-pizza',
      category: 'Somewhat Local',
      description: 'Smoky Bihari chicken kebabs infused with traditional aromatic herbs, fresh jalapeños, and gooey cheese.',
      price: 145000,
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=700&auto=format&fit=crop&q=80',
      isPizza: true,
    },

    // --- Pizza Deals ---
    {
      name: 'Cheezy Feast Deal',
      slug: 'cheezy-feast-deal',
      category: 'Pizza Deals',
      description: '1 Large Pizza of your choice + 1 Garlic Bread + 2 Dips + 1.5 Litre Pepsi. Perfect for a family of 4.',
      price: 249000,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=700&auto=format&fit=crop&q=80',
      isPizza: true,
    },
    {
      name: 'Crown Crust Special',
      slug: 'crown-crust-special',
      category: 'Pizza Deals',
      description: 'Crown shaped pizza crust filled with Philadelphia cream cheese, stuffed with peri peri chicken and golden cheddar.',
      price: 189000,
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=700&auto=format&fit=crop&q=80',
      isPizza: true,
    },

    // --- Cheezy Treats ---
    {
      name: 'Cheezy Sticks (4 Pcs)',
      slug: 'cheezy-sticks',
      category: 'Cheezy Treats',
      description: 'Fresh baked dough sticks generously brushed with garlic herb butter and stuffed with molten mozzarella cheese.',
      price: 52000,
      image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=700&auto=format&fit=crop&q=80',
      isPizza: false,
    },
    {
      name: 'Chicken Supreme Pasta',
      slug: 'chicken-supreme-pasta',
      category: 'Cheezy Treats',
      description: 'Creamy fettuccine tossed with seasoned chicken, mushrooms, black olives, topped with baked mozzarella.',
      price: 79000,
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=700&auto=format&fit=crop&q=80',
      isPizza: false,
    },

    // --- Thin Crust Pizza ---
    {
      name: 'Thin Crust Beef Pepperoni',
      slug: 'thin-crust-beef-pepperoni',
      category: 'Thin Crust Pizza',
      description: 'Crispy Roman-style thin crust topped with premium halal beef pepperoni slices and aromatic oregano.',
      price: 169000,
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=700&auto=format&fit=crop&q=80',
      isPizza: true,
    },
    {
      name: 'Thin Crust Peri Peri Delight',
      slug: 'thin-crust-peri-peri-delight',
      category: 'Thin Crust Pizza',
      description: 'Ultra thin crust with peri peri spiced chicken, jalapeños, sweet corn, and garlic ranch drizzle.',
      price: 165000,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=700&auto=format&fit=crop&q=80',
      isPizza: true,
    },

    // --- Burgers ---
    {
      name: 'Bazinga Burger',
      slug: 'bazinga-burger',
      category: 'Burgers',
      description: 'Extra crispy golden battered chicken breast fillet coated in secret hot seasoning with crunchy lettuce and garlic mayo in a toasted sesame bun.',
      price: 59000,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
      isBurger: true,
    },
    {
      name: 'Double Bazinga Supreme',
      slug: 'double-bazinga-supreme',
      category: 'Burgers',
      description: 'Two massive crunchy chicken fillets layered with double cheddar cheese slices, spicy jalapeños, and special house dressing.',
      price: 89000,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=700&auto=format&fit=crop&q=80',
      isBurger: true,
    },
    {
      name: 'Reggy Classic Chicken Burger',
      slug: 'reggy-classic-chicken-burger',
      category: 'Burgers',
      description: 'Classic seasoned chicken patty with fresh tomato, crisp lettuce, cheese slice, and creamy mayo.',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&auto=format&fit=crop&q=80',
      isBurger: true,
    },

    // --- Sides ---
    {
      name: 'Cheezy Loaded Fries',
      slug: 'cheezy-loaded-fries',
      category: 'Sides',
      description: 'Golden skin-on french fries showered with warm cheddar cheese sauce, jalapeño rings, and crispy chicken bites.',
      price: 48000,
      image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=700&auto=format&fit=crop&q=80',
    },
    {
      name: 'Crispy Hot Wings (6 Pcs)',
      slug: 'crispy-hot-wings',
      category: 'Sides',
      description: 'Tender chicken wings fried to a crunchy golden crust and tossed in zesty Buffalo hot sauce.',
      price: 49000,
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=700&auto=format&fit=crop&q=80',
    },

    // --- Desserts ---
    {
      name: 'Molten Chocolate Lava Cake',
      slug: 'molten-chocolate-lava-cake',
      category: 'Desserts',
      description: 'Warm, rich dark chocolate cake with an irresistible molten chocolate center that flows with every spoonful.',
      price: 49000,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&auto=format&fit=crop&q=80',
    },

    // --- Beverages ---
    {
      name: 'Pepsi Can (330ml)',
      slug: 'pepsi-can-330ml',
      category: 'Beverages',
      description: 'Chilled 330ml carbonated soft drink.',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=700&auto=format&fit=crop&q=80',
    },
    {
      name: '7Up Can (330ml)',
      slug: '7up-can-330ml',
      category: 'Beverages',
      description: 'Crisp, refreshing lemon-lime carbonated beverage.',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=700&auto=format&fit=crop&q=80',
    },
  ];

  for (const item of products) {
    const categoryId = catMap[item.category];
    const product = await prisma.product.upsert({
      where: {
        tenant_id_slug: { tenant_id: tenant.id, slug: item.slug },
      },
      update: {
        name: item.name,
        description: item.description,
        base_price_minor: BigInt(item.price),
        status: CatalogStatus.ACTIVE,
        category_id: categoryId,
        deleted_at: null,
      },
      create: {
        id: randomUUID(),
        tenant_id: tenant.id,
        category_id: categoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        base_price_minor: BigInt(item.price),
        currency_code: 'PKR',
        status: CatalogStatus.ACTIVE,
      },
    });

    // Attach media
    await prisma.productMedia.deleteMany({ where: { product_id: product.id } });
    await prisma.productMedia.create({
      data: {
        id: randomUUID(),
        tenant_id: tenant.id,
        product_id: product.id,
        media_url: item.image,
        alt_text: item.name,
        sort_order: 0,
        is_primary: true,
      },
    });

    // Link modifier groups
    await prisma.productModifierGroup.deleteMany({ where: { product_id: product.id } });
    if (item.isPizza) {
      await prisma.productModifierGroup.create({
        data: { tenant_id: tenant.id, product_id: product.id, modifier_group_id: sizeGroup.id, sort_order: 1 },
      });
      await prisma.productModifierGroup.create({
        data: { tenant_id: tenant.id, product_id: product.id, modifier_group_id: crustGroup.id, sort_order: 2 },
      });
      await prisma.productModifierGroup.create({
        data: { tenant_id: tenant.id, product_id: product.id, modifier_group_id: addOnsGroup.id, sort_order: 3 },
      });
    } else if (item.isBurger) {
      await prisma.productModifierGroup.create({
        data: { tenant_id: tenant.id, product_id: product.id, modifier_group_id: burgerAddOnsGroup.id, sort_order: 1 },
      });
      await prisma.productModifierGroup.create({
        data: { tenant_id: tenant.id, product_id: product.id, modifier_group_id: addOnsGroup.id, sort_order: 2 },
      });
    }
  }

  console.log(`Seeded ${products.length} products with images, categories, and modifier groups!`);
  console.log('--- Cheezious Catalog Seeding Completed Successfully! ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
