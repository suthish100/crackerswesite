import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';

export const revalidate = 0;

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
    categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  } catch (error) {
    console.error('Unable to load product categories:', error);
  }

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { id: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'name_asc') orderBy = { name: 'asc' };

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({ where, orderBy, include: { category: true } });
  } catch (error) {
    console.error('Unable to load products:', error);
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[7rem_minmax(0,1fr)] gap-4 px-3 py-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6 sm:px-6 lg:px-8">
      <aside className="sticky top-24 h-fit self-start">
        <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-amber-400">Categories</h2>
        <nav className="space-y-1">
          <Link
            href="/products"
            className={`block border-l-2 px-3 py-3 text-xs font-bold transition-colors ${
              !categorySlug
                ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                : 'border-slate-800 text-slate-400 hover:border-amber-500/50 hover:text-white'
            }`}
          >
            All Categories
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`block border-l-2 px-3 py-3 text-xs font-bold transition-colors ${
                categorySlug === cat.slug
                  ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 text-slate-400 hover:border-amber-500/50 hover:text-white'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{categorySlug ? categories.find((cat) => cat.slug === categorySlug)?.name || 'Crackers' : 'All Crackers'}</h1>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">Choose a category and add products to your basket.</p>
          </div>
          <form className="flex w-full items-center gap-2 sm:w-auto">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <div className="relative min-w-0 flex-1 sm:w-52">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Search crackers..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            name="sort"
            defaultValue={sort || ''}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
          </form>
        </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
          <span className="text-5xl block mb-3">🔍</span>
          <h3 className="text-lg font-bold text-white">No products found</h3>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search query or selecting a different category.</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Reset Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      </section>
    </div>
  );
}
