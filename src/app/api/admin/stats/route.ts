import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async () => {
  try {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalCategories = await prisma.category.count({ where: { isActive: true } });
    const totalPackages = await prisma.package.count({ where: { isActive: true } });
    const lowStockProducts = await prisma.product.count({ where: { stockQty: { lte: 10 }, isActive: true } });

    // Calculate total revenue from non-cancelled orders
    const revenueAggregate = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'Cancelled' } },
    });
    const totalRevenue = revenueAggregate._sum.totalAmount || 0;

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        publicOrderId: true,
        customerName: true,
        customerPhone: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    // Orders count by status
    const ordersByStatusRaw = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const ordersByStatus: Record<string, number> = {};
    ordersByStatusRaw.forEach((row) => {
      ordersByStatus[row.status] = row._count.id;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalProducts,
        totalCategories,
        totalPackages,
        lowStockProducts,
        totalRevenue,
        ordersByStatus,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
});
