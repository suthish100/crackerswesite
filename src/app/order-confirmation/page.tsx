'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, ORDER_SUPPORT_PHONE } from '@/lib/utils';
import { FireworksBlast } from '@/components/ui/FireworksBlast';
import {
  downloadOrderInvoicePdf,
  shareOrderInvoicePdf,
  generateWhatsAppInvoiceShareUrl,
  OrderInvoiceData,
  InvoiceItem,
} from '@/lib/invoicePdf';

interface StoredOrderData {
  publicOrderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote?: string;
  totalAmount: number;
  whatsappLink?: string;
  items?: InvoiceItem[];
  createdAt?: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderData, setOrderData] = useState<StoredOrderData | null>(null);
  const [sharingPdf, setSharingPdf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [showItemsList, setShowItemsList] = useState(false);

  // 1. Load order from session storage or fetch from API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let loadedFromStorage = false;
    try {
      const saved = sessionStorage.getItem('last_order');
      if (saved) {
        const parsed: StoredOrderData = JSON.parse(saved);
        setOrderData(parsed);
        loadedFromStorage = true;
      }
    } catch (e) {
      console.error('Failed to parse last_order:', e);
    }

    const currentId = orderId || (loadedFromStorage ? null : null);
    if (currentId) {
      void fetch(`/api/orders/${encodeURIComponent(currentId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrderData((prev) => ({
              publicOrderId: data.order.publicOrderId,
              customerName: data.order.customerName,
              customerPhone: data.order.customerPhone,
              customerAddress: data.order.customerAddress,
              customerNote: data.order.customerNote || prev?.customerNote,
              totalAmount: data.order.totalAmount,
              whatsappLink: prev?.whatsappLink,
              items: data.order.items || prev?.items || [],
              createdAt: data.order.createdAt || prev?.createdAt,
            }));
          }
        })
        .catch((err) => console.warn('Could not fetch full order details:', err));
    }
  }, [orderId]);

  const displayOrderId = orderData?.publicOrderId || orderId || 'CR2026-XXXX';
  const displayCustomerName = orderData?.customerName || 'Customer';

  const invoiceData: OrderInvoiceData = {
    publicOrderId: displayOrderId,
    customerName: displayCustomerName,
    customerPhone: orderData?.customerPhone || '',
    customerAddress: orderData?.customerAddress || '',
    customerNote: orderData?.customerNote,
    totalAmount: orderData?.totalAmount || 0,
    createdAt: orderData?.createdAt || new Date(),
    status: 'Received',
    items: orderData?.items || [],
  };

  // 2. WhatsApp Forwarding as PDF Share
  const handleWhatsAppForward = async () => {
    setSharingPdf(true);
    setShareFeedback('');

    try {
      // Step A: Attempt native Web Share with the generated PDF file
      const result = await shareOrderInvoicePdf(invoiceData);

      if (result.success && result.method === 'web-share') {
        setShareFeedback('✅ Invoice PDF shared successfully!');
        return;
      }

      // Step B: Fallback for environments without native file sharing (e.g. desktop web)
      // The PDF was already downloaded to their device by shareOrderInvoicePdf
      const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || ORDER_SUPPORT_PHONE;
      const waUrl = generateWhatsAppInvoiceShareUrl(adminWhatsApp, invoiceData);

      setShareFeedback('📄 Invoice PDF downloaded to your device! Opening WhatsApp...');
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('WhatsApp forwarding failed:', err);
      // Last resort fallback
      if (orderData?.whatsappLink) {
        window.open(orderData.whatsappLink, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setSharingPdf(false);
    }
  };

  // 3. Direct Invoice PDF Download
  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    setShareFeedback('');
    try {
      downloadOrderInvoicePdf(invoiceData);
      setShareFeedback('✅ Invoice PDF downloaded successfully!');
    } catch (err) {
      console.error('Invoice PDF download error:', err);
      setShareFeedback('⚠️ Failed to generate PDF. Please try viewing it in browser.');
    } finally {
      setTimeout(() => setDownloadingPdf(false), 1200);
    }
  };

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
          STATUS: ORDER RECEIVED
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4">Order Received!</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
          Thank you, <span className="text-amber-800 font-bold">{displayCustomerName}</span>! Your celebration order has been placed successfully.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-8 space-y-5 max-w-lg mx-auto shadow-xl text-left">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-500 font-semibold uppercase tracking-wider">Tracking ID:</span>
            <span
              data-testid="public-order-id"
              className="text-lg font-black text-amber-700 tracking-wider font-mono"
            >
              {displayOrderId}
            </span>
          </div>

          {orderData?.totalAmount ? (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Total Order Amount:</span>
              <span className="font-black text-slate-900 text-base">{formatPrice(orderData.totalAmount)}</span>
            </div>
          ) : null}

          {orderData?.customerPhone && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Contact / WhatsApp:</span>
              <span className="font-semibold text-slate-800">{orderData.customerPhone}</span>
            </div>
          )}

          {orderData?.customerAddress && (
            <div className="py-1">
              <span className="text-slate-500 block mb-0.5">Delivery Address:</span>
              <span className="font-medium text-slate-800 leading-tight block">{orderData.customerAddress}</span>
            </div>
          )}
        </div>

        {/* Optional Collapsible Items Breakdown */}
        {orderData?.items && orderData.items.length > 0 && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
            <button
              onClick={() => setShowItemsList(!showItemsList)}
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-colors"
            >
              <span>📦 Ordered Items ({orderData.items.length} items)</span>
              <span className="text-slate-400 font-mono">{showItemsList ? '▲ Hide' : '▼ View'}</span>
            </button>

            {showItemsList && (
              <div className="p-3.5 space-y-2 border-t border-slate-200 text-xs max-h-48 overflow-y-auto">
                {orderData.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] text-slate-600">
                    <span className="font-medium truncate max-w-[200px]">
                      {it.name} <span className="text-slate-400">× {it.quantity}</span>
                    </span>
                    <span className="font-bold text-slate-900">{formatPrice(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
          📞 <strong>What happens next?</strong> Our Sivakasi dispatch team will review your order items and call your phone number directly to verify delivery details and transport dispatch before shipping.
        </div>

        {/* Feedback message banner if any action triggered */}
        {shareFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
            <span>{shareFeedback}</span>
            <button onClick={() => setShareFeedback('')} className="text-emerald-600 hover:text-emerald-900 ml-2">✕</button>
          </div>
        )}

        {/* WhatsApp Forwarding & PDF Actions */}
        <div className="space-y-3 pt-2">
          {/* Action 1: Forward Order Invoice via WhatsApp as PDF */}
          <button
            onClick={handleWhatsAppForward}
            disabled={sharingPdf}
            data-testid="whatsapp-forward-pdf"
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 px-5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            <span className="text-lg">💬</span>
            <span>{sharingPdf ? 'Preparing Invoice PDF...' : 'Forward Order Invoice via WhatsApp (PDF)'}</span>
          </button>

          {/* Action 2: Download Invoice PDF (Placed directly below WhatsApp forwarding) */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            data-testid="download-invoice-pdf"
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 py-3.5 px-5 text-sm font-black text-amber-900 shadow-sm transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            <span className="text-lg">📄</span>
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download Invoice PDF'}</span>
          </button>

          {/* Sub-actions: Browser View & Phone Call */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <a
              href={`/api/orders/${encodeURIComponent(displayOrderId)}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 transition-colors text-center"
            >
              <span>👁️</span> View in Browser
            </a>

            <a
              href={`tel:+91${ORDER_SUPPORT_PHONE}`}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 transition-colors text-center"
            >
              <span>📞</span> Call Support
            </a>
          </div>
        </div>
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
