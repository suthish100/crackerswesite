import { SiteSettings } from '@/types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  ticker: {
    enabled: true,
    text: 'UP TO 70% DISCOUNT ON ELIGIBLE CRACKERS',
    tag: 'SPECIAL OFFER',
    icon: '💥',
    linkText: 'Shop Deals',
    destinationUrl: '/products',
    isClickable: true,
    items: [
      {
        id: 'ticker-1',
        tag: 'SPECIAL OFFER',
        text: 'UP TO 70% DISCOUNT ON ELIGIBLE CRACKERS',
        linkText: 'Shop Deals',
        destinationUrl: '/products',
        isClickable: true,
      },
      {
        id: 'ticker-2',
        tag: 'DELIVERY INFO',
        text: 'Delivery across Tamil Nadu • Delivery charges apply',
        linkText: 'View Policy',
        destinationUrl: '/shipping-policy',
        isClickable: true,
      },
      {
        id: 'ticker-3',
        tag: 'FAST DISPATCH',
        text: 'Direct Sivakasi factory dispatch • 100% Certified Green Fireworks',
        linkText: 'Explore',
        destinationUrl: '/products',
        isClickable: true,
      },
    ],
  },
  header: {
    brandTitle: 'SIVAKASI CRACKERS',
    brandSubtitle: 'Premium Fireworks Store',
    announcementText: 'Diwali 2026 Celebrations — Book Factory Direct Rates',
  },
  hero: {
    autoplaySpeed: 5,
    slides: [
      {
        id: 'hero-slide-1',
        title: 'LIGHT UP YOUR CELEBRATION',
        subtitle: 'SIVAKASI • PREMIUM FIREWORKS',
        description:
          'Discover crackers and festive combos from Sivakasi. Best quality. Great offers direct from factory.',
        imageUrl: '/images/hero_combos_clean.png',
        isActive: true,
        sortOrder: 0,
      },
      {
        id: 'hero-slide-2',
        title: '100% CERTIFIED GREEN FIREWORKS',
        subtitle: 'DIRECT FROM SIVAKASI',
        description:
          'Eco-friendly CSIR-NEERI certified crackers with reduced smoke & dazzling festival lights.',
        imageUrl: '/images/hero_banner_ref.png',
        isActive: true,
        sortOrder: 1,
      },
    ],
  },
};
