'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, ORDER_SUPPORT_PHONE } from '@/lib/utils';
import { FireworksBlast } from '@/components/ui/FireworksBlast';

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
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrderData(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse last_order:', e);
    }
  }, []);

  const displayOrderId = orderData?.publicOrderId || orderId || 'CR2026-XXXX';
  const displayCustomerName = orderData?.customerName || 'Customer';

  return (
    <div data-testid="order-confirmation" className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 relative">
      {/* Sky Cracker Fireworks Blast on successful order checkout */}
      <FireworksBlast durationSeconds={5} />

      {/* Celebration Icon */}
      <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto shadow-xl shadow-amber-500/25 animate-bounce">
        ✓
      </div>

      <div>
        <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-[0.2em]">
          STATUS: RECEIVED
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4">Order Received!</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
          Thank you, <span className="text-amber-800 font-bold">{displayCustomerName}</span>! Your celebration order has been registered in our system.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-8 space-y-5 max-w-lg mx-auto shadow-xl">
        <div className="text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-500 font-semibold uppercase tracking-wider">Tracking ID:</span>
            <span
              data-testid="public-order-id"
              className="text-lg font-black text-amber-700 tracking-wider font-mono"
            >
              {displayOrderId}
            </span>
          </div>

          {orderData?.totalAmount && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-black text-slate-900 text-base">{formatPrice(orderData.totalAmount)}</span>
            </div>
          )}

          {orderData?.customerPhone && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Phone Number:</span>
              <span className="font-semibold text-slate-800">{orderData.customerPhone}</span>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left leading-relaxed">
          📞 <strong>What happens next?</strong> Our Sivakasi dispatch team will review your order items and call your phone number directly to verify delivery details and transport dispatch before shipping.
        </div>

        {orderData?.whatsappLink && (
          <div className="space-y-2.5">
            <a
              href={orderData.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
            >
              <span>💬</span> Open WhatsApp Order Chat
            </a>
            <a
              href={`tel:+91${ORDER_SUPPORT_PHONE}`}
              className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <span>📞</span> Call Order Support
            </a>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap justify-center gap-3 text-xs font-bold pt-4">
        <Link
          href={`/track?phone=${encodeURIComponent(orderData?.customerPhone || '')}&orderId=${encodeURIComponent(displayOrderId)}`}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white font-black shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
        >
          Track Order Status Timeline 📍
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-white text-slate-700 border border-slate-300 hover:border-amber-400 hover:text-amber-800 shadow-sm transition-all"
        >
          Back to Storefront
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 text-sm">Loading order confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
