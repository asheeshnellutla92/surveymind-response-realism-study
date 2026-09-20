import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01DualTrack — B01 beat for brand-metrics-performance-dashboard.
 * Enacts the narration: two line charts on one timeline. Conversion rises (+30%)
 * then brand equity curves down. The two never connect — neither team sees the
 * other's signal. Final annotation: "Both true. Neither connected."
 * Duration: 640 frames @ 30fps (21.3s)
 * Source: Branding and AI, Chapter 13 — Measuring Brand Equity (Nina Harris).
 */
export const brandB01DualTrackSchema = z.object({
  sparkLine: z.string().default('Both true. Neither connected.'),
});
export type BrandB01DualTrackProps = z.infer<typeof brandB01DualTrackSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// X-axis: Month 1 → Month 6
const MONTHS = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
// Conversion rate: rises steeply after campaign in month 1
const CONVERSION_VALUES = [30, 68, 75, 78, 80, 82]; // %
// Brand equity: starts at baseline, curves down after campaign discount
const EQUITY_VALUES = [72, 70, 64, 56, 48, 40]; // %

const GREEN = '#4A7C59';

export const BrandB01DualTrack: React.FC<BrandB01DualTrackProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const PAD_H = width * 0.06;
  const PAD_V = height * 0.10;

  // Two chart panels stacked
  const CHART_W = width - PAD_H * 2;
  const CHART_H = isPortrait ? height * 0.25 : height * 0.30;
  const CHART_GAP = height * 0.05;

  // Top chart (conversion) Y start
  const TOP_Y = isPortrait ? height * 0.30 : height * 0.20;
  // Bottom chart (brand equity) Y start
  const BOT_Y = TOP_Y + CHART_H + CHART_GAP;

  const xFor = (i: number) => PAD_H + (i / (MONTHS.length - 1)) * CHART_W;
  const yForTop = (pct: number) => TOP_Y + CHART_H - (pct / 100) * CHART_H;
  const yForBot = (pct: number) => BOT_Y + CHART_H - (pct / 100) * CHART_H;

  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Phase 1: draw conversion line (frames 0–90)
  const convProgress = clamp(interpolate(frame, [12, 85], [0, 5]), 0, 5);

  // Dashboard "+30%" label
  const dashboardIn = clamp(
    spring({ frame: frame - 55, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }),
    0, 1
  );

  // Phase 2: draw brand equity line (frames 90–220)
  const equityProgress = clamp(interpolate(frame, [90, 220], [0, 5]), 0, 5);

  // Phase 2 labels
  const equityLabelIn = clamp(
    spring({ frame: frame - 140, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Final annotation: "Both true. Neither connected."
  const finalAnnotationIn = clamp(
    spring({ frame: frame - 240, fps, config: { damping: 26, stiffness: 100, mass: 1 } }),
    0, 1
  );

  const footerIn = clamp(interpolate(frame, [60, 80], [0, 1]), 0, 1);

  // Build polyline string up to progress
  const buildLine = (
    values: number[],
    xFn: (i: number) => number,
    yFn: (v: number) => number,
    upTo: number
  ): string => {
    const pts: string[] = [];
    const fullIdx = Math.floor(upTo);
    for (let i = 0; i <= fullIdx && i < values.length; i++) {
      pts.push(`${xFn(i)},${yFn(values[i])}`);
    }
    if (fullIdx < values.length - 1 && upTo > fullIdx) {
      const frac = upTo - fullIdx;
      const x = xFn(fullIdx) + frac * (xFn(fullIdx + 1) - xFn(fullIdx));
      const y = yFn(values[fullIdx]) + frac * (yFn(values[fullIdx + 1]) - yFn(values[fullIdx]));
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  };

  const convPoints = buildLine(CONVERSION_VALUES, xFor, yForTop, convProgress);
  const equityPoints = buildLine(EQUITY_VALUES, xFor, yForBot, equityProgress);

  // Separator line between panels — missing connection
  const sepY = TOP_Y + CHART_H + CHART_GAP / 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: PAD_V * 0.44,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SERIF,
        fontSize: Math.round(Math.min(width, height) * 0.075),
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
        lineHeight: 1.1,
      }}>
        Two tracks. One timeline. No connection
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Subtitle */}
      <div style={{
        position: 'absolute',
        top: PAD_V * 0.44 + (isPortrait ? height * 0.175 : height * 0.095),
        left: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(height * 0.026),
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        Deep-discount campaign: Month 1 through Month 6.
      </div>

      {/* SVG charts */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={width}
        height={height}
      >
        {/* ── TOP CHART: Conversion rate ── */}
        {/* Panel label */}
        <text
          x={PAD_H} y={TOP_Y - 14}
          fontFamily={SANS} fontSize={26} fontWeight={700}
          fill={GREEN}
          opacity={titleIn}
        >
          PERFORMANCE METRIC — Conversion Rate
        </text>

        {/* Grid + axes */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <g key={`top-${pct}`} opacity={titleIn}>
            <line
              x1={PAD_H} y1={yForTop(pct)}
              x2={PAD_H + CHART_W} y2={yForTop(pct)}
              stroke={CLAUDE.BORDER} strokeWidth={1}
              strokeDasharray={pct === 0 ? 'none' : '3 3'}
            />
            <text
              x={PAD_H - 8} y={yForTop(pct) + 4}
              fontFamily={MONO} fontSize={24}
              fill={CLAUDE.INK_SOFT} textAnchor="end"
            >
              {pct}%
            </text>
          </g>
        ))}
        <line
          x1={PAD_H} y1={TOP_Y}
          x2={PAD_H} y2={TOP_Y + CHART_H}
          stroke={CLAUDE.BORDER} strokeWidth={1.5}
          opacity={titleIn}
        />

        {/* Conversion line */}
        {convPoints.length > 0 && (
          <polyline
            points={convPoints}
            fill="none"
            stroke={GREEN}
            strokeWidth={5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Conversion data dots */}
        {MONTHS.map((_, i) => {
          if (i > Math.floor(convProgress) + (convProgress % 1 > 0.8 ? 0 : -1)) return null;
          return (
            <circle
              key={`cd-${i}`}
              cx={xFor(i)} cy={yForTop(CONVERSION_VALUES[i])}
              r={9}
              fill={CLAUDE.CARD}
              stroke={GREEN}
              strokeWidth={2}
            />
          );
        })}

        {/* "+30%" dashboard label */}
        {frame >= 55 && (
          <g opacity={dashboardIn}>
            <rect
              x={xFor(1) - 70} y={yForTop(CONVERSION_VALUES[1]) - 56}
              width={160} height={46}
              rx={5}
              fill={`rgba(74,124,89,0.10)`}
              stroke={GREEN}
            />
            <text
              x={xFor(1) + 10} y={yForTop(CONVERSION_VALUES[1]) - 24}
              fontFamily={MONO} fontSize={28} fontWeight={700}
              fill={GREEN} textAnchor="middle"
            >
              ✓ +30%
            </text>
          </g>
        )}

        {/* "Performance metric says: success" label */}
        {frame >= 70 && (
          <text
            x={PAD_H + CHART_W * 0.55} y={yForTop(75)}
            fontFamily={SANS} fontSize={24} fontWeight={600}
            fill={GREEN}
            opacity={clamp(interpolate(frame, [70, 90], [0, 1]), 0, 1)}
          >
            Performance metric says: success.
          </text>
        )}

        {/* X-axis month labels (shared, below top chart) */}
        {MONTHS.map((m, i) => (
          <text
            key={`xl-${i}`}
            x={xFor(i)} y={TOP_Y + CHART_H + 18}
            fontFamily={MONO} fontSize={24}
            fill={CLAUDE.INK_SOFT} textAnchor="middle"
            opacity={titleIn}
          >
            {m}
          </text>
        ))}

        {/* Gap divider — "No connection" */}
        <line
          x1={PAD_H} y1={sepY}
          x2={PAD_H + CHART_W} y2={sepY}
          stroke={CLAUDE.BORDER} strokeWidth={1}
          strokeDasharray="8 6"
          opacity={titleIn}
        />

        {/* ── BOTTOM CHART: Brand equity ── */}
        {/* Panel label */}
        <text
          x={PAD_H} y={BOT_Y - 14}
          fontFamily={SANS} fontSize={26} fontWeight={700}
          fill={frame >= 90 ? CLAUDE.SPARK : CLAUDE.INK_SOFT}
          opacity={frame >= 90 ? equityLabelIn : titleIn}
        >
          BRAND METRIC — Brand Equity / Price Premium
        </text>

        {/* Grid + axes */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <g key={`bot-${pct}`} opacity={titleIn}>
            <line
              x1={PAD_H} y1={yForBot(pct)}
              x2={PAD_H + CHART_W} y2={yForBot(pct)}
              stroke={CLAUDE.BORDER} strokeWidth={1}
              strokeDasharray={pct === 0 ? 'none' : '3 3'}
            />
            <text
              x={PAD_H - 8} y={yForBot(pct) + 4}
              fontFamily={MONO} fontSize={24}
              fill={CLAUDE.INK_SOFT} textAnchor="end"
            >
              {pct}%
            </text>
          </g>
        ))}
        <line
          x1={PAD_H} y1={BOT_Y}
          x2={PAD_H} y2={BOT_Y + CHART_H}
          stroke={CLAUDE.BORDER} strokeWidth={1.5}
          opacity={titleIn}
        />

        {/* Brand equity line — terracotta, draws in phase 2 */}
        {frame >= 90 && equityPoints.length > 0 && (
          <polyline
            points={equityPoints}
            fill="none"
            stroke={CLAUDE.SPARK}
            strokeWidth={5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Equity data dots */}
        {frame >= 90 && MONTHS.map((_, i) => {
          if (i > equityProgress) return null;
          return (
            <circle
              key={`ed-${i}`}
              cx={xFor(i)} cy={yForBot(EQUITY_VALUES[i])}
              r={9}
              fill={CLAUDE.CARD}
              stroke={CLAUDE.SPARK}
              strokeWidth={2}
            />
          );
        })}

        {/* "Brand metric says: damage" annotation */}
        {frame >= 140 && (
          <g opacity={equityLabelIn}>
            <rect
              x={xFor(3) + 10} y={yForBot(EQUITY_VALUES[3]) - 32}
              width={340} height={38}
              rx={4}
              fill={`rgba(217,119,87,0.08)`}
              stroke={CLAUDE.SPARK}
            />
            <text
              x={xFor(3) + 180} y={yForBot(EQUITY_VALUES[3]) - 7}
              fontFamily={SANS} fontSize={24} fontWeight={700}
              fill={CLAUDE.SPARK} textAnchor="middle"
            >
              Brand metric says: damage.
            </text>
          </g>
        )}

        {/* X-axis month labels (bottom chart) */}
        {MONTHS.map((m, i) => (
          <text
            key={`bxl-${i}`}
            x={xFor(i)} y={BOT_Y + CHART_H + 18}
            fontFamily={MONO} fontSize={24}
            fill={CLAUDE.INK_SOFT} textAnchor="middle"
            opacity={frame >= 90 ? equityLabelIn : 0}
          >
            {m}
          </text>
        ))}
      </svg>

      {/* Final annotation: "Both true. Neither connected." */}
      {frame >= 240 && (
        <div style={{
          position: 'absolute',
          right: PAD_H,
          bottom: height * 0.14,
          background: CLAUDE.CARD,
          border: `1.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 10,
          padding: '10px 18px',
          fontFamily: SANS,
          fontSize: Math.round(height * 0.028),
          fontWeight: 700,
          color: CLAUDE.INK,
          opacity: finalAnnotationIn,
          transform: `translateY(${(1 - finalAnnotationIn) * 12}px)`,
          boxShadow: '0 2px 16px rgba(61,57,41,0.08)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: GREEN }}>Conversion: high.</span>
          {'  '}
          <span style={{ color: CLAUDE.SPARK }}>Brand equity: low.</span>
          <br />
          <span style={{ color: CLAUDE.INK_SOFT, fontWeight: 400 }}>Both true. Neither connected.</span>
        </div>
      )}

      {/* Footer sparkLine */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(Math.min(width, height) * 0.034),
        color: CLAUDE.INK_SOFT,
        opacity: footerIn,
        borderTop: `1px solid ${CLAUDE.BORDER}`,
        paddingTop: 10,
      }}>
        <span style={{ color: CLAUDE.SPARK, fontWeight: 700, marginRight: 8 }}>The failure:</span>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
