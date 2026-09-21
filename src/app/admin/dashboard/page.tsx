'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, ORDER_STATUSES, STATUS_COLORS } from '@/lib/utils';

interface RecentOrder {
  id: number;
  publicOrderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: RecentOrder[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const res = await fetch('/api/admin/stats', { cache: 'no-store' });
    const data = await res.json();
    if (data.success) setStats(data.stats);
    return data.success;
  };

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { success: boolean; stats?: DashboardStats }) => {
        if (data.success && data.stats) setStats(data.stats);
      })
      .catch((e) => console.error('Dashboard stats fetch error:', e))
      .finally(() => setLoading(false));

    const events = new EventSource('/api/admin/events');
    events.addEventListener('snapshot', (event) => {
      const snapshot = JSON.parse((event as MessageEvent).data);
      setStats((current) => current ? { ...current, ...snapshot } : current);
    });
    events.onerror = () => console.warn('Dashboard live updates temporarily unavailable');
    return () => events.close();
  }, []);

  const updateOrderStatus = async (orderId: number, status: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Unable to update order status');
    await loadStats();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading dashboard metrics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center text-rose-400 text-sm">
        Failed to load stats. Please check admin login status.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Store Overview & Analytics</h1>
        <p className="text-slate-400 text-xs mt-1">Live metrics for orders, revenue, products, and inventory.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Total Revenue</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-lg">💰</span>
          </div>
          <h2 className="text-2xl font-black text-amber-400 mt-3">{formatPrice(stats.totalRevenue)}</h2>
          <p className="text-[11px] text-slate-500 mt-1">From non-cancelled orders</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Total Orders</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 text-lg">📦</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-3">{stats.totalOrders}</h2>
          <p className="text-[11px] text-slate-500 mt-1">Orders registered in database</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Active Products</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 text-lg">🧨</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-3">{stats.totalProducts}</h2>
          <p className="text-[11px] text-slate-500 mt-1">Catalog items listed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Low Stock Alert</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 text-lg">⚠️</span>
          </div>
          <h2 className={`text-2xl font-black mt-3 ${stats.lowStockProducts > 0 ? 'text-rose-400' : 'text-white'}`}>
            {stats.lowStockProducts}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">Products with ≤10 units remaining</p>
        </div>
      </div>

      {/* Orders Breakdown by Status */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Orders Distribution by Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
            <div
              key={status}
              className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center"
            >
              <span className="text-xs font-semibold block text-slate-400">{status}</span>
              <span
                className="text-lg font-black block mt-1"
                style={{ color: STATUS_COLORS[status] || '#f59e0b' }}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs font-bold text-amber-400 hover:underline">
            View All Orders →
          </Link>
        </div>

        {stats.recentOrders?.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {stats.recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-950/50">
                    <td className="p-3 font-mono font-bold text-amber-400">{order.publicOrderId}</td>
                    <td className="p-3 font-semibold text-white">{order.customerName}</td>
                    <td className="p-3">{order.customerPhone}</td>
                    <td className="p-3 font-bold text-white">{formatPrice(order.totalAmount)}</td>
                    <td className="p-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                        style={{
                          backgroundColor: `${STATUS_COLORS[order.status]}20`,
                          color: STATUS_COLORS[order.status] || '#f59e0b',
                          borderColor: `${STATUS_COLORS[order.status]}40`,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        aria-label={`Update ${order.publicOrderId} status`}
                        value={order.status}
                        onChange={(event) => void updateOrderStatus(order.id, event.target.value).catch((error) => console.error(error))}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-200"
                      >
                        {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
