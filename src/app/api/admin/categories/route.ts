import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const GET = requireAdmin(async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch categories' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { name, description, isActive } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Category name is required' }, { status: 400 });
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const maxCat = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const nextSortOrder = (maxCat?.sortOrder ?? -1) + 1;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, message: 'Failed to create category' }, { status: 500 });
  }
});
