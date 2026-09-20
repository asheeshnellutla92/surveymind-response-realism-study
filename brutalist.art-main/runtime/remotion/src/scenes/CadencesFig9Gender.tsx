import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig9Gender — "Who Uses It Differently" (rebuilt from report Fig 3.8; exact).
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Four bars, women − men in outcome SDs, occupation-controlled, CI whiskers:
 *   Work-use share:    −0.09
 *   Claude Code share: −0.24 (6.3pp)
 *   Automation share:  −0.33 (7.3pp)
 *   Total active mins: +0.24   ← terracotta moment (the one positive bar)
 *
 * Terracotta moment: the +0.24 active-minutes bar.
 */

export const cadencesFig9GenderSchema = z.object({
  sparkLine: z.string().default('More time. More iterative. More collaborative.'),
});
export type CadencesFig9GenderProps = z.infer<typeof cadencesFig9GenderSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const BARS = [
  { label: 'Work-use share',    delta: -0.09, pp: null,    hot: false },
  { label: 'Claude Code share', delta: -0.24, pp: '6.3pp', hot: false },
  { label: 'Automation share',  delta: -0.33, pp: '7.3pp', hot: false },
  { label: 'Total active mins', delta: +0.24, pp: null,    hot: true  },
];

const CI_HALF = 0.06; // approximate CI half-width in SDs
const MAX_ABS = 0.45;

export const CadencesFig9Gender: React.FC<CadencesFig9GenderProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CHART_LEFT  = PAD_X + 180;
  const CHART_RIGHT = width - PAD_X;
  const CHART_W     = CHART_RIGHT - CHART_LEFT;
  const CENTER_X    = CHART_LEFT + CHART_W / 2;
  const BAR_TOP     = height * 0.28;
  const ROW_H       = height * 0.12;
  const BAR_H       = height * 0.05;

  const unitW = (CHART_W / 2) / MAX_ABS;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        WOMEN − MEN · OUTCOME SDs · OCCUPATION-CONTROLLED
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Less delegation. More time. Different mode.
      </div>

      {/* Sample size note */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
        opacity: clamp(titleIn, 0, 1), textAlign: 'right' as const,
      }}>
        Women = 12% of linked sample
      </div>

      {/* Zero axis */}
      <div style={{
        position: 'absolute', left: CENTER_X - 1, top: BAR_TOP - 10,
        width: 2, height: BARS.length * ROW_H + 20,
        background: CLAUDE.BORDER,
      }} />

      {/* Scale ticks */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map(v => (
        <React.Fragment key={v}>
          <div style={{
            position: 'absolute',
            left: CENTER_X + v * unitW - 18, top: BAR_TOP + BARS.length * ROW_H + 4,
            width: 36, fontFamily: SANS, fontSize: height * 0.012,
            color: CLAUDE.GHOST, textAlign: 'center' as const,
            opacity: clamp(titleIn, 0, 1),
          }}>
            {v > 0 ? `+${v}` : v === 0 ? '0' : v}
          </div>
        </React.Fragment>
      ))}

      {/* Axis label */}
      <div style={{
        position: 'absolute', left: CHART_LEFT + CHART_W / 2 - 40,
        top: BAR_TOP + BARS.length * ROW_H + 26,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(titleIn, 0, 1),
      }}>
        SDs (women − men)
      </div>

      {/* Bars */}
      {BARS.map((b, i) => {
        const bAnim = spring({ frame: frame - 15 - i * 10, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
        const y = BAR_TOP + i * ROW_H;
        const bw = Math.abs(b.delta) * unitW * clamp(bAnim, 0, 1);
        const isPos = b.delta > 0;

        return (
          <React.Fragment key={b.label}>
            {/* Row label */}
            <div style={{
              position: 'absolute', right: width - CHART_LEFT + 8, top: y + 10,
              fontFamily: SERIF, fontSize: height * 0.015, color: CLAUDE.INK,
              textAlign: 'right' as const, opacity: clamp(bAnim, 0, 1),
              whiteSpace: 'nowrap' as const,
            }}>
              {b.label}
            </div>

            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: isPos ? CENTER_X : CENTER_X - bw,
              top: y + 6,
              width: bw, height: BAR_H,
              background: b.hot ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              borderRadius: isPos ? '0 4px 4px 0' : '4px 0 0 4px',
            }} />

            {/* CI whisker */}
            {clamp(bAnim, 0, 1) > 0.6 && (
              <div style={{
                position: 'absolute',
                left: isPos ? CENTER_X + bw - CI_HALF * unitW : CENTER_X - bw - CI_HALF * unitW,
                top: y + 6,
                width: CI_HALF * 2 * unitW, height: BAR_H,
                border: `2px solid ${CLAUDE.BORDER}`,
                background: 'transparent',
              }} />
            )}

            {/* Delta label */}
            {clamp(bAnim, 0, 1) > 0.8 && (
              <div style={{
                position: 'absolute',
                left: isPos
                  ? CENTER_X + bw + CI_HALF * unitW + 8
                  : CENTER_X - bw - CI_HALF * unitW - 60,
                top: y + 8,
                fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
                color: b.hot ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              }}>
                {b.delta > 0 ? `+${b.delta}` : b.delta}
                {b.pp ? ` (${b.pp})` : ''}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data (†digitized): Anthropic Economic Index, Cadences (June 2026), Fig 3.8
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
