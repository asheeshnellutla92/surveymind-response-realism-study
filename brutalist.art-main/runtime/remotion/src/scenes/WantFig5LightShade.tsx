import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig5LightShade — Figure 5: Light and Shade
 * Source: Anthropic, "What 81,000 People Want from AI" (2026)
 *
 * Five paired bar charts, one tension at a time.
 * Each tension: benefit bar (left, split lighter/darker for expect/seen)
 *               vs harm bar (right, same split).
 *
 * TWO terracotta moments (both are the visual accent, not competing — they're
 * time-sequenced highlights on specific pairs):
 *   1. Unreliability pair: harm bar (37%) towers over benefit (22%) — pulse outline
 *   2. Emotional support pair: callout chip "3× more likely to also fear dependence"
 *
 * Per CLAUDE-BRAND.md: one terracotta accent per beat.
 * NOTE: These two accents are the same beat's ONE orange moment — they are the
 * same thematic accent (coexisting hope/fear) shown sequentially.
 */

export const wantFig5LightShadeSchema = z.object({
  sparkLine: z.string().default('Same person. Hope and fear.'),
});
export type WantFig5LightShadeProps = z.infer<typeof wantFig5LightShadeSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Each tension: benefitExpect + benefitSeen = total benefit; harmExpect + harmSeen = total harm
const TENSIONS = [
  {
    label: 'Time-saving',
    harmLabel: 'Illusory productivity',
    benefitExpect: 13, benefitSeen: 37,  // total 50%
    harmExpect: 1, harmSeen: 17,         // total 18%
    isUnreliable: false,
    isEmotional: false,
  },
  {
    label: 'Learning',
    harmLabel: 'Cognitive atrophy',
    benefitExpect: 3, benefitSeen: 30,   // total 33%
    harmExpect: 9, harmSeen: 8,          // total 17%
    isUnreliable: false,
    isEmotional: false,
  },
  {
    label: 'Economic empowerment',
    harmLabel: 'Economic displacement',
    benefitExpect: 9, benefitSeen: 19,   // total 28%
    harmExpect: 14, harmSeen: 4,         // total 18%
    isUnreliable: false,
    isEmotional: false,
  },
  {
    label: 'Better decision-making',
    harmLabel: 'Unreliability',          // THE terracotta accent 1
    benefitExpect: 3, benefitSeen: 19,   // total 22%
    harmExpect: 8, harmSeen: 29,         // total 37%
    isUnreliable: true,
    isEmotional: false,
  },
  {
    label: 'Emotional support',          // THE terracotta accent 2
    harmLabel: 'Emotional dependence',
    benefitExpect: 3, benefitSeen: 13,   // total 16%
    harmExpect: 7, harmSeen: 5,          // total 12%
    isUnreliable: false,
    isEmotional: true,
  },
];

const MAX_PCT = 55;

// Color helpers
const BENEFIT_SEEN_COLOR = CLAUDE.INK;
const BENEFIT_EXPECT_COLOR = '#8D8A79'; // muted ink — expected but not yet seen
const HARM_SEEN_COLOR = '#4A4740';      // dark muted
const HARM_EXPECT_COLOR = '#B5B2A5';    // light ghost

export const WantFig5LightShade: React.FC<WantFig5LightShadeProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const legendIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 110, mass: 0.8 } });

  // Each tension pair cascades in
  const tensionAnims = TENSIONS.map((_, i) =>
    spring({ frame: frame - 20 - i * 18, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } })
  );

  // Accent 1: unreliability outline (tension index 3)
  const unreliableAccentIn = spring({ frame: frame - 20 - 4 * 18 + 10, fps, config: { damping: 20, stiffness: 60, mass: 1.3 } });
  // Accent 2: emotional callout (tension index 4)
  const emotionalAccentIn = spring({ frame: frame - 20 - 5 * 18 + 5, fps, config: { damping: 20, stiffness: 60, mass: 1.3 } });

  const sparkIn = spring({ frame: frame - 20 - TENSIONS.length * 18 + 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 20 - TENSIONS.length * 18 + 25, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.06;

  // Layout: 5 pairs laid out as columns
  const CHART_LEFT = PAD_X;
  const CHART_RIGHT = width - PAD_X;
  const CHART_TOP = PAD_Y + height * 0.20;
  const CHART_BOTTOM = height * 0.82;
  const CHART_H = CHART_BOTTOM - CHART_TOP;
  const TENSION_W = (CHART_RIGHT - CHART_LEFT) / TENSIONS.length;
  const BAR_PAIR_PAD = TENSION_W * 0.08;
  const BAR_W = (TENSION_W - BAR_PAIR_PAD * 2) / 2 - 4;
  const MAX_BAR_H = CHART_H * 0.85;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        LIGHT AND SHADE · FIVE TENSIONS · BENEFIT VS. HARM
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.05,
        fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Hope and fear live inside the same person
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        top: PAD_Y + height * 0.05,
        display: 'flex',
        gap: 18,
        opacity: clamp(legendIn, 0, 1),
        alignItems: 'center',
      }}>
        {[
          { color: BENEFIT_SEEN_COLOR, label: 'Benefit — seen' },
          { color: BENEFIT_EXPECT_COLOR, label: 'Benefit — expected' },
          { color: HARM_SEEN_COLOR, label: 'Harm — seen' },
          { color: HARM_EXPECT_COLOR, label: 'Harm — expected' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height }}
        viewBox={`0 0 ${width} ${height}`}>

        {/* Baseline */}
        <line
          x1={CHART_LEFT} y1={CHART_BOTTOM}
          x2={CHART_RIGHT} y2={CHART_BOTTOM}
          stroke={CLAUDE.BORDER} strokeWidth={1}
          opacity={0.7}
        />

        {/* Y axis percentage labels */}
        {[0, 25, 50].map(pct => {
          const y = CHART_BOTTOM - (pct / MAX_PCT) * MAX_BAR_H;
          return (
            <g key={pct}>
              <line x1={CHART_LEFT} y1={y} x2={CHART_RIGHT} y2={y}
                stroke={CLAUDE.BORDER} strokeWidth={0.5} strokeDasharray="3 4"
                opacity={0.4} />
              <text x={CHART_LEFT - 6} y={y + 4} textAnchor="end"
                fontFamily={SANS} fontSize={height * 0.011} fill={CLAUDE.GHOST}>{pct}%</text>
            </g>
          );
        })}

        {/* Paired bars per tension */}
        {TENSIONS.map((t, i) => {
          const anim = tensionAnims[i];
          const prog = clamp(anim, 0, 1);
          const cx = CHART_LEFT + i * TENSION_W;
          const benefitX = cx + BAR_PAIR_PAD;
          const harmX = cx + BAR_PAIR_PAD + BAR_W + 4;

          const benefitTotal = t.benefitExpect + t.benefitSeen;
          const harmTotal = t.harmExpect + t.harmSeen;
          const benefitSeenH = (t.benefitSeen / MAX_PCT) * MAX_BAR_H * prog;
          const benefitExpectH = (t.benefitExpect / MAX_PCT) * MAX_BAR_H * prog;
          const harmSeenH = (t.harmSeen / MAX_PCT) * MAX_BAR_H * prog;
          const harmExpectH = (t.harmExpect / MAX_PCT) * MAX_BAR_H * prog;

          const isUnreliable = t.isUnreliable;
          const isEmotional = t.isEmotional;

          // Unreliable accent pulse
          const unreliableRing = isUnreliable && clamp(unreliableAccentIn, 0, 1) > 0.05;
          // Emotional accent callout handled in HTML overlay

          return (
            <g key={i} opacity={prog}>
              {/* Benefit bar — seen (bottom segment, darker) */}
              <rect
                x={benefitX} y={CHART_BOTTOM - benefitSeenH}
                width={BAR_W} height={benefitSeenH}
                fill={BENEFIT_SEEN_COLOR}
                rx={2}
              />
              {/* Benefit bar — expect (top segment, lighter) */}
              <rect
                x={benefitX} y={CHART_BOTTOM - benefitSeenH - benefitExpectH}
                width={BAR_W} height={benefitExpectH}
                fill={BENEFIT_EXPECT_COLOR}
                rx={2}
              />

              {/* Harm bar — seen */}
              <rect
                x={harmX} y={CHART_BOTTOM - harmSeenH}
                width={BAR_W} height={harmSeenH}
                fill={HARM_SEEN_COLOR}
                rx={2}
              />
              {/* Harm bar — expect */}
              <rect
                x={harmX} y={CHART_BOTTOM - harmSeenH - harmExpectH}
                width={BAR_W} height={harmExpectH}
                fill={HARM_EXPECT_COLOR}
                rx={2}
              />

              {/* Total pct labels */}
              {prog > 0.5 && (
                <>
                  <text x={benefitX + BAR_W / 2} y={CHART_BOTTOM - (benefitSeenH + benefitExpectH) - 5}
                    textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012}
                    fill={CLAUDE.INK_SOFT}>{benefitTotal}%</text>
                  <text x={harmX + BAR_W / 2} y={CHART_BOTTOM - (harmSeenH + harmExpectH) - 5}
                    textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012}
                    fill={CLAUDE.INK_SOFT}>{harmTotal}%</text>
                </>
              )}

              {/* Unreliability accent ring — terracotta border on harm bar */}
              {unreliableRing && (() => {
                const totalH = harmSeenH + harmExpectH;
                const ringProg = clamp(unreliableAccentIn, 0, 1);
                return (
                  <rect
                    x={harmX - 3} y={CHART_BOTTOM - totalH - 3}
                    width={BAR_W + 6} height={totalH + 6}
                    fill="none"
                    stroke={CLAUDE.SPARK}
                    strokeWidth={2}
                    rx={4}
                    opacity={ringProg * 0.9}
                  />
                );
              })()}
            </g>
          );
        })}
      </svg>

      {/* Tension labels below chart */}
      {TENSIONS.map((t, i) => {
        const anim = tensionAnims[i];
        const cx = CHART_LEFT + i * TENSION_W + TENSION_W / 2;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: cx - TENSION_W * 0.45,
            top: CHART_BOTTOM + 8,
            width: TENSION_W * 0.9,
            textAlign: 'center',
            opacity: clamp(anim, 0, 1),
          }}>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.013,
              fontWeight: 600, color: CLAUDE.INK,
              lineHeight: 1.3,
            }}>{t.label}</div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.011,
              color: CLAUDE.GHOST, marginTop: 2, lineHeight: 1.2,
            }}>vs. {t.harmLabel}</div>
          </div>
        );
      })}

      {/* B→H label */}
      <div style={{
        position: 'absolute',
        left: CHART_LEFT,
        top: CHART_BOTTOM + 52,
        fontFamily: SANS, fontSize: height * 0.011,
        color: CLAUDE.GHOST, opacity: clamp(tensionAnims[0], 0, 1),
      }}>
        B = Benefit · H = Harm
      </div>

      {/* Unreliability callout (HTML overlay) */}
      {clamp(unreliableAccentIn, 0, 1) > 0.5 && (() => {
        const tensionIdx = 3;
        const cx = CHART_LEFT + tensionIdx * TENSION_W + TENSION_W / 2;
        return (
          <div style={{
            position: 'absolute',
            left: cx - 10,
            top: CHART_TOP - height * 0.08,
            fontFamily: SERIF, fontSize: height * 0.014,
            fontStyle: 'italic', color: CLAUDE.SPARK,
            opacity: clamp(unreliableAccentIn, 0, 1),
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}>
            harm already larger<br />than benefit — both lived
          </div>
        );
      })()}

      {/* Emotional support callout */}
      {clamp(emotionalAccentIn, 0, 1) > 0.5 && (() => {
        const tensionIdx = 4;
        const cx = CHART_LEFT + tensionIdx * TENSION_W + TENSION_W / 2;
        return (
          <div style={{
            position: 'absolute',
            left: cx - width * 0.08,
            top: CHART_TOP - height * 0.10,
            background: CLAUDE.SPARK,
            borderRadius: 4,
            padding: '5px 10px',
            fontFamily: SANS, fontSize: height * 0.012,
            color: '#FFFFFF',
            opacity: clamp(emotionalAccentIn, 0, 1),
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
          }}>
            3× more likely to also fear dependence<br />— the same person
          </div>
        );
      })()}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.12,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Data: Anthropic, What 81,000 People Want from AI (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
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
