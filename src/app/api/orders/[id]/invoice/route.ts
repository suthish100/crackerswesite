import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderInvoicePdf, OrderInvoiceData } from '@/lib/invoicePdf';

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
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const invoiceData: OrderInvoiceData = {
      id: order.id,
      publicOrderId: order.publicOrderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      customerNote: order.customerNote,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.product?.name || `Product #${item.productId}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        sourcePackageName: item.sourcePackage?.name || null,
      })),
    };

    const doc = generateOrderInvoicePdf(invoiceData);
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    const filename = `Invoice_${order.publicOrderId}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate invoice PDF' }, { status: 500 });
  }
}
