'use client';

import React from 'react';
import Link from 'next/link';
import { ORDER_SUPPORT_PHONE, normalizeIndianPhone } from '@/lib/utils';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✨</span>
              <span className="text-lg font-extrabold text-amber-400 tracking-wider">SIVAKASI CRACKERS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Direct factory supply of certified green fireworks manufactured in Sivakasi, Tamil Nadu. Guaranteed factory prices, regional transport dispatch, and instant WhatsApp verification.
            </p>
          </div>

          <div>
            <h3 className="text-amber-300 font-bold mb-3 text-xs uppercase tracking-wider">Quick Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-amber-400">Home</Link></li>
              <li><Link href="/products" className="hover:text-amber-400">All Products</Link></li>
              <li><Link href="/packages" className="hover:text-amber-400">Ready Combos & Packages</Link></li>
              <li><Link href="/track" className="hover:text-amber-400">Track Your Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-amber-300 font-bold mb-3 text-xs uppercase tracking-wider">Legal & Compliance</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-amber-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy" className="hover:text-amber-400">Refund & Cancellation</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-amber-400">Shipping & Transport</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400">Contact & Grievance Officer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-amber-300 font-bold mb-3 text-xs uppercase tracking-wider">Order Verification</h3>
            <p className="text-xs text-slate-400 mb-2">
              Orders placed on this portal are directly forwarded to our Sivakasi dispatch team via WhatsApp for quick verification.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/${normalizeIndianPhone(ORDER_SUPPORT_PHONE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
              >
                <span>💬</span> WhatsApp Support
              </a>
              <a
                href={`tel:+91${ORDER_SUPPORT_PHONE}`}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                <span>📞</span> Call {ORDER_SUPPORT_PHONE}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Sivakasi Crackers E-Commerce Platform. All rights reserved.</p>
          <p className="text-amber-500/60 font-mono text-[11px] text-center sm:text-right">
            Licensed Green Fireworks (CSIR-NEERI & PESO compliant) • Sivakasi, TN
          </p>
        </div>
      </div>
    </footer>
  );
};
