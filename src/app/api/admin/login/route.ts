import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const { username, phone, password } = await request.json();
    const identifier = (phone || username || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Phone/username and password are required' },
        { status: 400 }
      );
    }

    const rateLimitKey = `admin_login:${ip}:${identifier.toLowerCase()}`;
    const rateLimitCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (!rateLimitCheck.allowed) {
      const waitMinutes = Math.ceil((rateLimitCheck.resetTime - Date.now()) / (60 * 1000));
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed login attempts. Locked out for ${waitMinutes} minute(s).`,
        },
        { status: 429 }
      );
    }

    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { name: identifier },
        ],
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful authentication
    resetRateLimit(rateLimitKey);

    const token = signToken({
      id: admin.id,
      name: admin.name,
      role: admin.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        phone: admin.phone,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 });
  }
}
