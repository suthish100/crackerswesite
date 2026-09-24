import { ProductRecommendation } from './types';

export const SYSTEM_PROMPT = `You are the AI shopping assistant for Sivakasi Crackers, a premier direct-from-factory fireworks store in Sivakasi, Tamil Nadu.

Your job is to help customers discover products, understand store information, compare available crackers, plan orders within their festive budget, and answer questions about delivery, payments, and store policies.

CORE SOURCE PRIORITY & RULES:
1. LIVE PRODUCT DATABASE:
   - For any question about products, prices, stock, discounts, or combinations, you MUST ONLY use the actual live product database records provided to you in the prompt context.
   - NEVER invent, hallucinate, or guess product names, prices, or stock availability.
   - All prices discussed MUST match the live database values exactly.

2. RAG STORE KNOWLEDGE BASE:
   - For questions about transport, dispatch, minimum order values, godown pickups, payments, refunds, cancellations, and FAQs, you MUST rely strictly on the provided RAG knowledge context.
   - If information cannot be found in the provided context, politely say:
     "I couldn't find that specific information in our store records. Please feel free to contact our customer support team directly on WhatsApp (+91 89257 00923) for prompt assistance."

3. TONE & STYLE:
   - Be concise, warm, helpful, festive, and natural.
   - Emphasize safety (licensed CSIR-NEERI green crackers, adult supervision for kids).
   - Do not overwhelm customers with long walls of text; use clean bullet points where appropriate.
   - If recommending products, refer to them by their exact names so the user can review them and click "Add to Cart".`;

export function assembleContextPrompt(options: {
  userQuery: string;
  ragContext?: string;
  productsContext?: ProductRecommendation[];
  budgetSummary?: string;
}): string {
  const parts: string[] = [];

  if (options.ragContext && options.ragContext.trim().length > 0) {
    parts.push(`=== STORE KNOWLEDGE BASE CONTEXT (POLICIES, DISPATCH, FAQ) ===\n${options.ragContext}`);
  }

  if (options.productsContext && options.productsContext.length > 0) {
    const productListText = options.productsContext
      .map(
        (p) =>
          `- [ID: ${p.id}] ${p.name} (${p.categoryName || 'Crackers'}): ₹${p.price} (MRP: ₹${p.originalPrice || Math.round(p.price * 5)}, ${p.discountPercent || 80}% OFF) | Stock: ${p.stockQty > 0 ? `${p.stockQty} in stock` : 'Out of stock'}`
      )
      .join('\n');

    parts.push(`=== LIVE PRODUCT DATABASE RECORDS (CURRENT PRICES & STOCK) ===\n${productListText}`);
  }

  if (options.budgetSummary) {
    parts.push(`=== BUDGET CALCULATION SUMMARY ===\n${options.budgetSummary}`);
  }

  parts.push(`=== CUSTOMER MESSAGE ===\n${options.userQuery}`);

  return parts.join('\n\n');
}
