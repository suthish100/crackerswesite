import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed Categories
  const categoriesData = [
    { name: 'Sparklers', slug: 'sparklers', description: 'Classic sparkling handheld crackers in green, red, and gold.' },
    { name: 'Ground Chakkars', slug: 'ground-chakkars', description: 'Spinning wheels that light up the floor with brilliant sparks.' },
    { name: 'Flower Pots', slug: 'flower-pots', description: 'Fountains emitting colourful sparkling showers rising high.' },
    { name: 'Rockets', slug: 'rockets', description: 'Soar high into the sky and burst with vibrant colors.' },
    { name: 'Fancy Aerials', slug: 'fancy-aerials', description: 'Multi-shot display shells that light up the night sky.' },
    { name: 'Sound Crackers', slug: 'sound-crackers', description: 'Traditional loud crackers from single to multi-shots.' },
    { name: 'Gift Boxes', slug: 'gift-boxes', description: 'Assorted custom crackers packages for families and celebrations.' },
  ];

  const categories: Record<string, number> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.name] = created.id;
  }
  console.log(`✅ ${categoriesData.length} categories seeded`);

  // 2. Seed Products
  const productsData = [
    {
      categoryName: 'Sparklers',
      name: 'Golden Sparklers (15cm)',
      slug: 'golden-sparklers-15cm',
      sku: 'SPK-001',
      description: 'Vibrant golden sparkles with low smoke, child-friendly hand-held sparklers. Perfect for kids and family celebrations.',
      price: 150.00,
      stockQty: 500,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Sparklers',
      name: 'Electric Sparklers (30cm)',
      slug: 'electric-sparklers-30cm',
      sku: 'SPK-002',
      description: 'Brilliant multi-color electric sparklers with extended burn time. Produces mesmerizing color-changing effects.',
      price: 250.00,
      stockQty: 300,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Ground Chakkars',
      name: 'Chakkar Special (10 Pcs)',
      slug: 'chakkar-special-10pcs',
      sku: 'GCK-001',
      description: 'High-speed spinning wheels emitting brilliant silver and gold sparks. Spins for 30+ seconds each.',
      price: 240.00,
      stockQty: 350,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Flower Pots',
      name: 'Flower Pot Ashoka Deluxe',
      slug: 'flower-pot-ashoka-deluxe',
      sku: 'FPT-001',
      description: 'Majestic fountain showers rising up to 10 feet with multi-color stars and crackling effect.',
      price: 320.00,
      stockQty: 200,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Rockets',
      name: 'Lunik Rocket (5 Pcs)',
      slug: 'lunik-rocket-5pcs',
      sku: 'RKT-001',
      description: 'Classic high-velocity rocket bursting into a red crackling canopy at 100+ feet altitude.',
      price: 450.00,
      stockQty: 150,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Fancy Aerials',
      name: 'Sky Shot 30 Shots',
      slug: 'sky-shot-30-shots',
      sku: 'FAR-001',
      description: 'Vibrant multi-colored aerial explosions painting the night sky in gold, green, red and silver.',
      price: 1200.00,
      stockQty: 80,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Sound Crackers',
      name: 'Red Laxmi Crackers (50 Pcs)',
      slug: 'red-laxmi-crackers-50pcs',
      sku: 'SND-001',
      description: 'Traditional loud sound cracker. A pack of 50 single-shot crackers with classic Diwali thunderous burst.',
      price: 180.00,
      stockQty: 300,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Sound Crackers',
      name: 'Atom Bomb (10 Pcs)',
      slug: 'atom-bomb-10pcs',
      sku: 'SND-002',
      description: 'Heavy-duty triple-burst sound crackers. Ground-shaking performance with spectacular sound.',
      price: 350.00,
      stockQty: 200,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Gift Boxes',
      name: 'Diwali Sparkle Family Gift Box',
      slug: 'diwali-sparkle-family-gift-box',
      sku: 'GFT-001',
      description: 'Premium collection of 35 items including sparklers, pots, chakkars, and rockets. Perfect family celebration box.',
      price: 2999.00,
      stockQty: 50,
      imageUrl: '/uploads/placeholder.png',
    },
    {
      categoryName: 'Flower Pots',
      name: 'Color Changing Fountain (3 Pcs)',
      slug: 'color-changing-fountain-3pcs',
      sku: 'FPT-002',
      description: 'Stunning 5-stage color-changing fountain with crackling stars. Each pot burns for 45 seconds.',
      price: 480.00,
      stockQty: 120,
      imageUrl: '/uploads/placeholder.png',
    },
  ];

  for (const prod of productsData) {
    const { categoryName, ...productData } = prod;
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        categoryId: categories[categoryName],
      },
    });
  }
  console.log(`✅ ${productsData.length} products seeded`);

  // 3. Seed Admin User
  const adminPhone = process.env.SEED_ADMIN_PHONE || '9999999999';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Akashkumar@2006';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      name: 'Akash Kumar',
      phone: adminPhone,
      role: 'owner',
      passwordHash,
    },
  });
  console.log(`✅ Admin user seeded (phone: ${adminPhone})`);

  await prisma.user.upsert({
    where: { email: 'demo.customer@example.com' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'demo.customer@example.com',
    },
  });
  console.log('✅ Demo customer user seeded');

  // 4. Seed Ready-Made Packages
  const allProducts = await prisma.product.findMany();
  const findProduct = (slug: string) => allProducts.find(p => p.slug === slug);

  // Package 1: Diwali Family Combo
  const pkg1 = await prisma.package.upsert({
    where: { slug: 'diwali-family-combo' },
    update: {},
    create: {
      name: 'Diwali Family Combo',
      slug: 'diwali-family-combo',
      description: 'A perfect family celebration package with a mix of sparklers, flower pots, chakkars, and rockets. Great value for a complete Diwali experience!',
      imageUrl: '/uploads/placeholder.png',
      basePrice: 1499.00,
    },
  });

  const pkg1Items = [
    { slug: 'golden-sparklers-15cm', qty: 2 },
    { slug: 'chakkar-special-10pcs', qty: 1 },
    { slug: 'flower-pot-ashoka-deluxe', qty: 2 },
    { slug: 'lunik-rocket-5pcs', qty: 1 },
    { slug: 'red-laxmi-crackers-50pcs', qty: 1 },
  ];

  for (const item of pkg1Items) {
    const product = findProduct(item.slug);
    if (product) {
      await prisma.packageItem.upsert({
        where: { packageId_productId: { packageId: pkg1.id, productId: product.id } },
        update: { defaultQty: item.qty },
        create: { packageId: pkg1.id, productId: product.id, defaultQty: item.qty },
      });
    }
  }

  // Package 2: Grand Celebration Kit
  const pkg2 = await prisma.package.upsert({
    where: { slug: 'grand-celebration-kit' },
    update: {},
    create: {
      name: 'Grand Celebration Kit',
      slug: 'grand-celebration-kit',
      description: 'The ultimate premium celebration package featuring aerial shots, multi-color fountains, and a spectacular mix of crackers for a grand show!',
      imageUrl: '/uploads/placeholder.png',
      basePrice: 3499.00,
    },
  });

  const pkg2Items = [
    { slug: 'electric-sparklers-30cm', qty: 3 },
    { slug: 'chakkar-special-10pcs', qty: 2 },
    { slug: 'color-changing-fountain-3pcs', qty: 2 },
    { slug: 'sky-shot-30-shots', qty: 1 },
    { slug: 'lunik-rocket-5pcs', qty: 2 },
    { slug: 'atom-bomb-10pcs', qty: 1 },
  ];

  for (const item of pkg2Items) {
    const product = findProduct(item.slug);
    if (product) {
      await prisma.packageItem.upsert({
        where: { packageId_productId: { packageId: pkg2.id, productId: product.id } },
        update: { defaultQty: item.qty },
        create: { packageId: pkg2.id, productId: product.id, defaultQty: item.qty },
      });
    }
  }
  console.log('✅ 2 ready-made packages seeded');

  console.log('\n🎆 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
