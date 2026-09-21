'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = false;

  return (
    <div
      data-testid="product-card"
      data-out-of-stock={isOutOfStock ? 'true' : 'false'}
      className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col group"
    >
      {/* Product Image Placeholder Container */}
      <div className="relative h-44 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🧨</span>
        
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
            {product.category.name}
          </span>
        )}

        {isOutOfStock ? (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Out of Stock
          </span>
        ) : (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            In Stock
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
            {product.description || 'Premium festival firecracker manufactured directly in Sivakasi.'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Factory Rate</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="mr-2 text-xs text-slate-500 line-through">{formatPrice(product.originalPrice)}</span>
            )}
            <span data-testid="product-price" className="text-lg font-black text-amber-400">{formatPrice(product.price)}</span>
          </div>

          {!isOutOfStock && (
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  -
                </button>
                <span className="px-2 text-xs font-bold text-white">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(product.stockQty, qty + 1))}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  +
                </button>
              </div>

              <button
                data-testid="add-to-cart"
                onClick={handleAdd}
                className={`px-3 py-2 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 ${
                  added
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950'
                }`}
              >
                {added ? 'Added ✓' : 'Add'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
