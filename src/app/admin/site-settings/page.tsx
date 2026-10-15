'use client';

import React, { useState, useEffect } from 'react';
import { SiteSettings, HeroSlide } from '@/types';

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'ticker' | 'hero' | 'header' | 'preview'>('ticker');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/admin/site-settings');
        const data = await res.json();
        if (!isCancelled && data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch {
        if (!isCancelled) {
          setStatusMsg({ type: 'error', text: 'Error loading settings' });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>📢</span> Storefront Content Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Promotional Ticker & Hero Banner</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Configure homepage banners, top discount ticker, and public copy without code edits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all disabled:opacity-50"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <span>{statusMsg.type === 'success' ? '✓ ' : '⚠️ '}{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('ticker')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ticker'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>⚡</span>
          <span>Top Promotional Ticker</span>
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hero'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🎠</span>
          <span>Hero Banner Carousel ({settings.hero.slides.length} slides)</span>
        </button>
        <button
          onClick={() => setActiveTab('header')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'header'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🏷️</span>
          <span>Header Brand Copy</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>👁️</span>
          <span>Live Storefront Preview</span>
        </button>
      </div>

      {/* Tab 1: Promotional Ticker */}
      {activeTab === 'ticker' && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Promotional Ticker Settings</h2>
              <p className="text-xs text-slate-400">Controls the rolling top alert bar across customer-facing pages.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-xs font-bold text-slate-300">
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
                className="w-5 h-5 accent-amber-500 rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Primary Promotional Text <span className="text-amber-500">*</span>
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-amber-400/80 mt-1 font-medium">
                Tip: Clearly specify &quot;UP TO 70% DISCOUNT ON ELIGIBLE CRACKERS&quot; to keep offers accurate and transparent.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
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
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-xs font-semibold text-slate-300">
                  Enable Click Action on Ticker (disabled automatically if destination is empty)
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Live Ticker Preview</h3>
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 rounded-xl p-3 text-white text-xs font-semibold flex items-center justify-center gap-2">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <div>
              <h2 className="text-base font-bold text-white">Hero Banner Carousel Slides</h2>
              <p className="text-xs text-slate-400">
                Manage rolling slides on the homepage. Notice: per specification, no &quot;Start Shopping&quot; button inside the hero.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shrink-0"
            >
              + Add New Slide
            </button>
          </div>

          {/* Slides List */}
          <div className="space-y-4">
            {settings.hero.slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate max-w-xs">{slide.title || 'Untitled Slide'}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        slide.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
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
                      className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs disabled:opacity-30"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={idx === settings.hero.slides.length - 1}
                      onClick={() => handleMoveSlide(idx, 'down')}
                      className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs disabled:opacity-30"
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 ml-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.isActive}
                        onChange={(e) => handleSlideChange(idx, 'isActive', e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs ml-2"
                      title="Delete Slide"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Left: Image Upload & Preview */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Slide Image
                    </label>
                    <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center">
                      {slide.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-500">No Image</span>
                      )}
                      {uploadingIndex === idx && (
                        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs text-amber-400 font-bold">
                          Uploading...
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <label className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors">
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
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Eyebrow / Subtitle
                      </label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => handleSlideChange(idx, 'subtitle', e.target.value)}
                        placeholder="e.g. SIVAKASI • PREMIUM FIREWORKS"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Main Heading
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                        placeholder="e.g. LIGHT UP YOUR CELEBRATION"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Supporting Promotional Text
                      </label>
                      <textarea
                        rows={2}
                        value={slide.description}
                        onChange={(e) => handleSlideChange(idx, 'description', e.target.value)}
                        placeholder="e.g. Discover crackers and festive combos from Sivakasi..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
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
        <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div>
            <h2 className="text-base font-bold text-white">Header & Brand Copy</h2>
            <p className="text-xs text-slate-400">Configure brand text displayed in the persistent navbar.</p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Storefront Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Live Storefront Preview</h2>
              <p className="text-xs text-slate-400">Preview how your configured ticker and hero banner will appear to customers.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewViewport('desktop')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewViewport === 'desktop' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                🖥️ Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport('mobile')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewViewport === 'mobile' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 Mobile
              </button>
            </div>
          </div>

          <div className="flex justify-center p-4 bg-slate-950 rounded-2xl overflow-hidden">
            <div
              className={`transition-all duration-300 bg-[#FAF7F2] text-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-2xl ${
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
