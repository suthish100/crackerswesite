import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function readSnapshot() {
  const [totalOrders, revenueAggregate, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'Cancelled' } },
    }),
    prisma.order.findMany({
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
        updatedAt: true,
      },
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: revenueAggregate._sum.totalAmount || 0,
    recentOrders,
  };
}

export const GET = requireAdmin(async (request: Request) => {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sendSnapshot = async () => {
        try {
          const snapshot = await readSnapshot();
          if (!closed) {
            controller.enqueue(encoder.encode(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`));
          }
        } catch (error) {
          if (!closed) console.error('Admin event stream error:', error);
        }
      };

      await sendSnapshot();
      timer = setInterval(() => {
        if (!closed) void sendSnapshot();
      }, 2000);

      request.signal.addEventListener('abort', () => {
        closed = true;
        if (timer) clearInterval(timer);
        controller.close();
      });
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'X-Accel-Buffering': 'no',
    },
  });
});