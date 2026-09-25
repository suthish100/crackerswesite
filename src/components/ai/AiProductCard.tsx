'use client';

import React, { useState } from 'react';
import { ProductRecommendation } from '@/lib/ai/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

interface AiProductCardProps {
  product: ProductRecommendation;
}

export const AiProductCard: React.FC<AiProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    // Convert ProductRecommendation to Cart-compatible Product
    const fullProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice || null,
      stockQty: product.stockQty,
      imageUrl: product.imageUrl || '/uploads/placeholder.png',
      categoryId: 1,
      sku: null,
      description: null,
      isActive: true,
      category: product.categoryName ? { id: 1, name: product.categoryName, slug: '', description: null, isActive: true } : undefined,
    };

    addToCart(fullProduct, product.quantity || 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const isOutOfStock = product.stockQty <= 0;

  return (
    <div
      data-testid="ai-product-card"
      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-amber-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center justify-center overflow-hidden shrink-0">
        {product.imageUrl && product.imageUrl !== '/uploads/placeholder.png' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">🧨</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.categoryName && (
            <span className="text-[9px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-full">
              {product.categoryName}
            </span>
          )}
            <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
              70% DISCOUNT
            </span>
        </div>

        <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5" title={product.name}>
          {product.name}
        </h4>

        <div className="flex items-baseline gap-1.5 mt-1">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] text-rose-500 font-semibold line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-xs font-black text-emerald-700">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0">
        {!isOutOfStock ? (
          <button
            type="button"
            data-testid="ai-add-to-cart"
            onClick={handleAdd}
            className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition-all shadow-xs active:scale-95 ${
              added
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-105 shadow-amber-500/20'
            }`}
          >
            {added ? 'Added ✓' : '+ Add'}
          </button>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
            Sold Out
          </span>
        )}
      </div>
    </div>
  );
};
