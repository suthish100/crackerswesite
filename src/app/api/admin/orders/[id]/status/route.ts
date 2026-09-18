import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { ORDER_STATUSES } from '@/lib/utils';

export const PATCH = requireAdmin(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const idIndex = pathSegments.indexOf('orders') + 1;
    const id = Number(pathSegments[idIndex]);

    const body = await req.json();
    const { status, note } = body;

    if (!status || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If order is cancelled and was not cancelled before, restore stock
      if (status === 'Cancelled' && existingOrder.status !== 'Cancelled') {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { increment: item.quantity } },
          });
        }
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id },
        data: { status },
      });

      // Append row to order_status_history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note: note || `Status updated to ${status}`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ success: false, message: 'Failed to update order status' }, { status: 500 });
  }
});
