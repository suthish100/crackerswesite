'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const { totalItemCount, totalAmount, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/92 backdrop-blur-xl border-b border-amber-200/80 text-slate-800 shadow-sm transition-colors">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 text-lg font-black text-white shadow-md shadow-amber-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <span aria-hidden="true">✦</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-900 sm:text-lg">
              SIVAKASI CRACKERS
            </h1>
            <p className="hidden text-[10px] font-bold uppercase tracking-widest text-amber-700 sm:block">
              Premium Fireworks Store
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-700">
          <Link
            href="/"
            className="hover:text-amber-600 transition-colors relative py-1"
          >
            Home
          </Link>
          <Link
            href="/quick-order"
            className="text-amber-800 hover:text-amber-600 transition-colors flex items-center gap-1.5 relative py-1 font-black bg-amber-100/80 hover:bg-amber-200/80 px-2.5 py-1 rounded-full border border-amber-300 shadow-xs"
          >
            <span>⚡</span> Quick Order
          </Link>
          <Link
            href="/products"
            className="hover:text-amber-600 transition-colors relative py-1"
          >
            Explore Crackers
          </Link>
          <Link
            href="/packages"
            className="hover:text-amber-600 transition-colors flex items-center gap-1.5 relative py-1"
          >
            <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 rounded-full shadow-sm">
              HOT
            </span>
            Ready Packages
          </Link>
          <Link
            href="/track"
            className="hover:text-amber-600 transition-colors relative py-1"
          >
            Track Order
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/quick-order"
            className="md:hidden rounded-lg px-2.5 py-1.5 text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200 flex items-center gap-1"
          >
            <span>⚡</span> Quick Order
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            aria-label={`Open basket${totalItemCount > 0 ? `, ${totalItemCount} items` : ''}`}
            className="relative flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 px-3.5 py-2 text-sm font-black text-white shadow-md shadow-amber-500/20 transition-all hover:brightness-105 active:scale-95 sm:px-5"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden sm:inline font-bold">Bag</span>
            {totalItemCount > 0 && (
              <span
                data-testid="cart-count"
                className="ml-0.5 bg-white text-amber-700 text-xs font-black px-2 py-0.5 rounded-full border border-amber-300 shadow-sm"
              >
                {totalItemCount}
              </span>
            )}
            {totalAmount > 0 && (
              <span className="font-mono text-xs font-black bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-300/30 text-amber-50 hidden xs:inline-block">
                {formatPrice(totalAmount)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
