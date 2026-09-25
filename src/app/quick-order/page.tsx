import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { QuickOrderTable } from '@/components/storefront/QuickOrderTable';

export const metadata: Metadata = {
  title: 'Quick Order / Price List | Sivakasi Crackers',
  description:
    'Instant wholesale price list and quick order sheet for Sivakasi Diwali crackers. Direct factory rates, fast quantity selection, and instant line subtotal calculation.',
};

export const revalidate = 0;

export default async function QuickOrderPage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.product.findMany({
        where: { isActive: true, category: { isActive: true } },
        include: { category: true },
        orderBy: { id: 'asc' },
      }),
    ]);
  } catch (error) {
    console.error('Failed to load products for quick order:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header Eyebrow & Title */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-widest shadow-xs">
          <span>⚡</span> WHOLESALE PRICE LIST & QUICK ORDER
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
          Sivakasi Direct Quick Order Sheet
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-2">
          Type or select your required box quantities below. Subtotals and grand total calculate instantly for rapid festival checkout!
        </p>
      </div>

      <QuickOrderTable categories={categories} products={products} />
    </div>
  );
}
