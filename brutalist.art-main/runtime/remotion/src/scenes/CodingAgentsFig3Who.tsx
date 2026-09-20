import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CodingAgentsFig3Who — "Who Adopts" (disparity bars; †exact).
 * Source: Anthropic, Coding Agents in the Social Sciences (May 2026)
 *
 * Phase 1 (0–90f): AI-use bars land — nearly equal by gender (81% vs 78%, 3pp gap)
 * Phase 2 (90–end): Coding-agent bars land — gender gap explodes: 22% vs 9%
 *
 * Terracotta on the gender pair in phase 2.
 * Caption: all differences p < 0.05.
 */

export const codingAgentsFig3WhoSchema = z.object({
  sparkLine: z.string().default('The agent era is opening more unequal than the chatbot era.'),
});
export type CodingAgentsFig3WhoProps = z.infer<typeof codingAgentsFig3WhoSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GROUPS = [
  { label: 'PhD student',           n: 384,  ai: 92, agent: 27, hot: false, group: 'career' },
  { label: '0–10y post-PhD',        n: 435,  ai: 83, agent: 22, hot: false, group: 'career' },
  { label: '11+ post-PhD',          n: 439,  ai: 70, agent:  9, hot: false, group: 'career' },
  { label: 'Typically male name',   n: 561,  ai: 81, agent: 22, hot: true,  group: 'gender' },
  { label: 'Typically female name', n: 374,  ai: 78, agent:  9, hot: true,  group: 'gender' },
  { label: 'Top-25 university',     n: 354,  ai: 83, agent: 24, hot: false, group: 'rank' },
  { label: 'Outside top-25',        n: 906,  ai: 81, agent: 17, hot: false, group: 'rank' },
];

const PHASE_SWITCH = 90;
const MAX_PCT = 100;

export const CodingAgentsFig3Who: React.FC<CodingAgentsFig3WhoProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const LABEL_W = 220;
  const CHART_LEFT = PAD_X + LABEL_W + 12;
  const CHART_RIGHT = width - PAD_X;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const CHART_TOP = height * 0.26;
  const ROW_H = (height * 0.58) / GROUPS.length;
  const BAR_H = ROW_H * 0.48;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showP2 = frame >= PHASE_SWITCH;

  const barW = (pct: number, prog: number) => (pct / MAX_PCT) * CHART_W * prog;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        {showP2 ? 'CODING AGENT USE · BY GROUP · ALL p<0.05' : 'AI USE · BY GROUP'}
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showP2 ? '22% vs 9%. More than double.' : 'AI use looks nearly equal.'}
      </div>

      {/* Bars */}
      {GROUPS.map((g, i) => {
        const bAnim = spring({ frame: frame - 10 - i * 10, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
        const bAnim2 = spring({ frame: frame - PHASE_SWITCH - i * 8, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
        const cy = CHART_TOP + i * ROW_H + ROW_H / 2 - BAR_H / 2;
        const isGender = g.group === 'gender';

        const aiProg = clamp(bAnim, 0, 1);
        const agProg = showP2 ? clamp(bAnim2, 0, 1) : 0;

        const pct = showP2 ? g.agent : g.ai;
        const prog = showP2 ? agProg : aiProg;
        const bw = barW(pct, prog);
        const barColor = showP2
          ? (isGender ? CLAUDE.SPARK : CLAUDE.INK)
          : CLAUDE.INK_SOFT;

        return (
          <React.Fragment key={g.label}>
            {/* Row label */}
            <div style={{
              position: 'absolute',
              right: width - CHART_LEFT + 10, top: cy + 2,
              fontFamily: SERIF, fontSize: height * 0.014,
              color: showP2 && isGender ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'right' as const,
              whiteSpace: 'nowrap' as const,
              opacity: clamp(bAnim, 0, 1),
            }}>
              {g.label}
            </div>
            {/* n chip */}
            <div style={{
              position: 'absolute',
              right: width - CHART_LEFT + 10, top: cy + BAR_H - 4,
              fontFamily: SANS, fontSize: height * 0.010,
              color: CLAUDE.GHOST, textAlign: 'right' as const,
              opacity: clamp(bAnim, 0, 1) * 0.8,
            }}>
              n={g.n}
            </div>

            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: CHART_LEFT, top: cy,
              width: bw, height: BAR_H,
              background: barColor,
              borderRadius: '0 4px 4px 0',
              transition: 'none',
            }} />

            {/* Pct label */}
            {prog > 0.6 && (
              <div style={{
                position: 'absolute',
                left: CHART_LEFT + bw + 8, top: cy + 2,
                fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
                color: showP2 && isGender ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              }}>
                {pct}%
              </div>
            )}

            {/* Group divider */}
            {i < GROUPS.length - 1 && GROUPS[i].group !== GROUPS[i + 1].group && (
              <div style={{
                position: 'absolute',
                left: PAD_X, top: CHART_TOP + (i + 1) * ROW_H - 4,
                width: width - PAD_X * 2, height: 1,
                background: CLAUDE.BORDER, opacity: 0.5,
              }} />
            )}
          </React.Fragment>
        );
      })}

      {/* Phase 2 gender annotation */}
      {showP2 && (
        <div style={{
          position: 'absolute', right: PAD_X, top: height * 0.42,
          maxWidth: 220,
          background: CLAUDE.CARD, borderRadius: 10,
          border: `1px solid ${CLAUDE.SPARK}`,
          padding: '10px 14px',
          opacity: interpolate(frame, [PHASE_SWITCH + 50, PHASE_SWITCH + 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.SPARK, fontWeight: 700 }}>
            Gender gap
          </div>
          <div style={{ fontFamily: SERIF, fontSize: height * 0.022, color: CLAUDE.INK, marginTop: 4 }}>
            22% vs 9%
          </div>
          <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST, marginTop: 4 }}>
            AI use: 81% vs 78%<br />
            Agent use: 22% vs 9%
          </div>
        </div>
      )}

      {/* X-axis label */}
      <div style={{
        position: 'absolute',
        left: CHART_LEFT + (showP2 ? 0.20 : 0.80) * CHART_W - 40,
        top: CHART_TOP + GROUPS.length * ROW_H + 8,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(titleIn, 0, 1),
      }}>
        % adopting
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
