'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return null;

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Orders', href: '/admin/orders', icon: '📦' },
    { label: 'Products', href: '/admin/products', icon: '🧨' },
    { label: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { label: 'Packages', href: '/admin/packages', icon: '🎁' },
    { label: 'Banners & Ticker', href: '/admin/site-settings', icon: '📢' },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white text-slate-700 md:min-h-screen md:w-64 md:border-b-0 md:border-r border-slate-200 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:p-6 bg-slate-50/60">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-lg shadow-md border border-slate-800">
          👑
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-wide">ADMIN CONSOLE</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Sivakasi Crackers</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex gap-2 overflow-x-auto p-3 text-xs font-semibold md:block md:flex-1 md:space-y-1.5 md:p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                isActive
                  ? 'bg-slate-900 text-white font-bold shadow-md shadow-slate-900/15'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Storefront link / Logout */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3 md:block md:space-y-2 md:p-4 bg-slate-50/40">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-200"
        >
          <span>🌐</span> View Storefront
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};
