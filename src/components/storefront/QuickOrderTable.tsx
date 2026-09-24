'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product, Category } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface QuickOrderTableProps {
  categories: Category[];
  products: Product[];
}

export const QuickOrderTable: React.FC<QuickOrderTableProps> = ({
  categories,
  products,
}) => {
  const { items, setProductQuantity, totalAmount, totalItemCount, setIsOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);

  // Map cart quantities for instant O(1) lookup
  const cartQtyMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of items) {
      if (!item.sourcePackageId) {
        map.set(item.productId, (map.get(item.productId) || 0) + item.quantity);
      }
    }
    return map;
  }, [items]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategorySlug === 'all' || p.category?.slug === selectedCategorySlug;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategorySlug]);

  // Group filtered products by category
  const groupedProducts = useMemo(() => {
    const groups: { category: Category | { id: number; name: string; slug: string }; products: Product[] }[] = [];
    const categoryMap = new Map<number, Product[]>();

    for (const p of filteredProducts) {
      const catId = p.categoryId;
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, []);
      }
      categoryMap.get(catId)!.push(p);
    }

    for (const cat of categories) {
      const prods = categoryMap.get(cat.id);
      if (prods && prods.length > 0) {
        groups.push({ category: cat, products: prods });
        categoryMap.delete(cat.id);
      }
    }

    // Any remaining categories not in the main list
    for (const [catId, prods] of categoryMap.entries()) {
      if (prods.length > 0) {
        groups.push({
          category: prods[0].category || { id: catId, name: 'Other Crackers', slug: 'other' },
          products: prods,
        });
      }
    }

    return groups;
  }, [filteredProducts, categories]);

  const handleQtyChange = (product: Product, valueStr: string) => {
    const parsed = parseInt(valueStr, 10);
    const validQty = isNaN(parsed) || parsed < 0 ? 0 : Math.min(parsed, product.stockQty || 9999);
    setProductQuantity(product, validQty);
  };

  const handleStep = (product: Product, delta: number) => {
    const currentQty = cartQtyMap.get(product.id) || 0;
    const nextQty = Math.max(0, Math.min(currentQty + delta, product.stockQty || 9999));
    setProductQuantity(product, nextQty);
  };

  const MIN_ORDER_TN = 3000;
  const tnRemaining = Math.max(0, MIN_ORDER_TN - totalAmount);

  return (
    <div className="space-y-6 pb-36 sm:pb-28">
      {/* Minimum Order Banner (Matching reference video) */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 p-4 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 font-black text-sm uppercase tracking-wider">
              <span>📢</span> Minimum Order Notice
            </div>
            <p className="text-xs sm:text-sm font-bold text-amber-50 mt-0.5">
              Tamil Nadu & Pondicherry: <span className="underline font-black">₹3,000</span> | Other States: <span className="underline font-black">₹5,000</span>
            </p>
          </div>
          <div className="text-xs font-black bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 text-white">
            {tnRemaining === 0 ? (
              <span className="text-emerald-100">✓ Minimum order requirement reached!</span>
            ) : (
              <span>Add {formatPrice(tnRemaining)} more for dispatch</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search crackers (e.g. Sparklers, Chakkars, Pots, Lakshmi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none"
          />
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Jump Select */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategorySlug('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategorySlug === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategorySlug(c.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategorySlug === c.slug
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Hint */}
      <div className="sm:hidden flex items-center justify-between text-[11px] font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
        <span className="flex items-center gap-1.5">
          <span>⚡</span>
          <span>Wholesale Price Sheet • Live Amount Calc</span>
        </span>
        <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-md">80% OFF</span>
      </div>

      {/* Quick Order Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Header Columns */}
            <thead className="bg-amber-400 text-slate-950 uppercase text-[9px] sm:text-[11px] font-black tracking-wider border-b border-amber-500 sticky top-0 z-20">
              <tr>
                <th className="py-2 sm:py-3 px-1 sm:px-4 text-center w-10 sm:w-20">Image</th>
                <th className="py-2 sm:py-3 px-1.5 sm:px-4 min-w-[90px] sm:min-w-[180px]">Products</th>
                <th className="py-2 sm:py-3 px-1 sm:px-4 text-right sm:text-center w-14 sm:w-32">Price</th>
                <th className="py-2 sm:py-3 px-1 sm:px-4 text-center w-20 sm:w-36">Qty</th>
                <th className="py-2 sm:py-3 px-1.5 sm:px-4 text-right w-16 sm:w-32">Amount</th>
              </tr>
            </thead>

            <tbody>
              {groupedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    No crackers match your search query. Try another term!
                  </td>
                </tr>
              ) : (
                groupedProducts.map(({ category, products: catProducts }) => (
                  <React.Fragment key={category.id}>
                    {/* Category Banner Row (Matching the reference video's purple/amber banner) */}
                    <tr className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-900 text-white font-black text-xs sm:text-sm uppercase tracking-wide">
                      <td colSpan={5} className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center justify-between">
                          <span>
                            ✦ {category.name} <span className="text-[10px] sm:text-[11px] font-bold text-purple-200 ml-1">(80% DISCOUNT)</span>
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-semibold text-purple-200 normal-case">
                            {catProducts.length} items
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Products in this Category */}
                    {catProducts.map((p, idx) => {
                      const qty = cartQtyMap.get(p.id) || 0;
                      const lineAmount = p.price * qty;
                      const effectiveOriginalPrice =
                        p.originalPrice && p.originalPrice > p.price
                          ? p.originalPrice
                          : Math.round(p.price * 5); // 80% discount baseline

                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-slate-100 transition-colors ${
                            qty > 0 ? 'bg-amber-50/50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                          } hover:bg-amber-50/80`}
                        >
                          {/* Image Column */}
                          <td className="py-1.5 sm:py-2 px-1 sm:px-4 text-center">
                            <div
                              onClick={() => {
                                if (p.imageUrl && p.imageUrl !== '/uploads/placeholder.png') {
                                  setPreviewImage({ src: p.imageUrl, name: p.name });
                                }
                              }}
                              className="w-8 h-8 sm:w-14 sm:h-14 mx-auto rounded-lg sm:rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden cursor-pointer hover:border-amber-400 transition-colors shadow-2xs"
                            >
                              {p.imageUrl && p.imageUrl !== '/uploads/placeholder.png' ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-base sm:text-2xl">🧨</span>
                              )}
                            </div>
                          </td>

                          {/* Product Details Column */}
                          <td className="py-1.5 sm:py-2 px-1.5 sm:px-4">
                            <div className="font-bold text-slate-900 text-[11px] sm:text-sm leading-snug line-clamp-2">
                              {p.name}
                            </div>
                            <div className="text-[9px] sm:text-[11px] font-semibold text-rose-600 mt-0.5 line-clamp-1">
                              {p.description || '1 pkt (5 pcs)'}
                            </div>
                            {p.sku && (
                              <div className="text-[8px] sm:text-[10px] font-mono text-slate-400 hidden sm:block">
                                SKU: {p.sku}
                              </div>
                            )}
                          </td>

                          {/* Price Column */}
                          <td className="py-1.5 sm:py-2 px-1 sm:px-4 text-right sm:text-center whitespace-nowrap">
                            <div className="text-[9px] sm:text-xs text-rose-500 font-semibold line-through">
                              {formatPrice(effectiveOriginalPrice)}
                            </div>
                            <div className="text-[11px] sm:text-base font-black text-emerald-700 font-mono">
                              {formatPrice(p.price)}
                            </div>
                          </td>

                          {/* Qty Input Column */}
                          <td className="py-1.5 sm:py-2 px-1 sm:px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleStep(p, -1)}
                                className="w-5 sm:w-7 py-0.5 sm:py-1 text-xs font-black text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                aria-label={`Decrease ${p.name}`}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                max={p.stockQty || 9999}
                                value={qty === 0 ? '' : qty}
                                placeholder="0"
                                onChange={(e) => handleQtyChange(p, e.target.value)}
                                className="w-7 sm:w-12 py-0.5 text-center font-black text-[11px] sm:text-sm text-slate-900 focus:outline-none focus:bg-amber-50"
                              />
                              <button
                                type="button"
                                onClick={() => handleStep(p, 1)}
                                className="w-5 sm:w-7 py-0.5 sm:py-1 text-xs font-black text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                aria-label={`Increase ${p.name}`}
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Amount Column */}
                          <td className="py-1.5 sm:py-2 px-1.5 sm:px-4 text-right whitespace-nowrap">
                            <span
                              className={`text-[11px] sm:text-sm font-black ${
                                lineAmount > 0 ? 'text-slate-900 font-mono' : 'text-slate-300'
                              }`}
                            >
                              {formatPrice(lineAmount)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Order Summary Bar (Matching reference video's yellow footer bar) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-amber-400 border-t border-amber-500 shadow-2xl py-2.5 sm:py-3 px-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Total display */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-6">
            <div className="text-left">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-900">
                Live Order Summary
              </div>
              <div className="text-base sm:text-2xl font-black text-slate-950 font-mono">
                Grand Total : {formatPrice(totalAmount)}
              </div>
            </div>
            {totalItemCount > 0 && (
              <div className="text-xs font-bold text-amber-950 bg-amber-500/40 px-2 py-1 rounded-lg">
                <span>📦 {totalItemCount} Items</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl border border-amber-600 bg-white/95 hover:bg-white text-slate-900 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              View Bag ({totalItemCount})
            </button>
            <Link
              href="/checkout"
              className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-950/20 text-center transition-all hover:scale-105 active:scale-95"
            >
              Submit Order Now ➔
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox / Preview Modal for Product Image */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-sm w-full border border-amber-200 shadow-2xl space-y-3 cursor-default"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm truncate">{previewImage.name}</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="h-64 rounded-2xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.src}
                alt={previewImage.name}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-center text-xs font-semibold text-slate-500">
              Sivakasi Factory Certified Cracker
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
