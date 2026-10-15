import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PackageCard } from '@/components/storefront/PackageCard';
import { ProductCard } from '@/components/storefront/ProductCard';
import { FireworksBlast } from '@/components/ui/FireworksBlast';
import { HeroCarousel } from '@/components/storefront/HeroCarousel';
import { TraditionalShowcase } from '@/components/storefront/TraditionalShowcase';
import { TamilNaduDeliveryMap } from '@/components/storefront/TamilNaduDeliveryMap';
import { getSiteSettings } from '@/lib/siteSettings';

export const revalidate = 0;

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let featuredPackages: Awaited<ReturnType<typeof prisma.package.findMany>> = [];
  let featuredProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let allProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  const fetchStorefrontData = () =>
    Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        take: 8,
      }),
      prisma.package.findMany({
        where: { isActive: true },
        take: 4,
        include: { items: { include: { product: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true, category: { isActive: true } },
        take: 8,
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

  const siteSettings = getSiteSettings();

  return (
    <div className="bg-[#FAF7F2] text-slate-900 pb-16 selection:bg-amber-500 selection:text-white">
      {/* Festive Sky Blast on first entrance */}
      <FireworksBlast durationSeconds={3} />

      {/* Hero Container with Rolling Promotional Carousel & Diwali Countdown */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <HeroCarousel
          slides={siteSettings.hero.slides}
          autoplaySpeed={siteSettings.hero.autoplaySpeed}
        />
      </div>

      {/* Primary Shopping Destination Cards (Matching Reference Layout input_file_2 & input_file_4) */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Card 1: Quick Order List (Top Primary Action matching handwritten "Quick order" annotation) */}
          <Link
            href="/quick-order"
            className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-4 sm:p-6 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 border border-white/30">
                ⚡
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1.5">
                Top Primary Action
              </span>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white leading-tight">
                Quick Order List
              </h2>
              <p className="mt-1 text-[11px] sm:text-xs text-amber-100 font-medium leading-relaxed line-clamp-2">
                Direct wholesale order sheet. Type box quantities and calculate instantly.
              </p>
            </div>
            <div className="relative z-10 mt-4 sm:mt-6 flex items-center justify-between text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-100 group-hover:text-white">
              <span>Quick Order</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* Card 2: Shop Combos (Navy Card matching screenshot) */}
          <Link
            href="/packages"
            className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-6 text-white shadow-lg shadow-slate-950/20 hover:shadow-xl hover:shadow-slate-950/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-slate-700/50"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 border border-white/20">
                🎁
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full inline-block mb-1.5 border border-amber-400/30">
                Ready Packages
              </span>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white leading-tight">
                Shop Combos
              </h2>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed line-clamp-2">
                Ready-made festive packages curated for family Diwali celebrations.
              </p>
            </div>
            <div className="relative z-10 mt-4 sm:mt-6 flex items-center justify-between text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 group-hover:text-amber-200">
              <span>Explore Combos</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-white transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* Card 3: Explore Crackers */}
          <Link
            href="/products"
            className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 text-slate-900 shadow-sm hover:shadow-lg hover:border-orange-400 border border-slate-200/90 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 border border-orange-200 text-orange-900">
                📦
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block mb-1.5">
                Browse Catalogue
              </span>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                Explore Crackers
              </h2>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                Browse all individual certified crackers, sparklers, and aerial shots.
              </p>
            </div>
            <div className="relative z-10 mt-4 sm:mt-6 flex items-center justify-between text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-700 group-hover:text-orange-900">
              <span>View Catalogue</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-orange-900 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* Card 4: Track Order */}
          <Link
            href="/track"
            className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 text-slate-900 shadow-sm hover:shadow-lg hover:border-amber-400 border border-slate-200/90 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 border border-amber-200 text-amber-900">
                🚚
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block mb-1.5">
                Live Status
              </span>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors leading-tight">
                Track Order
              </h2>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                Check dispatch status and transport LR details using your Order ID.
              </p>
            </div>
            <div className="relative z-10 mt-4 sm:mt-6 flex items-center justify-between text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-800 group-hover:text-amber-950">
              <span>Track Consignment</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-900 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </div>

        {/* 4 Trust Badges Pill Row (Matching input_file_2 & input_file_4) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-amber-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <span className="text-xl text-amber-600">🛡️</span>
            <div>
              <div className="text-xs font-black text-slate-900">Original Sivakasi Products</div>
              <div className="text-[10px] text-slate-500">100% Factory Direct</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <span className="text-xl text-amber-600">🏅</span>
            <div>
              <div className="text-xs font-black text-slate-900">Quality Verified</div>
              <div className="text-[10px] text-slate-500">CSIR-NEERI Green Certified</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <span className="text-xl text-amber-600">🚚</span>
            <div>
              <div className="text-xs font-black text-slate-900">Safe Delivery</div>
              <div className="text-[10px] text-slate-500">Licensed Road Carriers</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <span className="text-xl text-amber-600">🎧</span>
            <div>
              <div className="text-xs font-black text-slate-900">Support & Assistance</div>
              <div className="text-[10px] text-slate-500">Call & WhatsApp Helpline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Contains [data-testid="category-link"] for smoke tests) */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="flex items-end justify-between gap-4 border-b border-amber-200/80 pb-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-800">
                Browse By Category
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Festival Fireworks Collection
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
            >
              <span>View All ({categories.length})</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                data-testid="category-link"
                href={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-2xl text-amber-600 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Factory Rate
                  </span>
                </div>
                <h3 className="mt-3 text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors truncate">
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

      {/* Popular Combos / Packages Section */}
      {featuredPackages.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-14 sm:pt-16">
          <div className="flex items-end justify-between gap-4 border-b border-amber-200/80 pb-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-800">
                Best Selling Combos
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Diwali Family Packages
              </h2>
            </div>
            <Link
              href="/packages"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
            >
              <span>View All Combos</span>
              <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} allProducts={allProducts} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products / Explore Crackers Highlight (Contains [data-testid="product-card"] for smoke tests) */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-14 sm:pt-16">
          <div className="flex items-end justify-between gap-4 border-b border-amber-200/80 pb-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-800">
                Explore Crackers
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Featured Individual Crackers
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
            >
              <span>View All Crackers</span>
              <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom Showcase 1: Traditional Showcase (Celebrate with Sivakasi Temple Skyline from input_file_4) */}
      <div className="mt-16">
        <TraditionalShowcase />
      </div>

      {/* Bottom Showcase 2: Tamil Nadu Statewide Celebration Map (From Sivakasi to Every Corner of TN from input_file_3) */}
      <TamilNaduDeliveryMap />
    </div>
  );
}
