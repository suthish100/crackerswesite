import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Sivakasi Crackers',
  description: 'Privacy Policy and data protection practices for Sivakasi Crackers online portal.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <Link href="/" className="text-amber-400 text-xs font-semibold hover:underline mb-2 inline-block">
            ← Back to Storefront
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: September 2026 • In compliance with the Information Technology Act, 2000 and Digital Personal Data Protection (DPDP) Act, 2023.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">1. Information We Collect</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            When you place an inquiry or order on our storefront, we collect the following personal information to facilitate fulfillment:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 pl-2">
            <li><strong className="text-white">Full Name:</strong> To identify the consignee on transport booking slips.</li>
            <li><strong className="text-white">Contact Phone Number:</strong> To coordinate order confirmation, WhatsApp status updates, and transport arrival alerts.</li>
            <li><strong className="text-white">Delivery Address & Pincode:</strong> To determine the nearest transport hub/godown and calculate shipping viability.</li>
            <li><strong className="text-white">Order Details:</strong> Specific items and quantities selected for dispatch.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">2. How Your Data Is Used</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We use your data solely for lawful business operations:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 pl-2">
            <li>Processing, packing, and dispatching your festival cracker parcel from Sivakasi, Tamil Nadu.</li>
            <li>Communicating order status, transport LR (Lorry Receipt) numbers, and estimated delivery dates.</li>
            <li>Responding to customer support, inquiries, or grievance redressal requests.</li>
          </ul>
          <p className="text-sm text-slate-300 leading-relaxed">
            We <strong className="text-amber-400">do not sell, rent, or trade</strong> your personal information to third-party advertising or marketing brokers.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">3. Data Sharing With Third Parties</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your delivery name, contact number, and city are shared strictly with authorized road transport operators and logistics handlers who execute goods transit. All sharing is limited to what is strictly necessary to complete transit.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">4. Cookies & Local Storage</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our website uses browser <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">localStorage</code> solely to remember items in your shopping cart across sessions and preserve checkout state. We do not use third-party behavioral profiling trackers.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">5. Grievance Officer & Contact</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            For questions about your data or to request record deletion after seasonal fulfillment, please contact our designated Grievance Officer:
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-1 text-slate-300">
            <p><strong className="text-white">Grievance Officer:</strong> Customer Redressal Desk</p>
            <p><strong className="text-white">Address:</strong> Sivakasi Industrial Area, Sivakasi, Virudhunagar Dist, Tamil Nadu - 626123</p>
            <p><strong className="text-white">Helpline / WhatsApp:</strong> +91 89257 00923</p>
            <p><strong className="text-white">Response Time:</strong> Inquiries acknowledged within 48 hours.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
