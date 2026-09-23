'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-800 bg-amber-100 border border-amber-300 px-3.5 py-1 rounded-full inline-block mb-3 shadow-sm">
          Your Basket
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Review Your Order</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <span className="text-5xl block mb-3 animate-festive-float">🛍️</span>
          <p className="text-slate-800 font-semibold">Your basket is currently empty.</p>
          <p className="text-xs text-slate-500 mt-1 mb-6">Explore our crackers to add individual items or ready-made packages.</p>
          <Link
            href="/products"
            className="inline-block rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 px-6 py-3 text-sm font-black text-white shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
          >
            Explore Crackers
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100/70 flex items-center justify-center text-2xl flex-shrink-0 border border-amber-200">
                🧨
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base truncate">{item.product.name}</h2>
                <p className="mt-0.5 text-xs text-amber-700 font-semibold">{formatPrice(item.unitPrice)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                  className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 text-xs transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                <button
                  type="button"
                  data-testid="qty-increase"
                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 text-xs transition-colors"
                >
                  +
                </button>
              </div>
              <span className="w-24 text-right text-sm font-black text-amber-700">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeFromCart(item.cartItemId)}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <span className="text-base font-bold text-slate-700">Grand Total</span>
            <span
              data-testid="cart-total"
              className="text-3xl font-black text-amber-700"
            >
              {formatPrice(totalAmount)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="block rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 px-5 py-4 text-center text-sm font-black text-white shadow-lg shadow-amber-500/25 hover:brightness-105 active:scale-[0.99] transition-all"
          >
            Proceed to Checkout →
          </Link>
        </div>
      )}
    </div>
  );
}