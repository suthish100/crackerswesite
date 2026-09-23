'use client';

import React from 'react';
import { cn } from '@/lib/cn';

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'purple' | 'gold' | 'royal';
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className,
  glowColor = 'royal',
  ...props
}) => {
  const borderClasses = {
    purple: 'border-purple-500/20 hover:border-purple-400/50 hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.3)]',
    gold: 'border-amber-400/20 hover:border-amber-400/50 hover:shadow-[0_0_25px_-5px_rgba(245,196,81,0.25)]',
    royal: 'border-purple-500/20 hover:border-amber-400/40 hover:shadow-[0_4px_30px_-5px_rgba(124,58,237,0.2),0_2px_15px_-3px_rgba(245,196,81,0.15)]',
  };

  return (
    <div
      className={cn(
        'relative rounded-3xl bg-[#0B1226] border transition-all duration-300',
        borderClasses[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
