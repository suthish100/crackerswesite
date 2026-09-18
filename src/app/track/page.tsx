'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order } from '@/types';
import { formatPrice, ORDER_STATUSES, STATUS_COLORS } from '@/lib/utils';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const defaultPhone = searchParams.get('phone') || '';
  const defaultOrderId = searchParams.get('orderId') || '';

  const [phone, setPhone] = useState(defaultPhone);
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTracking = async (p: string, o: string) => {
    if (!p.trim() || !o.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(p.trim())}&orderId=${encodeURIComponent(o.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Order not found');
      }

      setOrder(data.order);
    } catch (err: any) {
      console.error('Tracking fetch error:', err);
      setErrorMsg(err.message || 'Failed to locate order.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultPhone && defaultOrderId) {
      fetchTracking(defaultPhone, defaultOrderId);
    }
  }, [defaultPhone, defaultOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(phone, orderId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Public Lookup</span>
        <h1 className="text-3xl font-black text-white mt-1">Track Order Progress</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
          No account or login required. Enter your phone number and Public Order ID to view live progress timeline.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Order ID (e.g. CR2026-0143)
            </label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. CR2026-0143"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* Order Status Results Card & Timeline */}
      {order && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fadeIn">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
              <h2 className="text-2xl font-black text-amber-400 font-mono">{order.publicOrderId}</h2>
              <p className="text-xs text-slate-400 mt-1">Customer: {order.customerName} ({order.customerPhone})</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block font-semibold">Current Status</span>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-black border uppercase mt-1"
                style={{
                  backgroundColor: `${STATUS_COLORS[order.status]}20`,
                  color: STATUS_COLORS[order.status] || '#f59e0b',
                  borderColor: `${STATUS_COLORS[order.status]}40`,
                }}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Execution Progress</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {ORDER_STATUSES.filter(s => s !== 'Cancelled').map((stepName, idx) => {
                const currentIdx = ORDER_STATUSES.indexOf(order.status as any);
                const stepIdx = ORDER_STATUSES.indexOf(stepName);
                const isPassed = currentIdx >= stepIdx && order.status !== 'Cancelled';
                const isCurrent = order.status === stepName;

                return (
                  <div
                    key={stepName}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black shadow-lg shadow-amber-500/10'
                        : isPassed
                        ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 font-bold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] block opacity-60">Step {idx + 1}</span>
                    <span className="text-xs font-bold block mt-0.5">{stepName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline History Rows */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Status History Timeline</h3>
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {order.statusHistory?.map((hist) => (
                <div key={hist.id} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900" />
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-300">{hist.status}</span>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(hist.changedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {hist.note && <p className="text-xs text-slate-400 mt-1">{hist.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                  <div>
                    <span className="font-bold text-white">• {item.product.name}</span>
                    {item.sourcePackage && (
                      <span className="text-[10px] text-amber-400 block">
                        Source Package: {item.sourcePackage.name}
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px] block">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</span>
                  </div>
                  <span className="font-bold text-amber-300">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <span className="text-xs text-slate-400">Total Paid/Due: </span>
              <span className="text-xl font-black text-amber-400 ml-2">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-sm">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
