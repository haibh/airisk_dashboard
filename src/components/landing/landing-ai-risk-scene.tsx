'use client';

/**
 * Pure-CSS animated SVG background for the landing page.
 * No JS mouse tracking — all motion via CSS keyframes for maximum performance.
 * Theme-adaptive via CSS `currentColor` and `.dark` selectors.
 * Depicts: neural-network nodes, shield shapes, data-flow streams, risk indicators.
 */
export function LandingAIRiskScene() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="lg">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="fg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Hexagonal grid — far layer */}
        <g className="ai-scene-float-slow" opacity="0.035" fill="none" stroke="currentColor" strokeWidth="0.5">
          {hexPoints.map((pts, i) => (
            <polygon key={i} points={pts} />
          ))}
        </g>

        {/* Neural-network connections */}
        <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.06">
          {connections.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>

        {/* Network nodes */}
        <g filter="url(#lg)">
          {nodes.map(([cx, cy, r, alt], i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="currentColor"
              opacity={r > 4 ? 0.15 : 0.08}
              className={alt ? 'ai-scene-node-pulse-alt' : 'ai-scene-node-pulse'}
            />
          ))}
        </g>

        {/* Risk-level dots — semantic colors, work in both themes */}
        {riskDots.map(([cx, cy, color], i) => (
          <circle
            key={i} cx={cx} cy={cy} r="3.5"
            fill={color} opacity="0.45"
            className="ai-scene-node-pulse-alt"
          />
        ))}

        {/* Shield shapes */}
        {shields.map(([tx, ty, s, op], i) => (
          <g key={i} className="ai-scene-float-slow" transform={`translate(${tx},${ty}) scale(${s})`} opacity={op}>
            <path
              d="M24 4L4 10v10c0 11 8.2 17.2 20 22 11.8-4.8 20-11 20-22V10L24 4z"
              fill="currentColor" stroke="currentColor" strokeWidth="1" opacity="0.15"
            />
          </g>
        ))}

        {/* Data-flow streams */}
        <g stroke="url(#fg)" strokeWidth="1.5" fill="none" strokeDasharray="10 8">
          <path d="M0 350 Q 360 260 720 350 T 1440 350" className="ai-scene-dash-flow" />
          <path d="M0 550 Q 360 640 720 550 T 1440 550" className="ai-scene-dash-flow-rev" />
        </g>
      </svg>

      {/* Floating CSS particles */}
      {particles.map(([left, top, size, cls], i) => (
        <div key={i} className={`landing-particle ${cls}`} style={{ left, top, width: size, height: size }} />
      ))}
    </div>
  );
}

/* ── Static data ──────────────────────────────────────────────────── */

const nodes: [number, number, number, boolean][] = [
  [150, 160, 5, false], [380, 280, 3, true], [600, 140, 5, false],
  [820, 310, 4, true], [1060, 190, 5, false], [1300, 340, 3, true],
  [220, 560, 4, false], [480, 660, 3, true], [720, 530, 5, false],
  [960, 690, 3, true], [1220, 560, 4, false],
];

const connections: [number, number, number, number][] = [
  [150, 160, 380, 280], [380, 280, 600, 140], [600, 140, 820, 310],
  [820, 310, 1060, 190], [1060, 190, 1300, 340], [220, 560, 480, 660],
  [480, 660, 720, 530], [720, 530, 960, 690], [960, 690, 1220, 560],
  [380, 280, 480, 660], [820, 310, 720, 530], [1060, 190, 1220, 560],
];

const riskDots: [number, number, string][] = [
  [180, 220, '#10b981'], [550, 380, '#f59e0b'], [900, 250, '#f43f5e'],
  [1150, 480, '#10b981'], [350, 750, '#f59e0b'],
];

const shields: [number, number, number, number][] = [
  [80, 60, 0.6, 0.08], [1280, 680, 0.7, 0.06], [1350, 120, 0.5, 0.05],
];

const particles: [string, string, number, string][] = [
  ['8%', '18%', 5, 'ai-scene-float-slow'], ['22%', '72%', 4, 'ai-scene-float-medium'],
  ['78%', '12%', 5, 'ai-scene-float-fast'], ['88%', '58%', 3, 'ai-scene-float-slow'],
  ['48%', '82%', 4, 'ai-scene-float-medium'], ['62%', '28%', 5, 'ai-scene-float-fast'],
];

/* Pre-computed hexagonal grid points */
const hexPoints = (() => {
  const hexes: string[] = [];
  const size = 60, startX = 140, startY = 80, count = 6, cols = 3;
  for (let i = 0; i < count; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = startX + col * size * 1.8 + (row % 2 === 1 ? size * 0.9 : 0);
    const cy = startY + row * size * 1.6;
    hexes.push(
      Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k - Math.PI / 6;
        return `${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`;
      }).join(' ')
    );
  }
  return hexes;
})();
