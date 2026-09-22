'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, ORDER_SUPPORT_PHONE } from '@/lib/utils';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderData, setOrderData] = useState<{
    publicOrderId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    totalAmount: number;
    whatsappLink: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = sessionStorage.getItem('last_order');
      // Client-only session storage must be read after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderData(saved ? JSON.parse(saved) : null);
    } catch (e) {
      console.error('Failed to parse last_order:', e);
      // Keep the confirmation page usable when session storage is unavailable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderData(null);
    }
  }, []);

  const displayOrderId = orderData?.publicOrderId || orderId || 'CR2026-XXXX';
  const displayCustomerName = orderData?.customerName || 'Customer';

  return (
    <div data-testid="order-confirmation" className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      {/* Celebration Icon */}
      <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 rounded-full flex items-center justify-center text-4xl font-black mx-auto shadow-2xl shadow-emerald-500/20 animate-bounce">
        ✓
      </div>

      <div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
          STATUS: RECEIVED
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">Order Received!</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
          Thank you, <span className="text-white font-bold">{displayCustomerName}</span>! Your order has been registered in our system.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4 max-w-lg mx-auto shadow-xl">
        <div className="text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-slate-400 font-semibold uppercase">Tracking ID:</span>
            <span data-testid="public-order-id" className="text-base font-black text-amber-400 tracking-wider font-mono">{displayOrderId}</span>
          </div>

          {orderData?.totalAmount && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Total Amount:</span>
              <span className="font-bold text-white text-sm">{formatPrice(orderData.totalAmount)}</span>
            </div>
          )}

          {orderData?.customerPhone && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Phone Number:</span>
              <span className="font-semibold text-slate-200">{orderData.customerPhone}</span>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-left leading-relaxed">
          📞 <strong>What happens next?</strong> Our team will review your order items and call your phone number directly to verify delivery details and payment mode before dispatching.
        </div>

        {orderData?.whatsappLink && (
          <div className="space-y-2">
            <a
              href={orderData.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-emerald-500 py-4 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-400"
            >
              <span>💬</span> Open WhatsApp Order Chat
            </a>
            <a
              href={`tel:+91${ORDER_SUPPORT_PHONE}`}
              className="block w-full rounded-xl border border-slate-700 py-3 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-800"
            >
              <span>📞</span> Call Order Support
            </a>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap justify-center gap-4 text-xs font-bold pt-4">
        <Link
          href={`/track?phone=${encodeURIComponent(orderData?.customerPhone || '')}&orderId=${encodeURIComponent(displayOrderId)}`}
          className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
        >
          Track Order Status Timeline 📍
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800"
        >
          Back to Storefront
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-sm">Loading order confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
