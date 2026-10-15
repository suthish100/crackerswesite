'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/types';
import { formatPrice, ORDER_STATUSES, STATUS_COLORS } from '@/lib/utils';
import {
  downloadOrderInvoicePdf,
  shareOrderInvoicePdf,
  generateWhatsAppInvoiceShareUrl,
  OrderInvoiceData,
} from '@/lib/invoicePdf';

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

  // Share Modal & Toast
  const [shareOrder, setShareOrder] = useState<Order | null>(null);
  const [adminToast, setAdminToast] = useState('');

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

  const toInvoiceData = (order: Order): OrderInvoiceData => ({
    id: order.id,
    publicOrderId: order.publicOrderId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    customerNote: order.customerNote,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    items:
      order.items?.map((item) => ({
        name: item.product?.name || `Product #${item.productId}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        sourcePackageName: item.sourcePackage?.name || null,
      })) || [],
  });

  const showToast = (message: string) => {
    setAdminToast(message);
    setTimeout(() => setAdminToast(''), 3500);
  };

  const handleDownloadInvoice = (order: Order) => {
    try {
      downloadOrderInvoicePdf(toInvoiceData(order));
      showToast(`✅ Invoice for ${order.publicOrderId} downloaded!`);
    } catch (e) {
      console.error('Failed to download invoice:', e);
      showToast('⚠️ Failed to generate invoice PDF');
    }
  };

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
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === selectedOrder.id ? { ...order, status: newStatus } : order
          )
        );
        // Refresh detail view
        const resDetail = await fetch(`/api/admin/orders/${selectedOrder.id}`);
        const dataDetail = await resDetail.json();
        if (dataDetail.success) {
          setSelectedOrder(dataDetail.order);
          setOrders((currentOrders) =>
            currentOrders.map((order) =>
              order.id === dataDetail.order.id ? { ...order, ...dataDetail.order } : order
            )
          );
        }
        setStatusNote('');
        showToast(`✅ Status updated to ${newStatus}`);
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
      {/* Toast Notification */}
      {adminToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700">
          <span>{adminToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Order Processing & Management</h1>
          <p className="text-slate-500 text-xs mt-1">
            Verify customer orders, generate & share PDF invoices, update status workflows, and audit history.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white border border-slate-200 p-4 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders
          </button>

          {ORDER_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading orders...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          {/* Mobile Swipe Hint */}
          <div className="md:hidden px-4 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <span>👉</span>
              <span>Scroll sideways to view all columns & actions</span>
            </span>
            <span className="text-[10px] font-mono text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
              swipe ↔
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[840px]">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions & Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No orders found matching criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} data-testid="order-row" className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900 text-sm">{o.publicOrderId}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{o.customerName}</div>
                        <div className="text-slate-500 font-mono text-[11px]">📞 {o.customerPhone}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">
                        {o.items?.length || 0} items ({o.items?.reduce((s, i) => s + i.quantity, 0)} pcs)
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">{formatPrice(o.totalAmount)}</td>
                      <td className="p-4">
                        <span
                          data-testid="order-status-badge"
                          className="px-3 py-1 rounded-full text-[10px] font-bold border uppercase"
                          style={{
                            backgroundColor: `${STATUS_COLORS[o.status]}15`,
                            color: STATUS_COLORS[o.status] || '#0f172a',
                            borderColor: `${STATUS_COLORS[o.status]}35`,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click PDF Download */}
                          <button
                            onClick={() => handleDownloadInvoice(o)}
                            title="Download Official Invoice PDF"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 text-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>📄</span>
                            <span className="hidden sm:inline">PDF</span>
                          </button>

                          {/* Share Invoice as PDF */}
                          <button
                            onClick={() => setShareOrder(o)}
                            title="Share Invoice (PDF)"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold border border-blue-200 text-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>📤</span>
                            <span className="hidden sm:inline">Share</span>
                          </button>

                          {/* Manage Order Modal */}
                          <button
                            onClick={() => openOrderDetail(o)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs whitespace-nowrap transition-all shadow-xs cursor-pointer"
                          >
                            Manage →
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col text-slate-900">
            {/* Modal Header with Invoice Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Management</span>
                <h2 className="text-2xl font-black text-slate-900 font-mono">{selectedOrder.publicOrderId}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Action Buttons: PDF Download, Share, View, Close */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Download Invoice PDF"
                >
                  <span>📄</span>
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => setShareOrder(selectedOrder)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold border border-blue-200 text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Share Invoice as PDF"
                >
                  <span>📤</span>
                  <span>Share (PDF)</span>
                </button>

                <a
                  href={`/api/orders/${encodeURIComponent(selectedOrder.publicOrderId)}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 text-xs flex items-center gap-1.5 transition-all"
                  title="Open PDF Preview in New Tab"
                >
                  <span>👁️</span>
                  <span>Preview</span>
                </a>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 space-y-6 pr-1 text-xs">
              {/* Customer Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Customer Info</h4>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                  <p className="text-slate-500 font-mono mt-0.5">📞 {selectedOrder.customerPhone}</p>
                  {selectedOrder.customerNote && (
                    <p className="text-slate-700 text-[11px] mt-2 bg-white p-2 rounded-lg border border-slate-200">
                      Note: {selectedOrder.customerNote}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Delivery Address</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedOrder.customerAddress}</p>
                </div>
              </div>

              {/* Status Updater Form */}
              <form onSubmit={handleStatusUpdate} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  ⚡ Update Order Status (Appends to Customer Timeline)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="block font-bold text-slate-700 mb-1">New Status</label>
                    <select
                      data-testid="order-status-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block font-bold text-slate-700 mb-1">Optional Note for Customer</label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="e.g. Payment verified via UPI / Shipped via Express Cargo"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {updatingStatus ? 'Updating Status...' : 'Apply Status Change ✓'}
                  </button>
                </div>
              </form>

              {/* Ordered Items Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                    Order Items Breakdown ({selectedOrder.items?.length || 0})
                  </h4>
                  <button
                    onClick={() => handleDownloadInvoice(selectedOrder)}
                    className="text-slate-900 hover:text-blue-900 font-bold text-[11px] underline"
                  >
                    Download Invoice PDF ↓
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{item.product.name}</h5>
                        {item.sourcePackage && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200 mt-1">
                            From Ready Package: {item.sourcePackage.name}
                          </span>
                        )}
                        <p className="text-slate-500 text-[11px] mt-1">
                          Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>

                      <span className="font-black text-slate-900 text-sm">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-100 rounded-2xl border border-slate-200 font-bold">
                  <span className="text-slate-600">Total Order Amount</span>
                  <span className="text-xl font-black text-slate-900">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Status History Timeline Audit Trail */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Order Status History Logs
                </h4>
                <div className="space-y-2">
                  {selectedOrder.statusHistory?.map((hist) => (
                    <div key={hist.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-slate-900">{hist.status}</span>
                        {hist.note && <span className="text-slate-600 ml-2">— {hist.note}</span>}
                      </div>
                      <span className="text-slate-400">{new Date(hist.changedAt).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Invoice as PDF Modal */}
      {shareOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>📤</span> Share Invoice (PDF)
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Order: {shareOrder.publicOrderId}</p>
              </div>
              <button
                onClick={() => setShareOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Option 1: Native Device Share */}
              <button
                onClick={async () => {
                  const res = await shareOrderInvoicePdf(toInvoiceData(shareOrder));
                  if (res.success && res.method === 'web-share') {
                    showToast('✅ Invoice PDF shared successfully!');
                    setShareOrder(null);
                  } else {
                    showToast('📄 Invoice PDF downloaded to your device!');
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Share PDF to Any App</p>
                    <p className="text-[11px] text-slate-500">Opens native share dialog to send the actual PDF file directly</p>
                  </div>
                </div>
                <span className="text-slate-900 font-bold text-sm">→</span>
              </button>

              {/* Option 2: Send WhatsApp to Customer */}
              <button
                onClick={() => {
                  downloadOrderInvoicePdf(toInvoiceData(shareOrder));
                  const waUrl = generateWhatsAppInvoiceShareUrl(
                    shareOrder.customerPhone,
                    toInvoiceData(shareOrder)
                  );
                  showToast('📄 PDF downloaded! Opening WhatsApp chat...');
                  window.open(waUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-bold text-emerald-950 text-xs">Send to Customer on WhatsApp</p>
                    <p className="text-[11px] text-emerald-700">
                      To {shareOrder.customerName} ({shareOrder.customerPhone})
                    </p>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold text-sm">→</span>
              </button>

              {/* Option 3: Download PDF to device */}
              <button
                onClick={() => {
                  downloadOrderInvoicePdf(toInvoiceData(shareOrder));
                  showToast('✅ Invoice PDF downloaded!');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📥</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Download Invoice PDF</p>
                    <p className="text-[11px] text-slate-500">Save Invoice_{shareOrder.publicOrderId}.pdf directly</p>
                  </div>
                </div>
                <span className="text-slate-900 font-bold text-sm">→</span>
              </button>

              {/* Option 4: Copy Direct PDF Link */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/api/orders/${encodeURIComponent(shareOrder.publicOrderId)}/invoice`;
                  void navigator.clipboard.writeText(url);
                  showToast('📋 PDF direct download link copied to clipboard!');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Copy Direct PDF Link</p>
                    <p className="text-[11px] text-slate-500">Permanent link to download this invoice PDF</p>
                  </div>
                </div>
                <span className="text-slate-900 font-bold text-sm">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
