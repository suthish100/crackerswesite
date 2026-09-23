'use client';

import React, { useState } from 'react';
import { Package, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { CustomizerModal } from './CustomizerModal';

interface PackageCardProps {
  pkg: Package;
  allProducts?: Product[];
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, allProducts = [] }) => {
  const { addPackageToCart } = useCart();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [addedDirect, setAddedDirect] = useState(false);

  const defaultItemCount = pkg.items?.reduce((sum, item) => sum + item.defaultQty, 0) || 0;

  const handleQuickAdd = () => {
    addPackageToCart(pkg);
    setAddedDirect(true);
    setTimeout(() => setAddedDirect(false), 1500);
  };

  return (
    <>
      <div
        data-testid="package-card"
        className="group relative flex flex-col rounded-3xl bg-white border border-slate-200/90 hover:border-amber-400 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] overflow-hidden"
      >
        {/* Festive Header Ribbon Container */}
        <div className="relative h-48 bg-gradient-to-tr from-amber-100/90 via-orange-50/70 to-amber-50/50 flex items-center justify-center overflow-hidden p-6 border-b border-amber-100">
          {/* Soft Warm Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-radial from-amber-300/25 via-orange-200/15 to-transparent blur-xl"
          />

          <div className="animate-festive-float flex items-center justify-center">
            <span className="text-6xl transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(217,119,6,0.18)]">
              🎁
            </span>
          </div>

          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30">
            READY COMBO
          </span>

          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/95 text-amber-800 border border-amber-200 backdrop-blur-md shadow-sm">
            {defaultItemCount} Crackers Inside
          </span>
        </div>

        {/* Details */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
              {pkg.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {pkg.description || 'Assorted festival package customizable with your preferred items.'}
            </p>

            {/* Default Items Preview List */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-2">
                What&apos;s Inside (Default):
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {pkg.items?.slice(0, 4).map((item) => (
                  <li
                    key={item.id}
                    data-testid="package-item"
                    className="flex justify-between items-center text-slate-700"
                  >
                    <span className="truncate pr-2 font-medium">• {item.product.name}</span>
                    <span className="font-bold text-amber-700 flex-shrink-0">
                      × {item.defaultQty}
                    </span>
                  </li>
                ))}
                {pkg.items && pkg.items.length > 4 && (
                  <li className="text-[11px] text-amber-700 font-semibold pt-1">
                    + {pkg.items.length - 4} more items...
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                  Base Package Price
                </span>
                <span
                  data-testid="package-price"
                  className="text-2xl font-black text-amber-700"
                >
                  {formatPrice(pkg.basePrice)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Secondary Button */}
              <button
                onClick={handleQuickAdd}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 text-center ${
                  addedDirect
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                {addedDirect ? 'Added ✓' : 'Add Default'}
              </button>

              {/* Primary Button */}
              <button
                onClick={() => setIsCustomizing(true)}
                className="py-2.5 px-3 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:brightness-105 text-white shadow-md shadow-amber-500/25 transition-all active:scale-95 text-center"
              >
                Customize ⚙️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customizer Modal */}
      {isCustomizing && (
        <CustomizerModal
          pkg={pkg}
          allProducts={allProducts}
          onClose={() => setIsCustomizing(false)}
        />
      )}
    </>
  );
};
