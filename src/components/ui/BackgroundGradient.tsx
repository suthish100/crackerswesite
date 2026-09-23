'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

interface BackgroundGradientProps {
  className?: string;
  children?: React.ReactNode;
  showRadialGlow?: boolean;
}

export const BackgroundGradient: React.FC<BackgroundGradientProps> = ({
  className,
  children,
  showRadialGlow = true,
}) => {
  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF9F0] to-[#FAF8F5]', className)}>
      {showRadialGlow && (
        <>
          {/* Subtle Warm Saffron atmospheric glow */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-radial from-amber-300/20 to-transparent blur-3xl opacity-70"
            animate={{
              scale: [1, 1.08, 1],
              x: [0, 15, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Subtle Festive Crimson / Gold atmospheric glow */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute top-10 right-[-10%] h-[450px] w-[450px] rounded-full bg-radial from-rose-200/25 to-transparent blur-3xl opacity-60"
            animate={{
              scale: [1, 1.05, 1],
              x: [0, -15, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {children}
    </div>
  );
};
