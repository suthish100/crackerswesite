import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PackageCard } from '@/components/storefront/PackageCard';
import { ProductCard } from '@/components/storefront/ProductCard';

export const revalidate = 0;

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let featuredPackages: Awaited<ReturnType<typeof prisma.package.findMany>> = [];
  let featuredProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let allProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    [categories, featuredPackages, featuredProducts, allProducts] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, take: 8 }),
      prisma.package.findMany({ where: { isActive: true }, take: 4, include: { items: { include: { product: true } } } }),
      prisma.product.findMany({ where: { isActive: true, category: { isActive: true } }, take: 6, orderBy: { id: 'desc' }, include: { category: true } }),
      prisma.product.findMany({ where: { isActive: true, category: { isActive: true } } }),
    ]);
  } catch (error) {
    console.warn('Storefront catalog is temporarily unavailable:', error instanceof Error ? error.message : error);
  }

  return (
    <div className="pb-16">
      <section className="border-b border-amber-500/20 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_42%),linear-gradient(135deg,#111827,#020617)] px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">Direct from Sivakasi</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-white sm:text-6xl">
            Your celebration starts here.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Shop individual crackers or choose a ready-made family package. Place your order in minutes and our team will call to confirm it.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/packages" className="rounded-xl bg-amber-500 px-5 py-4 text-center text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400">
              Shop packages <span aria-hidden="true">→</span>
            </Link>
            <Link href="/products" className="rounded-xl border border-slate-600 bg-slate-900/70 px-5 py-4 text-center text-sm font-bold text-white transition hover:border-amber-400 hover:text-amber-300">
              Browse all crackers <span aria-hidden="true">→</span>
            </Link>
            <Link href="/track" className="rounded-xl border border-slate-700 px-5 py-4 text-center text-sm font-bold text-slate-300 transition hover:border-amber-400 hover:text-amber-300">
              Track an order <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Start with a category</p>
              <h2 className="mt-1 text-2xl font-black text-white">What are you shopping for?</h2>
            </div>
            <Link href="/products" className="hidden text-xs font-bold text-amber-400 sm:block">View catalog →</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} data-testid="category-link" href={`/products?category=${cat.slug}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-amber-500/50">
                <span className="text-xl text-amber-400" aria-hidden="true">✦</span>
                <h3 className="mt-3 text-sm font-bold text-white">{cat.name}</h3>
                <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{cat.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredPackages.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Popular combos</span>
              <h2 className="mt-1 text-2xl font-black text-white">Ready for the basket</h2>
            </div>
            <Link href="/packages" className="text-xs font-bold text-amber-400">View all →</Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} allProducts={allProducts} />
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Catalog highlights</span>
              <h2 className="mt-1 text-2xl font-black text-white">Shop individual crackers</h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-amber-400">View all →</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
