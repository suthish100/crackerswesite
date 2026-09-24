import { getAiConfig } from './config';
import { ragService } from './rag';
import {
  searchLiveProducts,
  buildBudgetRecommendation,
  parseNaturalLanguageQuery,
} from './product-search';
import { SYSTEM_PROMPT, assembleContextPrompt } from './prompts';
import {
  AiChatMessage,
  AiResponsePayload,
  ProductRecommendation,
} from './types';

export class AiShoppingAssistantService {
  async processMessage(
    userMessage: string,
    history: AiChatMessage[] = []
  ): Promise<AiResponsePayload> {
    const config = getAiConfig();
    const cleanQuery = userMessage.trim();

    if (!cleanQuery) {
      return {
        message: 'Hello! How can I help you with your cracker shopping today?',
        products: [],
        suggestedQuestions: [
          'Show me crackers under ₹500',
          'I have a ₹2,000 budget',
          'What are your delivery options?',
        ],
      };
    }

    const parsedQuery = parseNaturalLanguageQuery(cleanQuery);
    let recommendedProducts: ProductRecommendation[] = [];
    let budgetSummary: string | undefined;

    // 1. Handle budget calculation
    if (parsedQuery.targetBudget && parsedQuery.targetBudget > 0) {
      const budgetResult = await buildBudgetRecommendation(parsedQuery.targetBudget);
      recommendedProducts = budgetResult.products;
      budgetSummary = budgetResult.summary;
    } else {
      // 2. Query live products if query seems product-related
      const isProductQuery =
        parsedQuery.maxPrice !== undefined ||
        parsedQuery.minPrice !== undefined ||
        parsedQuery.categoryHint !== undefined ||
        parsedQuery.wantsCheapest ||
        parsedQuery.wantsDiscounted ||
        /product|cracker|sparkler|bomb|flower|pot|chakkar|aerial|fountain|buy|rate|price|cost|item|combo/i.test(
          cleanQuery
        );

      if (isProductQuery) {
        recommendedProducts = await searchLiveProducts(cleanQuery, { maxResults: 6 });
      }
    }

    // 3. Retrieve RAG store knowledge chunks
    const { contextText: ragContext, sources } = await ragService.buildContext(cleanQuery, config.ragTopK);

    // 4. Assemble the unified context
    const fullUserPrompt = assembleContextPrompt({
      userQuery: cleanQuery,
      ragContext,
      productsContext: recommendedProducts,
      budgetSummary,
    });

    let aiAnswer = '';

    // 5. LLM Call or Intelligent Local Fallback Engine
    if (config.aiApiKey && (config.aiProvider === 'openai' || config.aiProvider === 'local')) {
      try {
        const baseUrl = config.aiBaseUrl || 'https://api.openai.com/v1';
        const formattedHistory = history.slice(-6).map((h) => ({
          role: h.role,
          content: h.content,
        }));

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.aiApiKey}`,
          },
          body: JSON.stringify({
            model: config.aiModel || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...formattedHistory,
              { role: 'user', content: fullUserPrompt },
            ],
            temperature: 0.4,
            max_tokens: 800,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          aiAnswer = json.choices?.[0]?.message?.content || '';
        } else {
          console.warn('LLM API error, falling back to local reasoning:', await response.text());
        }
      } catch (err) {
        console.warn('LLM request failed, falling back to local engine:', err);
      }
    }

    // If external LLM did not return an answer, use our intelligent zero-hallucination local engine
    if (!aiAnswer) {
      aiAnswer = this.generateLocalSmartResponse({
        cleanQuery,
        parsedQuery,
        recommendedProducts,
        budgetSummary,
        ragContext,
      });
    }

    // 6. Generate dynamic clickable suggested questions based on context
    const suggestedQuestions = this.generateSuggestedFollowups({
      cleanQuery,
      hasProducts: recommendedProducts.length > 0,
      hasBudget: !!parsedQuery.targetBudget,
    });

    return {
      message: aiAnswer,
      products: recommendedProducts,
      suggestedQuestions,
      sourceSnippets: sources.map((s) => ({ source: s.chunk.source, score: s.score })),
    };
  }

  private generateLocalSmartResponse(params: {
    cleanQuery: string;
    parsedQuery: ReturnType<typeof parseNaturalLanguageQuery>;
    recommendedProducts: ProductRecommendation[];
    budgetSummary?: string;
    ragContext?: string;
  }): string {
    const { cleanQuery, parsedQuery, recommendedProducts, budgetSummary, ragContext } = params;
    const q = cleanQuery.toLowerCase();

    // Budget intent
    if (parsedQuery.targetBudget && recommendedProducts.length > 0) {
      const itemsList = recommendedProducts
        .map((p) => `• **${p.name}** (${p.categoryName || 'Cracker'}) — **₹${p.price}** (80% OFF MRP ₹${p.originalPrice})`)
        .join('\n');

      return `🎆 **Custom Festive Package for ₹${parsedQuery.targetBudget.toLocaleString('en-IN')} Budget**\n\n${budgetSummary}\n\nHere are the recommended items from our live factory catalog:\n\n${itemsList}\n\n👉 You can review each product card below and click **"+ Add to Cart"** to add them directly to your order bag!`;
    }

    // Product search results
    if (recommendedProducts.length > 0) {
      const criteria = parsedQuery.maxPrice
        ? `priced under ₹${parsedQuery.maxPrice}`
        : parsedQuery.categoryHint
        ? `in ${parsedQuery.categoryHint}`
        : 'matching your request';

      const itemsList = recommendedProducts
        .map((p) => `• **${p.name}** — **₹${p.price}** ${p.originalPrice ? `~~(₹${p.originalPrice})~~` : ''} [${p.stockQty > 0 ? 'In Stock' : 'Out of stock'}]`)
        .join('\n');

      return `Here are the top crackers ${criteria} available directly from our Sivakasi factory:\n\n${itemsList}\n\n✨ All items are 100% certified Green Crackers. You can add them straight to your cart using the cards below!`;
    }

    // Shipping & Transport questions
    if (/delivery|transport|shipping|lorry|godown|lr|courier|transit|reach/i.test(q)) {
      return `🚚 **Sivakasi Transport & Delivery Details:**\n\n• **Fulfillment Method**: Under Indian safety regulations, crackers are Class 1 hazardous goods and are transported exclusively via licensed **regional commercial road transport carriers** (such as VRL, ARC, TAT, Rathimeena).\n• **Godown Pickup**: Consignments arrive at the road transport parcel godown nearest to your town/city. You collect it by presenting your Lorry Receipt (LR) tracking number.\n• **Minimum Order Thresholds**:\n  - **₹3,000** for Tamil Nadu & Pondicherry (transit: 24 to 48 hours).\n  - **₹5,000** for other Indian states (transit: 3 to 7 business days).\n• **Door Delivery**: Can be arranged directly with your city transport godown for a small local vehicle charge upon arrival.`;
    }

    // Payment questions
    if (/payment|pay|upi|gpay|phonepe|cod|cash|bank|account/i.test(q)) {
      return `💳 **Payment Policy & Methods:**\n\n• **Supported Modes**: Instant UPI (Google Pay, PhonePe, Paytm, BHIM) and direct Bank Account Transfer (IMPS / NEFT / RTGS).\n• **Cash on Delivery (COD)**: Not available, as road transport freight operators do not handle retail cash collections for hazardous materials.\n• **Verification**: After placing your order on checkout, share your transaction UTR or payment screenshot on WhatsApp (+91 89257 00923) with your Public Order ID for instant dispatch confirmation!`;
    }

    // Return & Cancellation questions
    if (/return|refund|cancel|damaged|broken/i.test(q)) {
      return `🛡️ **Returns, Damages & Cancellation Policy:**\n\n• **Returns**: Due to explosives safety regulations, fireworks cannot be sent back via courier once received.\n• **Damaged Goods Claim**: If any box arrives damaged, record a mandatory unboxing video and notify our WhatsApp support desk within 24 hours of godown pickup for an immediate replacement or refund credit.\n• **Cancellation**: Free pre-dispatch cancellation prior to factory boxing and transport handover. Once goods are boarded onto the transport lorry, orders cannot be cancelled.`;
    }

    // Safety & Green crackers
    if (/safe|green|neeri|barium|smoke|eco|legal|license/i.test(q)) {
      return `🌿 **Certified Green Crackers & Safety:**\n\n• 100% legal, licensed fireworks manufactured under CSIR-NEERI formulations in Sivakasi.\n• Produced with 30-35% lower particulate emissions and completely free of toxic barium compounds.\n• Every box features the official green fireworks emblem and authentic NEERI QR code for verification.`;
    }

    // Fallback if RAG context has content
    if (ragContext && ragContext.length > 50) {
      // Extract first meaningful sentences from RAG
      const cleanSnippet = ragContext.replace(/\[Source[^\]]+\]/g, '').replace(/#+/g, '').slice(0, 450).trim();
      return `${cleanSnippet}\n\nNeed more details? Feel free to ask about our cracker varieties, transport routes, or pricing!`;
    }

    return `I'm here to help you with your festival cracker shopping! You can ask me to find crackers by budget (e.g. "Suggest a combination for ₹2,000"), search by price (e.g. "Crackers under ₹500"), or ask about our road transport delivery and store policies.`;
  }

  private generateSuggestedFollowups(params: {
    cleanQuery: string;
    hasProducts: boolean;
    hasBudget: boolean;
  }): string[] {
    if (params.hasBudget) {
      return [
        'What are the delivery charges?',
        'Show sound crackers under ₹500',
        'Can I customize this package?',
      ];
    }

    if (params.hasProducts) {
      return [
        'I have a ₹3,000 budget',
        'How does transport delivery work?',
        'Show sparklers and flower pots',
      ];
    }

    return [
      'Show me crackers under ₹500',
      'I have a ₹2,000 budget',
      'What are your delivery options?',
      'Tell me about your payment methods',
    ];
  }
}

export const aiAssistant = new AiShoppingAssistantService();
