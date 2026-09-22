import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderId, generateWhatsAppLink, ORDER_SUPPORT_PHONE } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const rateCheck = checkRateLimit(`order_create:${ip}`, 20, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many order requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { customerName, customerPhone, customerAddress, customerNote, items } = body;

    // Type and existence checks
    if (
      typeof customerName !== 'string' ||
      typeof customerPhone !== 'string' ||
      typeof customerAddress !== 'string' ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: 'Customer name, phone, address, and items are required' },
        { status: 400 }
      );
    }

    const trimmedName = customerName.trim();
    const cleanPhone = customerPhone.replace(/[\s\-()]/g, '');
    const trimmedAddress = customerAddress.trim();
    const trimmedNote = typeof customerNote === 'string' ? customerNote.trim().slice(0, 500) : null;

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Customer name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Phone format: 10 to 15 digits
    const phoneRegex = /^[0-9+]{10,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit phone number' },
        { status: 400 }
      );
    }

    if (trimmedAddress.length < 5 || trimmedAddress.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Address must be between 5 and 500 characters' },
        { status: 400 }
      );
    }

    if (items.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Order exceeds maximum allowable items (100)' },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    const orderItemsToCreate: Array<{
      productId: number;
      sourcePackageId?: number | null;
      quantity: number;
      unitPrice: number;
    }> = [];

    const whatsappItemsList: Array<{ name: string; quantity: number; unitPrice: number }> = [];

    for (const item of items) {
      if (!Number.isInteger(item.productId) || item.productId <= 0) {
        return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 1000) {
        return NextResponse.json({ success: false, message: 'Item quantity must be a positive number up to 1000' }, { status: 400 });
      }
    }

    const publicOrderId = generateOrderId();

    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product || !product.isActive) {
          throw new Error(`PRODUCT_UNAVAILABLE:${item.productName || item.productId}`);
        }

        const reserved = await tx.product.updateMany({
          where: { id: product.id, isActive: true, stockQty: { gte: item.quantity } },
          data: { stockQty: { decrement: item.quantity } },
        });

        if (reserved.count !== 1) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }

        totalAmount += product.price * item.quantity;
        orderItemsToCreate.push({
          productId: product.id,
          sourcePackageId: item.sourcePackageId || null,
          quantity: item.quantity,
          unitPrice: product.price,
        });
        whatsappItemsList.push({ name: product.name, quantity: item.quantity, unitPrice: product.price });
      }

      // Create order
      const order = await tx.order.create({
        data: {
          publicOrderId,
          customerName: trimmedName,
          customerPhone: cleanPhone,
          customerAddress: trimmedAddress,
          customerNote: trimmedNote,
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
    }, { maxWait: 15000, timeout: 30000 });

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
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.startsWith('PRODUCT_UNAVAILABLE:')) {
      return NextResponse.json({ success: false, message: `Product "${errorMessage.slice('PRODUCT_UNAVAILABLE:'.length)}" is unavailable` }, { status: 400 });
    }
    if (errorMessage.startsWith('INSUFFICIENT_STOCK:')) {
      return NextResponse.json({ success: false, message: `Not enough stock for "${errorMessage.slice('INSUFFICIENT_STOCK:'.length)}"` }, { status: 409 });
    }
    const message = errorMessage.includes('Can\'t reach database server')
      ? 'The order service is temporarily unavailable. Please try again in a moment.'
      : 'Failed to create order';
    return NextResponse.json({ success: false, message }, { status: 503 });
  }
}
