import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CodingAgentsFig4Use — "What They Use It For" (paired bars; †exact).
 * Source: Anthropic, Coding Agents in the Social Sciences (May 2026)
 *
 * Agent users vs other AI users, cascade by rank:
 *   Code 97|77 · Edit prose 87|72 · Method advice 77|63
 *   Lit review 76|60 · Draft prose 54|30 · Generate ideas 47|32
 *
 * Terracotta annotation on Draft prose: "the slop panic is about writing; the adoption is about code."
 * Aggregate chip: only ~1/3 of all AI users have drafted prose at all.
 */

export const codingAgentsFig4UseSchema = z.object({
  sparkLine: z.string().default('The adoption is about code. Not prose.'),
});
export type CodingAgentsFig4UseProps = z.infer<typeof codingAgentsFig4UseSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const USE_CASES = [
  { label: 'Generate analysis code', agent: 97, other: 77, hot: false },
  { label: 'Edit prose',             agent: 87, other: 72, hot: false },
  { label: 'Method advice',          agent: 77, other: 63, hot: false },
  { label: 'Literature review',      agent: 76, other: 60, hot: false },
  { label: 'Draft prose',            agent: 54, other: 30, hot: true  },
  { label: 'Generate ideas',         agent: 47, other: 32, hot: false },
];

export const CodingAgentsFig4Use: React.FC<CodingAgentsFig4UseProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const LABEL_W = 230;
  const CHART_LEFT = PAD_X + LABEL_W + 12;
  const CHART_RIGHT = width - PAD_X - 100;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const CHART_TOP = height * 0.26;
  const GROUP_H = (height * 0.58) / USE_CASES.length;
  const BAR_H = GROUP_H * 0.28;
  const BAR_GAP = GROUP_H * 0.06;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const barW = (pct: number, prog: number) => (pct / 100) * CHART_W * prog;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        % SELECTING EACH USE CASE
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Not the slop panic. The code.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y + height * 0.055,
        display: 'flex', flexDirection: 'column' as const, gap: 6,
        opacity: clamp(titleIn, 0, 1),
      }}>
        {[
          { label: 'Coding agent users', color: CLAUDE.INK },
          { label: 'Other AI users', color: CLAUDE.INK_SOFT },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 10, background: l.color, borderRadius: 2 }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      {USE_CASES.map((u, i) => {
        const bAnim = spring({ frame: frame - 10 - i * 10, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
        const prog = clamp(bAnim, 0, 1);
        const cy = CHART_TOP + i * GROUP_H;

        return (
          <React.Fragment key={u.label}>
            {/* Row label */}
            <div style={{
              position: 'absolute',
              right: width - CHART_LEFT + 10, top: cy + 4,
              fontFamily: SERIF, fontSize: height * 0.015,
              color: u.hot ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'right' as const,
              whiteSpace: 'nowrap' as const,
              opacity: prog,
            }}>
              {u.label}
            </div>

            {/* Agent bar (dark, top) */}
            <div style={{
              position: 'absolute',
              left: CHART_LEFT, top: cy + 2,
              width: barW(u.agent, prog), height: BAR_H,
              background: u.hot ? CLAUDE.SPARK : CLAUDE.INK,
              borderRadius: '0 4px 4px 0',
            }} />
            {prog > 0.5 && (
              <div style={{
                position: 'absolute',
                left: CHART_LEFT + barW(u.agent, prog) + 8, top: cy + 2,
                fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
                color: u.hot ? CLAUDE.SPARK : CLAUDE.INK,
              }}>
                {u.agent}%
              </div>
            )}

            {/* Other AI bar (lighter, bottom) */}
            <div style={{
              position: 'absolute',
              left: CHART_LEFT, top: cy + 2 + BAR_H + BAR_GAP,
              width: barW(u.other, prog), height: BAR_H,
              background: CLAUDE.INK_SOFT,
              borderRadius: '0 4px 4px 0',
              opacity: 0.7,
            }} />
            {prog > 0.5 && (
              <div style={{
                position: 'absolute',
                left: CHART_LEFT + barW(u.other, prog) + 8, top: cy + 2 + BAR_H + BAR_GAP,
                fontFamily: SANS, fontSize: height * 0.012,
                color: CLAUDE.INK_SOFT,
              }}>
                {u.other}%
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Draft prose annotation */}
      <div style={{
        position: 'absolute', right: PAD_X, top: height * 0.58,
        maxWidth: 240,
        background: CLAUDE.CARD, borderRadius: 10,
        border: `1px solid ${CLAUDE.SPARK}`,
        padding: '10px 14px',
        opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.SPARK, fontWeight: 700, marginBottom: 4 }}>
          The slop panic is here
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST, lineHeight: 1.5 }}>
          Only ~1/3 of all AI users<br />
          have drafted prose at all.<br />
          Editing beats drafting everywhere.
        </div>
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data (†exact): Anthropic, Coding Agents in the Social Sciences (2026)
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
