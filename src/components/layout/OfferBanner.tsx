'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

const OFFERS = [
  {
    icon: '💥',
    tag: 'DIWALI SPECIAL',
    text: 'Flat 75% Factory Direct Discount on all Ready Combos & Crackers!',
    linkText: 'Shop Deals',
    href: '/packages',
  },
  {
    icon: '🚚',
    tag: 'FREE TRANSPORT',
    text: 'Free Regional Hub Dispatch on all celebration orders above ₹3,000!',
    linkText: 'Order Now',
    href: '/products',
  },
  {
    icon: '🎁',
    tag: 'BONUS GIFT',
    text: 'Complimentary box of 10 Electric Sparklers with every Family Combo!',
    linkText: 'Claim Gift',
    href: '/packages',
  },
  {
    icon: '⚡',
    tag: 'FAST DISPATCH',
    text: 'Direct Sivakasi factory dispatch within 24 hours • 100% Certified Green Fireworks',
    linkText: 'Explore',
    href: '/products',
  },
];

export const OfferBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % OFFERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentOffer = OFFERS[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white text-xs font-semibold shadow-sm overflow-hidden"
    >
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + OFFERS.length) % OFFERS.length)}
          className="p-1 rounded-md hover:bg-black/10 transition-colors hidden sm:block text-amber-100"
          aria-label="Previous Offer"
        >
          ‹
        </button>

        {/* Sliding Offer Message */}
        <div className="flex-1 overflow-hidden text-center mx-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="inline-flex items-center justify-center gap-2 truncate max-w-full"
            >
              <span className="text-sm shrink-0">{currentOffer.icon}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shrink-0">
                {currentOffer.tag}
              </span>
              <span className="truncate text-amber-50 text-[11px] sm:text-xs">
                {currentOffer.text}
              </span>
              <Link
                href={currentOffer.href}
                className="hidden sm:inline-block underline decoration-amber-200 underline-offset-2 hover:text-amber-200 transition-colors font-bold shrink-0 ml-1"
              >
                {currentOffer.linkText} →
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % OFFERS.length)}
          className="p-1 rounded-md hover:bg-black/10 transition-colors hidden sm:block text-amber-100"
          aria-label="Next Offer"
        >
          ›
        </button>
      </div>
    </div>
  );
};
