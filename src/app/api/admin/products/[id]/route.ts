import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const PUT = requireAdmin(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());

    const body = await req.json();
    const { categoryId, name, sku, description, originalPrice, price, stockQty, imageUrl, isActive } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      const baseSlug = slugify(name);
      slug = baseSlug;
      let count = 1;
      while (true) {
        const found = await prisma.product.findUnique({ where: { slug } });
        if (!found || found.id === id) break;
        slug = `${baseSlug}-${count++}`;
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(name && { name }),
        ...(name && { slug }),
        ...(sku !== undefined && { sku: sku || null }),
        ...(description !== undefined && { description: description || null }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice === '' ? null : Number(originalPrice) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stockQty !== undefined && { stockQty: 999999 }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || '/uploads/placeholder.png' }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });

    if (orderItemCount > 0) {
      const archived = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        action: 'archived',
        product: archived,
        message: 'Product archived because it is part of an existing order.',
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.packageItem.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, action: 'deleted', message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 });
  }
});
