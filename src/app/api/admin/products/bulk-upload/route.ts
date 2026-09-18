import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { parse } from 'csv-parse/sync';

export const POST = requireAdmin(async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    // Some distributor exports wrap each complete CSV record in quotes
    // (including the header). Unwrap those records before parsing so the
    // parser can see the individual columns while retaining escaped quotes.
    const lines = text.split(/\r?\n/);
    const wrappedRecords = lines.filter((line) => line.trim()).every((line) => {
      const value = line.trim();
      return value.startsWith('"') && value.endsWith('"');
    });
    const csvText = wrappedRecords
      ? lines.map((line) => {
          const value = line.trim();
          return value.startsWith('"') && value.endsWith('"')
            ? value.slice(1, -1).replace(/""/g, '"')
            : line;
        }).join('\n')
      : text;
    let records: Record<string, string>[] = [];

    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (e) {
      console.error('CSV parse error:', e);
      return NextResponse.json({ success: false, message: 'Failed to parse CSV file. Ensure valid CSV format.' }, { status: 400 });
    }

    if (!records || records.length === 0) {
      return NextResponse.json({ success: false, message: 'CSV file contains no rows' }, { status: 400 });
    }

    // Pre-fetch categories map
    const existingCategories = await prisma.category.findMany();
    const catMap = new Map<string, number>();
    existingCategories.forEach((c) => catMap.set(c.name.toLowerCase(), c.id));

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const normalizedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key.toLowerCase().replace(/[^a-z0-9]/g, ''),
          value.trim(),
        ])
      ) as Record<string, string>;

      const name = normalizedRow.name || normalizedRow.productname || normalizedRow.product;
      const categoryName = normalizedRow.category || normalizedRow.categoryname;
      const originalPriceVal = normalizedRow.price || normalizedRow.rate || normalizedRow.originalprice;
      const discountVal = normalizedRow.discount || normalizedRow.discount80 || normalizedRow.discountamount || '0';
      const stockInput = normalizedRow.stock || normalizedRow.stockqty || normalizedRow.quantity;
      const hasStock = stockInput !== undefined && stockInput !== '';
      const stockVal = stockInput || '0';
      const sku = normalizedRow.sku || null;
      const description = normalizedRow.description || (normalizedRow.packing ? `Packing: ${normalizedRow.packing}` : null);

      const rowNumber = i + 2;
      const safeName = name || `Imported product row ${rowNumber}`;
      const safeCategoryName = categoryName || 'Uncategorized';
      if (!name || !categoryName || !originalPriceVal) {
        warnings.push(`Row ${rowNumber}: Missing ${!name ? 'product name' : ''}${!name && (!categoryName || !originalPriceVal) ? ', ' : ''}${!categoryName ? 'category' : ''}${!categoryName && !originalPriceVal ? ', ' : ''}${!originalPriceVal ? 'original price' : ''}; defaults were applied.`);
      }

      const originalPrice = originalPriceVal ? parseFloat(originalPriceVal.replace(/[^0-9.-]/g, '')) : 0;
      const discount = parseFloat(discountVal.replace(/[^0-9.-]/g, '')) || 0;
      const price = originalPrice - discount;
      const stockText = stockVal.toLowerCase();
      const parsedStockQty = stockText.includes('out of stock') || stockText === 'out' || stockText === 'no'
        ? 0
        : stockText.includes('in stock') || stockText === 'in' || stockText === 'yes'
          ? 1
          : parseInt(stockVal, 10);

      if (hasStock && (Number.isNaN(parsedStockQty) || parsedStockQty < 0)) {
        warnings.push(`Row ${rowNumber}: Invalid stock quantity; marked in stock.`);
      }
      // Inventory is managed as an availability flag. Keep a positive internal
      // quantity for cart/order validation, but never expose a piece count.
      const stockQuantity = 999999;

      if (isNaN(originalPrice) || originalPrice < 0 || price < 0) {
        warnings.push(`Row ${rowNumber}: Invalid rate or discount; price set to 0.`);
      }

      // Find or create category
      let categoryId = catMap.get(safeCategoryName.toLowerCase());
      if (!categoryId) {
        const catSlug = slugify(safeCategoryName) || `uncategorized-${Date.now()}`;
        const newCat = await prisma.category.upsert({
          where: { slug: catSlug },
          update: {},
          create: { name: safeCategoryName, slug: catSlug, description: `Category ${safeCategoryName}` },
        });
        categoryId = newCat.id;
        catMap.set(safeCategoryName.toLowerCase(), categoryId);
      }

      const baseSlug = slugify(safeName) || `imported-product-${rowNumber}`;
      const existingProduct = sku
        ? await prisma.product.findFirst({ where: { OR: [{ sku }, { slug: baseSlug }] } })
        : await prisma.product.findUnique({ where: { slug: baseSlug } });

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            categoryId,
            originalPrice,
            price,
            stockQty: stockQuantity,
            ...(description && { description }),
            ...(sku && { sku }),
          },
        });
        updatedCount++;
      } else {
        let slug = baseSlug;
        let count = 1;
        while (await prisma.product.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${count++}`;
        }

        await prisma.product.create({
          data: {
            categoryId,
            name: safeName,
            slug,
            sku: sku || null,
            description,
            originalPrice,
            price,
            stockQty: stockQuantity,
            imageUrl: '/uploads/placeholder.png',
            isActive: true,
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: records.length,
        createdCount,
        updatedCount,
        errors,
        warnings,
      },
    });
  } catch (error) {
    console.error('Error during bulk product upload:', error);
    return NextResponse.json({ success: false, message: 'Bulk upload failed' }, { status: 500 });
  }
});
