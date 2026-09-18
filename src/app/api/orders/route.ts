import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderId, generateWhatsAppLink, ORDER_SUPPORT_PHONE } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, customerNote, items } = body;

    if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Customer name, phone, address, and items are required' },
        { status: 400 }
      );
    }

    // Verify products and calculate total
    let totalAmount = 0;
    const orderItemsToCreate: Array<{
      productId: number;
      sourcePackageId?: number | null;
      quantity: number;
      unitPrice: number;
    }> = [];

    const whatsappItemsList: Array<{ name: string; quantity: number; unitPrice: number }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          { success: false, message: `Product "${item.productName || item.productId}" is unavailable` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsToCreate.push({
        productId: product.id,
        sourcePackageId: item.sourcePackageId || null,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      whatsappItemsList.push({
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    const publicOrderId = generateOrderId();

    // Inventory is availability based; products remain orderable while active.
    // Keep order creation transactional so the order and its items are atomic.
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          publicOrderId,
          customerName,
          customerPhone,
          customerAddress,
          customerNote: customerNote || null,
          status: 'Received',
          totalAmount,
          items: {
            create: orderItemsToCreate,
          },
          statusHistory: {
            create: {
              status: 'Received',
              note: 'Order submitted by customer via storefront',
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      return order;
    });

    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || ORDER_SUPPORT_PHONE;
    const whatsappLink = generateWhatsAppLink(
      adminPhone,
      publicOrderId,
      customerName,
      customerPhone,
      customerAddress,
      whatsappItemsList,
      totalAmount
    );

    return NextResponse.json({
      success: true,
      order: {
        id: result.id,
        publicOrderId: result.publicOrderId,
        customerName: result.customerName,
        customerPhone: result.customerPhone,
        customerAddress: result.customerAddress,
        totalAmount: result.totalAmount,
        status: result.status,
        createdAt: result.createdAt,
      },
      whatsappLink,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    const message = error instanceof Error && error.message.includes('Can\'t reach database server')
      ? 'The order service is temporarily unavailable. Please try again in a moment.'
      : 'Failed to create order';
    return NextResponse.json({ success: false, message }, { status: 503 });
  }
}
