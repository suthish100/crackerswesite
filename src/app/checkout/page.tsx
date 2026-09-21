'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-6xl block">🛍️</span>
        <h1 className="text-2xl font-black text-white">Your basket is empty</h1>
        <p className="text-slate-400 text-sm">Please add some crackers to your basket before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 rounded-full bg-amber-500 text-slate-950 font-bold text-sm"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMsg('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNote: customerNote.trim() || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          sourcePackageId: item.sourcePackageId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Store confirmation details in session storage for confirmation screen
      sessionStorage.setItem('last_order', JSON.stringify({
        publicOrderId: data.order.publicOrderId,
        customerName: data.order.customerName,
        customerPhone: data.order.customerPhone,
        customerAddress: data.order.customerAddress,
        totalAmount: data.order.totalAmount,
        whatsappLink: data.whatsappLink,
      }));

      clearCart();
      router.push(`/order-confirmation?orderId=${encodeURIComponent(data.order.publicOrderId)}`);
    } catch (err: unknown) {
      console.error('Checkout submit error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong while submitting your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Order Checkout</h1>
        <p className="text-slate-400 text-sm mt-1">
          Complete your details to place your order. No upfront online payment required — our team will verify your order via phone call.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Information Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-amber-400 mb-6 flex items-center gap-2">
            <span>📋</span> Delivery & Contact Details
          </h2>

          {errorMsg && (
            <div data-testid="checkout-error" className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <input
                data-testid="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                WhatsApp Phone Number <span className="text-amber-400">*</span>
              </label>
              <input
                data-testid="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Our team will reach out to this number to confirm payment and shipping details.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Full Delivery Address <span className="text-amber-400">*</span>
              </label>
              <textarea
                data-testid="customer-address"
                rows={3}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="House No, Street Name, Landmark, City, Pincode"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Order Notes / Preferences (Optional)
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Please deliver before festival weekend"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-4">
              <button
                data-testid="place-order"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Placing order...' : 'Place order →'}
              </button>
              <p className="mt-3 text-center text-[11px] text-slate-500">
                Our team will contact you to confirm payment and delivery details.
              </p>
            </div>
          </form>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-4">
            Order Breakdown ({items.length} items)
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800"
              >
                <div>
                  <h4 className="font-bold text-white line-clamp-1">{item.product.name}</h4>
                  {item.sourcePackageName && (
                    <span className="text-[10px] text-amber-400/80 font-semibold block">
                      Package: {item.sourcePackageName}
                    </span>
                  )}
                  <span className="text-slate-400 font-medium">Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-amber-300 text-sm">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-semibold text-white">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Verification Status</span>
              <span className="font-semibold">Direct Call Confirmation</span>
            </div>
            <div className="flex justify-between text-lg font-black text-amber-400 pt-2 border-t border-slate-800">
              <span>Grand Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
