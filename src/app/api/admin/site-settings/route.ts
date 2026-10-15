import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSiteSettings, saveSiteSettings } from '@/lib/siteSettings';
import { SiteSettings } from '@/types';

export const GET = requireAdmin(async () => {
  try {
    const settings = getSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching admin site settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (req: Request) => {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    // Validate ticker text
    if (body.ticker) {
      if (typeof body.ticker.text === 'string') {
        body.ticker.text = body.ticker.text.trim();
      }
      if (typeof body.ticker.destinationUrl === 'string') {
        body.ticker.destinationUrl = body.ticker.destinationUrl.trim();
      }
      // Rule: Ticker must not be clickable if it has no valid destination
      if (!body.ticker.destinationUrl) {
        body.ticker.isClickable = false;
      }
    }

    // Validate hero slides
    if (body.hero && Array.isArray(body.hero.slides)) {
      body.hero.slides = body.hero.slides.map((s: Record<string, unknown>, idx: number) => ({
        id: String(s.id || `slide-${Date.now()}-${idx}`),
        title: String(s.title || '').trim(),
        subtitle: String(s.subtitle || '').trim(),
        description: String(s.description || '').trim(),
        imageUrl: String(s.imageUrl || '/images/hero_combos_ref.png').trim(),
        destinationUrl: s.destinationUrl ? String(s.destinationUrl).trim() : undefined,
        isActive: s.isActive !== false,
        sortOrder: typeof s.sortOrder === 'number' ? s.sortOrder : idx,
      }));
    }

    const saved = saveSiteSettings(body as Partial<SiteSettings>);
    return NextResponse.json({ success: true, settings: saved, message: 'Settings saved and published successfully' });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to save settings' }, { status: 500 });
  }
});
