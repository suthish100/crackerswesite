import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PackageCard } from '@/components/storefront/PackageCard';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Sparkles } from '@/components/ui/Sparkles';
import { BackgroundGradient } from '@/components/ui/BackgroundGradient';
import { TextBlurFade } from '@/components/ui/TextBlurFade';
import { FireworksBlast } from '@/components/ui/FireworksBlast';

export const revalidate = 0;

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let featuredPackages: Awaited<ReturnType<typeof prisma.package.findMany>> = [];
  let featuredProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let allProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  const fetchStorefrontData = () =>
    Promise.all([
      prisma.category.findMany({ where: { isActive: true }, take: 8 }),
      prisma.package.findMany({
        where: { isActive: true },
        take: 4,
        include: { items: { include: { product: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true, category: { isActive: true } },
        take: 6,
        orderBy: { id: 'desc' },
        include: { category: true },
      }),
      prisma.product.findMany({ where: { isActive: true, category: { isActive: true } } }),
    ]);

  try {
    [categories, featuredPackages, featuredProducts, allProducts] = await fetchStorefrontData();
  } catch {
    try {
      await new Promise((r) => setTimeout(r, 500));
      [categories, featuredPackages, featuredProducts, allProducts] = await fetchStorefrontData();
    } catch (error) {
      console.warn('Storefront catalog is temporarily unavailable:', error instanceof Error ? error.message : error);
    }
  }

  return (
    <div className="pb-20">
      {/* Interactive Blasting Sky Crackers on entering the homepage */}
      <FireworksBlast durationSeconds={4} />

      {/* Festive Hero Section */}
      <BackgroundGradient className="border-b border-amber-200/70 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <Sparkles particleCount={26} />

        <div className="relative z-10 mx-auto max-w-5xl text-center sm:text-left">
          {/* Eyebrow */}
          <TextBlurFade delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-xs font-black uppercase tracking-[0.22em] text-amber-800 shadow-sm">
              <span>✦</span> SIVAKASI • PREMIUM FIREWORKS <span>✦</span>
            </div>
          </TextBlurFade>

          {/* Heading */}
          <TextBlurFade delay={0.25} className="mt-5">
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              LIGHT UP <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 drop-shadow-sm">
                YOUR CELEBRATION
              </span>
            </h1>
          </TextBlurFade>

          {/* Subtitle */}
          <TextBlurFade delay={0.4} className="mt-5">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              Premium certified green crackers direct from Sivakasi factories. Choose a ready-made family combo or handpick individual crackers for your Diwali festivities.
            </p>
          </TextBlurFade>

          {/* CTAs */}
          <TextBlurFade delay={0.55} className="mt-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl">
              <Link
                href="/quick-order"
                className="group relative flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 px-4 py-3.5 text-center text-sm font-black text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:brightness-105 active:scale-95 transition-all"
              >
                <span>⚡</span> Quick Order List <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/packages"
                className="group relative flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3.5 text-center text-sm font-black text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all"
              >
                Shop Combos <span aria-hidden="true" className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-center text-sm font-bold text-slate-800 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50 shadow-sm active:scale-95 transition-all"
              >
                Explore Crackers <span aria-hidden="true" className="ml-1.5">→</span>
              </Link>
              <Link
                href="/track"
                className="flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-4 py-3.5 text-center text-sm font-bold text-slate-700 hover:border-amber-400 hover:text-amber-800 shadow-sm active:scale-95 transition-all"
              >
                Track Order <span aria-hidden="true" className="ml-1.5">→</span>
              </Link>
            </div>
          </TextBlurFade>
        </div>
      </BackgroundGradient>

      {/* Category Section */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Start with a category
              </span>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                What are you shopping for?
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden text-xs font-bold text-amber-700 hover:text-amber-900 sm:block transition-colors"
            >
              Explore all crackers →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                data-testid="category-link"
                href={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10"
              >
                <span
                  className="text-xl text-amber-600 transition-transform duration-300 group-hover:scale-110 inline-block drop-shadow-sm"
                  aria-hidden="true"
                >
                  ✦
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                  {cat.description || 'Sivakasi factory certified selection'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Combos Section */}
      {featuredPackages.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Popular Combos
              </span>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Ready for the Celebration
              </h2>
            </div>
            <Link
              href="/packages"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
            >
              View all combos →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} allProducts={allProducts} />
            ))}
          </div>
        </section>
      )}

      {/* Catalog Highlights Section */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Explore Crackers
              </span>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Shop Individual Crackers
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
            >
              View all crackers →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
