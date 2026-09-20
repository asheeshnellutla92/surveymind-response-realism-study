import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01AttributionConfusion — brand-attribution-problem B01.
 * Three-line chart (Q1 → Q3): campaign spend (solid ink), NPS (terracotta),
 * and competitor spend (dashed grey, revealed in Phase 2).
 * Enacts: "The instinct to find one number and declare it the verdict is
 * precisely what the attribution problem exploits."
 * Source: Branding and AI, Ch. 13 (Nina Harris).
 */
export const brandB01AttributionConfusionSchema = z.object({
  sparkLine: z.string().default('The instinct to find one number is what the problem exploits.'),
});
export type BrandB01AttributionConfusionProps = z.infer<typeof brandB01AttributionConfusionSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Quarter labels
const QUARTERS = ['Q1', 'Q2', 'Q3'];

// Chart data (normalised 0–1 on y)
// Campaign spend: rises sharply in Q1, stable Q2–Q3
const CAMPAIGN_PTS = [
  { q: 0,   y: 0.20 },
  { q: 0.5, y: 0.72 },
  { q: 1,   y: 0.70 },
];
// NPS: follows campaign — rises Q1, slightly dips Q3
const NPS_PTS = [
  { q: 0,   y: 0.30 },
  { q: 0.5, y: 0.65 },
  { q: 1,   y: 0.62 },
];
// Competitor spend: drops in Q1 (same time as campaign launches) — hidden in Phase 1
const COMPETITOR_PTS = [
  { q: 0,   y: 0.75 },
  { q: 0.5, y: 0.30 },
  { q: 1,   y: 0.28 },
];

export const BrandB01AttributionConfusion: React.FC<BrandB01AttributionConfusionProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } }),
    0, 1,
  );
  const axisIn = clamp(
    spring({ frame: frame - 10, fps, config: { damping: 26, stiffness: 120, mass: 1 } }),
    0, 1,
  );

  // Phase 1 (0–90): campaign + NPS lines draw; "Declared: success" label appears
  const phase1Progress = clamp(interpolate(frame, [18, 85], [0, 1]), 0, 1);
  const successLabelIn = clamp(
    spring({ frame: frame - 70, fps, config: { damping: 24, stiffness: 110, mass: 1.1 } }),
    0, 1,
  );

  // Phase 2 (90+): competitor line appears; annotation appears
  const competitorProgress = clamp(interpolate(frame, [95, 160], [0, 1]), 0, 1);
  const annotationIn = clamp(
    spring({ frame: frame - 165, fps, config: { damping: 22, stiffness: 100, mass: 1.2 } }),
    0, 1,
  );
  const checklistIn = clamp(
    spring({ frame: frame - 210, fps, config: { damping: 22, stiffness: 100, mass: 1.2 } }),
    0, 1,
  );

  const sourceIn = clamp(interpolate(frame, [55, 75], [0, 1]), 0, 1);

  const PAD_H = width * 0.06;
  const PAD_V = height * 0.08;
  const CHART_L = PAD_H + width * 0.05;
  const CHART_R = width - PAD_H - width * 0.04;
  const CHART_W = CHART_R - CHART_L;
  // Expand chart to fill safe area — y≈170 to y≈880
  const CHART_Y = isPortrait ? height * 0.25 : height * 0.17;
  const CHART_H_PX = isPortrait ? height * 0.57 : height * 0.65;
  const CHART_T = CHART_Y;
  const CHART_B = CHART_T + CHART_H_PX;

  const toY = (pct: number) => CHART_B - pct * CHART_H_PX;
  const toX = (q: number) => CHART_L + q * CHART_W;

  // Build SVG polyline from points array
  const buildPath = (pts: { q: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.q)} ${toY(p.y)}`).join(' ');

  const campaignPath = buildPath(CAMPAIGN_PTS);
  const npsPath = buildPath(NPS_PTS);
  const competitorPath = buildPath(COMPETITOR_PTS);

  // Font sizes — FILL-THE-CANVAS law
  const titleSize = Math.round(Math.min(width, height) * 0.075);
  const subtitleSize = Math.round(Math.min(width, height) * 0.033);
  const sparkSize = Math.round(Math.min(width, height) * 0.034);
  const legendSize = Math.round(height * 0.026);   // ≈28px — legend item text min 26px
  const quarterLabelSize = Math.round(height * 0.028); // ≈30px — Q1/Q2/Q3 min 28px
  const yAxisLabelSize = Math.round(height * 0.026);   // ≈28px — y-axis min 26px
  const badgeSize = Math.round(height * 0.026);    // ≈28px — "Declared: success" min 26px
  const annotationSize = Math.round(height * 0.028); // ≈30px — annotations min 28px

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${PAD_V}px ${PAD_H}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: titleSize,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 6,
        opacity: titleIn,
        transform: `translateY(${(1 - titleIn) * 12}px)`,
        lineHeight: 1.1,
      }}>
        Correlation or Causation<span style={{ color: CLAUDE.SPARK }}>?</span>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: SANS,
        fontSize: subtitleSize,
        color: CLAUDE.INK_SOFT,
        marginBottom: 14,
        opacity: axisIn,
      }}>
        NPS rose when the campaign launched. So did something else happen at the same time?
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 36,
        marginBottom: 8,
        opacity: axisIn,
        fontFamily: SANS,
        fontSize: legendSize,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="32" height="16"><line x1="0" y1="8" x2="32" y2="8" stroke={CLAUDE.INK} strokeWidth="5"/></svg>
          <span style={{ color: CLAUDE.INK }}>Your campaign spend</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="32" height="16"><line x1="0" y1="8" x2="32" y2="8" stroke={CLAUDE.SPARK} strokeWidth="5"/></svg>
          <span style={{ color: CLAUDE.INK }}>NPS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: competitorProgress }}>
          <svg width="32" height="16">
            <line x1="0" y1="8" x2="32" y2="8" stroke={CLAUDE.INK_SOFT} strokeWidth="3"
              strokeDasharray="7,5"/>
          </svg>
          <span style={{ color: CLAUDE.INK_SOFT }}>Competitor spend</span>
        </div>
      </div>

      {/* SVG chart area */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Y-axis gridlines + labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <g key={pct} opacity={axisIn * 0.6}>
            <line
              x1={CHART_L} y1={toY(pct)}
              x2={CHART_R} y2={toY(pct)}
              stroke={CLAUDE.BORDER} strokeWidth="1"
            />
            <text
              x={CHART_L - 16} y={toY(pct) + 9}
              fontFamily={SANS} fontSize={yAxisLabelSize}
              fill={CLAUDE.INK_SOFT} textAnchor="end"
            >
              {Math.round(pct * 100)}%
            </text>
          </g>
        ))}

        {/* Q1 launch region highlight */}
        <rect
          x={toX(0)} y={CHART_T}
          width={toX(0.5) - toX(0)} height={CHART_H_PX}
          fill={`rgba(217,119,87,0.04)`}
          opacity={phase1Progress}
        />

        {/* Chart axes */}
        <g opacity={axisIn}>
          <line x1={CHART_L} y1={CHART_T - 10} x2={CHART_L} y2={CHART_B} stroke={CLAUDE.BORDER} strokeWidth="1.5"/>
          <line x1={CHART_L} y1={CHART_B} x2={CHART_R + 10} y2={CHART_B} stroke={CLAUDE.BORDER} strokeWidth="1.5"/>
        </g>

        {/* X-axis quarter labels */}
        {QUARTERS.map((q, i) => {
          const x = toX(i * 0.5);
          return (
            <g key={q} opacity={axisIn}>
              <line x1={x} y1={CHART_B} x2={x} y2={CHART_B + 8} stroke={CLAUDE.BORDER} strokeWidth="1.5"/>
              <text
                x={x} y={CHART_B + 38}
                fontFamily={SANS} fontSize={quarterLabelSize}
                fontWeight={600} fill={CLAUDE.INK_SOFT} textAnchor="middle"
              >{q}</text>
            </g>
          );
        })}

        {/* Competitor spend line (dashed, grey) — Phase 2 reveal */}
        <path
          d={competitorPath}
          fill="none"
          stroke={CLAUDE.INK_SOFT}
          strokeWidth="5"
          strokeDasharray="10,7"
          strokeLinecap="round"
          opacity={competitorProgress * 0.85}
          style={{ clipPath: `inset(0 ${(1 - competitorProgress) * 100}% 0 0)` }}
        />

        {/* Campaign spend line (solid, ink) */}
        <path
          d={campaignPath}
          fill="none"
          stroke={CLAUDE.INK}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={phase1Progress}
          style={{ clipPath: `inset(0 ${(1 - phase1Progress) * 100}% 0 0)` }}
        />

        {/* NPS line (solid, terracotta) */}
        <path
          d={npsPath}
          fill="none"
          stroke={CLAUDE.SPARK}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={phase1Progress}
          style={{ clipPath: `inset(0 ${(1 - phase1Progress) * 100}% 0 0)` }}
        />

        {/* Data dots on lines at each quarter */}
        {phase1Progress > 0.8 && CAMPAIGN_PTS.map((pt, i) => (
          <circle key={`camp-${i}`} cx={toX(pt.q)} cy={toY(pt.y)} r={9} fill={CLAUDE.INK} opacity={phase1Progress}/>
        ))}
        {phase1Progress > 0.8 && NPS_PTS.map((pt, i) => (
          <circle key={`nps-${i}`} cx={toX(pt.q)} cy={toY(pt.y)} r={9} fill={CLAUDE.SPARK} opacity={phase1Progress}/>
        ))}
        {competitorProgress > 0.8 && COMPETITOR_PTS.map((pt, i) => (
          <circle key={`comp-${i}`} cx={toX(pt.q)} cy={toY(pt.y)} r={9} fill={CLAUDE.INK_SOFT} opacity={competitorProgress}/>
        ))}

        {/* "Declared: success" label — Phase 1 */}
        {successLabelIn > 0.01 && (
          <g opacity={successLabelIn}>
            <rect
              x={toX(0.48)} y={toY(0.78)}
              width={220} height={46}
              rx={8}
              fill={CLAUDE.CARD}
              stroke={CLAUDE.BORDER}
            />
            <text
              x={toX(0.48) + 14} y={toY(0.78) + 30}
              fontFamily={SANS} fontSize={badgeSize}
              fontWeight={700} fill={CLAUDE.INK}
            >Declared: success ✓</text>
          </g>
        )}

        {/* "Correlation or causation?" annotation — Phase 2 */}
        {annotationIn > 0.01 && (
          <g opacity={annotationIn}>
            {/* Connecting bracket between campaign rise and competitor drop at Q1 */}
            <line
              x1={toX(0.02)} y1={toY(0.73)}
              x2={toX(0.02)} y2={toY(0.30)}
              stroke={CLAUDE.SPARK} strokeWidth="2.5"
              strokeDasharray="4,4"
            />
            <text
              x={toX(0.05)} y={toY(0.52)}
              fontFamily={SANS} fontSize={annotationSize}
              fontWeight={700} fill={CLAUDE.SPARK}
            >Same quarter</text>
          </g>
        )}

        {/* Checklist annotation box */}
        {checklistIn > 0.01 && (
          <g opacity={checklistIn}>
            <rect
              x={toX(0.54)} y={CHART_T + 14}
              width={CHART_R - toX(0.54) - 14} height={76}
              rx={10}
              fill={`rgba(217,119,87,0.10)`}
              stroke={CLAUDE.SPARK}
              strokeWidth="1.5"
            />
            <text
              x={toX(0.54) + 16} y={CHART_T + 46}
              fontFamily={SANS} fontSize={annotationSize}
              fontWeight={700} fill={CLAUDE.SPARK}
            >The checklist forces</text>
            <text
              x={toX(0.54) + 16} y={CHART_T + 78}
              fontFamily={SANS} fontSize={annotationSize}
              fontWeight={700} fill={CLAUDE.SPARK}
            >the question first.</text>
          </g>
        )}
      </svg>

      {/* Spark line footer */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        left: PAD_H,
        fontFamily: SANS,
        fontSize: sparkSize,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
        fontStyle: 'italic',
      }}>
        {sparkLine}
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: sparkSize,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 13
      </div>
    </AbsoluteFill>
  );
};
