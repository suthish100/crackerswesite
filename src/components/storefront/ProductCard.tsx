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
  const [showZoom, setShowZoom] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = false;
  const effectiveOriginalPrice =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice
      : Math.round(product.price * 5); // 80% discount Sivakasi factory standard
  const discountPercent = Math.round(
    ((effectiveOriginalPrice - product.price) / effectiveOriginalPrice) * 100
  );

  return (
    <>
      <div
        data-testid="product-card"
        data-out-of-stock={isOutOfStock ? 'true' : 'false'}
        className="group relative flex flex-col rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 hover:border-amber-400 shadow-xs hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      >
        {/* Product Image Container */}
        <div
          onClick={() => {
            if (product.imageUrl && product.imageUrl !== '/uploads/placeholder.png') {
              setShowZoom(true);
            }
          }}
          className="relative h-32 sm:h-40 md:h-44 bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-white flex items-center justify-center overflow-hidden border-b border-amber-100/70 cursor-pointer"
        >
          {/* Subtle radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-radial from-amber-300/20 via-orange-200/10 to-transparent blur-lg"
          />

          {/* Real Product Image or festive illustration */}
          {product.imageUrl && product.imageUrl !== '/uploads/placeholder.png' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="animate-festive-float flex items-center justify-center">
              <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_10px_rgba(217,119,6,0.15)]">
                🧨
              </span>
            </div>
          )}

          {/* Category Tag */}
          {product.category && (
            <span className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/95 text-amber-800 border border-amber-200 backdrop-blur-md shadow-xs max-w-[90px] sm:max-w-[120px] truncate">
              {product.category.name}
            </span>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute bottom-2 right-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-rose-600 text-white shadow-xs tracking-wide">
              {discountPercent}% OFF
            </span>
          )}

          {/* Stock Badge */}
          {isOutOfStock ? (
            <span className="absolute top-2 right-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Out of Stock
            </span>
          ) : (
            <span className="absolute top-2 right-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              In Stock
            </span>
          )}
        </div>

        {/* Card Details */}
        <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <h3
              title={product.name}
              className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 leading-snug"
            >
              {product.name}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
              {product.description || 'Sivakasi factory certified selection'}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            {/* Price Row */}
            <div className="flex items-baseline justify-between gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] sm:text-xs text-rose-500 font-semibold line-through">
                  {formatPrice(effectiveOriginalPrice)}
                </span>
                <span
                  data-testid="product-price"
                  className="text-xs sm:text-sm md:text-base font-black text-emerald-700"
                >
                  {formatPrice(product.price)}
                </span>
              </div>
              <span className="text-[9px] uppercase font-bold text-slate-400">
                Rate
              </span>
            </div>

            {/* Stepper + Add Button Controls */}
            {!isOutOfStock ? (
              <div className="flex items-center gap-1.5">
                {/* Stepper */}
                <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors font-bold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-1 sm:px-1.5 text-[11px] sm:text-xs font-bold text-slate-900 min-w-[14px] text-center">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(product.stockQty, qty + 1))}
                    className="px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors font-bold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add Button */}
                <button
                  data-testid="add-to-cart"
                  onClick={handleAdd}
                  className={`flex-1 py-1 px-2 rounded-lg font-black text-[11px] sm:text-xs shadow-xs transition-all active:scale-95 text-center ${
                    added
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-amber-500/20 hover:brightness-105'
                  }`}
                >
                  {added ? '✓' : '+ Add'}
                </button>
              </div>
            ) : (
              <button
                data-testid="add-to-cart"
                disabled
                className="w-full py-1 rounded-lg text-[10px] font-bold text-slate-400 bg-slate-100 cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            )}

            {/* Subtotal Preview */}
            {qty > 1 && (
              <div className="text-right">
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {qty} for {formatPrice(product.price * qty)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {showZoom && product.imageUrl && (
        <div
          onClick={() => setShowZoom(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white rounded-3xl p-4 shadow-2xl border border-amber-300"
          >
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>
            <div className="rounded-2xl overflow-hidden aspect-square bg-slate-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3">
              <h3 className="font-black text-slate-900 text-base">{product.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{product.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-rose-500 line-through">
                    {formatPrice(effectiveOriginalPrice)}
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleAdd();
                    setShowZoom(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
