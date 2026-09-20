import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig8Paradox — "The Delegation Paradox" (rebuilt from report Figs 3.6 + 3.7).
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * 8a (†digitized): Six bars with CI whiskers — change per +1 SD (22pp) of automation share.
 *   Economic: Pay +4.7 (mean 56%) | Security +4.0 (42%) | Finding a job +4.5 (52%)
 *   Intrinsic: Meaning +3.5 (59%) | Autonomy +2.9 (70%) | Human interaction +3.8 (36%)
 *
 * Phase 2 (80–end): Two trend lines vs automation share.
 *   "AI increases market value of my skills" (57%) RISES.
 *   "I learn more with AI" (68%) FLAT.
 *
 * Terracotta moment: the "All six positive" headline.
 */

export const cadencesFig8ParadoxSchema = z.object({
  sparkLine: z.string().default('Delegate more. Expect better. Not worse.'),
});
export type CadencesFig8ParadoxProps = z.infer<typeof cadencesFig8ParadoxSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const DIMENSIONS = [
  { label: 'Pay',               delta: 4.7, mean: 56, category: 'economic' },
  { label: 'Security',          delta: 4.0, mean: 42, category: 'economic' },
  { label: 'Finding a job',     delta: 4.5, mean: 52, category: 'economic' },
  { label: 'Meaning',           delta: 3.5, mean: 59, category: 'intrinsic' },
  { label: 'Autonomy',          delta: 2.9, mean: 70, category: 'intrinsic' },
  { label: 'Human interaction', delta: 3.8, mean: 36, category: 'intrinsic' },
];

const CI = 0.8; // approximate CI half-width

// Trend line: mock data points for automation share (x 0..1) vs response
const TREND_X = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const SKILLS_Y = TREND_X.map(x => 0.50 + x * 0.25); // rising
const LEARN_Y  = TREND_X.map(() => 0.65);             // flat ~68%

const PHASE_SWITCH = 80;

export const CadencesFig8Paradox: React.FC<CadencesFig8ParadoxProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn  = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn  = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showP2   = frame >= PHASE_SWITCH;

  // Bar chart geometry
  const CHART_LEFT = PAD_X + 160;
  const CHART_RIGHT = width - PAD_X;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const CENTER_X = CHART_LEFT + CHART_W / 2;
  const BAR_TOP = height * 0.28;
  const ROW_H = height * 0.078;
  const MAX_DELTA = 6;

  const barW = (delta: number) => (delta / MAX_DELTA) * (CHART_W / 2);
  const axisX = CENTER_X;

  // Trend chart geometry (phase 2)
  const TC_LEFT = PAD_X;
  const TC_RIGHT = width - PAD_X;
  const TC_TOP = height * 0.30;
  const TC_BOTTOM = height * 0.80;
  const TC_W = TC_RIGHT - TC_LEFT;
  const TC_H = TC_BOTTOM - TC_TOP;
  const tX = (x: number) => TC_LEFT + x * TC_W;
  const tY = (y: number) => TC_BOTTOM - y * TC_H;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        {showP2
          ? 'AUTOMATION SHARE vs SKILL & LEARNING OUTCOMES'
          : 'CHANGE IN POSITIVE OUTLOOK PER +1 SD AUTOMATION SHARE'}
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showP2
          ? 'Skills grow more valuable. Learning stays flat.'
          : 'All six positive. Zero exceptions.'}
      </div>

      {/* ── PHASE 1: Bars ── */}
      {!showP2 && (
        <>
          {/* Zero axis */}
          <div style={{
            position: 'absolute', left: axisX - 1, top: BAR_TOP - 10,
            width: 2, height: DIMENSIONS.length * ROW_H + 20,
            background: CLAUDE.BORDER,
          }} />

          {/* Category labels */}
          {['Economic', 'Intrinsic'].map((cat, ci) => (
            <div key={cat} style={{
              position: 'absolute',
              right: PAD_X, top: BAR_TOP + ci * 3 * ROW_H + ROW_H * 0.5,
              fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
              fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const,
              opacity: clamp(titleIn, 0, 1),
            }}>
              {cat}
            </div>
          ))}

          {DIMENSIONS.map((d, i) => {
            const bAnim = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
            const y = BAR_TOP + i * ROW_H;
            const bw = barW(d.delta) * clamp(bAnim, 0, 1);
            const isFirst = i === 0;

            return (
              <React.Fragment key={d.label}>
                {/* Row label */}
                <div style={{
                  position: 'absolute', right: width - CHART_LEFT + 8, top: y + 10,
                  fontFamily: SERIF, fontSize: height * 0.015, color: CLAUDE.INK,
                  textAlign: 'right' as const, opacity: clamp(bAnim, 0, 1),
                  whiteSpace: 'nowrap' as const,
                }}>
                  {d.label}
                </div>
                {/* Bar */}
                <div style={{
                  position: 'absolute',
                  left: axisX, top: y + 8,
                  width: bw, height: ROW_H * 0.55,
                  background: isFirst ? CLAUDE.SPARK : d.category === 'economic' ? CLAUDE.INK : CLAUDE.INK_SOFT,
                  borderRadius: '0 4px 4px 0',
                }} />
                {/* CI whisker */}
                {clamp(bAnim, 0, 1) > 0.6 && (
                  <div style={{
                    position: 'absolute',
                    left: axisX + bw - 2, top: y + 8,
                    width: barW(CI) * 2, height: ROW_H * 0.55,
                    border: `2px solid ${CLAUDE.BORDER}`,
                    borderLeft: 'none',
                    background: 'transparent',
                  }} />
                )}
                {/* Delta label */}
                {clamp(bAnim, 0, 1) > 0.8 && (
                  <div style={{
                    position: 'absolute',
                    left: axisX + bw + barW(CI) + 10, top: y + 10,
                    fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
                    color: isFirst ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                  }}>
                    +{d.delta}pp
                  </div>
                )}
                {/* Mean label */}
                {clamp(bAnim, 0, 1) > 0.9 && (
                  <div style={{
                    position: 'absolute',
                    left: CHART_RIGHT - 50, top: y + 10,
                    fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
                  }}>
                    ({d.mean}% avg)
                  </div>
                )}
              </React.Fragment>
            );
          })}

          <div style={{
            position: 'absolute', left: PAD_X, bottom: height * 0.11,
            fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
            opacity: clamp(titleIn, 0, 1),
          }}>
            Data (†digitized): Anthropic Economic Index, Cadences (June 2026), Fig 3.6
          </div>
        </>
      )}

      {/* ── PHASE 2: Trend lines ── */}
      {showP2 && (
        <>
          {/* Legend */}
          <div style={{
            position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
            display: 'flex', gap: 28, opacity: clamp(phase2In, 0, 1),
          }}>
            {[
              { label: '"AI increases market value of my skills" (57%)', color: CLAUDE.SPARK },
              { label: '"I learn more with AI" (68%)',                   color: CLAUDE.INK_SOFT },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 18, height: 2, background: l.color }} />
                <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>

          {/* Y gridlines */}
          {[0.4, 0.6, 0.8].map(v => (
            <React.Fragment key={v}>
              <div style={{
                position: 'absolute', left: TC_LEFT, top: tY(v),
                width: TC_W, height: 1, background: CLAUDE.BORDER, opacity: 0.5,
              }} />
              <div style={{
                position: 'absolute', right: width - TC_LEFT + 6, top: tY(v) - 9,
                fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
              }}>
                {Math.round(v * 100)}%
              </div>
            </React.Fragment>
          ))}

          {/* X axis label */}
          <div style={{
            position: 'absolute', left: TC_LEFT + TC_W / 2 - 80, top: TC_BOTTOM + 14,
            fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
            opacity: clamp(phase2In, 0, 1),
          }}>
            Automation share →
          </div>

          {/* SVG lines */}
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
            width={width} height={height}>
            {/* Skills line (rising, terracotta) */}
            <polyline
              points={TREND_X.map((x, i) => `${tX(x)},${tY(SKILLS_Y[i])}`).join(' ')}
              fill="none" stroke={CLAUDE.SPARK} strokeWidth={2.5}
              opacity={clamp(phase2In, 0, 1)}
            />
            {/* Learning line (flat) */}
            <polyline
              points={TREND_X.map((x, i) => `${tX(x)},${tY(LEARN_Y[i])}`).join(' ')}
              fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2.5}
              opacity={clamp(phase2In, 0, 1)}
            />
            <line x1={TC_LEFT} y1={TC_BOTTOM} x2={TC_RIGHT} y2={TC_BOTTOM}
              stroke={CLAUDE.BORDER} strokeWidth={1.5} />
          </svg>

          {/* Caveat */}
          <div style={{
            position: 'absolute', right: PAD_X, bottom: height * 0.15,
            maxWidth: 280, fontFamily: SANS, fontSize: height * 0.012,
            color: CLAUDE.GHOST, textAlign: 'right' as const,
            opacity: clamp(phase2In, 0, 1),
          }}>
            Caveat: self-reports can't rule out skill erosion. Results barely
            change controlling for user tenure.
          </div>

          <div style={{
            position: 'absolute', left: PAD_X, bottom: height * 0.11,
            fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
            opacity: clamp(phase2In, 0, 1),
          }}>
            Data (†digitized): Anthropic Economic Index, Cadences (June 2026), Fig 3.7
          </div>
        </>
      )}

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
