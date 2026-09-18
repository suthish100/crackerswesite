import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.trim();
    const orderId = searchParams.get('orderId')?.trim();

    if (!phone || !orderId) {
      return NextResponse.json(
        { success: false, message: 'Both phone number and Order ID are required for tracking' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        publicOrderId: { equals: orderId },
        customerPhone: { equals: phone },
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
      return NextResponse.json(
        { success: false, message: 'No matching order found for the provided details' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ success: false, message: 'Failed to track order' }, { status: 500 });
  }
}
