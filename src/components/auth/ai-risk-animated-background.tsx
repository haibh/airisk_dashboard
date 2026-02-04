'use client';

/**
 * AI Risk themed SVG background for the auth pages.
 * Renders neural network nodes, shield shapes, data-flow connections,
 * and floating particles. Theme-adaptive via CSS classes.
 * Pure CSS animations (no JS animation libraries).
 */
export function AIRiskAnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Neural network connection lines */}
        <g className="ai-scene-float-slow" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.06">
          <line x1="120" y1="150" x2="350" y2="280" />
          <line x1="350" y1="280" x2="580" y2="180" />
          <line x1="580" y1="180" x2="800" y2="320" />
          <line x1="800" y1="320" x2="1050" y2="200" />
          <line x1="1050" y1="200" x2="1300" y2="350" />
          <line x1="200" y1="550" x2="450" y2="650" />
          <line x1="450" y1="650" x2="700" y2="520" />
          <line x1="700" y1="520" x2="950" y2="680" />
          <line x1="950" y1="680" x2="1200" y2="550" />
          <line x1="350" y1="280" x2="450" y2="650" />
          <line x1="800" y1="320" x2="700" y2="520" />
          <line x1="1050" y1="200" x2="1200" y2="550" />
        </g>

        {/* Neural network nodes */}
        <g filter="url(#glow)">
          {[
            [120, 150], [350, 280], [580, 180], [800, 320], [1050, 200], [1300, 350],
            [200, 550], [450, 650], [700, 520], [950, 680], [1200, 550],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i % 3 === 0 ? 5 : 3}
              fill="currentColor"
              opacity={i % 3 === 0 ? 0.15 : 0.08}
              className={i % 2 === 0 ? 'ai-scene-node-pulse' : 'ai-scene-node-pulse-alt'}
            />
          ))}
        </g>

        {/* Shield icon shape — top-left area */}
        <g className="ai-scene-float-medium" transform="translate(100, 80) scale(0.6)" opacity="0.06">
          <path
            d="M24 4L4 10v10c0 11 8.2 17.2 20 22 11.8-4.8 20-11 20-22V10L24 4z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>

        {/* Shield icon — bottom-right area */}
        <g className="ai-scene-float-slow" transform="translate(1250, 650) scale(0.8)" opacity="0.04">
          <path
            d="M24 4L4 10v10c0 11 8.2 17.2 20 22 11.8-4.8 20-11 20-22V10L24 4z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>

        {/* Data flow dashed arcs */}
        <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="8 6" opacity="0.05">
          <path d="M0 400 Q 360 300 720 400 T 1440 400" className="ai-scene-dash-flow" />
          <path d="M0 500 Q 360 600 720 500 T 1440 500" className="ai-scene-dash-flow-rev" />
        </g>

        {/* Hexagonal grid pattern — AI/tech motif */}
        <g className="ai-scene-float-medium" opacity="0.04" fill="none" stroke="currentColor" strokeWidth="0.5">
          {[
            [1100, 100], [1160, 135], [1160, 200], [1100, 235], [1040, 200], [1040, 135],
          ].map(([x, y], i, arr) => (
            <line key={i} x1={x} y1={y} x2={arr[(i + 1) % arr.length][0]} y2={arr[(i + 1) % arr.length][1]} />
          ))}
          {[
            [300, 700], [360, 735], [360, 800], [300, 835], [240, 800], [240, 735],
          ].map(([x, y], i, arr) => (
            <line key={`h2-${i}`} x1={x} y1={y} x2={arr[(i + 1) % arr.length][0]} y2={arr[(i + 1) % arr.length][1]} />
          ))}
        </g>
      </svg>

      {/* Floating particles — theme-adaptive via CSS class */}
      <div className="auth-bg-particle ai-scene-float-slow" style={{ left: '10%', top: '20%', width: 6, height: 6 }} />
      <div className="auth-bg-particle ai-scene-float-medium" style={{ left: '25%', top: '70%', width: 4, height: 4 }} />
      <div className="auth-bg-particle ai-scene-float-fast" style={{ left: '75%', top: '15%', width: 5, height: 5 }} />
      <div className="auth-bg-particle ai-scene-float-slow" style={{ left: '85%', top: '60%', width: 3, height: 3 }} />
      <div className="auth-bg-particle ai-scene-float-medium" style={{ left: '50%', top: '85%', width: 4, height: 4 }} />
      <div className="auth-bg-particle ai-scene-float-fast" style={{ left: '60%', top: '30%', width: 6, height: 6 }} />
      <div className="auth-bg-particle ai-scene-float-slow" style={{ left: '35%', top: '45%', width: 3, height: 3 }} />
      <div className="auth-bg-particle ai-scene-float-medium" style={{ left: '90%', top: '40%', width: 5, height: 5 }} />
    </div>
  );
}
