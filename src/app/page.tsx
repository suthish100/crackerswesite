import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/storefront/ProductCard';
import { FireworksBlast } from '@/components/ui/FireworksBlast';
import { HeroCarousel } from '@/components/storefront/HeroCarousel';
import { getSiteSettings } from '@/lib/siteSettings';

export const revalidate = 0;

export default async function HomePage() {
  let allProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  const fetchStorefrontData = () =>
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { id: 'desc' },
      include: { category: true },
    });

  try {
    allProducts = await fetchStorefrontData();
  } catch {
    try {
      await new Promise((r) => setTimeout(r, 600));
      allProducts = await fetchStorefrontData();
    } catch (error) {
      console.warn('Storefront catalog is temporarily unavailable:', error instanceof Error ? error.message : error);
    }
  }

  const siteSettings = getSiteSettings();

  // Determine Best Sellers configured by Admin, fallback to top 4 active products
  const configuredIds = siteSettings.bestSellers?.productIds || [];
  let bestSellers = allProducts.filter((p) => configuredIds.includes(p.id));
  if (bestSellers.length === 0) {
    bestSellers = allProducts.slice(0, 4);
  } else {
    bestSellers = bestSellers.slice(0, 4);
  }

  const promoBanner = siteSettings.promoBanner;

  return (
    <div className="bg-[#FAF7F2] text-slate-900 pb-16 selection:bg-amber-500 selection:text-white">
      {/* Festive Sky Blast on first entrance */}
      <FireworksBlast durationSeconds={3} />

      {/* 1. Hero Container with Rolling Promotional Carousel & Diwali Countdown */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5">
        <HeroCarousel
          slides={siteSettings.hero.slides}
          autoplaySpeed={siteSettings.hero.autoplaySpeed}
        />
      </div>

      {/* 2. Four Buttons (Two in a Row on Mobile, 4 on Desktop) */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Button 1: Quick Order List */}
          <Link
            href="/quick-order"
            className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-3 sm:p-5 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-base sm:text-xl mb-2 sm:mb-3 border border-white/30">
                ⚡
              </div>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded-full inline-block mb-1">
                TOP PRIMARY ACTION
              </span>
              <h2 className="text-xs sm:text-base lg:text-lg font-black tracking-tight text-white leading-snug">
                Quick Order List
              </h2>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-amber-100 font-medium leading-tight sm:leading-relaxed line-clamp-1 sm:line-clamp-2">
                Wholesale order sheet. Type box quantities instantly.
              </p>
            </div>
            <div className="relative z-10 mt-2.5 sm:mt-4 flex items-center justify-between text-[9px] sm:text-xs font-black uppercase tracking-wider text-amber-100 group-hover:text-white">
              <span>Quick Order</span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* Button 2: Shop Combos */}
          <Link
            href="/packages"
            className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-3 sm:p-5 text-white shadow-md shadow-slate-950/20 hover:shadow-lg hover:shadow-slate-950/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden border border-slate-700/50"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-base sm:text-xl mb-2 sm:mb-3 border border-white/20">
                🎁
              </div>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full inline-block mb-1 border border-amber-400/30">
                READY PACKAGES
              </span>
              <h2 className="text-xs sm:text-base lg:text-lg font-black tracking-tight text-white leading-snug">
                Shop Combos
              </h2>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-300 font-medium leading-tight sm:leading-relaxed line-clamp-1 sm:line-clamp-2">
                Curated festive boxes for family Diwali celebrations.
              </p>
            </div>
            <div className="relative z-10 mt-2.5 sm:mt-4 flex items-center justify-between text-[9px] sm:text-xs font-black uppercase tracking-wider text-amber-300 group-hover:text-amber-200">
              <span>Explore Combos</span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* Button 3: Explore Crackers */}
          <Link
            data-testid="category-link"
            href="/products"
            className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 text-slate-900 shadow-xs hover:shadow-md hover:border-orange-400 border border-slate-200/90 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-orange-100 flex items-center justify-center text-base sm:text-xl mb-2 sm:mb-3 border border-orange-200 text-orange-900">
                📦
              </div>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full inline-block mb-1">
                BROWSE CATALOGUE
              </span>
              <h2 className="text-xs sm:text-base lg:text-lg font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                Explore Crackers
              </h2>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed line-clamp-1 sm:line-clamp-2">
                Browse certified crackers, sparklers & aerial shots.
              </p>
            </div>
            <div className="relative z-10 mt-2.5 sm:mt-4 flex items-center justify-between text-[9px] sm:text-xs font-black uppercase tracking-wider text-orange-700 group-hover:text-orange-900">
              <span>View Catalogue</span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-orange-900 text-xs transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* Button 4: Track Order */}
          <Link
            href="/track"
            className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 text-slate-900 shadow-xs hover:shadow-md hover:border-amber-400 border border-slate-200/90 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-100 flex items-center justify-center text-base sm:text-xl mb-2 sm:mb-3 border border-amber-200 text-amber-900">
                🚚
              </div>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full inline-block mb-1">
                LIVE STATUS
              </span>
              <h2 className="text-xs sm:text-base lg:text-lg font-black tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                Track Order
              </h2>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed line-clamp-1 sm:line-clamp-2">
                Check dispatch status & transport LR details.
              </p>
            </div>
            <div className="relative z-10 mt-2.5 sm:mt-4 flex items-center justify-between text-[9px] sm:text-xs font-black uppercase tracking-wider text-amber-800 group-hover:text-amber-950">
              <span>Track Consignment</span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-900 text-xs transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </div>

        {/* 3 Promotional Trust Badges within One Line */}
        <div className="mt-3 sm:mt-4 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-amber-200/80 shadow-xs">
          <div className="grid grid-cols-3 divide-x divide-amber-200/70 items-center">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-2 text-center sm:text-left">
              <span className="text-base sm:text-lg shrink-0">🛡️</span>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-xs font-black text-slate-900 leading-tight truncate">
                  Original Sivakasi Products
                </div>
                <div className="text-[8px] sm:text-[10px] text-slate-500 hidden sm:block truncate">
                  100% Factory Direct
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-2 text-center sm:text-left">
              <span className="text-base sm:text-lg shrink-0">🚚</span>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-xs font-black text-slate-900 leading-tight truncate">
                  Safe Delivery
                </div>
                <div className="text-[8px] sm:text-[10px] text-slate-500 hidden sm:block truncate">
                  Licensed Road Carriers
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-2 text-center sm:text-left">
              <span className="text-base sm:text-lg shrink-0">🎧</span>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-xs font-black text-slate-900 leading-tight truncate">
                  Support & Assistance
                </div>
                <div className="text-[8px] sm:text-[10px] text-slate-500 hidden sm:block truncate">
                  Call & WhatsApp Helpline
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Best Sellers Section (Compact 2x2 grid matching top 4 buttons height) */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl">🔥</span>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase">
                  {siteSettings.bestSellers?.title || 'Best Sellers'}
                </h2>
                <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium">
                  {siteSettings.bestSellers?.subtitle || 'Hand-picked festive favorites from Sivakasi factory'}
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="text-[10px] sm:text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 shrink-0"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          {/* Compact 1-Row Shelf on Mobile matching top 4 buttons height, 4-Cols on Desktop */}
          <div className="flex sm:grid sm:grid-cols-4 gap-2 sm:gap-3.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x scrollbar-none">
            {bestSellers.map((product) => (
              <div key={product.id} className="min-w-[152px] max-w-[165px] sm:min-w-0 sm:max-w-none flex-1 snap-start shrink-0 sm:shrink">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Animated Video / Promotional Banner Placeholder Section */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-4 sm:p-8 shadow-md border border-slate-700/60 overflow-hidden">
          {/* Subtle festive particle / glow backdrop */}
          <div className="pointer-events-none absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl" />
          <div className="pointer-events-none absolute -left-10 -top-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />

          {promoBanner?.videoUrl ? (
            /* Render configured animated video */
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black/60 border border-slate-700">
              <video
                src={promoBanner.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            /* Sleek Animated Banner / Video Slot Placeholder */
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 mb-2">
                  <span>🎬</span>
                  <span>{promoBanner?.badge || 'Animated Video / Banner Slot'}</span>
                </span>
                <h3 className="text-base sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {promoBanner?.title || 'Celebrate with Sivakasi Fireworks'}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
                  {promoBanner?.subtitle || 'Direct Sivakasi factory godown dispatch with certified green formulations. Experience brilliant colours and safe festivities.'}
                </p>
              </div>

              {/* Placeholder Video Preview Box */}
              <div className="w-full md:w-72 shrink-0 bg-white/5 border border-dashed border-amber-400/40 rounded-xl sm:rounded-2xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-xs">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-500/30 mb-2">
                  ▶
                </div>
                <div className="text-xs font-black text-amber-200">
                  Video & Banner Slot
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Ready for animated festive MP4 or banner upload
                </div>
                <Link
                  href="/products"
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20"
                >
                  Explore Crackers →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Clean Bottom Helpline & Details */}
      <footer className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="text-xs sm:text-sm font-black text-slate-900">
              Sivakasi Crackers Direct Wholesale
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Licensed road carrier deliveries across Tamil Nadu • 100% Green Certified Fireworks
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/quick-order"
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-xs transition-all"
            >
              Order Sheet
            </Link>
            <Link
              href="/track"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
            >
              Track Order
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
