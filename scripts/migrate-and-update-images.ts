import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting cracker images migration and database update...');

  const repoDataCsv = path.join(process.cwd(), 'data', 'crackers_imgs', 'IMAGE_INDEX.csv');
  const sourceDir = fs.existsSync('d:/crackers_imgs/IMAGE_INDEX.csv')
    ? 'd:/crackers_imgs'
    : path.join(process.cwd(), 'public', 'images', 'products');
  const targetPublicDir = path.join(process.cwd(), 'public', 'images', 'products');
  const targetDataDir = path.join(process.cwd(), 'data', 'crackers_imgs');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  // 1. Ensure target directories exist
  fs.mkdirSync(targetPublicDir, { recursive: true });
  fs.mkdirSync(targetDataDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });

  console.log(`📁 Target directory: ${targetPublicDir}`);

  // 2. Read CSV
  let csvFile = path.join(sourceDir, 'IMAGE_INDEX.csv');
  if (!fs.existsSync(csvFile) && fs.existsSync(repoDataCsv)) {
    csvFile = repoDataCsv;
  }
  if (!fs.existsSync(csvFile)) {
    throw new Error(`CSV file not found at ${csvFile}`);
  }
  const csvContent = fs.readFileSync(csvFile, 'utf-8');
  const records: Array<{
    sl_no: string;
    product_name: string;
    image_file: string;
    match_level: string;
    source_shop: string;
    source_product_name: string;
    source_page_url: string;
    image_url: string;
    note: string;
  }> = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📄 Found ${records.length} records in IMAGE_INDEX.csv`);

  // 3. Copy files to public/images/products and data/crackers_imgs
  let copiedCount = 0;
  for (const record of records) {
    const src = path.join(sourceDir, record.image_file);
    const dest = path.join(targetPublicDir, record.image_file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      copiedCount++;
    } else {
      console.warn(`⚠️ Warning: Image file not found: ${src}`);
    }
  }

  // Copy CSV to both public and data folders
  fs.copyFileSync(csvFile, path.join(targetPublicDir, 'IMAGE_INDEX.csv'));
  fs.copyFileSync(csvFile, path.join(targetDataDir, 'IMAGE_INDEX.csv'));

  console.log(`✅ Copied ${copiedCount} images to ${targetPublicDir}`);
  console.log(`✅ Copied IMAGE_INDEX.csv to ${targetDataDir}`);

  // 4. Ensure placeholder.png exists in public/uploads/
  const placeholderDest = path.join(uploadsDir, 'placeholder.png');
  if (!fs.existsSync(placeholderDest)) {
    // Copy the first image as placeholder or create one
    const firstImg = path.join(targetPublicDir, records[0].image_file);
    if (fs.existsSync(firstImg)) {
      fs.copyFileSync(firstImg, placeholderDest);
      console.log(`✅ Created placeholder.png from first image`);
    }
  }

  // 5. Fetch all products from Database
  const dbProducts = await prisma.product.findMany({
    orderBy: { id: 'asc' },
  });
  console.log(`📦 Found ${dbProducts.length} products in database`);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/["'″”’]/g, '')
      .replace(/[×x]/g, 'x')
      .replace(/[^a-z0-9]/g, '')
      .trim();

  // Create lookup maps
  const recordMapByNorm = new Map<string, typeof records[0]>();
  records.forEach((r) => {
    recordMapByNorm.set(normalize(r.product_name), r);
  });

  let updatedCount = 0;
  const updates: Array<{ id: number; name: string; imageUrl: string }> = [];

  for (let i = 0; i < dbProducts.length; i++) {
    const prod = dbProducts[i];
    const normName = normalize(prod.name);

    // First try normalized match, then fallback to sequence index if equal length
    let matchedRecord = recordMapByNorm.get(normName);
    if (!matchedRecord && i < records.length) {
      if (normalize(records[i].product_name) === normName) {
        matchedRecord = records[i];
      }
    }

    if (matchedRecord) {
      const imageUrl = `/images/products/${matchedRecord.image_file}`;
      await prisma.product.update({
        where: { id: prod.id },
        data: { imageUrl },
      });
      updatedCount++;
      updates.push({ id: prod.id, name: prod.name, imageUrl });
    } else {
      console.warn(`⚠️ Could not match DB product: "${prod.name}" (id: ${prod.id})`);
    }
  }

  console.log(`🎉 Successfully updated ${updatedCount} / ${dbProducts.length} products with images!`);

  // Update Packages if they have placeholder
  const packages = await prisma.package.findMany();
  for (const pkg of packages) {
    if (pkg.imageUrl === '/uploads/placeholder.png' || !pkg.imageUrl) {
      // Use combo pack image 186
      const comboImg = '/images/products/186_Classic_Combo_Pack_Rs_1199.jpg';
      await prisma.package.update({
        where: { id: pkg.id },
        data: { imageUrl: comboImg },
      });
      console.log(`✨ Updated package "${pkg.name}" imageUrl to ${comboImg}`);
    }
  }

  // 6. Validation sample
  const sample = await prisma.product.findMany({
    take: 5,
    select: { id: true, name: true, imageUrl: true },
  });
  console.log('\nSample updated products in DB:');
  console.dir(sample, { depth: null });
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
