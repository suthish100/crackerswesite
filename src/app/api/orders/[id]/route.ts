import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const lookupId = decodeURIComponent(id).trim();

    if (!lookupId) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    const numId = Number(lookupId);
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { publicOrderId: { equals: lookupId } },
          ...(Number.isInteger(numId) && numId > 0 ? [{ id: numId }] : []),
        ],
      },
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

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        publicOrderId: order.publicOrderId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        customerNote: order.customerNote,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map((i) => ({
          name: i.product?.name || `Product #${i.productId}`,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          sourcePackageName: i.sourcePackage?.name || null,
        })),
        statusHistory: order.statusHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json({ success: false, message: 'Failed to retrieve order' }, { status: 500 });
  }
}
