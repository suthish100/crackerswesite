'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ORDER_SUPPORT_PHONE, normalizeIndianPhone } from '@/lib/utils';

const CITIES = [
  { name: 'Chennai', region: 'North TN', hub: 'Direct Parcel Hub' },
  { name: 'Coimbatore', region: 'West TN', hub: 'Kongu Transport' },
  { name: 'Madurai', region: 'South TN', hub: 'City Godown' },
  { name: 'Tiruchirappalli', region: 'Central TN', hub: 'Central Depot' },
  { name: 'Salem', region: 'North-West TN', hub: 'Junction Office' },
  { name: 'Erode', region: 'West TN', hub: 'Perundurai Hub' },
  { name: 'Vellore', region: 'North TN', hub: 'Town Depot' },
  { name: 'Thanjavur', region: 'Delta TN', hub: 'Old Bus Stand Godown' },
  { name: 'Tirunelveli', region: 'Deep South', hub: 'Palayamkottai Hub' },
  { name: 'Nagercoil', region: 'Kanyakumari', hub: 'Vadasery Depot' },
];

export const TamilNaduDeliveryMap: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#090D1A] via-[#0F172A] to-[#0B0F19] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-amber-500/20">
      {/* Background fireworks ambiance */}
      <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* Section Header matching input_file_3 */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1 text-xs font-black uppercase tracking-[0.22em] text-amber-300 shadow-sm backdrop-blur-md">
            <span>✨</span>
            <span>TAMIL NADU STATEWIDE FULFILLMENT</span>
            <span>✨</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 tracking-tight">
            From Sivakasi to Every Corner of Tamil Nadu
          </h2>

          <div className="flex items-center justify-center gap-3 py-1">
            <span className="h-px w-12 bg-amber-500/50" />
            <span className="text-amber-400 text-sm">✦ 🪔 ✦</span>
            <span className="h-px w-12 bg-amber-500/50" />
          </div>

          <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl mx-auto font-medium">
            Lighting up Tamil Nadu with authentic Sivakasi crackers. Dispatched safely via licensed commercial road transport carriers.
          </p>
        </div>

        {/* Visual Map Layout: Grid with Image on Left & City Hub Info on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl backdrop-blur-md">
          {/* Left: Map Graphic matching input_file_3 reference */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-amber-400/30 shadow-2xl shadow-amber-950/50 max-w-md w-full bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/tn_map_celebration.png"
                alt="From Sivakasi to Every Corner of Tamil Nadu Map"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 inset-x-3 bg-slate-950/80 backdrop-blur-md rounded-xl p-2.5 border border-amber-500/30 text-center">
                <span className="text-[11px] font-bold text-amber-300">
                  📍 Origin Hub: Sivakasi Direct Factory Godown
                </span>
              </div>
            </div>
          </div>

          {/* Right: Key Hubs & Delivery Policy Details */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                <span>🚚</span>
                <span>Select Delivery Destination</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Shipments are sent to the courier / transport centre nearest to your address across Tamil Nadu.
              </p>
            </div>

            {/* City Chips */}
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => setSelectedCity(city.name === selectedCity ? null : city.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCity === city.name
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-amber-400/60 hover:text-white'
                  }`}
                >
                  <span>📍 {city.name}</span>
                </button>
              ))}
            </div>

            {/* Selected City Info or Default Notice */}
            {selectedCity ? (
              <div className="bg-amber-950/40 border border-amber-400/40 rounded-2xl p-4 text-xs space-y-1 animate-fadeIn">
                <div className="font-black text-amber-300 text-sm">
                  Delivery to {selectedCity} Transport Centre
                </div>
                <p className="text-slate-300">
                  Consignments arrive at the licensed road transport godown in {selectedCity} within 24 to 48 hours of Sivakasi dispatch.
                </p>
                <p className="text-amber-200 text-[11px] font-semibold pt-1">
                  Applicable delivery charges will be confirmed before dispatch.
                </p>
              </div>
            ) : null}

            {/* Mandatory Delivery Policy Notice (Specification Section 6) */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-amber-300 uppercase tracking-wider text-[11px]">
                <span>📢</span>
                <span>Official Delivery Notice</span>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">
                &ldquo;Delivery is available across Tamil Nadu. Delivery charges apply and will be included in your order total or shown separately before order confirmation. Your shipment will be sent to the courier centre nearest to your address, or to another courier centre of your choice, subject to availability and confirmation. For delivery details and assistance, please contact us by phone or message.&rdquo;
              </p>
            </div>

            {/* Direct Helpline / Message Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={`https://wa.me/${normalizeIndianPhone(ORDER_SUPPORT_PHONE)}?text=${encodeURIComponent(
                  'Hello Sivakasi Crackers, I would like to check delivery options and charges to my location in Tamil Nadu.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs text-center shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>💬</span>
                <span>WhatsApp Delivery Query</span>
              </a>
              <Link
                href="/shipping-policy"
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center border border-slate-700 transition-colors"
              >
                Full Shipping Policy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
