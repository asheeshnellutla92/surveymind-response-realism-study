import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CodingAgentsFig5Ladder — "The Ladder and the Last Mile" (dot-whisker; †exact).
 * Source: Anthropic, Coding Agents in the Social Sciences (May 2026)
 *
 * Horizontal dot-whisker chart — agent users vs non-users (controlled), % of non-user mean.
 * Animate the ladder climbing: +9*, +33**, +73** — then the drop to +3 and −6 on the zero line.
 *
 * Terracotta: +73 (the peak). Second terracotta moment: +3/−6 flatline pair captioned "the last mile."
 *
 * Rows (ordered top to bottom by value ascending):
 *   Journal resubmissions −6 | Journal submissions +3 | Conference submissions +10
 *   Working papers +73** | Grant proposals +33** | Empirical projects started +9*
 *
 * (chart ordered low → high: −6, +3, +10, +33, +73, +9 — use narrative order instead: project→grant→papers→conf→sub→resub)
 */

export const codingAgentsFig5LadderSchema = z.object({
  sparkLine: z.string().default('Agents launch projects. They don\'t finish papers.'),
});
export type CodingAgentsFig5LadderProps = z.infer<typeof codingAgentsFig5LadderSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// narrative order: pipeline → pipeline close
const OUTCOMES = [
  { label: 'Empirical projects started',  delta:  +9,  sig: '*',  hot: false, lastMile: false },
  { label: 'Grant proposals submitted',   delta: +33,  sig: '**', hot: false, lastMile: false },
  { label: 'Working papers posted',        delta: +73,  sig: '**', hot: true,  lastMile: false },
  { label: 'Conference submissions',       delta: +10,  sig: '',   hot: false, lastMile: false },
  { label: 'Journal submissions',          delta:  +3,  sig: '',   hot: false, lastMile: true  },
  { label: 'Journal resubmissions',        delta:  -6,  sig: '',   hot: false, lastMile: true  },
];

const CI_HALF: Record<number, number> = { 9: 7, 33: 9, 73: 14, 10: 9, 3: 8, '-6': 9 };
const MAX_ABS = 90;

export const CodingAgentsFig5Ladder: React.FC<CodingAgentsFig5LadderProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const LABEL_W = 240;
  const CHART_LEFT = PAD_X + LABEL_W + 12;
  const CHART_RIGHT = width - PAD_X;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const CENTER_X = CHART_LEFT + CHART_W / 2;
  const CHART_TOP = height * 0.26;
  const ROW_H = (height * 0.56) / OUTCOMES.length;
  const DOT_R = 8;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const unitW = (CHART_W / 2) / MAX_ABS;
  const xOf = (v: number) => CENTER_X + v * unitW;
  const ciKey = (d: number) => (d < 0 ? '-6' : d) as any;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        AGENT USERS vs NON-USERS · % OF NON-USER MEAN · CONTROLLED
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        The ladder stops at the journal door.
      </div>

      {/* SVG */}
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={width} height={height}>

        {/* Zero line */}
        <line x1={CENTER_X} y1={CHART_TOP - 10}
          x2={CENTER_X} y2={CHART_TOP + OUTCOMES.length * ROW_H + 10}
          stroke={CLAUDE.BORDER} strokeWidth={2}
          opacity={clamp(titleIn, 0, 1)}
        />

        {/* X-axis ticks */}
        {[-80, -40, 0, 40, 80].map(v => (
          <React.Fragment key={v}>
            <text x={xOf(v)} y={CHART_TOP + OUTCOMES.length * ROW_H + 20}
              textAnchor="middle" fontFamily={SANS} fontSize={height * 0.011}
              fill={CLAUDE.GHOST} opacity={clamp(titleIn, 0, 1)}>
              {v > 0 ? `+${v}%` : `${v}%`}
            </text>
          </React.Fragment>
        ))}

        {/* Significance key */}
        <text x={CHART_RIGHT} y={CHART_TOP - 10}
          textAnchor="end" fontFamily={SANS} fontSize={height * 0.011}
          fill={CLAUDE.GHOST} opacity={clamp(titleIn, 0, 1)}>
          * p&lt;0.05  ** p&lt;0.01
        </text>

        {OUTCOMES.map((o, i) => {
          const bAnim = spring({ frame: frame - 15 - i * 12, fps, config: { damping: 24, stiffness: 75, mass: 1.1 } });
          const prog = clamp(bAnim, 0, 1);
          const cy = CHART_TOP + i * ROW_H + ROW_H / 2;
          const dx = xOf(o.delta * prog);
          const ciW = CI_HALF[ciKey(o.delta)] * unitW;
          const isPos = o.delta >= 0;

          const dotColor = o.hot ? CLAUDE.SPARK : (o.lastMile ? CLAUDE.SPARK : CLAUDE.INK_SOFT);
          const lineColor = o.hot ? CLAUDE.SPARK : (o.lastMile ? CLAUDE.INK_SOFT : CLAUDE.INK_SOFT);

          return (
            <React.Fragment key={o.label}>
              {/* Horizontal line from zero to dot */}
              <line x1={CENTER_X} y1={cy} x2={dx} y2={cy}
                stroke={lineColor} strokeWidth={isPos ? 2.5 : 2}
                opacity={prog}
              />
              {/* CI bar */}
              {prog > 0.5 && (
                <rect x={dx - ciW} y={cy - DOT_R * 0.8} width={ciW * 2} height={DOT_R * 1.6}
                  fill="none" stroke={CLAUDE.BORDER} strokeWidth={1.5}
                  opacity={prog}
                />
              )}
              {/* Dot */}
              <circle cx={dx} cy={cy} r={DOT_R + (o.hot ? 2 : 0)}
                fill={dotColor} opacity={prog}
              />
            </React.Fragment>
          );
        })}
      </svg>

      {/* Row labels */}
      {OUTCOMES.map((o, i) => {
        const bAnim = spring({ frame: frame - 15 - i * 12, fps, config: { damping: 24, stiffness: 75, mass: 1.1 } });
        const prog = clamp(bAnim, 0, 1);
        const cy = CHART_TOP + i * ROW_H + ROW_H / 2;

        return (
          <React.Fragment key={o.label}>
            <div style={{
              position: 'absolute',
              right: width - CHART_LEFT + 10, top: cy - 11,
              fontFamily: SERIF, fontSize: height * 0.014,
              color: o.hot ? CLAUDE.SPARK : (o.lastMile ? CLAUDE.SPARK : CLAUDE.INK),
              textAlign: 'right' as const,
              whiteSpace: 'nowrap' as const,
              opacity: prog,
            }}>
              {o.label}
            </div>
            {/* Value + sig */}
            {prog > 0.7 && (
              <div style={{
                position: 'absolute',
                left: CHART_LEFT + (CENTER_X - CHART_LEFT) + o.delta * (CHART_W / 2) / MAX_ABS * prog + (o.delta >= 0 ? 20 : -70),
                top: cy - 24,
                fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
                color: o.hot ? CLAUDE.SPARK : (o.lastMile ? CLAUDE.SPARK : CLAUDE.INK_SOFT),
              }}>
                {o.delta > 0 ? `+${o.delta}%` : `${o.delta}%`}{o.sig}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Last mile annotation */}
      <div style={{
        position: 'absolute', right: PAD_X, top: height * 0.60,
        maxWidth: 230,
        background: CLAUDE.CARD, borderRadius: 10,
        border: `1px solid ${CLAUDE.SPARK}`,
        padding: '10px 14px',
        opacity: spring({ frame: frame - 100, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } }),
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.SPARK, fontWeight: 700 }}>
          the last mile
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST, lineHeight: 1.5, marginTop: 4 }}>
          Two readings: papers take time<br />
          — or agents can't perfect the end.<br />
          Descriptive; not causal.
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
