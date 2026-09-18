import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const PUT = requireAdmin(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());

    const body = await req.json();
    const { name, description, imageUrl, basePrice, isActive, items } = body;

    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      const baseSlug = slugify(name);
      slug = baseSlug;
      let count = 1;
      while (true) {
        const found = await prisma.package.findUnique({ where: { slug } });
        if (!found || found.id === id) break;
        slug = `${baseSlug}-${count++}`;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (items && Array.isArray(items)) {
        await tx.packageItem.deleteMany({ where: { packageId: id } });
        await tx.packageItem.createMany({
          data: items.map((i: { productId: number; defaultQty: number }) => ({
            packageId: id,
            productId: Number(i.productId),
            defaultQty: Number(i.defaultQty || 1),
          })),
        });
      }

      return tx.package.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(name && { slug }),
          ...(description !== undefined && { description: description || null }),
          ...(imageUrl !== undefined && { imageUrl: imageUrl || '/uploads/placeholder.png' }),
          ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, package: updated });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json({ success: false, message: 'Failed to update package' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());

    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
    }

    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete package' }, { status: 500 });
  }
});
