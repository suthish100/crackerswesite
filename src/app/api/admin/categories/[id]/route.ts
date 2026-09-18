import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const PUT = requireAdmin(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());

    const body = await req.json();
    const { name, description, isActive } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      const baseSlug = slugify(name);
      slug = baseSlug;
      let count = 1;
      while (true) {
        const found = await prisma.category.findUnique({ where: { slug } });
        if (!found || found.id === id) break;
        slug = `${baseSlug}-${count++}`;
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(name && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, message: 'Failed to update category' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete category containing ${existing._count.products} products` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
});
