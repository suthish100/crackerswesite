import { prisma } from '@/lib/prisma';
import { ExploreCrackersView } from '@/components/storefront/ExploreCrackersView';

export const revalidate = 0;

export const metadata = {
  title: 'Explore Crackers & Fireworks | Sivakasi Crackers',
  description: 'Browse certified green crackers, sparklers, flower pots, ground chakkars, rockets, and fancy aerial shots at direct factory prices from Sivakasi.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category: categorySlug, search, sort } = await searchParams;

  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  } catch (error) {
    console.error('Unable to load product categories:', error);
  }

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { id: 'desc' },
      include: { category: true },
    });
  } catch (error) {
    console.error('Unable to load products:', error);
  }

  const serializedProducts = products.map((p) => ({
    ...p,
    createdAt: p.createdAt ? p.createdAt.toISOString() : undefined,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
  }));

  return (
    <ExploreCrackersView
      categories={categories}
      initialProducts={serializedProducts}
      initialCategory={categorySlug || ''}
      initialSearch={search || ''}
      initialSort={sort || ''}
    />
  );
}
