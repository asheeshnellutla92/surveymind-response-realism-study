import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * TeachClaudeFig3 — Eval Performance vs Training Data Size (Act 3; scatter, log-scale x)
 * Source: Anthropic, "Teaching Claude why", May 2026
 *
 * x-axis: training tokens (M), log scale
 * y-axis: weighted mean misalignment score, lower = better
 *
 * Anchors:
 *   "Difficult advice" single point: ~3M tokens, score ~0.01 (pareto winner)
 *   Honeypot variants: scattered ~20–100M tokens, scores ~0.02–0.18
 *   Claude Sonnet 4 baseline: dashed reference line at ~0.22
 *
 * Animate: baseline dashed line draws first; honeypot cluster rains in;
 *   then the lone difficult-advice point lands bottom-left with terracotta ring.
 *
 * Per CLAUDE-BRAND.md: one terracotta accent per beat (the difficult-advice point).
 */

export const teachClaudeFig3Schema = z.object({
  sparkLine: z.string().default('28x less data. Better score.'),
});
export type TeachClaudeFig3Props = z.infer<typeof teachClaudeFig3Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Log scale: map token count to [0,1] over log range [1M, 200M]
const LOG_MIN = Math.log10(1);
const LOG_MAX = Math.log10(200);
const tokenToX = (m: number) => (Math.log10(m) - LOG_MIN) / (LOG_MAX - LOG_MIN);

// Score: map [0, 0.25] to [0,1] (y axis inverted — lower score = higher position)
const scoreToY = (s: number) => 1 - s / 0.25;

// Illustrative honeypot cluster (smooth, not raw data)
const HONEYPOTS = [
  { tokens: 22, score: 0.17 },
  { tokens: 30, score: 0.13 },
  { tokens: 45, score: 0.08 },
  { tokens: 55, score: 0.12 },
  { tokens: 70, score: 0.06 },
  { tokens: 85, score: 0.10 },
  { tokens: 100, score: 0.05 },
  { tokens: 38, score: 0.15 },
  { tokens: 60, score: 0.18 },
  { tokens: 80, score: 0.09 },
];

// The pareto winner
const DIFFICULT_ADVICE = { tokens: 3, score: 0.01 };

export const TeachClaudeFig3: React.FC<TeachClaudeFig3Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.10;
  const PAD_Y = height * 0.08;
  const CHART_TOP = height * 0.28;
  const CHART_BOTTOM = height * 0.82;
  const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;
  const CHART_LEFT = PAD_X + 60;
  const CHART_RIGHT = width - PAD_X;
  const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const baselineIn = spring({ frame: frame - 15, fps, config: { damping: 30, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 85, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const BASELINE_Y_SCORE = 0.22;
  const baselineY = CHART_TOP + (1 - scoreToY(BASELINE_Y_SCORE)) * CHART_HEIGHT;

  // Honeypots rain in with staggered delay
  const honeypotAnims = HONEYPOTS.map((_, i) =>
    spring({ frame: frame - 30 - i * 5, fps, config: { damping: 28, stiffness: 100, mass: 0.7 } })
  );

  const difficultAnim = spring({ frame: frame - 65, fps, config: { damping: 20, stiffness: 80, mass: 1.1 } });
  const ringAnim = spring({ frame: frame - 68, fps, config: { damping: 18, stiffness: 60, mass: 1.2 } });

  const ptX = (tok: number) => CHART_LEFT + tokenToX(tok) * CHART_WIDTH;
  const ptY = (score: number) => CHART_TOP + (1 - scoreToY(score)) * CHART_HEIGHT;

  // X axis tick marks (log scale)
  const X_TICKS = [1, 3, 10, 30, 100, 200];
  // Y axis tick marks
  const Y_TICKS = [0, 0.05, 0.10, 0.15, 0.20, 0.22];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        TRAINING DATA SIZE VS EVAL PERFORMANCE · LOWER IS BETTER
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Three million tokens. Best score.
      </div>

      {/* Y axis gridlines + labels */}
      {Y_TICKS.map(v => {
        const y = CHART_TOP + (1 - scoreToY(v)) * CHART_HEIGHT;
        const isBaseline = v === 0.22;
        return (
          <React.Fragment key={v}>
            <div style={{
              position: 'absolute', left: CHART_LEFT, top: y,
              width: CHART_WIDTH, height: 1,
              background: isBaseline ? CLAUDE.INK : CLAUDE.BORDER,
              opacity: isBaseline ? 0 : 0.5,
              borderStyle: 'none',
            }} />
            <div style={{
              position: 'absolute', right: width - CHART_LEFT + 8, top: y - 8,
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.GHOST, textAlign: 'right' as const,
            }}>
              {v.toFixed(2)}
            </div>
          </React.Fragment>
        );
      })}

      {/* Baseline dashed reference line */}
      <svg style={{
        position: 'absolute', left: CHART_LEFT, top: CHART_TOP,
        width: CHART_WIDTH, height: CHART_HEIGHT,
        overflow: 'visible',
        opacity: clamp(baselineIn, 0, 1),
      }}>
        <line
          x1={0} y1={baselineY - CHART_TOP}
          x2={CHART_WIDTH * clamp(baselineIn, 0, 1)} y2={baselineY - CHART_TOP}
          stroke={CLAUDE.INK_SOFT} strokeWidth={2}
          strokeDasharray="8 5"
        />
        <text x={CHART_WIDTH - 4} y={baselineY - CHART_TOP - 8}
          fontFamily={SANS} fontSize={height * 0.013}
          fill={CLAUDE.INK_SOFT} textAnchor="end">
          Sonnet 4 baseline
        </text>
      </svg>

      {/* X axis tick labels */}
      {X_TICKS.map(v => {
        const x = CHART_LEFT + tokenToX(v) * CHART_WIDTH;
        return (
          <div key={v} style={{
            position: 'absolute', left: x - 20, top: CHART_BOTTOM + 8,
            width: 40, textAlign: 'center' as const,
            fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
          }}>
            {v < 10 ? `${v}M` : `${v}M`}
          </div>
        );
      })}

      {/* X axis label */}
      <div style={{
        position: 'absolute',
        left: CHART_LEFT, right: PAD_X,
        top: CHART_BOTTOM + 30,
        textAlign: 'center' as const,
        fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
      }}>
        Training tokens (M) — log scale
      </div>

      {/* Y axis label */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: CHART_TOP + CHART_HEIGHT / 2 - 60,
        width: 120,
        fontFamily: SANS, fontSize: height * 0.012,
        color: CLAUDE.GHOST, lineHeight: 1.4,
      }}>
        Weighted mean
        misalignment
        score
      </div>

      {/* Honeypot cluster */}
      {HONEYPOTS.map((pt, i) => {
        const anim = honeypotAnims[i];
        const x = ptX(pt.tokens);
        const y = ptY(pt.score);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x - 7, top: y - 7,
            width: 14, height: 14,
            borderRadius: '50%',
            background: CLAUDE.INK,
            opacity: clamp(anim, 0, 1) * 0.55,
            transform: `scale(${clamp(anim, 0, 1)})`,
          }} />
        );
      })}

      {/* Difficult advice point + ring */}
      {clamp(difficultAnim, 0, 1) > 0.01 && (() => {
        const x = ptX(DIFFICULT_ADVICE.tokens);
        const y = ptY(DIFFICULT_ADVICE.score);
        const ring = clamp(ringAnim, 0, 1);
        return (
          <>
            {/* Terracotta ring */}
            <svg style={{
              position: 'absolute',
              left: x - 28, top: y - 28,
              width: 56, height: 56, overflow: 'visible',
            }}>
              <circle cx={28} cy={28} r={22 * ring}
                fill="none" stroke={CLAUDE.SPARK} strokeWidth={2.5}
                strokeDasharray={`${2 * Math.PI * 22 * ring} ${2 * Math.PI * 22}`}
                opacity={ring}
              />
            </svg>
            {/* Point */}
            <div style={{
              position: 'absolute',
              left: x - 8, top: y - 8,
              width: 16, height: 16,
              borderRadius: '50%',
              background: CLAUDE.SPARK,
              transform: `scale(${clamp(difficultAnim, 0, 1)})`,
            }} />
            {/* Label */}
            {ring > 0.6 && (
              <div style={{
                position: 'absolute',
                left: x + 18, top: y - 24,
                fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 600,
                color: CLAUDE.SPARK, whiteSpace: 'nowrap' as const,
                opacity: (ring - 0.6) / 0.4,
              }}>
                "Difficult advice"
                <br />
                <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK, fontWeight: 400 }}>
                  3M tokens · best score
                </span>
              </div>
            )}
          </>
        );
      })()}

      {/* Baseline / Y axis */}
      <div style={{
        position: 'absolute', left: CHART_LEFT, top: CHART_BOTTOM,
        width: CHART_WIDTH, height: 2, background: CLAUDE.INK, opacity: 0.2,
      }} />

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Redrawn (simplified) from Anthropic, "Teaching Claude why", 2026
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

    </AbsoluteFill>
  );
};
