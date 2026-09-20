import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcSixVariants — C2 centerpiece for "Six Agent Variants"
 * Six agent variants stacked left-to-right (naive → visual → typography
 * → palette → density → QA-loop) with per-variant score-delta bars beneath
 * each — greens for gains, terracotta for regressions.
 * Source: eval-driven-agent-development/ — CWC Workshop 2026
 */

export const cwcSixVariantsSchema = z.object({
  sparkLine: z.string().default('Each change. Measured.'),
});
export type CwcSixVariantsProps = z.infer<typeof cwcSixVariantsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Variant data: label, short name, deltas [readability, layout, overflow, contrast] (-100 to +100)
const VARIANTS = [
  { label: 'Naive', short: 'V1', deltas: [0, 0, 0, 0], baseline: true },
  { label: 'Visual', short: 'V2', deltas: [+12, +8, -5, +6], baseline: false },
  { label: 'Typography', short: 'V3', deltas: [+18, +11, -12, +9], baseline: false },
  { label: 'Palette', short: 'V4', deltas: [+6, +4, -3, +22], baseline: false },
  { label: 'Density', short: 'V5', deltas: [+14, +18, -8, +5], baseline: false },
  { label: 'QA-loop', short: 'V6', deltas: [+22, +24, -18, +14], baseline: false },
];

const METRICS = ['readability', 'layout', 'overflow', 'contrast'];
const METRIC_COLORS = [CLAUDE.SPARK, '#4CAF50', '#FF9800', '#2196F3'];

export const CwcSixVariants: React.FC<CwcSixVariantsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.04;
  const PAD_Y = height * 0.08;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  const colW = (width - PAD_X * 2) / VARIANTS.length;
  const BAR_AREA_TOP = PAD_Y + height * 0.32;
  const BAR_AREA_H = height * 0.38;
  const sparkIn = spring({ frame: frame - 220, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        AGENT VARIANTS · SCORE DELTAS ACROSS 10-TASK EVAL SUITE
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(headerIn, 0, 1),
      }}>
        Six prompt iterations — same rubric, every run
      </div>

      {/* Metric legend */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y + height * 0.04,
        display: 'flex', gap: 16, alignItems: 'center',
        opacity: clamp(headerIn, 0, 1),
      }}>
        {METRICS.map((m, i) => (
          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: METRIC_COLORS[i] }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT }}>{m}</span>
          </div>
        ))}
      </div>

      {/* Variant columns */}
      {VARIANTS.map((v, vi) => {
        const varIn = spring({ frame: frame - 20 - vi * 22, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
        const colX = PAD_X + vi * colW;
        const isAccent = vi === 2; // Typography is the terracotta focal variant

        return (
          <React.Fragment key={v.label}>
            {/* Card header */}
            <div style={{
              position: 'absolute',
              left: colX + colW * 0.05,
              top: PAD_Y + height * 0.14,
              width: colW * 0.90,
              borderRadius: 10,
              background: isAccent ? `${CLAUDE.SPARK}18` : CLAUDE.CARD,
              border: `1.5px solid ${isAccent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              padding: '10px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              opacity: clamp(varIn, 0, 1),
              transform: `translateY(${(1 - clamp(varIn, 0, 1)) * 14}px)`,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
                color: isAccent ? CLAUDE.SPARK : CLAUDE.INK_SOFT, letterSpacing: 1,
                textTransform: 'uppercase' as const,
              }}>{v.short}</div>
              <div style={{
                fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 700,
                color: isAccent ? CLAUDE.SPARK : CLAUDE.INK,
              }}>{v.label}</div>
              {v.baseline && (
                <div style={{
                  fontFamily: SANS, fontSize: height * 0.010,
                  color: CLAUDE.GHOST, marginTop: 2,
                }}>baseline</div>
              )}
            </div>

            {/* Delta bars — 4 metrics stacked */}
            {v.deltas.map((delta, mi) => {
              const barIn = spring({ frame: frame - 60 - vi * 20 - mi * 10, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
              const barH = BAR_AREA_H / METRICS.length;
              const barY = BAR_AREA_TOP + mi * barH;
              const maxDelta = 30;
              const barW = (Math.abs(delta) / maxDelta) * (colW * 0.70) * clamp(barIn, 0, 1);
              const isPositive = delta >= 0;
              const color = mi === 2
                ? (isPositive ? CLAUDE.SPARK : '#4CAF50') // overflow: regression is good (less overflow)
                : (isPositive ? '#4CAF50' : CLAUDE.SPARK); // others: positive is good

              return (
                <div key={mi} style={{
                  position: 'absolute',
                  left: colX + colW * 0.10,
                  top: barY + barH * 0.20,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  opacity: clamp(barIn, 0, 1),
                }}>
                  {delta !== 0 && (
                    <>
                      <div style={{
                        width: Math.max(4, barW), height: barH * 0.38,
                        background: color, borderRadius: 3,
                      }} />
                      <div style={{
                        fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700,
                        color: color,
                      }}>
                        {delta > 0 ? '+' : ''}{delta}%
                      </div>
                    </>
                  )}
                  {delta === 0 && (
                    <div style={{
                      width: 4, height: barH * 0.38,
                      background: CLAUDE.BORDER, borderRadius: 3,
                    }} />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.12,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Claude Code Workshops (Anthropic) — eval-driven-agent-development
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
