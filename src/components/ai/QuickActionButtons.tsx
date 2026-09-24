'use client';

import React from 'react';

interface QuickActionButtonsProps {
  onSelectAction: (query: string) => void;
  disabled?: boolean;
}

const ACTIONS = [
  { label: '🔎 Find Products', query: 'What are your most popular crackers?' },
  { label: '💰 Shop by Budget', query: 'I have a ₹2,000 budget. Suggest a combination.' },
  { label: '🎁 Recommendations', query: 'Recommend a good family crackers package.' },
  { label: '🚚 Delivery Info', query: 'What are your delivery options and transit times?' },
  { label: '💳 Payment Info', query: 'What payment methods do you accept?' },
  { label: '❓ FAQs', query: 'Are your crackers legal Green Crackers?' },
];

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onSelectAction,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelectAction(action.query)}
          className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors shadow-2xs active:scale-95 disabled:opacity-50 shrink-0"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};
