import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | Sivakasi Crackers',
  description: 'Terms of Use and safety agreements for purchasing fireworks from Sivakasi Crackers.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <Link href="/" className="text-amber-400 text-xs font-semibold hover:underline mb-2 inline-block">
            ← Back to Storefront
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Terms & Conditions</h1>
          <p className="text-xs text-slate-400 mt-2">
            Effective Date: September 2026 • Please review carefully before placing an order.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">1. Age & Legal Eligibility</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            By placing an order on this website, you certify under Indian law that you are at least <strong className="text-white">18 years of age</strong>. Purchasing, handling, and ignition of fireworks must always be performed or supervised by responsible adults.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">2. Explosives Act & Regulatory Compliance</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            All fireworks listed on this portal are certified green crackers manufactured in licensed factories in Sivakasi, Tamil Nadu, conforming to emission and chemical safety norms set by CSIR-NEERI and PESO (Petroleum & Explosives Safety Organisation).
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Buyers are solely responsible for ensuring that the possession, transport, and bursting of fireworks are permitted in their local jurisdiction/municipality during festival dates. We do not dispatch to jurisdictions where total bans are active (e.g. NCR / Delhi NCT as mandated by Supreme Court rulings).
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">3. Order Inquiry & Verification Workflow</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Submitting a checkout form on this portal creates a purchase request. Our dispatch team contacts you via WhatsApp or telephone to verify delivery address, calculate transport freight to your nearest regional godown, and finalize parcel dispatch.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">4. Safety Instructions & Limitation of Liability</h2>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 pl-2">
            <li>Always ignite fireworks in open outdoor areas away from dry grass, overhead electrical lines, and flammable structures.</li>
            <li>Keep a bucket of clean water or sand ready at all times.</li>
            <li>Never attempt to reignite a misfired or malfunctioning cracker; soak it in water and dispose of safely.</li>
            <li>The seller shall not be held liable for any damages, personal injuries, or legal fines resulting from improper storage, misuse, or negligent bursting of crackers.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">5. Governing Law & Jurisdiction</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Any disputes arising from transactions conducted on this website are subject to the exclusive jurisdiction of the competent courts in <strong className="text-white">Sivakasi / Srivilliputhur, Tamil Nadu</strong>, India.
          </p>
        </section>
      </div>
    </div>
  );
}
