import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping & Delivery Policy | Sivakasi Crackers',
  description: 'Regional road transport fulfillment details for Sivakasi fireworks orders.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <Link href="/" className="text-amber-400 text-xs font-semibold hover:underline mb-2 inline-block">
            ← Back to Storefront
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Shipping & Transport Policy</h1>
          <p className="text-xs text-slate-400 mt-2">
            Important information regarding regional road transport and dispatch from Sivakasi, Tamil Nadu.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">1. Why Road Transport (Not Regular Couriers)?</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            In compliance with Indian safety regulations (Explosives Rules & Central Motor Vehicles Rules), commercial fireworks are classified as hazardous Class 1 cargo. Standard express courier companies (such as Blue Dart, DTDC, India Post, or Delhivery) <strong className="text-white">strictly prohibit carrying fireworks</strong> by air or standard parcel networks.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Therefore, all orders are dispatched directly from our Sivakasi godown using <strong className="text-amber-300">licensed, registered commercial road transport operators</strong> (such as VRL, ARC, TAT, Rathimeena, Royal Transport, etc.) equipped for safe carriage of packaged green crackers.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">2. Delivery Method: Nearest City Transport Godown</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Most road transports operate on a <strong className="text-white">Godown Pickup</strong> model. The goods will arrive at the transport agency&apos;s parcel office in your nearest city/town. Once the consignment reaches the depot, the transport office will notify you to collect your parcel by presenting your Lorry Receipt (LR) copy and government ID.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            In select metro areas, door delivery by local auto/van can be arranged directly with the delivery transport hub for a nominal local fee.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">3. Estimated Transit Times</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-slate-300 font-bold">
                <tr>
                  <th className="p-3">Destination Region</th>
                  <th className="p-3">Estimated Transit Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-400">
                <tr>
                  <td className="p-3 text-white font-medium">Tamil Nadu & Pondicherry</td>
                  <td className="p-3 text-amber-300 font-semibold">24 to 48 Hours</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-medium">Karnataka, Kerala, Andhra Pradesh, Telangana</td>
                  <td className="p-3 text-amber-300 font-semibold">2 to 4 Days</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-medium">Maharashtra, Gujarat, Central India</td>
                  <td className="p-3 text-amber-300 font-semibold">4 to 7 Days</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-medium">Other Accessible Indian States</td>
                  <td className="p-3 text-amber-300 font-semibold">5 to 9 Days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 italic mt-1">
            * Note: During peak Diwali festival weeks (last 10 days before Deepavali), transport corridors experience heavy volume. We recommend ordering at least 2 weeks in advance.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-amber-300">4. Freight Charges</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Transport charges depend on the consignment weight, box volume, and destination distance. Freight can be paid directly to the transport company upon collection (To-Pay basis) or billed into your order during WhatsApp verification.
          </p>
        </section>
      </div>
    </div>
  );
}
