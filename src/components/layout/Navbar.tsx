'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export const Navbar: React.FC = () => {
  const { totalItemCount, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-amber-500/20 text-white shadow-lg">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-lg font-black text-slate-950 shadow-md shadow-amber-500/20 transition-transform group-hover:scale-105">
            <span aria-hidden="true">✦</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide text-amber-400 sm:text-lg">SIVAKASI CRACKERS</h1>
            <p className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:block">Premium Fireworks Store</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <Link href="/products" className="hover:text-amber-400 transition-colors">
            Products
          </Link>
          <Link href="/packages" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">HOT</span>
            Ready Packages
          </Link>
          <Link href="/track" className="hover:text-amber-400 transition-colors">
            Track Order
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/track"
            className="md:hidden rounded-lg px-2 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10"
          >
            Track Order
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            aria-label={`Open basket${totalItemCount > 0 ? `, ${totalItemCount} items` : ''}`}
            className="relative flex min-h-11 items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95 sm:px-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden sm:inline">Basket</span>
            {totalItemCount > 0 && (
              <span data-testid="cart-count" className="ml-1 bg-slate-950 text-amber-400 text-xs font-black px-2 py-0.5 rounded-full border border-amber-400">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
