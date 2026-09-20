import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig01Division — "Same Hard Case, Different Scaffold"
 * Source: Agent Skills for K-12 Teachers (Anthropic) — k12-lesson-differentiation
 *
 * Manim move: scan (eye sweeps across three representations of the SAME problem)
 *
 * 17 ÷ 5 shown in three stacked tiers, animating bottom-up:
 *   Below (concrete): array diagram of 17 objects grouped by 5, leftovers circled
 *   At (representational): 17 ÷ 5 = 3 R2
 *   Above (abstract): Why must R < divisor? Proof scaffold.
 *
 * Terracotta: the "leftovers circled" moment — the hard case lives here.
 * Phase 2: scan arrow sweeps left→right across all three tiers to show they
 * all meet at the SAME hard case (remainder), just entered differently.
 */

export const k12Fig01DivisionSchema = z.object({
  sparkLine: z.string().default('Same hard case. Different door in.'),
});
export type K12Fig01DivisionProps = z.infer<typeof k12Fig01DivisionSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PHASE_SWITCH = 75;
const TIERS = [
  { label: 'Below', tag: 'Concrete', color: CLAUDE.INK },
  { label: 'At',    tag: 'Representational', color: CLAUDE.INK_SOFT },
  { label: 'Above', tag: 'Abstract', color: CLAUDE.GHOST },
];

// Array of 17 dots in groups of 5
const DOTS: { x: number; y: number; isRemainder: boolean }[] = [];
for (let g = 0; g < 3; g++) {
  for (let d = 0; d < 5; d++) {
    DOTS.push({ x: g * 52 + d * 9, y: 0, isRemainder: false });
  }
}
DOTS.push({ x: 3 * 52, y: 0, isRemainder: true });
DOTS.push({ x: 3 * 52 + 9, y: 0, isRemainder: true });

export const K12Fig01Division: React.FC<K12Fig01DivisionProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showP2 = frame >= PHASE_SWITCH;
  const scanProgress = clamp(interpolate(frame, [PHASE_SWITCH, PHASE_SWITCH + 60], [0, 1]), 0, 1);

  const CARD_LEFT = PAD_X;
  const CARD_RIGHT = width - PAD_X;
  const CARD_W = CARD_RIGHT - CARD_LEFT;
  const TIER_H = height * 0.17;
  const TIER_Y = [height * 0.26, height * 0.46, height * 0.66];
  const LABEL_W = 130;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        DIVISION WITH REMAINDER · THREE TIERS · SAME PROBLEM
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        All tiers meet the hard case.
      </div>

      {/* Scan arrow (phase 2) */}
      {showP2 && (
        <div style={{
          position: 'absolute',
          left: CARD_LEFT + LABEL_W + (CARD_W - LABEL_W) * scanProgress - 2,
          top: TIER_Y[0] - 10,
          width: 2, height: TIER_Y[2] + TIER_H - TIER_Y[0] + 20,
          background: CLAUDE.SPARK,
          opacity: 0.5,
          transition: 'none',
        }} />
      )}

      {/* Three tier cards */}
      {TIERS.map((t, ti) => {
        const bAnim = spring({ frame: frame - 8 - ti * 14, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
        const prog = clamp(bAnim, 0, 1);
        const y = TIER_Y[ti];

        return (
          <React.Fragment key={t.label}>
            {/* Card background */}
            <div style={{
              position: 'absolute',
              left: CARD_LEFT, top: y,
              width: CARD_W, height: TIER_H - 6,
              background: CLAUDE.CARD, borderRadius: 12,
              border: `1px solid ${CLAUDE.BORDER}`,
              opacity: prog,
              transform: `translateY(${(1 - prog) * 12}px)`,
            }} />

            {/* Tier label */}
            <div style={{
              position: 'absolute',
              left: CARD_LEFT + 18, top: y + 10,
              fontFamily: SERIF, fontSize: height * 0.018, fontWeight: 700,
              color: ti === 0 ? CLAUDE.SPARK : t.color,
              opacity: prog,
            }}>
              {t.label}
            </div>
            <div style={{
              position: 'absolute',
              left: CARD_LEFT + 18, top: y + 32,
              fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
              opacity: prog,
            }}>
              {t.tag}
            </div>

            {/* Content area */}
            <div style={{
              position: 'absolute',
              left: CARD_LEFT + LABEL_W + 20, top: y + 14,
              right: width - CARD_RIGHT + 20,
              fontFamily: ti === 1 ? SERIF : SANS,
              fontSize: ti === 1 ? height * 0.024 : height * 0.015,
              color: CLAUDE.INK,
              opacity: prog,
              lineHeight: 1.4,
            }}>
              {ti === 0 && (
                <span>
                  Draw 17 dots in groups of 5. Count the groups.{' '}
                  <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>
                    Circle the 2 left over.
                  </span>
                  {' '}→ 3 groups, 2 remaining.
                </span>
              )}
              {ti === 1 && (
                <span>
                  17 ÷ 5 = 3 R<span style={{ color: CLAUDE.SPARK }}>2</span>
                  {'  '}
                  <span style={{ fontFamily: SANS, fontSize: height * 0.015, color: CLAUDE.INK_SOFT }}>
                    "Each basket gets 3 apples, <span style={{ color: CLAUDE.SPARK }}>2 left over</span>."
                  </span>
                </span>
              )}
              {ti === 2 && (
                <span>
                  17 ÷ 5 = 3 R2 — now prove: <em>why must the remainder always be less than the divisor?</em>
                  <span style={{ color: CLAUDE.GHOST }}> (What would happen if R ≥ 5?)</span>
                </span>
              )}
            </div>

            {/* Divider between label and content */}
            <div style={{
              position: 'absolute',
              left: CARD_LEFT + LABEL_W, top: y + 8,
              width: 1, height: TIER_H - 22,
              background: CLAUDE.BORDER,
              opacity: prog * 0.6,
            }} />
          </React.Fragment>
        );
      })}

      {/* Problem statement */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y + height * 0.04,
        background: CLAUDE.CARD, borderRadius: 10, border: `1px solid ${CLAUDE.BORDER}`,
        padding: '10px 16px',
        fontFamily: SERIF, fontSize: height * 0.018, color: CLAUDE.INK,
        opacity: clamp(titleIn, 0, 1),
      }}>
        17 ÷ 5 = ?
      </div>

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
