'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice, ORDER_SUPPORT_PHONE, normalizeIndianPhone } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { totalItemCount, totalAmount, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-amber-200/80 text-slate-800 shadow-sm transition-colors">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
          {/* Brand Logo matching desktop and mobile references */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 text-lg font-black text-white shadow-md shadow-amber-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <span aria-hidden="true">✦</span>
            </div>
            <div>
              <div className="text-sm sm:text-lg font-black tracking-wider text-slate-900 leading-tight">
                SIVAKASI CRACKERS
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-700">
                Premium Fireworks Store
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-semibold text-sm text-slate-700">
            <Link
              href="/"
              className="hover:text-amber-600 transition-colors relative py-1"
            >
              Home
            </Link>
            <Link
              href="/quick-order"
              className="text-amber-900 hover:text-amber-700 transition-colors flex items-center gap-1.5 relative font-black bg-amber-100 hover:bg-amber-200/80 px-3 py-1.5 rounded-full border border-amber-300 shadow-xs"
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
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 rounded-full shadow-xs">
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

          {/* Right Action Controls: Search, Cart, Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search Icon (Visible on all screens) */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-amber-50/60 transition-colors"
              aria-label="Search Crackers"
            >
              <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Shopping Cart Button (Mobile: Icon with Red Badge matching screenshot; Desktop: Rich Bag button) */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label={`Open basket${totalItemCount > 0 ? `, ${totalItemCount} items` : ''}`}
              className="relative flex items-center justify-center p-2 sm:px-4 sm:py-2 rounded-xl text-slate-800 hover:text-slate-950 hover:bg-amber-50/60 sm:bg-gradient-to-r sm:from-orange-500 sm:to-amber-500 sm:text-white sm:shadow-md sm:shadow-orange-500/20 transition-all active:scale-95"
            >
              <svg className="w-6 h-6 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline font-bold ml-1.5 text-xs sm:text-sm">Bag</span>
              {totalItemCount > 0 && (
                <span
                  data-testid="cart-count"
                  className="absolute -top-1 -right-1 sm:static sm:ml-1.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-red-600 sm:bg-white text-white sm:text-orange-600 text-[10px] sm:text-xs font-black shadow-sm"
                >
                  {totalItemCount}
                </span>
              )}
              {totalAmount > 0 && (
                <span className="font-mono text-xs font-black bg-black/20 px-1.5 py-0.5 rounded-md text-amber-50 hidden md:inline-block ml-1">
                  {formatPrice(totalAmount)}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-800 hover:text-slate-950 hover:bg-amber-50/60 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Search Field */}
        {searchOpen && (
          <div className="md:hidden border-t border-amber-200/80 bg-white p-3 shadow-inner animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="Search crackers by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
              <svg
                className="w-4 h-4 absolute left-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                type="submit"
                className="ml-2 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Hamburger Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
            <div className="w-80 max-w-full pointer-events-auto bg-white flex flex-col shadow-2xl border-l border-slate-200">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✦</span>
                  <div>
                    <h2 className="text-sm font-black tracking-wide">SIVAKASI CRACKERS</h2>
                    <p className="text-[10px] text-amber-100 font-bold">Premium Fireworks</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-white"
                  aria-label="Close Menu"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-800 mb-2">
                    Shopping Navigation
                  </h3>
                  <div className="space-y-1 font-bold text-slate-800">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    >
                      <span>🏠</span> Home
                    </Link>
                    <Link
                      href="/quick-order"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-black"
                    >
                      <span className="flex items-center gap-2">
                        <span>⚡</span> Quick Order List
                      </span>
                      <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full">Wholesale</span>
                    </Link>
                    <Link
                      href="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    >
                      <span>📦</span> Explore Crackers
                    </Link>
                    <Link
                      href="/packages"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>🎁</span> Ready Packages
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                        Hot
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span>🛍️</span> My Cart
                      </span>
                      {totalItemCount > 0 && (
                        <span className="text-xs font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          {totalItemCount}
                        </span>
                      )}
                    </button>
                    <Link
                      href="/track"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    >
                      <span>🚚</span> Track Order
                    </Link>
                  </div>
                </div>

                {/* Support & Assistance */}
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-800 mb-2">
                    Support & Helpline
                  </h3>
                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/${normalizeIndianPhone(ORDER_SUPPORT_PHONE)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold"
                    >
                      <span>💬</span> WhatsApp Support
                    </a>
                    <a
                      href={`tel:+91${ORDER_SUPPORT_PHONE}`}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold"
                    >
                      <span>📞</span> Call: {ORDER_SUPPORT_PHONE}
                    </a>
                  </div>
                </div>

                {/* Safety & Store Policies */}
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-800 mb-2">
                    Policies & Safety
                  </h3>
                  <div className="space-y-1 text-xs text-slate-600">
                    <Link
                      href="/shipping-policy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      🚚 Shipping & Delivery Policy
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      🔒 Privacy Policy
                    </Link>
                    <Link
                      href="/terms"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      📜 Terms & Conditions
                    </Link>
                    <Link
                      href="/refund-policy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      🔄 Refund & Cancellation
                    </Link>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
                Sivakasi Direct Fireworks • PESO & CSIR-NEERI Certified
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
