import { NextRequest, NextResponse } from 'next/server';
import { buildBudgetRecommendation } from '@/lib/ai/product-search';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const budgetRaw = body.budget;
    const budget = typeof budgetRaw === 'number' ? budgetRaw : parseInt(String(budgetRaw || '0'), 10);

    if (isNaN(budget) || budget <= 0) {
      return NextResponse.json({ error: 'Valid positive budget amount is required' }, { status: 400 });
    }

    const recommendation = await buildBudgetRecommendation(budget);
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Error in /api/ai/recommend:', error);
    return NextResponse.json({ error: 'Budget recommendation failed' }, { status: 500 });
  }
}
