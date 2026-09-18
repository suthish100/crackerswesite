import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const GET = requireAdmin(async () => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { id: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch packages' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { name, description, imageUrl, basePrice, isActive, items } = body;

    if (!name || basePrice === undefined || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Package name, base price, and at least one default item are required' },
        { status: 400 }
      );
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.package.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || '/uploads/placeholder.png',
        basePrice: Number(basePrice),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        items: {
          create: items.map((i: { productId: number; defaultQty: number }) => ({
            productId: Number(i.productId),
            defaultQty: Number(i.defaultQty || 1),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ success: false, message: 'Failed to create package' }, { status: 500 });
  }
});
