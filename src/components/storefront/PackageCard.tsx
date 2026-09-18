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
      <div className="bg-slate-900 border border-amber-500/30 hover:border-amber-400 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group">
        {/* Header Ribbon */}
        <div className="relative h-48 bg-gradient-to-tr from-amber-950 via-slate-900 to-orange-950 flex items-center justify-center overflow-hidden p-6">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🎁</span>
          
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-md">
            READY COMBO
          </span>

          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30">
            {defaultItemCount} Crackers Inside
          </span>
        </div>

        {/* Details */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors">
              {pkg.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {pkg.description || 'Assorted festival package customizable with your preferred items.'}
            </p>

            {/* Default Items Preview List */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h4 className="text-[11px] font-bold uppercase text-amber-400/80 tracking-wider mb-2">
                What's Inside (Default):
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {pkg.items?.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-slate-300">
                    <span className="truncate pr-2">• {item.product.name}</span>
                    <span className="font-bold text-amber-400/80 flex-shrink-0">× {item.defaultQty}</span>
                  </li>
                ))}
                {pkg.items && pkg.items.length > 4 && (
                  <li className="text-[11px] text-amber-400 font-semibold pt-1">
                    + {pkg.items.length - 4} more items...
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Base Package Price</span>
                <span className="text-xl font-black text-amber-400">{formatPrice(pkg.basePrice)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleQuickAdd}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 text-center ${
                  addedDirect
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {addedDirect ? 'Added ✓' : 'Add Default'}
              </button>

              <button
                onClick={() => setIsCustomizing(true)}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all text-center"
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
