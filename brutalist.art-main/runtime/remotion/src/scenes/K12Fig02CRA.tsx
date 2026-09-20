import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig02CRA — "Climbing the Representation Ladder"
 * Source: Agent Skills for K-12 Teachers (Anthropic) — k12-lesson-differentiation
 *
 * Manim move: accumulate (pieces building up from concrete → representational → abstract)
 *
 * 1/3 + 1/2 shown as three rungs on a ladder, animating bottom-up:
 *   Rung 1 (Concrete): fraction circles
 *   Rung 2 (Representational): tape diagram
 *   Rung 3 (Abstract): symbolic equation + explanation
 *
 * Terracotta: the arrows connecting rungs — the upward climb IS the scaffold.
 * All tiers solve the SAME problem; the rung entered differs by tier.
 */

export const k12Fig02CRASchema = z.object({
  sparkLine: z.string().default('Same problem. Different rung to start.'),
});
export type K12Fig02CRAProps = z.infer<typeof k12Fig02CRASchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const RUNGS = [
  {
    label: 'Concrete', tier: 'Below enters here',
    desc: 'Arrange fraction circles: one-third circle + one-half circle → push together → see the sum is 5/6.',
    visual: '⅓ ○ + ½ ○ → 5/6 ●',
    hot: false,
  },
  {
    label: 'Representational', tier: 'At enters here',
    desc: 'Draw a tape diagram divided into thirds and halves. Find the common unit.',
    visual: '|—|—|—|  +  |—|—|',
    hot: false,
  },
  {
    label: 'Abstract', tier: 'Above enters here',
    desc: '1/3 + 1/2 = 2/6 + 3/6 = 5/6. Explain: why does the common-denominator step work?',
    visual: '1/3 + 1/2 = 5/6',
    hot: true,
  },
];

export const K12Fig02CRA: React.FC<K12Fig02CRAProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CARD_W = width * 0.55;
  const CARD_CX = width * 0.42;
  const RUNG_H = height * 0.155;
  const RUNG_GAP = height * 0.04;
  const TOTAL_H = 3 * RUNG_H + 2 * RUNG_GAP;
  const TOP_Y = (height - TOTAL_H) * 0.52;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        CRA PROGRESSION · 1/3 + 1/2 · ALL TIERS SAME PROBLEM
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Climb toward abstract without reducing the task.
      </div>

      {/* Ladder rungs (bottom-up accumulate) */}
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={width} height={height}>
        {/* Upward arrows between rungs */}
        {[0, 1].map(i => {
          const bottomY = TOP_Y + (2 - i) * (RUNG_H + RUNG_GAP) + RUNG_H;
          const topY = bottomY - RUNG_GAP;
          const anim = spring({ frame: frame - 10 - (2 - i) * 14 - 10, fps, config: { damping: 22, stiffness: 80, mass: 1 } });
          return (
            <React.Fragment key={i}>
              <line x1={CARD_CX} y1={bottomY} x2={CARD_CX} y2={topY}
                stroke={CLAUDE.SPARK} strokeWidth={2.5}
                strokeDasharray="4 3"
                opacity={clamp(anim, 0, 1)}
              />
              <polygon
                points={`${CARD_CX},${topY - 6} ${CARD_CX - 6},${topY + 4} ${CARD_CX + 6},${topY + 4}`}
                fill={CLAUDE.SPARK} opacity={clamp(anim, 0, 1)}
              />
            </React.Fragment>
          );
        })}
      </svg>

      {/* Rung cards (bottom first = Concrete at index 0 = displayed at bottom) */}
      {[...RUNGS].reverse().map((r, ri) => {
        const realIdx = 2 - ri; // concrete=2(bottom), repr=1(mid), abstract=0(top) in reversed display
        const displayRow = ri; // 0=top in reversed = abstract, 2=bottom=concrete
        // We want concrete at bottom (row 2), repr at middle (row 1), abstract at top (row 0)
        // So display order: [Abstract, Representational, Concrete] top→bottom
        // ri=0 → Abstract (top), ri=1 → Repr (mid), ri=2 → Concrete (bottom)
        const rungY = TOP_Y + ri * (RUNG_H + RUNG_GAP);
        // Animate bottom-up: concrete first (ri=2), then repr (ri=1), then abstract (ri=0)
        const delay = 10 + (2 - ri) * 14;
        const bAnim = spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
        const prog = clamp(bAnim, 0, 1);

        return (
          <React.Fragment key={r.label}>
            <div style={{
              position: 'absolute',
              left: CARD_CX - CARD_W / 2, top: rungY,
              width: CARD_W, height: RUNG_H - 6,
              background: r.hot ? '#FEF5F0' : CLAUDE.CARD,
              borderRadius: 12,
              border: `${r.hot ? 2 : 1}px solid ${r.hot ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              opacity: prog,
              transform: `translateY(${(1 - prog) * 10}px)`,
              display: 'flex', flexDirection: 'column' as const,
              padding: '10px 18px',
              justifyContent: 'center' as const,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: SERIF, fontSize: height * 0.020, fontWeight: 700, color: r.hot ? CLAUDE.SPARK : CLAUDE.INK }}>
                  {r.label}
                </span>
                <span style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST }}>
                  {r.tier}
                </span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT, marginTop: 5, lineHeight: 1.35 }}>
                {r.desc}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: height * 0.020, color: r.hot ? CLAUDE.SPARK : CLAUDE.INK, marginTop: 5 }}>
                {r.visual}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Side label */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: TOP_Y + TOTAL_H / 2 - 20,
        fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
        writingMode: 'vertical-rl' as const,
        transform: 'rotate(180deg)',
        opacity: clamp(titleIn, 0, 1),
      }}>
        ← more abstract
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
