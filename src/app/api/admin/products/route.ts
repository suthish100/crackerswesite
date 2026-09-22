import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const GET = requireAdmin(async () => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'desc' },
      include: {
        category: true,
      },
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { categoryId, name, sku, description, originalPrice, price, stockQty, imageUrl, isActive } = body;

    if (!categoryId || !name || price === undefined || stockQty === undefined) {
      return NextResponse.json(
        { success: false, message: 'Category, name, price, and stock quantity are required' },
        { status: 400 }
      );
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const product = await prisma.product.create({
      data: {
        categoryId: Number(categoryId),
        name,
        slug,
        sku: sku || null,
        description: description || null,
        originalPrice: originalPrice !== undefined && originalPrice !== '' ? Number(originalPrice) : null,
        price: Number(price),
        stockQty: 999999,
        imageUrl: imageUrl || '/uploads/placeholder.png',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 });
  }
});
