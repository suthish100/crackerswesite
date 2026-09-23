'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  color: string;
  exploded: boolean;
}

const FESTIVE_COLORS = [
  '#F59E0B', // Saffron Gold
  '#E11D48', // Ruby Crimson
  '#10B981', // Emerald Green
  '#8B5CF6', // Royal Violet
  '#38BDF8', // Sky Blue
  '#FBBF24', // Warm Sparkle
];

export const FireworksBlast: React.FC<{ durationSeconds?: number }> = ({
  durationSeconds = 3.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsActive(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    // Launch initial rockets
    const launchRocket = (startX: number, targetHeight: number) => {
      rockets.push({
        x: startX,
        y: height,
        targetY: targetHeight,
        speed: Math.random() * 3 + 11,
        color: FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)],
        exploded: false,
      });
    };

    // Staggered rocket launches
    const timeout1 = setTimeout(() => launchRocket(width * 0.25, height * (0.2 + Math.random() * 0.2)), 100);
    const timeout2 = setTimeout(() => launchRocket(width * 0.5, height * (0.15 + Math.random() * 0.2)), 350);
    const timeout3 = setTimeout(() => launchRocket(width * 0.75, height * (0.2 + Math.random() * 0.25)), 600);
    const timeout4 = setTimeout(() => launchRocket(width * 0.38, height * (0.18 + Math.random() * 0.2)), 1000);
    const timeout5 = setTimeout(() => launchRocket(width * 0.65, height * (0.16 + Math.random() * 0.2)), 1300);

    const createExplosion = (x: number, y: number, baseColor: string) => {
      const particleCount = 65;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 6 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: Math.random() > 0.3 ? baseColor : FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)],
          size: Math.random() * 2.5 + 1.5,
          decay: Math.random() * 0.015 + 0.01,
          gravity: 0.12,
        });
      }
    };

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        if (!r.exploded) {
          r.y -= r.speed;

          // Rocket spark trail
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = r.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = r.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (r.y <= r.targetY) {
            r.exploded = true;
            createExplosion(r.x, r.y, r.color);
            rockets.splice(i, 1);
          }
        }
      }

      // Render & update explosion particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const stopTimer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      setIsActive(false);
    }, durationSeconds * 1000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      clearTimeout(timeout5);
      clearTimeout(stopTimer);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [durationSeconds, shouldReduceMotion]);

  if (!isActive || shouldReduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
};
