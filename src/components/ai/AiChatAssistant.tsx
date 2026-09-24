'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AiChatMessage } from '@/lib/ai/types';
import { AiProductCard } from './AiProductCard';
import { QuickActionButtons } from './QuickActionButtons';

const WELCOME_MESSAGE: AiChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! 👋 I'm your crackers shopping assistant. I can help you find crackers, compare products, plan your order within a budget, and answer questions about delivery and our store.",
  createdAt: new Date().toISOString(),
};

const SUGGESTED_QUESTIONS = [
  'Show me crackers under ₹500',
  'I have a ₹2,000 budget',
  'What crackers do you have?',
  'What are your delivery options?',
  'Help me choose products',
];

export const AiChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: AiChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      const assistantMessage: AiChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.message || 'I am ready to help you with your cracker shopping!',
        productRecommendations: data.products || [],
        quickActions: data.suggestedQuestions || [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (!isOpen) setHasUnread(true);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: AiChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          "Sorry, I'm having trouble right now. Please try again in a moment, or contact our WhatsApp support directly at +91 89257 00923.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <>
      {/* Floating Circular AI Trigger Button */}
      <div className="fixed bottom-28 right-3 sm:bottom-6 sm:right-6 z-40 transition-transform duration-300 hover:scale-105 active:scale-95">
        <button
          data-testid="ai-assistant-trigger"
          type="button"
          aria-label="Open AI Shopping Assistant"
          onClick={() =>
            setIsOpen((prev) => {
              if (!prev) setHasUnread(false);
              return !prev;
            })
          }
          className="relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/35 border-2 border-amber-200/90 focus:outline-none focus:ring-4 focus:ring-amber-300/40"
        >
          {/* Animated pulse ring */}
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping pointer-events-none"
          />

          {isOpen ? (
            <span className="text-xl sm:text-2xl font-black">✕</span>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-xl sm:text-3xl leading-none">✨</span>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5">AI</span>
            </div>
          )}

          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-600 border-2 border-white rounded-full" />
          )}
        </button>
      </div>

      {/* Floating Chat Panel Window */}
      {isOpen && (
        <div
          data-testid="ai-assistant-panel"
          className="fixed inset-x-3 bottom-24 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-auto sm:w-[420px] h-[580px] max-h-[82vh] flex flex-col rounded-3xl bg-[#FAF8F5] border border-amber-300/90 shadow-2xl overflow-hidden"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-lg shadow-2xs">
                ✨
              </div>
              <div>
                <h3 className="font-black text-sm tracking-wide">Sivakasi Shopping Assistant</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-100 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Live Store AI</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Clear chat conversation"
                onClick={handleClearChat}
                title="Clear Conversation"
                className="p-1.5 rounded-lg text-amber-100 hover:text-white hover:bg-white/20 transition-colors text-xs font-bold"
              >
                🗑️
              </button>
              <button
                type="button"
                aria-label="Close assistant"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-amber-100 hover:text-white hover:bg-white/20 transition-colors text-base font-black leading-none"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Action Header Bar */}
          <div className="px-3 py-1.5 bg-amber-100/60 border-b border-amber-200/80 shrink-0">
            <QuickActionButtons onSelectAction={(q) => handleSendMessage(q)} disabled={isLoading} />
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-slate-800">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl shadow-2xs ${
                      isAssistant
                        ? 'bg-white border border-amber-200/80 text-slate-800 rounded-tl-none'
                        : 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white font-medium rounded-tr-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Render Product Cards inside Assistant Chat */}
                    {isAssistant && msg.productRecommendations && msg.productRecommendations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                          <span>🧨</span>
                          <span>Recommended Live Products:</span>
                        </div>
                        {msg.productRecommendations.map((prod) => (
                          <AiProductCard key={prod.id} product={prod} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Render Suggested Questions if this is the welcome message or last message */}
                  {msg.id === 'welcome' && (
                    <div className="mt-2.5 w-full space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                        Try asking:
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {SUGGESTED_QUESTIONS.map((question) => (
                          <button
                            key={question}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleSendMessage(question)}
                            className="text-left px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200/90 text-amber-950 font-bold text-xs shadow-2xs transition-colors active:scale-[0.99] disabled:opacity-50"
                          >
                            💬 {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Quick Actions followups from assistant response */}
                  {isAssistant && msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                      {msg.quickActions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleSendMessage(action)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors shadow-2xs"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing / Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-amber-200/80 w-fit rounded-tl-none shadow-2xs">
                <span className="text-[11px] font-bold text-amber-800">AI is finding products</span>
                <span className="flex gap-1 items-center ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-amber-200/90 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crackers, budget, delivery..."
              className="flex-1 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white shadow-2xs"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-xs hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all shrink-0"
            >
              Send ➔
            </button>
          </form>
        </div>
      )}
    </>
  );
};
