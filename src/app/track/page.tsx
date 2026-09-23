'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Order } from '@/types';
import { formatPrice, ORDER_STATUSES, STATUS_COLORS, type OrderStatus } from '@/lib/utils';

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
    } catch (err: unknown) {
      console.error('Tracking fetch error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to locate order.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultPhone && defaultOrderId) {
      // The request resolves asynchronously; this synchronizes URL-provided lookup values.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTracking(defaultPhone, defaultOrderId);
    }
  }, [defaultPhone, defaultOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(phone, orderId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-800 bg-amber-100 border border-amber-300 px-3.5 py-1 rounded-full inline-block mb-3 shadow-sm">
          Public Order Lookup
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Track Order Progress</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
          No account or login required. Enter your phone number and Public Order ID to view the live timeline.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Order ID (e.g. CR2026-0143)
            </label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. CR2026-0143"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:brightness-105 text-white font-black text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-95 transition-all"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* Order Status Results Card & Timeline */}
      {order && (
        <div className="bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
              <h2 className="text-2xl font-black text-amber-700 font-mono">
                {order.publicOrderId}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Customer: {order.customerName} ({order.customerPhone})</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 block font-semibold">Current Status</span>
              <span
                className="inline-block px-3.5 py-1 rounded-full text-xs font-black border uppercase mt-1 shadow-sm"
                style={{
                  backgroundColor: `${STATUS_COLORS[order.status] || '#D97706'}18`,
                  color: STATUS_COLORS[order.status] || '#D97706',
                  borderColor: `${STATUS_COLORS[order.status] || '#D97706'}40`,
                }}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-5">Execution Progress</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {ORDER_STATUSES.filter(s => s !== 'Cancelled').map((stepName, idx) => {
                const currentIdx = ORDER_STATUSES.indexOf(order.status as OrderStatus);
                const stepIdx = ORDER_STATUSES.indexOf(stepName);
                const isPassed = currentIdx >= stepIdx && order.status !== 'Cancelled';
                const isCurrent = order.status === stepName;

                return (
                  <div
                    key={stepName}
                    className={`relative p-3 rounded-2xl border text-center transition-all duration-300 ${
                      isCurrent
                        ? 'bg-amber-100/90 border-amber-500 text-amber-900 font-black shadow-md shadow-amber-500/10'
                        : isPassed
                        ? 'bg-slate-50 border-emerald-300 text-emerald-800 font-bold'
                        : 'bg-slate-50/60 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-amber-500"
                        animate={{ opacity: [0.3, 0.9, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <span className="text-[10px] block opacity-70">Step {idx + 1}</span>
                    <span className="text-xs font-bold block mt-0.5">{stepName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline History Rows */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              Status History Timeline
            </h3>
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {order.statusHistory?.map((hist) => (
                <div key={hist.id} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-800">{hist.status}</span>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(hist.changedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {hist.note && <p className="text-xs text-slate-600 mt-1">{hist.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Order Items</h3>
            <div className="space-y-2.5">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-800"
                >
                  <div>
                    <span className="font-bold text-slate-900">• {item.product.name}</span>
                    {item.sourcePackage && (
                      <span className="text-[10px] text-amber-700 block">
                        Source Package: {item.sourcePackage.name}
                      </span>
                    )}
                    <span className="text-slate-500 text-[11px] block">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                  <span className="font-black text-amber-700">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 text-right">
              <span className="text-xs text-slate-500">Total Paid/Due: </span>
              <span className="text-2xl font-black text-amber-700 ml-2">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 text-sm">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
