'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface CustomizerModalProps {
  pkg: Package;
  allProducts?: Product[];
  onClose: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({ pkg, allProducts = [], onClose }) => {
  const { addPackageToCart } = useCart();

  // Initialize customized quantities map from package default items
  const [customItems, setCustomItems] = useState<Map<number, { product: Product; quantity: number }>>(() => {
    const map = new Map<number, { product: Product; quantity: number }>();
    pkg.items?.forEach((item) => {
      map.set(item.productId, {
        product: item.product,
        quantity: item.defaultQty,
      });
    });
    return map;
  });

  const [selectedExtraProduct, setSelectedExtraProduct] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');

  const updateQuantity = (productId: number, qty: number) => {
    setCustomItems((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(productId);
      } else {
        const item = next.get(productId);
        if (item) {
          next.set(productId, { ...item, quantity: Math.min(qty, item.product.stockQty) });
        }
      }
      return next;
    });
  };

  const addExtraProduct = () => {
    if (!selectedExtraProduct) return;
    const prodId = Number(selectedExtraProduct);
    const productToAdd = allProducts.find((p) => p.id === prodId);

    if (productToAdd) {
      setCustomItems((prev) => {
        const next = new Map(prev);
        const existing = next.get(prodId);
        if (existing) {
          next.set(prodId, { ...existing, quantity: existing.quantity + 1 });
        } else {
          next.set(prodId, { product: productToAdd, quantity: 1 });
        }
        return next;
      });
    }
    setSelectedExtraProduct('');
  };

  // Calculate live total price of customized items
  const liveTotal = Array.from(customItems.values()).reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  );

  const handleSaveToBasket = () => {
    const itemsList = Array.from(customItems.values());
    if (itemsList.length === 0) {
      alert('Please include at least one cracker in your package!');
      return;
    }
    addPackageToCart(pkg, itemsList);
    onClose();
  };

  const availableExtras = allProducts.filter(
    (p) => !customItems.has(p.id) && p.isActive && p.stockQty > 0 && p.name.toLowerCase().includes(productSearch.toLowerCase())
  );
  const groupedItems = Array.from(customItems.values()).reduce<Record<string, Array<{ product: Product; quantity: number }>>>(
    (groups, item) => {
      const key = item.product.category?.name || 'Uncategorized';
      (groups[key] ||= []).push(item);
      return groups;
    },
    {}
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white border border-amber-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl drop-shadow-sm">⚙️</span>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Customize Package
                </h2>
                <p className="text-xs text-slate-500">{pkg.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
              Adjust quantities, remove items, or add extra crackers from our store catalog. Your package price updates live!
            </p>

            {/* Items List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Package Contents ({customItems.size} items)
              </h3>

              {customItems.size === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No items in package. Add items using the catalog dropdown below!
                </div>
              ) : (
                Object.entries(groupedItems)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .flatMap(([category, categoryItems]) => [
                    <div
                      key={`category-${category}`}
                      className="pt-2 text-[11px] font-black uppercase tracking-wider text-amber-700"
                    >
                      {category}
                    </div>,
                    ...categoryItems.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-4 hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl">🧨</span>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 truncate">{product.name}</h4>
                            <p className="text-xs text-amber-700 font-semibold">{formatPrice(product.price)} each</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="px-2.5 py-1 text-xs text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900 min-w-[20px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="px-2.5 py-1 text-xs text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-bold text-sm text-amber-700 w-20 text-right">
                            {formatPrice(product.price * quantity)}
                          </span>

                          <button
                            onClick={() => updateQuantity(product.id, 0)}
                            className="text-xs text-rose-500 hover:text-rose-700 p-1 font-bold"
                            title="Remove from package"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )),
                  ])
              )}
            </div>

            {/* Add Extra Items from Catalog */}
            {availableExtras.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
                  Add Extra Crackers from Catalog
                </h3>
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="mb-2 w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
                <div className="flex gap-2">
                  <select
                    value={selectedExtraProduct}
                    onChange={(e) => setSelectedExtraProduct(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select a product to add...</option>
                    {availableExtras.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatPrice(p.price)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={addExtraProduct}
                    disabled={!selectedExtraProduct}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 disabled:opacity-50 transition-colors"
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Live Calculated Price */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Customized Package Price</span>
              <span className="text-2xl font-black text-amber-700">
                {formatPrice(liveTotal)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToBasket}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:brightness-105 text-white font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                Save & Add to Basket 🛒
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
