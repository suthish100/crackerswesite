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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <QuickOrderTable categories={categories} products={products} />
    </div>
  );
}
