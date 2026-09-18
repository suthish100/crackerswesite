export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  const seq = String(random).padStart(4, '0');
  return `CR${year}-${seq}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export const ORDER_SUPPORT_PHONE = '8925700923';

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

export function generateWhatsAppLink(
  adminPhone: string,
  orderId: string,
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  items: Array<{ name: string; quantity: number; unitPrice: number }>,
  totalAmount: number,
): string {
  let itemsText = '';
  items.forEach((item) => {
    itemsText += `• ${item.name} × ${item.quantity} — ₹${(item.unitPrice * item.quantity).toFixed(0)}\n`;
  });

  const message =
    `*🎆 NEW ORDER — ${orderId}*\n\n` +
    `*Customer:*\n` +
    `Name: ${customerName}\n` +
    `Phone: ${customerPhone}\n` +
    `Address: ${customerAddress}\n\n` +
    `*Items:*\n${itemsText}\n` +
    `*Total: ₹${totalAmount.toFixed(0)}*\n\n` +
    `Please confirm this order. Thank you! 🙏`;

  return `https://wa.me/${normalizeIndianPhone(adminPhone)}?text=${encodeURIComponent(message)}`;
}

export const ORDER_STATUSES = [
  'Received',
  'Verifying',
  'Confirmed',
  'Payment Done',
  'Packed',
  'Dispatched',
  'Cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_COLORS: Record<string, string> = {
  'Received': '#f59e0b',
  'Verifying': '#3b82f6',
  'Confirmed': '#8b5cf6',
  'Payment Done': '#10b981',
  'Packed': '#06b6d4',
  'Dispatched': '#22c55e',
  'Cancelled': '#ef4444',
};
