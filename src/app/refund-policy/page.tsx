import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Refund & Cancellation Policy | Sivakasi Crackers',
  description: 'Refund, return, and cancellation policies for fireworks orders.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <Link href="/" className="text-amber-400 text-xs font-semibold hover:underline mb-2 inline-block">
            ← Back to Storefront
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Refund & Cancellation Policy</h1>
          <p className="text-xs text-slate-400 mt-2">
            In accordance with Consumer Protection (E-Commerce) Rules, 2020.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">1. Order Cancellations</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            You may cancel your order free of charge at any time <strong className="text-white">before the parcel is packed and handed over to the transport agency</strong>.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            To request a cancellation, message our support desk on WhatsApp (+91 89257 00923) or call with your Order ID. Once a transport LR (Lorry Receipt) has been generated and the goods have departed the Sivakasi depot, cancellation is no longer possible.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">2. Non-Returnable Goods (Hazardous Materials)</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Under Indian transport safety laws and PESO guidelines, fireworks cannot be accepted back into reverse transit once collected by the customer. Therefore, <strong className="text-rose-400">all completed deliveries are final and non-returnable</strong>.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">3. Damaged In Transit or Missing Items</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We inspect and pack all items in heavy-duty corrugated cartons sealed with tamper-evident tape. In the rare event of transit damage or missing pieces:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 pl-2">
            <li>You must record a clear, continuous <strong className="text-white">unboxing video</strong> from parcel opening to item verification.</li>
            <li>Send the video along with your Order ID to our WhatsApp support within <strong className="text-white">48 hours of parcel collection</strong>.</li>
            <li>Upon verification, we will issue a partial refund or dispatch replacement stock at no extra charge.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">4. Refund Processing Timeline</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Approved refunds will be processed via original payment mode (UPI / Bank NEFT) within <strong className="text-white">3 to 5 business days</strong> of verification approval.
          </p>
        </section>
      </div>
    </div>
  );
}
