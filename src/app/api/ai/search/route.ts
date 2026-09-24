import { NextRequest, NextResponse } from 'next/server';
import { searchLiveProducts } from '@/lib/ai/product-search';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    const maxResults = typeof body.maxResults === 'number' ? body.maxResults : 8;

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const products = await searchLiveProducts(query, { maxResults });
    return NextResponse.json({ query, count: products.length, products });
  } catch (error) {
    console.error('Error in /api/ai/search:', error);
    return NextResponse.json({ error: 'Product search failed' }, { status: 500 });
  }
}
