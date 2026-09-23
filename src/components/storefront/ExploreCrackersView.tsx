'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/storefront/ProductCard';

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
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Quick Order Banner */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-sm">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="text-xl sm:text-2xl animate-bounce">⚡</span>
          <div>
            <div className="font-black text-xs sm:text-sm uppercase tracking-wide">Prefer Wholesale Price List?</div>
            <div className="text-[11px] sm:text-xs text-amber-100 font-medium">Type box quantities directly, view live line subtotals, and check out instantly.</div>
          </div>
        </div>
        <Link
          href="/quick-order"
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs text-center shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          Open Quick Order List →
        </Link>
      </div>

      {/* Main Responsive Layout: Side by side on Desktop (lg:), Full width on Mobile */}
      <div className="lg:grid lg:grid-cols-[15.5rem_1fr] lg:gap-8 items-start">
        {/* Desktop Category Sidebar (Hidden on Mobile/Tablet) */}
        <aside className="hidden lg:block sticky top-24 self-start bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-800">
              Categories
            </h2>
            <span className="text-[11px] font-bold text-slate-400">
              {categories.length} Types
            </span>
          </div>

          <nav className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
            <button
              type="button"
              data-testid="category-link"
              onClick={() => handleSelectCategory('')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/20'
                  : 'text-slate-700 hover:bg-amber-50/80 hover:text-amber-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>✦</span>
                <span>All Crackers</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${!selectedCategory ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/20'
                      : 'text-slate-700 hover:bg-amber-50/80 hover:text-amber-800'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
          {/* Header & Search/Sort Toolbar */}
          <div className="flex flex-col gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeCategoryObject ? activeCategoryObject.name : 'Explore Crackers'}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Direct Sivakasi factory rates with certified quality ({filteredProducts.length} items)
                </p>
              </div>

              {/* Mobile All Categories Button Trigger */}
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300 text-xs font-black shadow-xs hover:bg-amber-200 transition-colors shrink-0"
              >
                <span>📂</span>
                <span>Categories</span>
                <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">
                  {categories.length}
                </span>
              </button>
            </div>

            {/* Controls Row: Search + Sort */}
            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateFilters(selectedCategory, e.target.value, sortOption)}
                  placeholder="Search crackers by name or type..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 pointer-events-none">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => updateFilters(selectedCategory, '', sortOption)}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <select
                value={sortOption}
                onChange={(e) => updateFilters(selectedCategory, searchQuery, e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-amber-500 shadow-xs shrink-0"
              >
                <option value="">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Mobile Horizontal Swipeable Category Chips */}
          <div className="lg:hidden mt-3 mb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5">
              <button
                type="button"
                data-testid="category-link"
                onClick={() => handleSelectCategory('')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300'
                }`}
              >
                <span>✦</span>
                <span>All ({initialProducts.length})</span>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                const count = categoryCounts.get(cat.slug) || 0;
                const icon = getCategoryIcon(cat.slug, cat.name);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    data-testid="category-link"
                    onClick={() => handleSelectCategory(cat.slug)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{cat.name}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'text-slate-400'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
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
    </div>
  );
};
