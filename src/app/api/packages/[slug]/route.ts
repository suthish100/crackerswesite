import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const pkg = await prisma.package.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!pkg || !pkg.isActive) {
      return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error('Error fetching package detail:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch package' }, { status: 500 });
  }
}
