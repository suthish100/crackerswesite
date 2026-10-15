'use client';

import React, { useState, useEffect } from 'react';
import { HeroSlide } from '@/types';
import { DiwaliCountdown } from './DiwaliCountdown';

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoplaySpeed?: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides = [],
  autoplaySpeed = 5,
}) => {
  const [slideList, setSlideList] = useState<HeroSlide[]>(slides);
  const [speed, setSpeed] = useState<number>(autoplaySpeed);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Sync with live site settings saved by admin
  useEffect(() => {
    let isMounted = true;
    const fetchLatestSettings = async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' });
        const data = await res.json();
        if (isMounted && data.success && data.settings?.hero?.slides) {
          setSlideList(data.settings.hero.slides);
          if (data.settings.hero.autoplaySpeed) {
            setSpeed(data.settings.hero.autoplaySpeed);
          }
        }
      } catch (err) {
        console.warn('Could not sync latest hero slide settings:', err);
      }
    };

    fetchLatestSettings();

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'site-settings-updated') {
        fetchLatestSettings();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const activeSlides = slideList.filter((s) => s.isActive);

  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, speed * 1000);

    return () => clearInterval(timer);
  }, [activeSlides.length, isPaused, speed]);

  if (activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white shadow-2xl border border-amber-500/20"
    >
      {/* Slide Image from Admin Panel or default image */}
      {currentSlide.imageUrl && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title || 'Festive Fireworks Banner'}
            className="w-full h-full object-cover object-center transition-all duration-700"
          />
          {/* Gradient overlay to ensure text contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />
        </div>
      )}

      {/* Background festive ambient glow and sparkles */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-orange-600/10 to-transparent z-1" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl z-1" />
      <div className="pointer-events-none absolute top-10 left-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl z-1" />

      {/* Main Content Layout: Compact mobile padding and proportion matching design */}
      <div className="relative z-10 mx-auto max-w-7xl px-3 py-3.5 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-center">
          {/* Left Column: Rolling Promotional Text & Eyebrow */}
          <div className="lg:col-span-7 space-y-2 sm:space-y-3.5 text-center sm:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-amber-300 backdrop-blur-md shadow-xs">
              <span>✦</span>
              <span>{currentSlide.subtitle || 'SIVAKASI • PREMIUM FIREWORKS'}</span>
              <span>✦</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-xl sm:text-3xl lg:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md">
              {currentSlide.title || 'LIGHT UP YOUR CELEBRATION'}
            </h1>

            {/* Supporting Text */}
            <p className="max-w-xl text-xs sm:text-sm sm:leading-relaxed text-amber-100/90 font-medium line-clamp-2 sm:line-clamp-none">
              {currentSlide.description ||
                'Discover crackers and festive combos from Sivakasi. Best quality. Great offers direct from factory.'}
            </p>

            {/* Highlight Badges (hidden on mobile to keep banner compact, visible on tablet/desktop) */}
            <div className="pt-1 hidden sm:flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-amber-200">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs font-bold">
                <span>🏭</span> Factory Direct Rates
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs font-bold">
                <span>🌿</span> CSIR-NEERI Green Certified
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs font-bold">
                <span>🚚</span> All Tamil Nadu Delivery
              </span>
            </div>
          </div>

          {/* Right Column: Cartoon-Style Diwali Countdown Calendar */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <DiwaliCountdown className="w-full max-w-sm sm:max-w-md" />
          </div>
        </div>

        {/* Carousel Slide Indicators Centered at Bottom */}
        {activeSlides.length > 1 && (
          <div className="mt-3 sm:mt-5 flex items-center justify-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-5 sm:w-6 bg-amber-400 shadow-xs'
                    : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Left & Right Side Navigation Arrows matching reference screenshot */}
        {activeSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20 font-black text-xs sm:text-base"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20 font-black text-xs sm:text-base"
              aria-label="Next slide"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
};
