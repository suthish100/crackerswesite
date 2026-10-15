import fs from 'fs';
import path from 'path';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from './siteSettingsDefaults';

export { DEFAULT_SITE_SETTINGS };

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'site-settings.json');

export function getSiteSettings(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        ticker: {
          ...DEFAULT_SITE_SETTINGS.ticker,
          ...(parsed.ticker || {}),
        },
        header: {
          ...DEFAULT_SITE_SETTINGS.header,
          ...(parsed.header || {}),
        },
        hero: {
          ...DEFAULT_SITE_SETTINGS.hero,
          ...(parsed.hero || {}),
          slides: Array.isArray(parsed.hero?.slides) && parsed.hero.slides.length > 0
            ? parsed.hero.slides
            : DEFAULT_SITE_SETTINGS.hero.slides,
        },
        bestSellers: {
          ...DEFAULT_SITE_SETTINGS.bestSellers,
          ...(parsed.bestSellers || {}),
        },
        promoBanner: {
          ...DEFAULT_SITE_SETTINGS.promoBanner,
          ...(parsed.promoBanner || {}),
        },
      };
    }
  } catch (error) {
    console.error('Error reading site settings, falling back to defaults:', error);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    ticker: {
      ...current.ticker,
      ...(settings.ticker || {}),
      // Enforce: ticker must not be clickable if it has no destination URL
      isClickable: Boolean(
        settings.ticker?.isClickable &&
        (settings.ticker?.destinationUrl || current.ticker.destinationUrl)?.trim()
      ),
    },
    header: {
      ...current.header,
      ...(settings.header || {}),
    },
    hero: {
      ...current.hero,
      ...(settings.hero || {}),
    },
    bestSellers: {
      ...(current.bestSellers || DEFAULT_SITE_SETTINGS.bestSellers),
      ...(settings.bestSellers || {}),
      productIds: settings.bestSellers?.productIds ?? current.bestSellers?.productIds ?? DEFAULT_SITE_SETTINGS.bestSellers.productIds,
    },
    promoBanner: {
      ...(current.promoBanner || DEFAULT_SITE_SETTINGS.promoBanner),
      ...(settings.promoBanner || {}),
      enabled: settings.promoBanner?.enabled ?? current.promoBanner?.enabled ?? DEFAULT_SITE_SETTINGS.promoBanner.enabled,
      title: settings.promoBanner?.title ?? current.promoBanner?.title ?? DEFAULT_SITE_SETTINGS.promoBanner.title,
      subtitle: settings.promoBanner?.subtitle ?? current.promoBanner?.subtitle ?? DEFAULT_SITE_SETTINGS.promoBanner.subtitle,
    },
  };

  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving site settings:', error);
    throw new Error('Failed to save site settings');
  }

  return updated;
}
