import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_SITE_SETTINGS, saveSiteSettings } from '@/lib/siteSettings';

export const POST = requireAdmin(async () => {
  try {
    const restored = saveSiteSettings(DEFAULT_SITE_SETTINGS);
    return NextResponse.json({
      success: true,
      settings: restored,
      message: 'Default settings restored successfully',
    });
  } catch (error) {
    console.error('Error restoring site settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to restore default settings' }, { status: 500 });
  }
});
