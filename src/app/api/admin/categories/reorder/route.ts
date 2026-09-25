import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const PUT = requireAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const orderedIds: number[] = Array.isArray(body.orderedIds)
      ? body.orderedIds.map((id: unknown) => Number(id)).filter((id: number) => !isNaN(id))
      : [];

    if (orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty orderedIds list provided' },
        { status: 400 }
      );
    }

    // Execute bulk update of sortOrder using sequential indexing
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Category order updated successfully',
    });
  } catch (error) {
    console.error('Error reordering categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reorder categories' },
      { status: 500 }
    );
  }
});

// Also support POST for maximum compatibility
export const POST = PUT;
