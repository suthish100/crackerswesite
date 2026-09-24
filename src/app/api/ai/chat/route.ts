import { NextRequest, NextResponse } from 'next/server';
import { aiAssistant } from '@/lib/ai/assistant';
import { AiChatMessage } from '@/lib/ai/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history: AiChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(
        { error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    if (message.length > 1500) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep your question under 1500 characters.' },
        { status: 400 }
      );
    }

    const result = await aiAssistant.processMessage(message, history);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    return NextResponse.json(
      {
        message: "Sorry, I'm having trouble right now. Please try again in a moment, or contact our WhatsApp support directly at +91 89257 00923.",
        products: [],
        suggestedQuestions: [
          'Show me crackers under ₹500',
          'What are your delivery options?',
        ],
      },
      { status: 200 } // Return 200 with friendly fallback so the UI never displays broken crash screens
    );
  }
}
