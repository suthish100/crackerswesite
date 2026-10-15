'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettingsDefaults';

export const OfferBanner: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Fetch live settings if available
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {
        // Fall back gracefully to DEFAULT_SITE_SETTINGS
      });
  }, []);

  const ticker = settings.ticker;

  // Build items array
  const items = (ticker.items && ticker.items.length > 0)
    ? ticker.items
    : [
        {
          id: 'default-1',
          tag: ticker.tag || 'SPECIAL OFFER',
          text: ticker.text || 'UP TO 70% DISCOUNT ON ELIGIBLE CRACKERS',
          linkText: ticker.linkText || 'Shop Deals',
          destinationUrl: ticker.destinationUrl || '/products',
          isClickable: ticker.isClickable,
        },
      ];

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  if (!ticker.enabled || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];
  const isClickable = Boolean(currentItem.isClickable && currentItem.destinationUrl?.trim());

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-50 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs font-bold shadow-xs select-none"
    >
      <div className="mx-auto flex h-9 sm:h-10 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left Gift Icon */}
        <div className="flex items-center gap-1.5 shrink-0 text-base">
          <span>🎁</span>
        </div>

        {/* Center Promotional Message */}
        <div className="flex-1 overflow-hidden text-center mx-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="inline-flex items-center justify-center gap-2 truncate max-w-full"
            >
              {isClickable ? (
                <Link
                  href={currentItem.destinationUrl}
                  className="inline-flex items-center gap-2 text-white hover:text-amber-100 transition-colors uppercase tracking-wider text-[11px] sm:text-xs font-black truncate"
                >
                  <span className="truncate">{currentItem.text}</span>
                </Link>
              ) : (
                <span className="text-white uppercase tracking-wider text-[11px] sm:text-xs font-black truncate">
                  {currentItem.text}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow / Action */}
        <div className="flex items-center gap-1 shrink-0">
          {isClickable ? (
            <Link
              href={currentItem.destinationUrl}
              className="p-1 rounded hover:bg-black/10 transition-colors text-white font-bold text-sm sm:text-base flex items-center"
              aria-label="View offer details"
            >
              →
            </Link>
          ) : (
            <span className="text-white/80 text-sm">→</span>
          )}
        </div>
      </div>
    </div>
  );
};
