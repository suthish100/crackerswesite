import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  const csvContent = fs.readFileSync('d:/crackers_imgs/IMAGE_INDEX.csv', 'utf-8');
  const records: Record<string, string>[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const dbProducts = await prisma.product.findMany({
    orderBy: { id: 'asc' },
  });

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/["'″”’]/g, '')
      .replace(/[×x]/g, 'x')
      .replace(/[^a-z0-9]/g, '')
      .trim();

  console.log(`Checking 1-to-1 match for all ${records.length} items:`);
  let allMatched = true;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const dbP = dbProducts[i];
    const normCsv = normalize(row.product_name);
    const normDb = normalize(dbP.name);
    const matches = normCsv === normDb;

    if (!matches) {
      allMatched = false;
      console.log(`Mismatch at index ${i + 1}: CSV "${row.product_name}" vs DB "${dbP.name}"`);
    }

    // Check that the image file exists
    const imgPath = `d:/crackers_imgs/${row.image_file}`;
    if (!fs.existsSync(imgPath)) {
      console.log(`Missing image file on disk: ${imgPath}`);
      allMatched = false;
    }
  }

  if (allMatched) {
    console.log('✅ ALL 189 PRODUCTS MATCH 1-TO-1 PERFECTLY WITH IMAGES AND CSV!');
  }

  console.log('\nValidating physical images for DB products:');
  let validOnDisk = 0;
  for (const prod of dbProducts) {
    const filePath = path.join(process.cwd(), 'public', prod.imageUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      validOnDisk++;
    } else {
      console.log(`❌ Missing image for [${prod.id}] ${prod.name}: ${filePath}`);
    }
  }
  console.log(`✅ ${validOnDisk} / ${dbProducts.length} products have physical images existing in public directory!`);

  const packages = await prisma.package.findMany();
  console.log('Existing packages in DB:', packages);
}

main().catch(console.error).finally(() => prisma.$disconnect());
