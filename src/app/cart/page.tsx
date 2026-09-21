'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Your basket</p>
        <h1 className="mt-1 text-3xl font-black text-white">Review your order</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-slate-400">Your basket is empty.</p>
          <Link href="/products" className="mt-5 inline-block rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex-1">
                <h2 className="font-bold text-white">{item.product.name}</h2>
                <p className="mt-1 text-xs text-slate-400">{formatPrice(item.unitPrice)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="h-8 w-8 rounded-lg bg-slate-800 text-white">-</button>
                <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                <button type="button" data-testid="qty-increase" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="h-8 w-8 rounded-lg bg-slate-800 text-white">+</button>
              </div>
              <span className="w-20 text-right text-sm font-bold text-amber-300">{formatPrice(item.unitPrice * item.quantity)}</span>
              <button type="button" onClick={() => removeFromCart(item.cartItemId)} className="text-xs text-rose-300">Remove</button>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <span className="text-sm font-bold text-slate-300">Grand Total</span>
            <span data-testid="cart-total" className="text-2xl font-black text-amber-400">{formatPrice(totalAmount)}</span>
          </div>
          <Link href="/checkout" className="block rounded-xl bg-amber-500 px-5 py-4 text-center text-sm font-black text-slate-950">
            Proceed to checkout
          </Link>
        </div>
      )}
    </div>
  );
}