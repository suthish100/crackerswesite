import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            sourcePackage: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching admin order detail:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch order detail' }, { status: 500 });
  }
});
