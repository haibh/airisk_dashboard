'use client';

/**
 * CSS-only mouse glow effect for auth pages.
 * Uses CSS custom properties + :hover for a subtle spotlight effect.
 * No JS animation loop — better performance than requestAnimationFrame tracking.
 * The actual glow follows cursor via CSS in globals.css (.auth-mouse-glow-area).
 */
export function LoginMouseGlowTracker() {
  return (
    <div
      className="auth-mouse-glow-area pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
