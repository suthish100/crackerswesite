import { prisma } from '@/lib/prisma';
import { PackageCard } from '@/components/storefront/PackageCard';

export const revalidate = 0;

export default async function PackagesPage() {
  const [packages, allProducts] = await Promise.all([
    prisma.package.findMany({
      where: { isActive: true },
      orderBy: { id: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Curated Combos</span>
        <h1 className="text-3xl font-black text-white mt-1">Ready-Made Festival Packages</h1>
        <p className="text-slate-400 text-sm mt-1">
          Pick a pre-packed assortment for family celebrations, or click <span className="text-amber-400 font-bold">Customize</span> to modify items and quantities to your liking!
        </p>
      </div>

      {/* Grid */}
      {packages.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
          <span className="text-5xl block mb-3">🎁</span>
          <h3 className="text-lg font-bold text-white">No active packages currently available</h3>
          <p className="text-slate-400 text-xs mt-1">Please check back soon or build your own custom basket from our catalog!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} allProducts={allProducts} />
          ))}
        </div>
      )}
    </div>
  );
}
