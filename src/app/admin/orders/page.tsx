'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/types';
import { formatPrice, ORDER_STATUSES, STATUS_COLORS } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const url = `/api/admin/orders?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (active && data.success) setOrders(data.orders);
      } catch (e) {
        console.error('Fetch admin orders error:', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadOrders();
    const refreshTimer = window.setInterval(loadOrders, 5000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [statusFilter, searchQuery]);

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((currentOrders) => currentOrders.map((order) => (
          order.id === selectedOrder.id ? { ...order, status: newStatus } : order
        )));
        // Refresh detail view
        const resDetail = await fetch(`/api/admin/orders/${selectedOrder.id}`);
        const dataDetail = await resDetail.json();
        if (dataDetail.success) {
          setSelectedOrder(dataDetail.order);
          setOrders((currentOrders) => currentOrders.map((order) => (
            order.id === dataDetail.order.id
              ? { ...order, ...dataDetail.order }
              : order
          )));
        }
        setStatusNote('');
      } else {
        alert(data.message || 'Status update failed');
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Order Processing & Management</h1>
        <p className="text-slate-400 text-xs mt-1">
          Verify customer orders, update progress statuses, and maintain live status timelines.
        </p>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Orders
          </button>

          {ORDER_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="w-full lg:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Name, Phone..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading orders...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {/* Mobile Swipe Hint */}
          <div className="md:hidden px-4 py-2 bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <span>👉</span>
              <span>Scroll sideways to view all columns & actions</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400/80 bg-slate-800/80 px-2 py-0.5 rounded-full">
              swipe ↔
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No orders found matching criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} data-testid="order-row" className="hover:bg-slate-950/40">
                      <td className="p-4 font-mono font-bold text-amber-400 text-sm">{o.publicOrderId}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{o.customerName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{o.customerPhone}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-300">
                        {o.items?.length || 0} product types ({o.items?.reduce((s, i) => s + i.quantity, 0)} pcs)
                      </td>
                      <td className="p-4 font-black text-amber-300 text-sm">{formatPrice(o.totalAmount)}</td>
                      <td className="p-4">
                        <span
                          data-testid="order-status-badge"
                          className="px-3 py-1 rounded-full text-[10px] font-bold border uppercase"
                          style={{
                            backgroundColor: `${STATUS_COLORS[o.status]}20`,
                            color: STATUS_COLORS[o.status] || '#f59e0b',
                            borderColor: `${STATUS_COLORS[o.status]}40`,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openOrderDetail(o)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                        >
                          Manage Order →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail & Status Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Detail</span>
                <h2 className="text-2xl font-black text-amber-400 font-mono">{selectedOrder.publicOrderId}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 space-y-6 pr-1 text-xs">
              {/* Customer Info Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[10px] mb-2">Customer Info</h4>
                  <p className="font-bold text-white text-sm">{selectedOrder.customerName}</p>
                  <p className="text-slate-400 font-mono mt-0.5">📞 {selectedOrder.customerPhone}</p>
                  {selectedOrder.customerNote && (
                    <p className="text-amber-400/90 text-[11px] mt-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      Note: {selectedOrder.customerNote}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[10px] mb-2">Delivery Address</h4>
                  <p className="text-slate-300 leading-relaxed">{selectedOrder.customerAddress}</p>
                </div>
              </div>

              {/* Status Updater Form */}
              <form onSubmit={handleStatusUpdate} className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider">
                  ⚡ Update Order Status (Appends to Customer Timeline)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="block font-bold text-slate-300 mb-1">New Status</label>
                    <select
                      data-testid="order-status-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block font-bold text-slate-300 mb-1">Optional Note for Customer</label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="e.g. Payment verified via UPI / Shipped via Express Cargo"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md disabled:opacity-50"
                  >
                    {updatingStatus ? 'Updating Status...' : 'Apply Status Change ✓'}
                  </button>
                </div>
              </form>

              {/* Ordered Items Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Order Items Breakdown ({selectedOrder.items?.length || 0})
                </h4>

                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <h5 className="font-bold text-white text-sm">{item.product.name}</h5>
                        {item.sourcePackage && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-1">
                            From Ready Package: {item.sourcePackage.name}
                          </span>
                        )}
                        <p className="text-slate-400 text-[11px] mt-1">
                          Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>

                      <span className="font-black text-amber-300 text-sm">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800 font-bold">
                  <span className="text-slate-400">Total Order Amount</span>
                  <span className="text-xl font-black text-amber-400">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Status History Timeline Audit Trail */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Order Status History Logs
                </h4>
                <div className="space-y-2">
                  {selectedOrder.statusHistory?.map((hist) => (
                    <div key={hist.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-amber-400">{hist.status}</span>
                        {hist.note && <span className="text-slate-400 ml-2">— {hist.note}</span>}
                      </div>
                      <span className="text-slate-500">{new Date(hist.changedAt).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
