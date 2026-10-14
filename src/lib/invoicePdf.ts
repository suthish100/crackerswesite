import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ORDER_SUPPORT_PHONE } from './utils';

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  sourcePackageName?: string | null;
}

export interface OrderInvoiceData {
  id?: number | string;
  publicOrderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote?: string | null;
  status?: string;
  totalAmount: number;
  createdAt?: string | Date;
  items?: InvoiceItem[];
}

export function generateOrderInvoicePdf(order: OrderInvoiceData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Sleek Top Banner (Slate-900)
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SIVAKASI CRACKERS', margin, 12);

  // Brand Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(251, 191, 36); // #fbbf24 (amber)
  doc.text('Standard Safety Certified Fireworks • Direct Sivakasi Wholesale', margin, 18);
  doc.setTextColor(203, 213, 225); // #cbd5e1
  doc.text(`Helpline / WhatsApp: +91 ${ORDER_SUPPORT_PHONE} | Sivakasi, Tamil Nadu`, margin, 23);

  // Right Side Header: Document Badge & Reference
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TAX INVOICE / ORDER ESTIMATE', pageWidth - margin, 11, { align: 'right' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Order ID: ${order.publicOrderId}`, pageWidth - margin, 17, { align: 'right' });

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${formattedDate}, ${formattedTime}`, pageWidth - margin, 23, { align: 'right' });

  // 2. Gold/Amber Accent Divider
  doc.setFillColor(217, 119, 6); // #d97706
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // 3. Customer & Order Info Cards (Side by side)
  const infoCardY = 34;
  const cardHeight = 32;
  const colWidth = (contentWidth - 6) / 2;

  // Left Card: Customer & Delivery Details
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, infoCardY, colWidth, cardHeight, 2, 2, 'FD');

  doc.setTextColor(180, 83, 9); // amber-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BILLED & DELIVERED TO:', margin + 3.5, infoCardY + 6);

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(order.customerName || 'Valued Customer', margin + 3.5, infoCardY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`WhatsApp / Phone: +91 ${order.customerPhone}`, margin + 3.5, infoCardY + 16);

  // Address wrapped
  const addressLines = doc.splitTextToSize(order.customerAddress || 'Direct Store Pickup', colWidth - 7);
  doc.text(addressLines.slice(0, 2), margin + 3.5, infoCardY + 21);

  // Right Card: Order Metadata & Status
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightColX, infoCardY, colWidth, cardHeight, 2, 2, 'FD');

  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ORDER & DISPATCH METRICS:', rightColX + 3.5, infoCardY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Order Tracking No:', rightColX + 3.5, infoCardY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(order.publicOrderId, rightColX + 38, infoCardY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Order Status:', rightColX + 3.5, infoCardY + 16);
  doc.setFont('helvetica', 'bold');
  const statusColor = (order.status || 'Received').toLowerCase();
  if (statusColor.includes('confirm') || statusColor.includes('paid')) {
    doc.setTextColor(16, 185, 129); // emerald
  } else if (statusColor.includes('dispatch')) {
    doc.setTextColor(37, 99, 235); // blue
  } else {
    doc.setTextColor(217, 119, 6); // amber
  }
  doc.text(order.status || 'Received / Verifying', rightColX + 38, infoCardY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Dispatch Origin:', rightColX + 3.5, infoCardY + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Sivakasi, Tamil Nadu', rightColX + 38, infoCardY + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Verification:', rightColX + 3.5, infoCardY + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Direct Phone / WhatsApp', rightColX + 38, infoCardY + 26);

  // If customer note exists, small note banner
  let tableStartY = infoCardY + cardHeight + 4;
  if (order.customerNote) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(margin, tableStartY, contentWidth, 7, 1.5, 1.5, 'FD');
    doc.setTextColor(146, 64, 14); // amber-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const noteText = `Customer Preference: ${order.customerNote}`;
    doc.text(doc.splitTextToSize(noteText, contentWidth - 6)[0], margin + 3, tableStartY + 4.8);
    tableStartY += 9;
  }

  // 4. Products Table
  const items = order.items && order.items.length > 0 ? order.items : [];
  const tableRows = items.map((item, index) => {
    const totalItemPrice = item.unitPrice * item.quantity;
    return [
      String(index + 1),
      item.name,
      item.sourcePackageName ? `Pkg: ${item.sourcePackageName}` : 'Individual Cracker',
      `${item.quantity} pcs`,
      `Rs. ${item.unitPrice.toLocaleString('en-IN')}`,
      `Rs. ${totalItemPrice.toLocaleString('en-IN')}`,
    ];
  });

  if (tableRows.length === 0) {
    tableRows.push([
      '1',
      'Crackers Celebration Order',
      'Festival Order',
      '1',
      `Rs. ${order.totalAmount.toLocaleString('en-IN')}`,
      `Rs. ${order.totalAmount.toLocaleString('en-IN')}`,
    ]);
  }

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [['#', 'Item Description', 'Classification / Package', 'Quantity', 'Unit Rate', 'Amount']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'left', cellWidth: 42 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
    },
  });

  // 5. Financial Totals & Verification Notice
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = (doc.lastAutoTable?.finalY as number) || tableStartY + 50;

  // Check if we have enough room on current page (need ~45mm)
  let totalsY = finalY + 5;
  if (totalsY + 45 > pageHeight - 15) {
    doc.addPage();
    totalsY = 20;
  }

  const totalsBoxWidth = 84;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;

  // Financial Breakdown Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsBoxX, totalsY, totalsBoxWidth, 34, 2, 2, 'FD');

  const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('Total Items / Pieces:', totalsBoxX + 4, totalsY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${items.length} items (${totalPieces} pcs)`, pageWidth - margin - 4, totalsY + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal Amount:', totalsBoxX + 4, totalsY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${order.totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 4, totalsY + 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Safe Packing & Handling:', totalsBoxX + 4, totalsY + 18);
  doc.setTextColor(16, 185, 129); // emerald
  doc.setFont('helvetica', 'bold');
  doc.text('INCLUDED (FREE)', pageWidth - margin - 4, totalsY + 18, { align: 'right' });

  // Grand Total Banner inside box
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.roundedRect(totalsBoxX + 2, totalsY + 22, totalsBoxWidth - 4, 10, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text('GRAND TOTAL:', totalsBoxX + 5, totalsY + 28.5);

  doc.setFontSize(11);
  doc.text(`Rs. ${order.totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 5, totalsY + 28.5, { align: 'right' });

  // Left Note Box (Verification and Safety guidelines)
  const noticeBoxWidth = contentWidth - totalsBoxWidth - 5;
  doc.setFillColor(255, 251, 235); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(margin, totalsY, noticeBoxWidth, 34, 2, 2, 'FD');

  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ORDER VERIFICATION & SAFETY NOTICE', margin + 3.5, totalsY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  const notices = [
    '1. Direct Verification: Sivakasi dispatch team will call your phone to verify delivery & transport.',
    '2. No Upfront Online Gateway: Payment confirmed directly via verified UPI / NEFT on order call.',
    '3. Certified Manufacturing: 100% genuine Sivakasi standard safety-tested crackers.',
    '4. Storage: Store crackers in a cool, dry place away from heat, flame, or direct sunlight.',
  ];

  let noticeY = totalsY + 11.5;
  notices.forEach((line) => {
    doc.text(line, margin + 3.5, noticeY);
    noticeY += 5;
  });

  // 6. Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Sivakasi Crackers Store • Support Phone / WhatsApp: +91 ${ORDER_SUPPORT_PHONE} • Computer Generated Tax Invoice`,
      margin,
      pageHeight - 7.5
    );

    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
  }

  return doc;
}

export function downloadOrderInvoicePdf(order: OrderInvoiceData, filename?: string): void {
  const doc = generateOrderInvoicePdf(order);
  const safeFilename = filename || `Invoice_${order.publicOrderId}.pdf`;
  doc.save(safeFilename);
}

export function getOrderInvoiceBlob(order: OrderInvoiceData): Blob {
  const doc = generateOrderInvoicePdf(order);
  return doc.output('blob');
}

export interface ShareResult {
  success: boolean;
  method: 'web-share' | 'download' | 'whatsapp-link' | 'error';
  message?: string;
}

export async function shareOrderInvoicePdf(
  order: OrderInvoiceData,
  options?: { origin?: string }
): Promise<ShareResult> {
  const doc = generateOrderInvoicePdf(order);
  const filename = `Invoice_${order.publicOrderId}.pdf`;
  const blob = doc.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });

  // 1. Try Native Web Share API with PDF file
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Official Invoice - Order #${order.publicOrderId}`,
        text: `Here is the official order invoice PDF for Order #${order.publicOrderId} from Sivakasi Crackers. Total: Rs. ${order.totalAmount.toLocaleString('en-IN')}`,
        files: [file],
      });
      return { success: true, method: 'web-share', message: 'Invoice PDF shared successfully!' };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled the share dialog
        return { success: false, method: 'web-share', message: 'Share dismissed' };
      }
      console.warn('Web Share failed, proceeding to fallback:', err);
    }
  }

  // 2. Fallback: Automatically download the PDF to device
  try {
    doc.save(filename);
  } catch (downloadErr) {
    console.error('PDF direct download failed:', downloadErr);
  }

  return {
    success: true,
    method: 'download',
    message: 'Invoice PDF downloaded to your device! You can now send or attach it.',
  };
}

export function generateWhatsAppInvoiceShareUrl(
  phone: string,
  order: OrderInvoiceData,
  origin?: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const currentOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const invoiceDownloadUrl = currentOrigin
    ? `${currentOrigin}/api/orders/${encodeURIComponent(order.publicOrderId)}/invoice`
    : '';

  let itemsSummary = '';
  if (order.items && order.items.length > 0) {
    order.items.slice(0, 10).forEach((item) => {
      itemsSummary += `• ${item.name} × ${item.quantity} — Rs. ${(item.unitPrice * item.quantity).toLocaleString('en-IN')}\n`;
    });
    if (order.items.length > 10) {
      itemsSummary += `• ...and ${order.items.length - 10} more items\n`;
    }
  }

  const message =
    `*🎆 SIVAKASI CRACKERS — OFFICIAL ORDER INVOICE*\n\n` +
    `*Order ID:* ${order.publicOrderId}\n` +
    `*Customer:* ${order.customerName}\n` +
    `*Phone:* ${order.customerPhone}\n` +
    `*Delivery Address:* ${order.customerAddress}\n\n` +
    `*Order Items:*\n${itemsSummary}\n` +
    `*Total Order Amount:* Rs. ${order.totalAmount.toLocaleString('en-IN')}\n` +
    `*Status:* ${order.status || 'Received'}\n\n` +
    (invoiceDownloadUrl ? `📄 *Download Official PDF Invoice:*\n${invoiceDownloadUrl}\n\n` : '') +
    `Please verify and confirm this celebration order. Thank you! 🙏`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
