import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig07ExpertiseReversal — "Expertise Reversal Effect"
 * Source: Agent Skills for K-12 Teachers (Anthropic)
 *
 * Chart: X = Expertise Level (Novice→Expert), Y = Benefit (0–100%)
 *   Curve 1: Scaffold benefit — HIGH left, curves DOWN right. Dashed grey.
 *   Curve 2: Independent generation demand — LOW left, curves UP right. Solid terracotta.
 *   Crossing point ~50% x.
 * Phase 1: Axes appear, then curves draw left→right.
 * Phase 2 (90): Vertical dashed line at crossing + zone labels + CRA annotation.
 */

export const k12Fig07ExpertiseReversalSchema = z.object({
  sparkLine: z.string().default('The CRA rung that helped yesterday is noise today.'),
});
export type K12Fig07ExpertiseReversalProps = z.infer<typeof k12Fig07ExpertiseReversalSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PHASE_SWITCH = 90;

// Cubic bezier via quadratic interpolation for a smooth S-curve
// Scaffold benefit: high → low. Points: (0,0.9) (0.35,0.65) (0.65,0.25) (1,0.08)
function scaffoldY(t: number): number {
  const pts = [[0, 0.9], [0.35, 0.65], [0.65, 0.25], [1, 0.08]];
  // cubic bezier
  const u = 1 - t;
  return (
    u * u * u * pts[0][1] +
    3 * u * u * t * pts[1][1] +
    3 * u * t * t * pts[2][1] +
    t * t * t * pts[3][1]
  );
}
// Demand: low → high. Points: (0,0.08) (0.35,0.30) (0.65,0.70) (1,0.92)
function demandY(t: number): number {
  const pts = [[0, 0.08], [0.35, 0.30], [0.65, 0.70], [1, 0.92]];
  const u = 1 - t;
  return (
    u * u * u * pts[0][1] +
    3 * u * u * t * pts[1][1] +
    3 * u * t * t * pts[2][1] +
    t * t * t * pts[3][1]
  );
}

const CROSS_T = 0.50; // parameter t where curves cross
const N_STEPS = 60;

export const K12Fig07ExpertiseReversal: React.FC<K12Fig07ExpertiseReversalProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axisIn = spring({ frame: frame - 10, fps, config: { damping: 24, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 18, stiffness: 80 } });
  const showP2 = frame >= PHASE_SWITCH;

  // Curve draw progress 0→1 over frames 20–80
  const curveProg = clamp(interpolate(frame, [20, 80], [0, 1]), 0, 1);

  // Chart bounds
  const CX = PAD_X + 60;
  const CY_TOP = height * 0.20;
  const CY_BOT = height * 0.72;
  const CW = width - PAD_X - 100 - CX;
  const CH = CY_BOT - CY_TOP;

  const toSvgX = (t: number) => CX + t * CW;
  const toSvgY = (v: number) => CY_BOT - v * CH; // v in [0,1]

  // Build polyline points up to curveProg
  const maxSteps = Math.max(1, Math.round(curveProg * N_STEPS));
  const scaffoldPts: string[] = [];
  const demandPts: string[] = [];
  for (let i = 0; i <= maxSteps; i++) {
    const t = i / N_STEPS;
    scaffoldPts.push(`${toSvgX(t)},${toSvgY(scaffoldY(t))}`);
    demandPts.push(`${toSvgX(t)},${toSvgY(demandY(t))}`);
  }

  const crossX = toSvgX(CROSS_T);
  const crossY = toSvgY(scaffoldY(CROSS_T)); // ~0.5 benefit

  const axisProg = clamp(axisIn, 0, 1);
  const p2 = clamp(phase2In, 0, 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        EXPERTISE REVERSAL EFFECT · CRA LADDER
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        The scaffold that helps the novice harms the expert.
      </div>

      {/* Y-axis label */}
      <div style={{
        position: 'absolute',
        left: PAD_X - 10,
        top: CY_TOP + CH / 2 - 10,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT,
        writingMode: 'vertical-rl' as const,
        transform: 'rotate(180deg)',
        opacity: axisProg,
      }}>
        Benefit (%)
      </div>

      {/* X-axis labels */}
      <div style={{
        position: 'absolute', left: CX - 10, top: CY_BOT + height * 0.02,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT,
        opacity: axisProg,
      }}>
        Novice
      </div>
      <div style={{
        position: 'absolute', right: width - CX - CW - 10, top: CY_BOT + height * 0.02,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT,
        opacity: axisProg,
      }}>
        Expert →
      </div>

      {/* Chart SVG */}
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={width} height={height}>
        {/* Axes */}
        <line x1={CX} y1={CY_TOP} x2={CX} y2={CY_BOT + 8}
          stroke={CLAUDE.BORDER} strokeWidth={2} opacity={axisProg} />
        <line x1={CX - 8} y1={CY_BOT} x2={CX + CW} y2={CY_BOT}
          stroke={CLAUDE.BORDER} strokeWidth={2} opacity={axisProg} />

        {/* Y-axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1.0].map(v => (
          <g key={v} opacity={axisProg}>
            <line x1={CX - 6} y1={toSvgY(v)} x2={CX} y2={toSvgY(v)}
              stroke={CLAUDE.BORDER} strokeWidth={1.5} />
            <text x={CX - 10} y={toSvgY(v) + 5} textAnchor="end"
              fontFamily={SANS} fontSize={height * 0.010} fill={CLAUDE.GHOST}>
              {Math.round(v * 100)}%
            </text>
          </g>
        ))}

        {/* Scaffold curve — dashed grey */}
        {curveProg > 0 && (
          <polyline
            points={scaffoldPts.join(' ')}
            fill="none"
            stroke={CLAUDE.INK_SOFT}
            strokeWidth={2.5}
            strokeDasharray="7 4"
          />
        )}

        {/* Demand curve — solid terracotta */}
        {curveProg > 0 && (
          <polyline
            points={demandPts.join(' ')}
            fill="none"
            stroke={CLAUDE.SPARK}
            strokeWidth={3}
          />
        )}

        {/* Phase 2: vertical crossing line */}
        {showP2 && (
          <line
            x1={crossX} y1={CY_TOP + (1 - p2) * CH}
            x2={crossX} y2={CY_BOT}
            stroke={CLAUDE.INK} strokeWidth={1.5} strokeDasharray="5 3"
            opacity={p2}
          />
        )}

        {/* Crossing dot */}
        {showP2 && (
          <circle cx={crossX} cy={crossY} r={6}
            fill={CLAUDE.PAGE} stroke={CLAUDE.INK} strokeWidth={2}
            opacity={p2}
          />
        )}
      </svg>

      {/* Legend */}
      {curveProg > 0.4 && (
        <div style={{
          position: 'absolute',
          right: PAD_X, top: CY_TOP + height * 0.02,
          display: 'flex', flexDirection: 'column' as const, gap: 8,
          opacity: curveProg,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={30} height={12}>
              <line x1={0} y1={6} x2={30} y2={6}
                stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} strokeDasharray="6 4" />
            </svg>
            <span style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT }}>
              Scaffold benefit
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={30} height={12}>
              <line x1={0} y1={6} x2={30} y2={6}
                stroke={CLAUDE.SPARK} strokeWidth={3} />
            </svg>
            <span style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK }}>
              Independent demand
            </span>
          </div>
        </div>
      )}

      {/* Phase 2: zone labels */}
      {showP2 && (
        <>
          <div style={{
            position: 'absolute',
            left: CX + 8, top: CY_TOP + height * 0.03,
            width: crossX - CX - 16,
            fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
            color: CLAUDE.INK_SOFT, textAlign: 'center' as const,
            opacity: p2,
          }}>
            scaffold helps
          </div>
          <div style={{
            position: 'absolute',
            left: crossX + 8, top: CY_TOP + height * 0.03,
            width: CX + CW - crossX - 16,
            fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
            color: CLAUDE.SPARK, textAlign: 'center' as const,
            opacity: p2,
          }}>
            scaffold harms
          </div>
          <div style={{
            position: 'absolute',
            left: PAD_X, top: CY_BOT + height * 0.06,
            right: PAD_X,
            fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT,
            textAlign: 'center' as const, fontStyle: 'italic',
            opacity: p2,
          }}>
            CRA ladder = a trajectory across this curve.
          </div>
        </>
      )}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Agent Skills for K-12 Teachers (Anthropic)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    
      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>
    </AbsoluteFill>

  );
};
