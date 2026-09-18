'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const groupedItems = items.reduce<Record<string, typeof items>>((groups, item) => {
    const key = item.product.category?.name || 'Uncategorized';
    (groups[key] ||= []).push(item);
    return groups;
  }, {});
  if (items.length === 0 || !isOpen) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 bg-slate-950/70 p-4 backdrop-blur-sm sm:p-6">
      <button
        type="button"
        aria-label="Close basket"
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="pointer-events-auto relative ml-auto flex h-full max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
          {/* Drawer Header */}
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛍️</span>
              <div>
                <h2 className="text-lg font-bold text-amber-400">Your Basket</h2>
                <p className="text-xs text-slate-400">{items.length} unique items</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Drawer Items */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🧨</span>
                <p className="text-slate-400 font-semibold mb-2">Your basket is empty!</p>
                <p className="text-xs text-slate-500 mb-6">Explore our individual crackers or customized ready-made packages.</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).flatMap(([category, categoryItems]) => [
                <div key={`category-${category}`} className="pt-2 text-xs font-black uppercase tracking-wider text-amber-400">{category}</div>,
                ...categoryItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex gap-4 items-center hover:border-slate-700 transition-colors"
                >
                  <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                    🧨
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-100 truncate">{item.product.name}</h4>
                    {item.sourcePackageName && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
                        Package: {item.sourcePackageName}
                      </span>
                    )}
                    <p className="text-xs font-semibold text-amber-400">{formatPrice(item.unitPrice)} each</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center hover:bg-slate-700 text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center hover:bg-slate-700 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-amber-300">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-xs text-rose-400 hover:text-rose-300 mt-2 block ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                ))
              ])
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && isOpen && (
            <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-slate-300 text-sm">
                <span>Total Amount</span>
                <span className="text-xl font-black text-amber-400">{formatPrice(totalAmount)}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  className="px-4 py-3 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>

                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-center text-sm shadow-lg shadow-amber-500/20 transition-all"
                >
                  Proceed to Checkout →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};
