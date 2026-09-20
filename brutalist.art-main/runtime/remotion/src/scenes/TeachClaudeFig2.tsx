import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * TeachClaudeFig2 — Training on the Eval Barely Works (Act 2; 3-bar reveal)
 * Source: Anthropic, "Teaching Claude why", May 2026
 *
 * Misalignment rate bars (lower = better):
 *   Honeypot-matched training: 22% → 15%
 *   Responses rewritten with values deliberation: 3%
 *
 * Animate (two phases):
 *   phase "baseline" (default): 22% bar stands at full height, then 15% bar
 *     grows beside it — narration "barely moved".
 *   phase "deliberation": all three bars visible, 3% drops in (terracotta).
 *
 * Per CLAUDE-BRAND.md: one terracotta accent per beat (the 3% bar).
 * Caption: "Redrawn (simplified) from Anthropic, 'Teaching Claude why', 2026"
 */

export const teachClaudeFig2Schema = z.object({
  sparkLine: z.string().default('Same prompts. Different results.'),
  phase: z.enum(['baseline', 'deliberation']).default('baseline'),
});
export type TeachClaudeFig2Props = z.infer<typeof teachClaudeFig2Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const BARS = [
  { label: 'Honeypot\ntraining', value: 22, color: '#73705F', isAccent: false },
  { label: 'Honeypot training\n+ matched data', value: 15, color: CLAUDE.INK, isAccent: false },
  { label: 'Honeypot training\n+ value deliberation', value: 3, color: CLAUDE.SPARK, isAccent: true },
];

export const TeachClaudeFig2: React.FC<TeachClaudeFig2Props> = ({ sparkLine, phase }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.12;
  const CHART_TOP = height * 0.28;
  const CHART_BOTTOM = height * 0.78;
  const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;
  const CHART_LEFT = PAD_X + 40;
  const CHART_RIGHT = width - PAD_X;
  const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  const bar0Anim = spring({ frame: frame - 15, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const bar1Anim = spring({ frame: frame - 35, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const bar2Anim = phase === 'deliberation'
    ? spring({ frame: frame - 15, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } })
    : spring({ frame: frame - 9999, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const barAnims = [bar0Anim, bar1Anim, bar2Anim];

  const sparkIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const MAX_VAL = 25;
  const nBars = phase === 'deliberation' ? 3 : 2;
  const BAR_W = Math.min(180, CHART_WIDTH / (nBars * 2));
  const BAR_SPACING = CHART_WIDTH / nBars;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        TRAINING ON THE EVAL · MISALIGNMENT RATE · LOWER IS BETTER
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
        maxWidth: width * 0.75,
      }}>
        {phase === 'deliberation'
          ? 'The reasons mattered more than the answers.'
          : 'Training on the eval barely works.'}
      </div>

      {/* Y axis gridlines */}
      {[0, 5, 10, 15, 20].map(v => {
        const y = CHART_BOTTOM - (v / MAX_VAL) * CHART_HEIGHT;
        return (
          <React.Fragment key={v}>
            <div style={{
              position: 'absolute', left: CHART_LEFT, top: y,
              width: CHART_WIDTH, height: 1,
              background: CLAUDE.BORDER, opacity: 0.6,
            }} />
            <div style={{
              position: 'absolute', right: width - CHART_LEFT + 8, top: y - 9,
              fontFamily: SANS, fontSize: height * 0.013,
              color: CLAUDE.GHOST, textAlign: 'right' as const,
            }}>
              {v}%
            </div>
          </React.Fragment>
        );
      })}

      {/* Bars */}
      {BARS.slice(0, phase === 'deliberation' ? 3 : 2).map((bar, bi) => {
        const anim = barAnims[bi];
        const barH = (bar.value / MAX_VAL) * CHART_HEIGHT * clamp(anim, 0, 1);
        const barX = CHART_LEFT + bi * BAR_SPACING + (BAR_SPACING - BAR_W) / 2;

        return (
          <React.Fragment key={bi}>
            <div style={{
              position: 'absolute',
              left: barX, top: CHART_BOTTOM - barH,
              width: BAR_W, height: barH,
              background: bar.color,
              borderRadius: '4px 4px 0 0',
              boxShadow: bar.isAccent ? `0 0 20px ${CLAUDE.SPARK}66` : 'none',
            }} />

            {/* Value label above bar */}
            {clamp(anim, 0, 1) > 0.7 && (
              <div style={{
                position: 'absolute',
                left: barX,
                top: CHART_BOTTOM - barH - 28,
                width: BAR_W,
                textAlign: 'center' as const,
                fontFamily: SANS, fontSize: height * 0.028, fontWeight: 700,
                color: bar.isAccent ? CLAUDE.SPARK : CLAUDE.INK,
              }}>
                {bar.value}%
              </div>
            )}

            {/* Bar label below axis */}
            <div style={{
              position: 'absolute',
              left: barX,
              top: CHART_BOTTOM + 10,
              width: BAR_W,
              textAlign: 'center' as const,
              fontFamily: SERIF, fontSize: height * 0.015,
              color: CLAUDE.INK, lineHeight: 1.35, whiteSpace: 'pre-line' as const,
              opacity: clamp(anim, 0, 1),
            }}>
              {bar.label}
            </div>
          </React.Fragment>
        );
      })}

      {/* Baseline axis */}
      <div style={{
        position: 'absolute', left: CHART_LEFT, top: CHART_BOTTOM,
        width: CHART_WIDTH, height: 2, background: CLAUDE.INK, opacity: 0.25,
      }} />

      {/* "Barely moved" annotation for baseline phase */}
      {phase === 'baseline' && clamp(bar1Anim, 0, 1) > 0.6 && (
        <div style={{
          position: 'absolute',
          left: CHART_LEFT + BAR_SPACING,
          top: CHART_BOTTOM - (15 / MAX_VAL) * CHART_HEIGHT - 58,
          fontFamily: SERIF, fontSize: height * 0.018, fontStyle: 'italic',
          color: CLAUDE.INK_SOFT,
        }}>
          barely moved
        </div>
      )}

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
