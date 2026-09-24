import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { ProductRecommendation, BudgetRecommendationResult } from './types';

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export interface ParsedProductQuery {
  keywords: string[];
  maxPrice?: number;
  minPrice?: number;
  targetBudget?: number;
  categoryHint?: string;
  wantsCheapest?: boolean;
  wantsDiscounted?: boolean;
  wantsFamilyCombo?: boolean;
}

export function parseNaturalLanguageQuery(query: string): ParsedProductQuery {
  const q = query.toLowerCase();
  const result: ParsedProductQuery = { keywords: [] };

  // Budget detection: "budget of 3000", "have 2000", "budget 2,000", "within 1500"
  const budgetMatch =
    q.match(/(?:budget\s*(?:of|is|:)?|have|around|approx)\s*₹?\s*(\d[\d,]*)/i) ||
    q.match(/₹?\s*(\d[\d,]*)\s*(?:budget|rupees)/i);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      result.targetBudget = val;
    }
  }

  // Max price: "under 500", "below 1000", "less than 800", "< 500"
  const underMatch = q.match(/(?:under|below|less\s+than|<)\s*₹?\s*(\d[\d,]*)/i);
  if (underMatch) {
    const val = parseInt(underMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      result.maxPrice = val;
    }
  }

  // Min price: "above 1000", "more than 500", "> 500"
  const aboveMatch = q.match(/(?:above|more\s+than|over|>)\s*₹?\s*(\d[\d,]*)/i);
  if (aboveMatch) {
    const val = parseInt(aboveMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      result.minPrice = val;
    }
  }

  // Category hints
  if (q.includes('sparkler') || q.includes('kambi')) result.categoryHint = 'sparkler';
  else if (q.includes('flower') || q.includes('pot') || q.includes('kottai')) result.categoryHint = 'flower';
  else if (q.includes('chakkar') || q.includes('ground') || q.includes('wheel')) result.categoryHint = 'chakkar';
  else if (q.includes('bomb') || q.includes('sound') || q.includes('hydro')) result.categoryHint = 'bomb';
  else if (q.includes('aerial') || q.includes('sky') || q.includes('shot') || q.includes('cake')) result.categoryHint = 'aerial';
  else if (q.includes('fountain')) result.categoryHint = 'fountain';
  else if (q.includes('gift') || q.includes('box') || q.includes('combo') || q.includes('pack')) {
    result.categoryHint = 'gift';
    result.wantsFamilyCombo = true;
  }

  if (q.includes('cheapest') || q.includes('lowest price') || q.includes('low price')) {
    result.wantsCheapest = true;
  }

  if (q.includes('discount') || q.includes('offer') || q.includes('deal')) {
    result.wantsDiscounted = true;
  }

  // Keywords extraction
  const cleanTokens = q
    .replace(/[₹,?.!]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['show', 'find', 'give', 'want', 'need', 'what', 'have', 'with', 'under', 'below', 'above', 'some'].includes(w));
  result.keywords = cleanTokens;

  return result;
}

export async function searchLiveProducts(
  query: string,
  options: { maxResults?: number } = {}
): Promise<ProductRecommendation[]> {
  const maxResults = options.maxResults || 8;
  const parsed = parseNaturalLanguageQuery(query);

  let allProducts: ProductWithCategory[] = [];
  try {
    allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { price: 'asc' },
    });
  } catch (err) {
    console.error('Error querying live product database:', err);
    return [];
  }

  if (allProducts.length === 0) return [];

  // Filter products based on parsed criteria
  let filtered = allProducts.filter((p) => {
    // Max price filter
    if (parsed.maxPrice !== undefined && p.price > parsed.maxPrice) return false;
    // Min price filter
    if (parsed.minPrice !== undefined && p.price < parsed.minPrice) return false;

    // Category hint filter
    if (parsed.categoryHint) {
      const catName = (p.category?.name || '').toLowerCase();
      const pName = p.name.toLowerCase();
      const hint = parsed.categoryHint;
      if (!catName.includes(hint) && !pName.includes(hint)) {
        return false;
      }
    }

    return true;
  });

  // If no strict category matches, relax filter to all active products within price
  if (filtered.length === 0 && (parsed.maxPrice !== undefined || parsed.minPrice !== undefined)) {
    filtered = allProducts.filter((p) => {
      if (parsed.maxPrice !== undefined && p.price > parsed.maxPrice) return false;
      if (parsed.minPrice !== undefined && p.price < parsed.minPrice) return false;
      return true;
    });
  }

  // If still empty or no price filter, score by keyword relevance
  if (parsed.keywords.length > 0) {
    const scored = (filtered.length > 0 ? filtered : allProducts).map((p) => {
      const text = `${p.name} ${p.category?.name || ''} ${p.description || ''}`.toLowerCase();
      let score = 0;
      for (const kw of parsed.keywords) {
        if (text.includes(kw)) score += 1;
      }
      return { product: p, score };
    });

    const relevant = scored.filter((s) => s.score > 0);
    if (relevant.length > 0) {
      relevant.sort((a, b) => b.score - a.score || a.product.price - b.product.price);
      filtered = relevant.map((r) => r.product);
    }
  }

  // Sort preference
  if (parsed.wantsCheapest) {
    filtered.sort((a, b) => a.price - b.price);
  } else if (parsed.wantsDiscounted) {
    filtered.sort((a, b) => {
      const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
      const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
      return discB - discA;
    });
  }

  const selected = (filtered.length > 0 ? filtered : allProducts).slice(0, maxResults);

  return selected.map((p) => {
    const effectiveOriginal = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : Math.round(p.price * 5);
    const discountPercent = Math.round(((effectiveOriginal - p.price) / effectiveOriginal) * 100);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: effectiveOriginal,
      discountPercent,
      stockQty: p.stockQty,
      imageUrl: p.imageUrl,
      categoryName: p.category?.name,
      quantity: 1,
    };
  });
}

export async function buildBudgetRecommendation(budget: number): Promise<BudgetRecommendationResult> {
  let allProducts: ProductWithCategory[] = [];
  try {
    allProducts = await prisma.product.findMany({
      where: { isActive: true, stockQty: { gt: 0 } },
      include: { category: true },
      orderBy: { price: 'asc' },
    });
  } catch (err) {
    console.error('Error querying products for budget combo:', err);
    return {
      budget,
      totalAmount: 0,
      remainingBudget: budget,
      products: [],
      summary: 'Unable to query live products at this moment.',
    };
  }

  if (allProducts.length === 0) {
    return {
      budget,
      totalAmount: 0,
      remainingBudget: budget,
      products: [],
      summary: 'No in-stock crackers currently available.',
    };
  }

  // Desired festive basket categories in priority order
  const categoryOrder = [
    { key: 'sparkler', label: 'Sparklers (Hand-held)' },
    { key: 'flower', label: 'Flower Pots (Fountain)' },
    { key: 'chakkar', label: 'Ground Chakkars (Spinning)' },
    { key: 'fountain', label: 'Fancy Fountains' },
    { key: 'bomb', label: 'Sound Crackers' },
    { key: 'aerial', label: 'Sky Aerial Shots' },
  ];

  const picked: ProductRecommendation[] = [];
  let currentTotal = 0;

  // Step 1: Pick one affordable, available item from each category
  for (const cat of categoryOrder) {
    const matching = allProducts.filter((p) => {
      const catText = `${p.category?.name || ''} ${p.name}`.toLowerCase();
      return catText.includes(cat.key) && !picked.some((already) => already.id === p.id);
    });

    if (matching.length > 0) {
      // Pick best value product that fits within remaining budget
      const candidate = matching.find((p) => currentTotal + p.price <= budget) || matching[0];
      if (currentTotal + candidate.price <= budget) {
        const effectiveOriginal = candidate.originalPrice && candidate.originalPrice > candidate.price
          ? candidate.originalPrice
          : Math.round(candidate.price * 5);
        const discountPercent = Math.round(((effectiveOriginal - candidate.price) / effectiveOriginal) * 100);

        picked.push({
          id: candidate.id,
          name: candidate.name,
          slug: candidate.slug,
          price: candidate.price,
          originalPrice: effectiveOriginal,
          discountPercent,
          stockQty: candidate.stockQty,
          imageUrl: candidate.imageUrl,
          categoryName: candidate.category?.name,
          quantity: 1,
          reason: `Balanced festive pick for ${cat.label}`,
        });
        currentTotal += candidate.price;
      }
    }
  }

  // Step 2: If remaining budget allows, fill with popular items or increase quantity
  const remaining = budget - currentTotal;
  if (remaining >= 100) {
    const fillers = allProducts.filter((p) => !picked.some((pk) => pk.id === p.id) && p.price <= remaining);
    if (fillers.length > 0) {
      fillers.sort((a, b) => b.price - a.price); // pick highest price that still fits
      const topFiller = fillers[0];
      const effectiveOriginal = topFiller.originalPrice && topFiller.originalPrice > topFiller.price
        ? topFiller.originalPrice
        : Math.round(topFiller.price * 5);
      const discountPercent = Math.round(((effectiveOriginal - topFiller.price) / effectiveOriginal) * 100);

      picked.push({
        id: topFiller.id,
        name: topFiller.name,
        slug: topFiller.slug,
        price: topFiller.price,
        originalPrice: effectiveOriginal,
        discountPercent,
        stockQty: topFiller.stockQty,
        imageUrl: topFiller.imageUrl,
        categoryName: topFiller.category?.name,
        quantity: 1,
        reason: 'Bonus festive cracker within budget',
      });
      currentTotal += topFiller.price;
    }
  }

  const remainingBudget = Math.max(0, budget - currentTotal);
  const summary = `Curated festive package of ${picked.length} cracker varieties totaling ₹${currentTotal.toLocaleString('en-IN')} (Budget: ₹${budget.toLocaleString('en-IN')}, Remaining: ₹${remainingBudget.toLocaleString('en-IN')}).`;

  return {
    budget,
    totalAmount: currentTotal,
    remainingBudget,
    products: picked,
    summary,
  };
}
