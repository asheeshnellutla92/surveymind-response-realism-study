import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * TeachClaudeFig1 — Agentic Misalignment Evals (Act 4 punchline; grouped bars)
 * Source: Anthropic, "Teaching Claude why", May 2026
 *
 * 3 scenarios × 3 conditions, misalignment score, lower = better:
 *   Blackmail:        Baseline 0.65 | Constitutional SDF 0.27 | SDF+stories 0.18
 *   Financial crimes: Baseline 0.49 | Constitutional SDF 0.11 | SDF+stories 0.04
 *   Cancer research:  Baseline 0.67 | Constitutional SDF 0.11 | SDF+stories 0.01
 *
 * Animate: baseline bars rise first (tall, alarming), then each treatment bar
 * grows beside them dramatically shorter. The 0.65→0.18 blackmail collapse is
 * the terracotta moment.
 *
 * Per CLAUDE-BRAND.md: one terracotta accent per beat.
 * Caption: "Redrawn (simplified) from Anthropic, 'Teaching Claude why', 2026"
 */

export const teachClaudeFig1Schema = z.object({
  sparkLine: z.string().default('Factor of three. No eval data.'),
});
export type TeachClaudeFig1Props = z.infer<typeof teachClaudeFig1Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const SCENARIOS = [
  { label: 'Blackmail', baseline: 0.65, sdf: 0.27, stories: 0.18 },
  { label: 'Financial crimes', baseline: 0.49, sdf: 0.11, stories: 0.04 },
  { label: 'Cancer research', baseline: 0.67, sdf: 0.11, stories: 0.01 },
];

const CONDITIONS = [
  { key: 'baseline', label: 'Baseline', color: '#73705F', accentScenario: -1 },
  { key: 'sdf', label: 'Constitutional SDF', color: CLAUDE.INK, accentScenario: -1 },
  { key: 'stories', label: 'SDF + Stories', color: CLAUDE.SPARK, accentScenario: 0 },
];

export const TeachClaudeFig1: React.FC<TeachClaudeFig1Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const CHART_TOP = height * 0.28;
  const CHART_BOTTOM = height * 0.82;
  const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;
  const CHART_LEFT = PAD_X + 60;
  const CHART_RIGHT = width - PAD_X;
  const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Stagger: baseline bars first, then SDF, then stories
  const baselineAnim = spring({ frame: frame - 15, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const sdfAnim = spring({ frame: frame - 35, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const storiesAnim = spring({ frame: frame - 55, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const conditionAnims = [baselineAnim, sdfAnim, storiesAnim];

  const sparkIn = spring({ frame: frame - 75, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const MAX_VAL = 0.70;
  const GROUP_W = CHART_WIDTH / SCENARIOS.length;
  const BAR_W = (GROUP_W * 0.6) / 3;
  const GROUP_PAD = GROUP_W * 0.2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        AGENTIC MISALIGNMENT EVALS · LOWER IS BETTER
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Blackmail. Financial crimes. Cancer research.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
        display: 'flex', gap: 28, opacity: clamp(titleIn, 0, 1),
      }}>
        {CONDITIONS.map(c => (
          <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 2, background: c.color }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* Y axis label */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: CHART_TOP + CHART_HEIGHT / 2,
        transform: 'rotate(-90deg) translateX(-50%)',
        transformOrigin: 'left center',
        fontFamily: SANS, fontSize: height * 0.012,
        color: CLAUDE.GHOST, whiteSpace: 'nowrap' as const,
        opacity: clamp(titleIn, 0, 1),
      }}>
        Misalignment Score
      </div>

      {/* Y axis gridlines */}
      {[0, 0.25, 0.50, 0.65].map(v => {
        const y = CHART_BOTTOM - (v / MAX_VAL) * CHART_HEIGHT;
        return (
          <React.Fragment key={v}>
            <div style={{
              position: 'absolute', left: CHART_LEFT, top: y,
              width: CHART_WIDTH, height: 1,
              background: CLAUDE.BORDER, opacity: 0.6,
            }} />
            <div style={{
              position: 'absolute', right: width - CHART_LEFT + 6, top: y - 8,
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.GHOST, textAlign: 'right' as const,
            }}>
              {v.toFixed(2)}
            </div>
          </React.Fragment>
        );
      })}

      {/* Bars */}
      {SCENARIOS.map((scenario, si) => {
        const groupX = CHART_LEFT + si * GROUP_W + GROUP_PAD;

        const vals = [
          { val: scenario.baseline, condIdx: 0 },
          { val: scenario.sdf, condIdx: 1 },
          { val: scenario.stories, condIdx: 2 },
        ];

        return (
          <React.Fragment key={scenario.label}>
            {vals.map(({ val, condIdx }) => {
              const cond = CONDITIONS[condIdx];
              const anim = conditionAnims[condIdx];
              const barH = (val / MAX_VAL) * CHART_HEIGHT * clamp(anim, 0, 1);
              const barX = groupX + condIdx * (BAR_W + 3);
              const isAccent = condIdx === 2 && si === 0; // terracotta moment: blackmail SDF+stories

              return (
                <div key={cond.key} style={{
                  position: 'absolute',
                  left: barX,
                  top: CHART_BOTTOM - barH,
                  width: BAR_W,
                  height: barH,
                  background: cond.color,
                  borderRadius: '3px 3px 0 0',
                  boxShadow: isAccent ? `0 0 16px ${CLAUDE.SPARK}55` : 'none',
                }} />
              );
            })}

            {/* Scenario label */}
            <div style={{
              position: 'absolute',
              left: groupX,
              top: CHART_BOTTOM + 8,
              width: GROUP_W - GROUP_PAD * 2,
              fontFamily: SERIF, fontSize: height * 0.015,
              color: CLAUDE.INK, textAlign: 'center' as const,
              opacity: clamp(baselineAnim, 0, 1),
            }}>
              {scenario.label}
            </div>

            {/* Baseline value label */}
            {clamp(baselineAnim, 0, 1) > 0.5 && (
              <div style={{
                position: 'absolute',
                left: groupX - 2,
                top: CHART_BOTTOM - (scenario.baseline / MAX_VAL) * CHART_HEIGHT * clamp(baselineAnim, 0, 1) - 18,
                fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
                color: CLAUDE.INK_SOFT,
              }}>
                {scenario.baseline.toFixed(2)}
              </div>
            )}

            {/* SDF+stories value label (terracotta for blackmail) */}
            {clamp(storiesAnim, 0, 1) > 0.5 && (
              <div style={{
                position: 'absolute',
                left: groupX + 2 * (BAR_W + 3) - 4,
                top: CHART_BOTTOM - (scenario.stories / MAX_VAL) * CHART_HEIGHT * clamp(storiesAnim, 0, 1) - 18,
                fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
                color: si === 0 ? CLAUDE.SPARK : CLAUDE.INK,
              }}>
                {scenario.stories.toFixed(2)}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Baseline axis */}
      <div style={{
        position: 'absolute', left: CHART_LEFT, top: CHART_BOTTOM,
        width: CHART_WIDTH, height: 2, background: CLAUDE.INK, opacity: 0.25,
      }} />

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
