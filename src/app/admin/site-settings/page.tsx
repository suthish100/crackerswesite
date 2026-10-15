'use client';

import React, { useState, useEffect } from 'react';
import { SiteSettings, HeroSlide, Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'ticker' | 'hero' | 'header' | 'bestsellers' | 'banner' | 'preview'>('ticker');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;
    void (async () => {
      try {
        const [resSettings, resProducts] = await Promise.all([
          fetch('/api/admin/site-settings'),
          fetch('/api/admin/products'),
        ]);
        const dataSettings = await resSettings.json();
        const dataProducts = await resProducts.json();
        if (!isCancelled && dataSettings.success && dataSettings.settings) {
          setSettings(dataSettings.settings);
        }
        if (!isCancelled && dataProducts.success && dataProducts.products) {
          setProducts(dataProducts.products);
        }
      } catch {
        if (!isCancelled) {
          setStatusMsg({ type: 'error', text: 'Error loading settings or products' });
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setStatusMsg(null);

      // Validate destination URL logic
      const payload: SiteSettings = {
        ...settings,
        ticker: {
          ...settings.ticker,
          isClickable: Boolean(settings.ticker.isClickable && settings.ticker.destinationUrl?.trim()),
        },
      };

      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setStatusMsg({ type: 'success', text: 'Settings successfully published to the live store!' });
        try {
          localStorage.setItem('site-settings-updated', Date.now().toString());
        } catch {}
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to save settings' });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: 'Failed to save settings due to network error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('Are you sure you want to restore default ticker and hero banner settings?')) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/site-settings/restore', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setStatusMsg({ type: 'success', text: 'Default settings successfully restored and published!' });
        try {
          localStorage.setItem('site-settings-updated', Date.now().toString());
        } catch {}
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to restore defaults' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Network error restoring defaults' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, slideIndex: number) => {
    try {
      setUploadingIndex(slideIndex);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        handleSlideChange(slideIndex, 'imageUrl', data.url);
        setStatusMsg({ type: 'success', text: 'Hero image uploaded successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to upload image' });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: 'Error uploading image' });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: unknown) => {
    if (!settings) return;
    const slides = [...settings.hero.slides];
    slides[index] = { ...slides[index], [field]: value };
    setSettings({
      ...settings,
      hero: { ...settings.hero, slides },
    });
  };

  const handleAddSlide = () => {
    if (!settings) return;
    const newSlide: HeroSlide = {
      id: `hero-slide-${Date.now()}`,
      title: 'FESTIVE FIREWORKS CELEBRATION',
      subtitle: 'SIVAKASI DIRECT WHOLESALE',
      description: 'Handcrafted standard crackers for brilliant festivities and family joy.',
      imageUrl: '/images/hero_combos_ref.png',
      isActive: true,
      sortOrder: settings.hero.slides.length,
    };
    setSettings({
      ...settings,
      hero: {
        ...settings.hero,
        slides: [...settings.hero.slides, newSlide],
      },
    });
  };

  const handleRemoveSlide = (index: number) => {
    if (!settings) return;
    if (settings.hero.slides.length <= 1) {
      alert('You must keep at least one slide in the hero banner.');
      return;
    }
    const slides = settings.hero.slides.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      hero: { ...settings.hero, slides },
    });
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (!settings) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= settings.hero.slides.length) return;
    const slides = [...settings.hero.slides];
    const temp = slides[index];
    slides[index] = slides[newIndex];
    slides[newIndex] = temp;
    // Update sort order
    slides.forEach((s, idx) => (s.sortOrder = idx));
    setSettings({
      ...settings,
      hero: { ...settings.hero, slides },
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-semibold">Loading banner and ticker settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Page Title & Save Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">
            <span>📢</span> Storefront Content Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Promotional Ticker & Hero Banner</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure homepage banners, top discount ticker, and public copy without code edits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save & Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{statusMsg.type === 'success' ? '✓ ' : '⚠️ '}{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ticker')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ticker'
              ? 'border-slate-900 text-slate-900 bg-slate-100/60'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>⚡</span>
          <span>Top Promotional Ticker</span>
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hero'
              ? 'border-slate-900 text-slate-900 bg-slate-100/60'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>🎠</span>
          <span>Hero Banner Carousel ({settings.hero.slides.length} slides)</span>
        </button>
        <button
          onClick={() => setActiveTab('header')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'header'
              ? 'border-slate-900 text-slate-900 bg-slate-100/60'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>🏷️</span>
          <span>Header Brand Copy</span>
        </button>
        <button
          onClick={() => setActiveTab('bestsellers')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bestsellers'
              ? 'border-slate-900 text-slate-900 bg-slate-100/60'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>🔥</span>
          <span>Best Sellers Selection ({settings.bestSellers?.productIds?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'banner'
              ? 'border-slate-900 text-slate-900 bg-slate-100/60'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>🎬</span>
          <span>Video & Banner Slot</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-slate-900 text-slate-900 bg-slate-100/60'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>👁️</span>
          <span>Live Storefront Preview</span>
        </button>
      </div>

      {/* Tab 1: Promotional Ticker */}
      {activeTab === 'ticker' && (
        <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Promotional Ticker Settings</h2>
              <p className="text-xs text-slate-500">Controls the rolling top alert bar across customer-facing pages.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-xs font-bold text-slate-700">
                {settings.ticker.enabled ? 'Ticker Active' : 'Ticker Disabled'}
              </span>
              <input
                type="checkbox"
                checked={settings.ticker.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ticker: { ...settings.ticker, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 accent-slate-900 rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Promotional Text <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={settings.ticker.text}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ticker: { ...settings.ticker, text: e.target.value },
                  })
                }
                placeholder="e.g. UP TO 70% DISCOUNT ON ELIGIBLE CRACKERS"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Tip: Clearly specify &quot;UP TO 70% DISCOUNT ON ELIGIBLE CRACKERS&quot; to keep offers accurate and transparent.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tag / Badge Text
              </label>
              <input
                type="text"
                value={settings.ticker.tag}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ticker: { ...settings.ticker, tag: e.target.value },
                  })
                }
                placeholder="e.g. SPECIAL OFFER"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Icon
              </label>
              <input
                type="text"
                value={settings.ticker.icon}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ticker: { ...settings.ticker, icon: e.target.value },
                  })
                }
                placeholder="e.g. 💥"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Action Link Text
              </label>
              <input
                type="text"
                value={settings.ticker.linkText}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ticker: { ...settings.ticker, linkText: e.target.value },
                  })
                }
                placeholder="e.g. Shop Deals"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Destination URL / Route
              </label>
              <input
                type="text"
                value={settings.ticker.destinationUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ticker: { ...settings.ticker, destinationUrl: e.target.value },
                  })
                }
                placeholder="e.g. /products"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ticker.isClickable && Boolean(settings.ticker.destinationUrl?.trim())}
                  disabled={!settings.ticker.destinationUrl?.trim()}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ticker: { ...settings.ticker, isClickable: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-slate-900 rounded"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Enable Click Action on Ticker (disabled automatically if destination is empty)
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Live Ticker Preview</h3>
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 rounded-xl p-3 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs">
              <span>{settings.ticker.icon}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase">
                {settings.ticker.tag}
              </span>
              <span>{settings.ticker.text}</span>
              {settings.ticker.isClickable && settings.ticker.destinationUrl && (
                <span className="underline decoration-amber-200 underline-offset-2 font-bold ml-1">
                  {settings.ticker.linkText} →
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hero Banner Carousel */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs text-slate-900">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hero Banner Carousel Slides</h2>
              <p className="text-xs text-slate-500">
                Manage rolling slides on the homepage. Notice: per specification, no &quot;Start Shopping&quot; button inside the hero.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shrink-0 shadow-md shadow-slate-900/10"
            >
              + Add New Slide
            </button>
          </div>

          {/* Slides List */}
          <div className="space-y-4">
            {settings.hero.slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs text-slate-900"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center border border-slate-200">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs">{slide.title || 'Untitled Slide'}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        slide.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {slide.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, 'up')}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs disabled:opacity-30 border border-slate-200"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={idx === settings.hero.slides.length - 1}
                      onClick={() => handleMoveSlide(idx, 'down')}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs disabled:opacity-30 border border-slate-200"
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 ml-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.isActive}
                        onChange={(e) => handleSlideChange(idx, 'isActive', e.target.checked)}
                        className="w-4 h-4 accent-slate-900 rounded"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs ml-2 border border-rose-200"
                      title="Delete Slide"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Left: Image Upload & Preview */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Slide Image
                    </label>
                    <div className="relative aspect-video rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {slide.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400">No Image</span>
                      )}
                      {uploadingIndex === idx && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-xs text-white font-bold">
                          Uploading...
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <label className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors border border-slate-200">
                        Upload New Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, idx);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Right: Slide Text Fields */}
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Eyebrow / Subtitle
                      </label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => handleSlideChange(idx, 'subtitle', e.target.value)}
                        placeholder="e.g. SIVAKASI • PREMIUM FIREWORKS"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Main Heading
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                        placeholder="e.g. LIGHT UP YOUR CELEBRATION"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Supporting Promotional Text
                      </label>
                      <textarea
                        rows={2}
                        value={slide.description}
                        onChange={(e) => handleSlideChange(idx, 'description', e.target.value)}
                        placeholder="e.g. Discover crackers and festive combos from Sivakasi..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Header Brand Copy */}
      {activeTab === 'header' && (
        <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs text-slate-900">
          <div>
            <h2 className="text-base font-bold text-slate-900">Header & Brand Copy</h2>
            <p className="text-xs text-slate-500">Configure brand text displayed in the persistent navbar.</p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Brand Title
              </label>
              <input
                type="text"
                value={settings.header.brandTitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    header: { ...settings.header, brandTitle: e.target.value },
                  })
                }
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Brand Subtitle / Tagline
              </label>
              <input
                type="text"
                value={settings.header.brandSubtitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    header: { ...settings.header, brandSubtitle: e.target.value },
                  })
                }
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Best Sellers Selection */}
      {activeTab === 'bestsellers' && (
        <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs text-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Homepage Best Sellers Selection</h2>
              <p className="text-xs text-slate-500">
                Choose which products appear in the compact Best Sellers row directly beneath the 4 quick action buttons.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-700">Enable Section</span>
              <input
                type="checkbox"
                checked={settings.bestSellers?.enabled ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bestSellers: {
                      title: settings.bestSellers?.title || 'Popular Sivakasi Best Sellers',
                      subtitle: settings.bestSellers?.subtitle || 'Handcrafted festive favorites straight from the heartland godown',
                      enabled: e.target.checked,
                      productIds: settings.bestSellers?.productIds || [],
                    },
                  })
                }
                className="w-5 h-5 accent-slate-900 rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={settings.bestSellers?.title || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bestSellers: {
                      ...settings.bestSellers,
                      title: e.target.value,
                      subtitle: settings.bestSellers?.subtitle || '',
                      enabled: settings.bestSellers?.enabled ?? true,
                      productIds: settings.bestSellers?.productIds || [],
                    },
                  })
                }
                placeholder="e.g. Popular Sivakasi Best Sellers"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Section Subtitle
              </label>
              <input
                type="text"
                value={settings.bestSellers?.subtitle || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bestSellers: {
                      ...settings.bestSellers,
                      title: settings.bestSellers?.title || 'Popular Sivakasi Best Sellers',
                      subtitle: e.target.value,
                      enabled: settings.bestSellers?.enabled ?? true,
                      productIds: settings.bestSellers?.productIds || [],
                    },
                  })
                }
                placeholder="e.g. Handcrafted festive favorites"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Currently Selected Products Counter */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-amber-900">
                Selected Best Sellers ({settings.bestSellers?.productIds?.length || 0})
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {(settings.bestSellers?.productIds?.length || 0) === 0
                  ? 'No specific products pinned. The storefront will automatically display the top 4 featured products.'
                  : 'Pinned items will display first in the homepage Best Sellers grid.'}
              </p>
            </div>
            {(settings.bestSellers?.productIds?.length || 0) > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    bestSellers: {
                      ...settings.bestSellers!,
                      productIds: [],
                    },
                  })
                }
                className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 bg-white border border-rose-200 rounded-xl transition-colors"
              >
                Clear All Selections
              </button>
            )}
          </div>

          {/* Product Picker */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Best Seller Products
              </h3>
              <input
                type="text"
                placeholder="Search catalog by name or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 w-full sm:w-64"
              />
            </div>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {products
                .filter(
                  (p) =>
                    !productSearch ||
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    (p.category?.name && p.category.name.toLowerCase().includes(productSearch.toLowerCase()))
                )
                .map((product) => {
                  const isSelected = (settings.bestSellers?.productIds || []).includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        const currentIds = settings.bestSellers?.productIds || [];
                        const nextIds = isSelected
                          ? currentIds.filter((id) => id !== product.id)
                          : [...currentIds, product.id];
                        setSettings({
                          ...settings,
                          bestSellers: {
                            title: settings.bestSellers?.title || 'Popular Sivakasi Best Sellers',
                            subtitle: settings.bestSellers?.subtitle || '',
                            enabled: settings.bestSellers?.enabled ?? true,
                            productIds: nextIds,
                          },
                        });
                      }}
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50/50 hover:bg-amber-100/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by row click
                          className="w-4 h-4 accent-amber-600 rounded"
                        />
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-base">🧨</span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">{product.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {product.category?.name || 'Crackers'} &bull; {formatPrice(product.price)}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ Best Seller' : 'Select'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Animated Video / Banner Placeholder */}
      {activeTab === 'banner' && (
        <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs text-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Animated Video &amp; Promo Banner Slot</h2>
              <p className="text-xs text-slate-500">
                Configure the promotional placeholder below the Best Sellers section for festival videos, animations, or announcement banners.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-700">Enable Slot</span>
              <input
                type="checkbox"
                checked={settings.promoBanner?.enabled ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promoBanner: {
                      mediaType: settings.promoBanner?.mediaType || 'video',
                      mediaUrl: settings.promoBanner?.mediaUrl || '',
                      posterUrl: settings.promoBanner?.posterUrl || '',
                      title: settings.promoBanner?.title || "Experience Sivakasi's Sparkling Celebrations",
                      subtitle: settings.promoBanner?.subtitle || 'Watch the magic unfold or explore our curated festival collections.',
                      badgeText: settings.promoBanner?.badgeText || 'DIWALI 2026 SPECIAL',
                      buttonText: settings.promoBanner?.buttonText || 'Explore All Crackers',
                      buttonLink: settings.promoBanner?.buttonLink || '/products',
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 accent-slate-900 rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Media Type
              </label>
              <select
                value={settings.promoBanner?.mediaType || 'video'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promoBanner: {
                      mediaType: e.target.value as 'video' | 'image',
                      mediaUrl: settings.promoBanner?.mediaUrl || '',
                      posterUrl: settings.promoBanner?.posterUrl || '',
                      title: settings.promoBanner?.title || "Experience Sivakasi's Sparkling Celebrations",
                      subtitle: settings.promoBanner?.subtitle || '',
                      badgeText: settings.promoBanner?.badgeText || '',
                      buttonText: settings.promoBanner?.buttonText || 'Explore All Crackers',
                      buttonLink: settings.promoBanner?.buttonLink || '/products',
                      enabled: settings.promoBanner?.enabled ?? true,
                    },
                  })
                }
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="video">🎬 Animated Video (MP4 / WebM / Embed)</option>
                <option value="image">🖼️ Static or Animated Banner (GIF / PNG / JPG)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Badge / Tag Text
              </label>
              <input
                type="text"
                value={settings.promoBanner?.badgeText || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promoBanner: {
                      ...settings.promoBanner,
                      mediaType: settings.promoBanner?.mediaType || 'video',
                      mediaUrl: settings.promoBanner?.mediaUrl || '',
                      posterUrl: settings.promoBanner?.posterUrl || '',
                      title: settings.promoBanner?.title || '',
                      subtitle: settings.promoBanner?.subtitle || '',
                      badgeText: e.target.value,
                      buttonText: settings.promoBanner?.buttonText || 'Explore All Crackers',
                      buttonLink: settings.promoBanner?.buttonLink || '/products',
                      enabled: settings.promoBanner?.enabled ?? true,
                    },
                  })
                }
                placeholder="e.g. DIWALI 2026 SPECIAL"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Media File URL (MP4 / WebM / Image / GIF)
              </label>
              <input
                type="text"
                value={settings.promoBanner?.mediaUrl || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promoBanner: {
                      ...settings.promoBanner,
                      mediaType: settings.promoBanner?.mediaType || 'video',
                      mediaUrl: e.target.value,
                      posterUrl: settings.promoBanner?.posterUrl || '',
                      title: settings.promoBanner?.title || '',
                      subtitle: settings.promoBanner?.subtitle || '',
                      badgeText: settings.promoBanner?.badgeText || '',
                      buttonText: settings.promoBanner?.buttonText || 'Explore All Crackers',
                      buttonLink: settings.promoBanner?.buttonLink || '/products',
                      enabled: settings.promoBanner?.enabled ?? true,
                    },
                  })
                }
                placeholder="e.g. /videos/festive-diwali.mp4 or https://cdn.example.com/banner.gif"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                If left empty, a stylish animated placeholder card will guide visitors or prompt content upload.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Banner Headline
              </label>
              <input
                type="text"
                value={settings.promoBanner?.title || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promoBanner: {
                      ...settings.promoBanner,
                      mediaType: settings.promoBanner?.mediaType || 'video',
                      mediaUrl: settings.promoBanner?.mediaUrl || '',
                      posterUrl: settings.promoBanner?.posterUrl || '',
                      title: e.target.value,
                      subtitle: settings.promoBanner?.subtitle || '',
                      badgeText: settings.promoBanner?.badgeText || '',
                      buttonText: settings.promoBanner?.buttonText || 'Explore All Crackers',
                      buttonLink: settings.promoBanner?.buttonLink || '/products',
                      enabled: settings.promoBanner?.enabled ?? true,
                    },
                  })
                }
                placeholder="e.g. Experience Sivakasi's Sparkling Celebrations"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Banner Subtitle / Description
              </label>
              <input
                type="text"
                value={settings.promoBanner?.subtitle || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promoBanner: {
                      ...settings.promoBanner,
                      mediaType: settings.promoBanner?.mediaType || 'video',
                      mediaUrl: settings.promoBanner?.mediaUrl || '',
                      posterUrl: settings.promoBanner?.posterUrl || '',
                      title: settings.promoBanner?.title || '',
                      subtitle: e.target.value,
                      badgeText: settings.promoBanner?.badgeText || '',
                      buttonText: settings.promoBanner?.buttonText || 'Explore All Crackers',
                      buttonLink: settings.promoBanner?.buttonLink || '/products',
                      enabled: settings.promoBanner?.enabled ?? true,
                    },
                  })
                }
                placeholder="e.g. Direct factory shipments guaranteed to light up your festivities safely."
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Call to Action Button Text
              </label>
              <input
                type="text"
                value={settings.promoBanner?.buttonText || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promoBanner: {
                      ...settings.promoBanner,
                      mediaType: settings.promoBanner?.mediaType || 'video',
                      mediaUrl: settings.promoBanner?.mediaUrl || '',
                      posterUrl: settings.promoBanner?.posterUrl || '',
                      title: settings.promoBanner?.title || '',
                      subtitle: settings.promoBanner?.subtitle || '',
                      badgeText: settings.promoBanner?.badgeText || '',
                      buttonText: e.target.value,
                      buttonLink: settings.promoBanner?.buttonLink || '/products',
                      enabled: settings.promoBanner?.enabled ?? true,
                    },
                  })
                }
                placeholder="e.g. Explore All Crackers"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Button Destination URL
              </label>
              <input
                type="text"
                value={settings.promoBanner?.buttonLink || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promoBanner: {
                      ...settings.promoBanner,
                      mediaType: settings.promoBanner?.mediaType || 'video',
                      mediaUrl: settings.promoBanner?.mediaUrl || '',
                      posterUrl: settings.promoBanner?.posterUrl || '',
                      title: settings.promoBanner?.title || '',
                      subtitle: settings.promoBanner?.subtitle || '',
                      badgeText: settings.promoBanner?.badgeText || '',
                      buttonText: settings.promoBanner?.buttonText || 'Explore All Crackers',
                      buttonLink: e.target.value,
                      enabled: settings.promoBanner?.enabled ?? true,
                    },
                  })
                }
                placeholder="e.g. /products or /combos"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Storefront Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Storefront Preview</h2>
              <p className="text-xs text-slate-500">Preview how your configured ticker and hero banner will appear to customers.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewViewport('desktop')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewViewport === 'desktop' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🖥️ Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport('mobile')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewViewport === 'mobile' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📱 Mobile
              </button>
            </div>
          </div>

          <div className="flex justify-center p-4 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            <div
              className={`transition-all duration-300 bg-[#FAF7F2] text-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-xl ${
                previewViewport === 'mobile' ? 'w-[380px]' : 'w-full max-w-4xl'
              }`}
            >
              {/* Ticker preview */}
              {settings.ticker.enabled && (
                <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white text-xs font-semibold py-2 px-3 text-center flex items-center justify-center gap-2">
                  <span>{settings.ticker.icon}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                    {settings.ticker.tag}
                  </span>
                  <span className="truncate">{settings.ticker.text}</span>
                  {settings.ticker.isClickable && settings.ticker.destinationUrl && (
                    <span className="underline font-bold text-[11px] shrink-0">{settings.ticker.linkText} →</span>
                  )}
                </div>
              )}

              {/* Header preview */}
              <div className="bg-white/95 border-b border-amber-200/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    ✦
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{settings.header.brandTitle}</div>
                    <div className="text-[9px] uppercase font-bold text-amber-700">{settings.header.brandSubtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-[10px] font-black">
                    ⚡ Quick Order
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-bold">
                    Bag
                  </span>
                </div>
              </div>

              {/* Hero preview */}
              {settings.hero.slides[0] && (
                <div className="p-6 bg-gradient-to-b from-amber-50/60 to-white border-b border-amber-200/60">
                  <div className="max-w-md space-y-2">
                    <span className="text-[10px] font-black tracking-widest text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full inline-block uppercase">
                      {settings.hero.slides[0].subtitle}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {settings.hero.slides[0].title}
                    </h2>
                    <p className="text-xs text-slate-600">
                      {settings.hero.slides[0].description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
