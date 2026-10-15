'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/storefront/ProductCard';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface ExploreCrackersViewProps {
  categories: Category[];
  initialProducts: Product[];
  initialCategory?: string;
  initialSearch?: string;
  initialSort?: string;
}

function getCategoryIcon(slug: string, name: string): string {
  const s = (slug + ' ' + name).toLowerCase();
  if (s.includes('sparkler') || s.includes('kambi')) return '✨';
  if (s.includes('flower') || s.includes('pot') || s.includes('kottai')) return '🌸';
  if (s.includes('chakkar') || s.includes('ground')) return '🌀';
  if (s.includes('rocket')) return '🚀';
  if (s.includes('bomb') || s.includes('sound')) return '💣';
  if (s.includes('aerial') || s.includes('sky') || s.includes('shot')) return '🎆';
  if (s.includes('fountain')) return '⛲';
  if (s.includes('gift') || s.includes('box')) return '🎁';
  if (s.includes('bijili')) return '⚡';
  if (s.includes('child') || s.includes('kid')) return '🧸';
  return '🧨';
}

export const ExploreCrackersView: React.FC<ExploreCrackersViewProps> = ({
  categories,
  initialProducts,
  initialCategory = '',
  initialSearch = '',
  initialSort = '',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? initialCategory ?? '';
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const { totalItemCount, totalAmount, setIsOpen } = useCart();

  // Product counts per category
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of initialProducts) {
      if (p.category?.slug) {
        map.set(p.category.slug, (map.get(p.category.slug) || 0) + 1);
      }
    }
    return map;
  }, [initialProducts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        if (!product.isActive) return false;
        if (selectedCategory && product.category?.slug !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(query);
          const matchesDesc = product.description?.toLowerCase().includes(query) || false;
          const matchesSku = product.sku?.toLowerCase().includes(query) || false;
          const matchesCat = product.category?.name.toLowerCase().includes(query) || false;
          if (!matchesName && !matchesDesc && !matchesSku && !matchesCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price_asc') return a.price - b.price;
        if (sortOption === 'price_desc') return b.price - a.price;
        if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
        return b.id - a.id; // default featured/newest
      });
  }, [initialProducts, selectedCategory, searchQuery, sortOption]);

  const updateFilters = (newCat: string, newSearch: string, newSort: string) => {
    setSearchQuery(newSearch);
    setSortOption(newSort);

    const params = new URLSearchParams();
    if (newCat) params.set('category', newCat);
    if (newSearch) params.set('search', newSearch);
    if (newSort) params.set('sort', newSort);

    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : '/products', { scroll: false });
  };

  const handleSelectCategory = (slug: string) => {
    updateFilters(slug, searchQuery, sortOption);
    setIsCategoryModalOpen(false);
  };

  const activeCategoryObject = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategory);
  }, [categories, selectedCategory]);

  const filteredCategoriesForModal = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const q = categorySearchQuery.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, categorySearchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-28">
      {/* Top Banner: Orange festive banner matching Screen 2 in uploaded design */}
      <div className="mb-4 sm:mb-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white p-4 sm:p-6 shadow-md relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white drop-shadow-xs">
            EXPLORE CRACKERS
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-amber-100 max-w-md">
            Browse all products by category and add to cart easily.
          </p>
        </div>
        <div className="text-4xl sm:text-6xl select-none relative z-10 shrink-0 ml-2" aria-hidden="true">
          🎆
        </div>
        {/* Subtle decorative glow & burst */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl" />
        <div className="pointer-events-none absolute left-1/3 -top-10 w-32 h-32 bg-amber-300/15 rounded-full blur-lg" />
      </div>

      {/* Full-width Search Bar matching Screen 2 */}
      <div className="mb-4 sm:mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => updateFilters(selectedCategory, e.target.value, sortOption)}
          placeholder="Search crackers by name or type..."
          className="w-full bg-white border border-slate-300 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs font-medium"
        />
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            type="button"
            onClick={() => updateFilters(selectedCategory, '', sortOption)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Responsive Split Layout: Category Sidebar on Left, Products on Right matching Image 3 */}
      <div className="grid grid-cols-[5.5rem_1fr] sm:grid-cols-[8.5rem_1fr] lg:grid-cols-[15.5rem_1fr] gap-2.5 sm:gap-4 lg:gap-8 items-start">
        {/* Category Sidebar matching Image 3 (Category sidebar + product list) */}
        <aside className="sticky top-20 sm:top-24 self-start bg-white p-1.5 sm:p-3 lg:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-slate-500">
              CATEGORIES
            </h2>
            <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 hidden sm:inline">
              {categories.length} Types
            </span>
          </div>

          <nav className="space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar pr-0.5">
            <button
              type="button"
              data-testid="category-link"
              onClick={() => handleSelectCategory('')}
              className={`w-full flex flex-col sm:flex-row items-center sm:justify-between p-1.5 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center sm:text-left ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs shadow-orange-500/20'
                  : 'text-slate-700 hover:bg-amber-50/80 hover:text-amber-800'
              }`}
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm">⭐</span>
                <span className="truncate">All</span>
              </span>
              <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full mt-0.5 sm:mt-0 ${!selectedCategory ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {initialProducts.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = categoryCounts.get(cat.slug) || 0;
              const isSelected = selectedCategory === cat.slug;
              const icon = getCategoryIcon(cat.slug, cat.name);

              return (
                <button
                  key={cat.id}
                  type="button"
                  data-testid="category-link"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`w-full flex flex-col sm:flex-row items-center sm:justify-between p-1.5 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center sm:text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs shadow-orange-500/20'
                      : 'text-slate-700 hover:bg-amber-50/80 hover:text-amber-800'
                  }`}
                >
                  <span className="flex items-center gap-1 sm:gap-2 truncate max-w-full">
                    <span className="text-xs sm:text-sm shrink-0">{icon}</span>
                    <span className="truncate text-[10px] sm:text-xs">{cat.name}</span>
                  </span>
                  {count > 0 && (
                    <span className={`text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full shrink-0 mt-0.5 sm:mt-0 ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Products Column */}
        <section className="min-w-0">
          {/* Header Row: All Crackers (X items) on Left, Sort: Featured on Right matching Screen 2 */}
          <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-200 mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <h2 className="text-xs sm:text-base font-black text-slate-900 tracking-tight truncate">
                {activeCategoryObject ? activeCategoryObject.name : 'All Crackers'}
              </h2>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium shrink-0">
                ({filteredProducts.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Sort Selector */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => updateFilters(selectedCategory, searchQuery, e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] sm:text-xs text-slate-800 font-bold focus:outline-none focus:border-orange-500 shadow-2xs shrink-0"
                >
                  <option value="">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory || searchQuery) && (
            <div className="flex items-center flex-wrap gap-2 my-2.5">
              <span className="text-[11px] font-bold text-slate-400">Active filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <span>{activeCategoryObject?.name || selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('')}
                    className="hover:text-rose-600 font-black ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                  <span>&quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => updateFilters(selectedCategory, '', sortOption)}
                    className="hover:text-rose-600 font-black ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => updateFilters('', '', '')}
                className="text-[11px] font-bold text-rose-600 hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid: 2 columns on Mobile, 3 on Tablet, 4 on Desktop */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs my-4">
              <span className="text-4xl block mb-2 animate-festive-float">🔍</span>
              <h3 className="text-base font-bold text-slate-900">No crackers found</h3>
              <p className="text-slate-500 text-xs mt-1">Try adjusting your search query or selecting another category.</p>
              <button
                type="button"
                onClick={() => updateFilters('', '', '')}
                className="inline-block mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 my-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Category Bottom Sheet / Modal */}
      {isCategoryModalOpen && (
        <div
          onClick={() => setIsCategoryModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📂</span>
                <h3 className="font-black text-slate-900 text-base">Select Cracker Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Category Search inside sheet */}
            <div className="my-3">
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Find a category..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Categories Grid inside sheet */}
            <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="category-link"
                onClick={() => handleSelectCategory('')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  !selectedCategory
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-black'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold'
                }`}
              >
                <span className="text-lg">✦</span>
                <div className="min-w-0">
                  <div className="text-xs truncate">All Crackers</div>
                  <div className="text-[10px] text-slate-400">{initialProducts.length} items</div>
                </div>
              </button>

              {filteredCategoriesForModal.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                const count = categoryCounts.get(cat.slug) || 0;
                const icon = getCategoryIcon(cat.slug, cat.name);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    data-testid="category-link"
                    onClick={() => handleSelectCategory(cat.slug)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-black'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold'
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{cat.name}</div>
                      <div className="text-[10px] text-slate-400">{count} items</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Bottom Cart Bar matching Screen 2 in uploaded design */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-4 py-2.5 sm:py-3 shadow-2xl border-t border-orange-400/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-white">
              <div className="relative flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-xs">
                  {totalItemCount}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black tracking-wide text-white font-mono">
                {totalItemCount} items | {formatPrice(totalAmount)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-5 py-2 rounded-full bg-white text-orange-600 hover:bg-amber-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>View Cart</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
