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

  const isOutOfStock = Boolean(product.stockQty <= 0);
  const effectiveOriginalPrice =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice
      : Math.round(product.price / 0.3);
  const discountPercent =
    effectiveOriginalPrice > product.price
      ? Math.round(((effectiveOriginalPrice - product.price) / effectiveOriginalPrice) * 100)
      : 70;

  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <>
      <div
        data-testid="product-card"
        data-out-of-stock={isOutOfStock ? 'true' : 'false'}
        className="group relative flex flex-col rounded-xl sm:rounded-2xl bg-white border border-slate-200 hover:border-orange-400 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
      >
        {/* Product Image Container (Vertically Compact) */}
        <div
          className="relative h-24 sm:h-32 md:h-36 bg-gradient-to-b from-amber-50/50 via-orange-50/20 to-white flex items-center justify-center overflow-hidden border-b border-amber-100/60 p-1.5"
        >
          {/* Subtle radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-radial from-amber-300/10 via-orange-200/5 to-transparent blur-md"
          />

          {/* Real Product Image or festive illustration */}
          {product.imageUrl && product.imageUrl !== '/uploads/placeholder.png' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="animate-festive-float flex items-center justify-center">
              <span className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(217,119,6,0.15)]">
                🧨
              </span>
            </div>
          )}

          {/* Dedicated Image Zoom Preview Button */}
          {product.imageUrl && product.imageUrl !== '/uploads/placeholder.png' && (
            <button
              type="button"
              data-testid="zoom-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowZoom(true);
              }}
              aria-label={`Preview ${product.name}`}
              className="absolute bottom-1.5 left-1.5 p-1 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-transform active:scale-90 z-10"
              title="Preview Image"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          )}

          {/* Top Right: In Stock Badge & Wishlist Heart matching Screen 2 */}
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
            {isOutOfStock ? (
              <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Out of Stock
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>In Stock</span>
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              aria-label={`Wishlist ${product.name}`}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-transform active:scale-90 ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-white/90 hover:bg-white text-rose-400 hover:text-rose-600 border border-slate-200'
              }`}
            >
              {isWishlisted ? '♥' : '♡'}
            </button>
          </div>
        </div>

        {/* Card Details matching WhatsApp mockup (Compact) */}
        <div className="p-1.5 sm:p-2.5 flex-1 flex flex-col justify-between">
          <div>
            <h3
              title={product.name}
              className="font-bold text-[11px] sm:text-xs text-slate-900 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2 min-h-[1.75rem]"
            >
              {product.name}
            </h3>
          </div>

          <div className="mt-1 pt-1 flex flex-col gap-1">
            {/* Price Row matching WhatsApp Mockup */}
            <div className="flex items-baseline justify-between gap-1">
              <span
                data-testid="product-price"
                className="text-xs sm:text-sm font-black text-orange-600 font-mono tracking-tight"
              >
                {formatPrice(product.price)}
              </span>
              <span className="text-[7.5px] sm:text-[8px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-100 shrink-0 leading-none">
                {discountPercent >= 70 ? '70% OFF' : `${discountPercent}% OFF`}
              </span>
            </div>

            {/* Stepper + Add Button Controls matching WhatsApp Mockup */}
            {!isOutOfStock ? (
              <div className="flex items-center gap-1">
                {/* Stepper */}
                <div className="inline-flex items-center border border-slate-200 rounded-md bg-slate-50 overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-1.5 py-0.5 text-[10px] sm:text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors font-bold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-1 text-[10px] sm:text-xs font-bold text-slate-900 min-w-[12px] text-center">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(product.stockQty, qty + 1))}
                    className="px-1.5 py-0.5 text-[10px] sm:text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors font-bold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add Button (Vibrant Orange matching WhatsApp mockup) */}
                <button
                  data-testid="add-to-cart"
                  onClick={handleAdd}
                  className={`flex-1 py-1 px-1.5 sm:px-2 rounded-md font-black text-[10px] sm:text-xs shadow-xs transition-all active:scale-95 text-center ${
                    added
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
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
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-rose-500 line-through">
                      {formatPrice(effectiveOriginalPrice)}
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    70% DISCOUNT
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
