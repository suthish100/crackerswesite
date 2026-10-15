'use client';

import React from 'react';
import Link from 'next/link';

export const TraditionalShowcase: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-8 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F5EEDB] border-t border-amber-200/70">
      {/* Background festive glow */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-amber-400/15 rounded-full blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/80 px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-900 shadow-xs mb-3">
          <span>🪔</span>
          <span>CELEBRATE WITH SIVAKASI</span>
          <span>🪔</span>
        </div>

        {/* Heading in festive style */}
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Heritage Fireworks Direct from the Heartland
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          For generations, Sivakasi has lit up millions of Indian households. We bring you genuine green crackers manufactured under standard safety guidelines, directly packed and dispatched from Sivakasi factory godowns.
        </p>

        {/* Heritage Temple Skyline Graphic from reference image */}
        <div className="mt-8 relative max-w-3xl mx-auto rounded-3xl overflow-hidden border border-amber-300/60 shadow-lg bg-gradient-to-b from-amber-50 to-orange-100/70 p-2 sm:p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/celebrate_sivakasi_temple.png"
            alt="Celebrate with Sivakasi Temple Heritage Skyline"
            className="w-full h-auto object-cover rounded-2xl drop-shadow-sm"
          />

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <span>🏛️</span> Centuries of Craftsmanship
            </span>
            <span className="flex items-center gap-1.5">
              <span>🪔</span> Authentic Deepavali Traditions
            </span>
            <span className="flex items-center gap-1.5">
              <span>✨</span> 100% PESO & CSIR-NEERI Approved
            </span>
          </div>
        </div>

        {/* Quick link action */}
        <div className="mt-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-black text-amber-800 hover:text-amber-950 transition-colors uppercase tracking-wider"
          >
            <span>Explore All Traditional Fireworks</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
