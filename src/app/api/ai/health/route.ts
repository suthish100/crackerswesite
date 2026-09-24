import { NextResponse } from 'next/server';
import { getAiConfig } from '@/lib/ai/config';
import { vectorStore } from '@/lib/ai/vector-store';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getAiConfig();
    const chunkCount = await vectorStore.count();
    const productCount = await prisma.product.count({ where: { isActive: true } });

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      aiProvider: config.aiProvider,
      aiModel: config.aiModel,
      hasApiKey: !!config.aiApiKey,
      embeddingProvider: config.embeddingProvider,
      indexedChunksCount: chunkCount,
      activeProductsCount: productCount,
      ragTopK: config.ragTopK,
    });
  } catch (error) {
    console.error('Error in /api/ai/health:', error);
    return NextResponse.json({ status: 'unhealthy', error: String(error) }, { status: 500 });
  }
}
