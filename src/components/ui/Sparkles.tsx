'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

interface SparklesProps {
  className?: string;
  particleCount?: number;
}

const COLORS = ['#D97706', '#F59E0B', '#E11D48', '#059669', '#7C3AED'];

export const Sparkles: React.FC<SparklesProps> = ({
  className,
  particleCount = 24,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  // Deterministic particle distribution - fast, zero hydration mismatch
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: ((i * 37.3) % 94) + 3,
    y: ((i * 59.7) % 88) + 6,
    size: (i % 3) * 0.7 + 1.4,
    color: COLORS[i % COLORS.length],
    duration: ((i % 4) * 0.8) + 2.6,
    delay: (i % 5) * 0.45,
  }));

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          initial={{ opacity: 0.15, scale: 0.8 }}
          animate={{
            opacity: [0.15, 0.75, 0.15],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
