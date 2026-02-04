'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

/**
 * Mouse-tracking radial glow that follows the cursor across the auth page.
 * Creates an interactive spotlight effect on the background.
 * Theme-adaptive: subtle blue in light mode, brighter in dark mode.
 * Uses requestAnimationFrame for smooth 60fps tracking.
 */
export function LoginMouseGlowTracker() {
  const glowRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let animId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el.style.transform = `translate(${currentX - 200}px, ${currentY - 200}px)`;
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const gradient = resolvedTheme === 'dark'
    ? 'radial-gradient(circle, rgba(140,180,255,0.15) 0%, rgba(100,140,255,0.05) 40%, transparent 70%)'
    : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.03) 40%, transparent 70%)';

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed z-0 h-[400px] w-[400px] rounded-full opacity-0 transition-opacity duration-700 auth-mouse-glow"
      aria-hidden="true"
      style={{ background: gradient }}
    />
  );
}
