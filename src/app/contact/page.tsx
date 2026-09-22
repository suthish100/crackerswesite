import React from 'react';
import Link from 'next/link';
import { ORDER_SUPPORT_PHONE, normalizeIndianPhone } from '@/lib/utils';

export const metadata = {
  title: 'Contact Us & Grievance Redressal | Sivakasi Crackers',
  description: 'Customer contact channels and statutory Grievance Officer details for Sivakasi Crackers.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <Link href="/" className="text-amber-400 text-xs font-semibold hover:underline mb-2 inline-block">
            ← Back to Storefront
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Contact Us & Grievance Redressal</h1>
          <p className="text-xs text-slate-400 mt-2">
            Customer support desk & statutory officer details under Consumer Protection (E-Commerce) Rules, 2020.
          </p>
        </div>

        {/* Quick Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <span className="text-2xl">💬</span>
            <h2 className="text-base font-bold text-white">WhatsApp Order Support</h2>
            <p className="text-xs text-slate-400">
              For instant order verification, product queries, bulk quotation, and transport status:
            </p>
            <a
              href={`https://wa.me/${normalizeIndianPhone(ORDER_SUPPORT_PHONE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
            >
              <span>📲</span> Chat on WhatsApp (+91 {ORDER_SUPPORT_PHONE})
            </a>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <span className="text-2xl">🏭</span>
            <h2 className="text-base font-bold text-white">Depot & Dispatch Facility</h2>
            <p className="text-xs text-slate-400">
              Direct factory supply unit:
            </p>
            <div className="text-xs text-slate-300 font-medium">
              Sivakasi Fireworks Industrial Zone<br />
              Sivakasi, Virudhunagar District<br />
              Tamil Nadu – 626123, India
            </div>
          </div>
        </div>

        {/* Statutory Grievance Redressal */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h2 className="text-base font-bold text-amber-300">Statutory Grievance Redressal Officer</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In compliance with Rule 5(9) of the Consumer Protection (E-Commerce) Rules, 2020, consumers may submit complaints or consumer grievances directly to our appointed officer:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-slate-500 font-bold uppercase text-[10px]">Officer Designation</p>
              <p className="text-white font-medium mt-0.5">Nodal Grievance Officer</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase text-[10px]">Helpline Phone</p>
              <p className="text-amber-400 font-mono font-medium mt-0.5">+91 {ORDER_SUPPORT_PHONE}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase text-[10px]">Office Hours</p>
              <p className="text-white font-medium mt-0.5">Mon – Sat, 9:00 AM – 7:00 PM IST</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase text-[10px]">Redressal Timelines</p>
              <p className="text-emerald-400 font-medium mt-0.5">Ack: &le; 48 hours | Resolution: &le; 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
