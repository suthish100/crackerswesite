'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const groupedItems = items.reduce<Record<string, typeof items>>((groups, item) => {
    const key = item.product.category?.name || 'Uncategorized';
    (groups[key] ||= []).push(item);
    return groups;
  }, {});

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full sm:w-[440px] max-w-full pointer-events-auto flex flex-col bg-white border-l border-slate-200 text-slate-900 shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl drop-shadow-sm">🛍️</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Your Basket
                  </h2>
                  <p className="text-xs text-slate-500">{items.length} unique items</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Items */}
            <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto p-4 sm:p-6">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-5xl block mb-4 animate-festive-float">🧨</span>
                  <p className="text-slate-800 font-semibold mb-2">Your basket is empty!</p>
                  <p className="text-xs text-slate-500 mb-6">
                    Explore our individual crackers or customized ready-made packages.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:brightness-105 transition-all shadow-md shadow-amber-500/20"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                Object.entries(groupedItems)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .flatMap(([category, categoryItems]) => [
                    <div
                      key={`category-${category}`}
                      className="pt-2 text-xs font-black uppercase tracking-wider text-amber-800"
                    >
                      {category}
                    </div>,
                    ...categoryItems.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200 flex gap-3 sm:gap-4 items-center hover:border-amber-300 transition-colors"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-100/60 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 border border-amber-200">
                          🧨
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.product.name}</h4>
                          {item.sourcePackageName && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 mb-1">
                              Package: {item.sourcePackageName}
                            </span>
                          )}
                          <p className="text-[11px] sm:text-xs font-semibold text-amber-700">
                            {formatPrice(item.unitPrice)} each
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 text-xs transition-colors"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-900 px-1.5 sm:px-2">{item.quantity}</span>
                            <button
                              data-testid="qty-increase"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 text-xs transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-xs sm:text-sm text-amber-700 font-mono">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-[11px] sm:text-xs text-rose-500 hover:text-rose-700 mt-1 sm:mt-2 block ml-auto font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )),
                  ])
              )}
            </div>

            {/* Drawer Footer */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3.5 sm:space-y-4">
                <div className="flex justify-between items-center text-slate-700 text-sm">
                  <span className="font-bold text-slate-800">Total Amount</span>
                  <span
                    data-testid="cart-total"
                    className="text-xl sm:text-2xl font-black text-amber-700 font-mono"
                  >
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <div className="flex gap-2.5 sm:gap-3">
                  <button
                    onClick={clearCart}
                    className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-white active:scale-95 transition-all"
                  >
                    Clear
                  </button>

                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:brightness-105 text-white font-black text-center text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    Proceed to Checkout →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
