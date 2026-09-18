import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin Console | Sivakasi Crackers',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <AdminSidebar />
      <main className="min-w-0 max-w-7xl flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
