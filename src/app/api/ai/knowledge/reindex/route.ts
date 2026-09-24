import { NextResponse } from 'next/server';
import { ragService } from '@/lib/ai/rag';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const stats = await ragService.indexKnowledgeBase();
    return NextResponse.json({
      success: true,
      message: 'RAG knowledge base successfully re-indexed.',
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error re-indexing RAG knowledge base:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Re-indexing failed' },
      { status: 500 }
    );
  }
}
