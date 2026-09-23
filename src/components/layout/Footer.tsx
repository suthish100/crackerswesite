'use client';

import React from 'react';
import Link from 'next/link';
import { ORDER_SUPPORT_PHONE, normalizeIndianPhone } from '@/lib/utils';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F7F4EE] border-t border-amber-200/80 text-slate-600 py-12 text-sm mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✨</span>
              <span className="text-lg font-black tracking-wider text-slate-900">
                SIVAKASI CRACKERS
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Direct factory supply of certified green fireworks manufactured in Sivakasi, Tamil Nadu. Guaranteed factory rates, regional transport dispatch, and direct WhatsApp verification.
            </p>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-3 text-xs uppercase tracking-wider">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-700 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-700 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-amber-700 transition-colors">
                  Ready Combos & Packages
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-amber-700 transition-colors">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-3 text-xs uppercase tracking-wider">
              Legal & Compliance
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-amber-700 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-700 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-amber-700 transition-colors">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-amber-700 transition-colors">
                  Shipping & Transport
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-700 transition-colors">
                  Contact & Grievance Officer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-3 text-xs uppercase tracking-wider">
              Order Verification
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Orders placed on this portal are directly forwarded to our Sivakasi dispatch team via WhatsApp for immediate verification.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/${normalizeIndianPhone(ORDER_SUPPORT_PHONE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-all shadow-sm"
              >
                <span>💬</span> WhatsApp Support
              </a>
              <a
                href={`tel:+91${ORDER_SUPPORT_PHONE}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:text-amber-800 transition-all shadow-sm"
              >
                <span>📞</span> Call {ORDER_SUPPORT_PHONE}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Sivakasi Crackers E-Commerce Platform. All rights reserved.</p>
          <p className="text-amber-700 font-medium text-[11px] text-center sm:text-right">
            Licensed Green Fireworks (CSIR-NEERI & PESO compliant) • Sivakasi, TN
          </p>
        </div>
      </div>
    </footer>
  );
};
