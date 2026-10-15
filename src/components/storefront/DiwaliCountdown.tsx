'use client';

import React, { useSyncExternalStore } from 'react';

// Diwali 2026: November 8, 2026, 00:00:00 IST (UTC+05:30)
const DIWALI_TARGET_TIMESTAMP = new Date('2026-11-08T00:00:00+05:30').getTime();

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

function getSnapshot(): string {
  const diff = DIWALI_TARGET_TIMESTAMP - Date.now();
  if (diff <= 0) return '0:0:0:0:1';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return `${d}:${h}:${m}:${s}:0`;
}

function getServerSnapshot(): string {
  return '';
}

export const DiwaliCountdown: React.FC<{ className?: string }> = ({ className = '' }) => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = snapshot !== '';
  const [days, hours, minutes, seconds, expired] = mounted
    ? snapshot.split(':').map(Number)
    : [0, 0, 0, 0, 0];
  const isExpired = Boolean(expired);

  const padZero = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-50 via-white to-amber-100/90 p-2.5 sm:p-4 border-2 border-amber-400 shadow-xl shadow-amber-900/10 text-slate-900 max-w-sm sm:max-w-md mx-auto select-none overflow-hidden transition-transform duration-300 hover:scale-[1.01] ${className}`}
    >
      {/* Decorative top rings / calendar hooks */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-8 sm:gap-14">
        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 -mt-1 sm:-mt-1.5 rounded-full bg-slate-800 border-2 border-amber-300 shadow-xs" />
        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 -mt-1 sm:-mt-1.5 rounded-full bg-slate-800 border-2 border-amber-300 shadow-xs" />
      </div>

      {/* Background festive sparkle accents */}
      <div className="pointer-events-none absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-amber-400/20 rounded-full blur-xl" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 w-16 h-16 sm:w-20 sm:h-20 bg-orange-400/20 rounded-full blur-xl" />

      {/* Floating cartoon stars */}
      <span aria-hidden="true" className="absolute top-1.5 sm:top-2.5 left-2 sm:left-3 text-amber-500 animate-pulse text-[10px] sm:text-xs">
        ✨
      </span>
      <span aria-hidden="true" className="absolute top-1.5 sm:top-2.5 right-2 sm:right-3 text-amber-500 animate-pulse delay-300 text-[10px] sm:text-xs">
        ✨
      </span>

      {/* Calendar Header */}
      <div className="text-center pt-1 sm:pt-1.5 pb-1 sm:pb-1.5 border-b border-amber-200/80">
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-[0.2em] text-rose-700">
          <span className="text-xs sm:text-base animate-bounce">🪔</span>
          <span>DIWALI COUNTDOWN</span>
          <span className="text-xs sm:text-base animate-bounce delay-150">🪔</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 mt-0.5 sm:mt-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white font-extrabold text-[9px] sm:text-xs shadow-xs tracking-wide">
          <span>📅</span>
          <span>November 8, 2026 (IST)</span>
        </div>
      </div>

      {/* Timer digits or expired celebration */}
      {isExpired ? (
        <div className="py-2.5 sm:py-4 text-center">
          <div className="text-lg sm:text-2xl font-black text-rose-600 animate-bounce">
            🎉 HAPPY DIWALI! 🪔
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-amber-800 mt-0.5 sm:mt-1">
            May your celebrations shine bright with Sivakasi Crackers!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 pt-1.5 sm:pt-2.5 text-center">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="w-full py-1 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 text-amber-300 font-black text-sm sm:text-xl lg:text-2xl shadow-md border-b-2 border-slate-950 font-mono tracking-tight flex items-center justify-center relative overflow-hidden group">
              <span className="relative z-10">{mounted ? padZero(days) : '--'}</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700/80" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-700 mt-0.5 sm:mt-1">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-full py-1 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 text-amber-300 font-black text-sm sm:text-xl lg:text-2xl shadow-md border-b-2 border-slate-950 font-mono tracking-tight flex items-center justify-center relative overflow-hidden">
              <span className="relative z-10">{mounted ? padZero(hours) : '--'}</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700/80" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-700 mt-0.5 sm:mt-1">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-full py-1 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 text-amber-300 font-black text-sm sm:text-xl lg:text-2xl shadow-md border-b-2 border-slate-950 font-mono tracking-tight flex items-center justify-center relative overflow-hidden">
              <span className="relative z-10">{mounted ? padZero(minutes) : '--'}</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700/80" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-700 mt-0.5 sm:mt-1">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="w-full py-1 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-rose-900 to-rose-950 text-rose-200 font-black text-sm sm:text-xl lg:text-2xl shadow-md border-b-2 border-black font-mono tracking-tight flex items-center justify-center relative overflow-hidden animate-pulse">
              <span className="relative z-10">{mounted ? padZero(seconds) : '--'}</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-rose-800/80" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-rose-800 mt-0.5 sm:mt-1">
              Seconds
            </span>
          </div>
        </div>
      )}

      {/* Bottom festive tag */}
      <div className="mt-1.5 pt-1 sm:mt-2.5 sm:pt-2 border-t border-amber-200/60 hidden sm:flex items-center justify-between text-[10px] font-semibold text-slate-600">
        <span className="flex items-center gap-1 text-amber-800">
          <span>✨</span> Standard Sivakasi Fireworks
        </span>
        <span className="text-amber-700 font-bold">100% Green Certified</span>
      </div>
    </div>
  );
};
