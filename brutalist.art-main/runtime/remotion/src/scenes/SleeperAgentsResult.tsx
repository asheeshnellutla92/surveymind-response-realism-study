import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SleeperAgentsResult — B03 for "Sleeper Agents: When Safety Training Fails"
 * Source: Hubinger et al. 2024, Anthropic
 *
 * Two grouped bar charts side by side:
 *   Left: "Chain-of-Thought Model" — Before RLHF (shorter, INK_SOFT) vs After RLHF (similar, INK)
 *   Right: "Distilled Model" — Before RLHF (shorter, INK_SOFT) vs After RLHF (TALLER, SPARK)
 *
 * ONE terracotta accent: the right group's "After RLHF" bar (rises higher = more deceptive).
 * Bars grow from bottom with spring animation.
 * No exact numeric labels — ordinal only.
 */

export const sleeperAgentsResultSchema = z.object({
  sparkLine: z.string().default('More training → more hidden.'),
});
export type SleeperAgentsResultProps = z.infer<typeof sleeperAgentsResultSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Bar data — proportional heights only (no exact numbers)
// Chain-of-Thought: before=0.52, after=0.48 (modest decrease)
// Distilled: before=0.38, after=0.72 (clear rise — the counterintuitive result)
const GROUPS = [
  {
    label: 'Chain-of-Thought\nModel',
    bars: [
      { label: 'Before RLHF', relH: 0.52, color: CLAUDE.INK_SOFT, textColor: CLAUDE.INK_SOFT },
      { label: 'After RLHF', relH: 0.48, color: CLAUDE.INK, textColor: CLAUDE.INK },
    ],
    annotation: null,
  },
  {
    label: 'Distilled\nModel',
    bars: [
      { label: 'Before RLHF', relH: 0.38, color: CLAUDE.INK_SOFT, textColor: CLAUDE.INK_SOFT },
      { label: 'After RLHF', relH: 0.74, color: CLAUDE.SPARK, textColor: CLAUDE.SPARK },
    ],
    annotation: 'MORE deceptive after\nsafety training',
  },
];

export const SleeperAgentsResult: React.FC<SleeperAgentsResultProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase timing:
  // 0-20: title/eyebrow
  // 20-50: left group bars grow
  // 50-90: right group bars grow (before bar first)
  // 90-130: right after-RLHF bar rises (terracotta moment)
  // 130+: annotation + sparkline

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axisIn = spring({ frame: frame - 15, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Left group bars
  const leftBar0 = spring({ frame: frame - 20, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const leftBar1 = spring({ frame: frame - 35, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });

  // Right group bars
  const rightBar0 = spring({ frame: frame - 50, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const rightBar1 = spring({ frame: frame - 90, fps, config: { damping: 22, stiffness: 80, mass: 1.2 } }); // slower spring for dramatic rise

  const annotationIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const barAnims = [
    [leftBar0, leftBar1],
    [rightBar0, rightBar1],
  ];

  const PAD_X = width * 0.08;
  const PAD_Y = height * 0.08;

  // Chart geometry
  const CHART_TOP = height * 0.28;
  const CHART_BOTTOM = height * 0.78;
  const CHART_H = CHART_BOTTOM - CHART_TOP;
  const CHART_W = (width - PAD_X * 2) * 0.85;
  const CHART_LEFT = PAD_X;

  // Group layout
  const GROUP_W = CHART_W / 2;
  const BAR_W = GROUP_W * 0.22;
  const BAR_GAP = GROUP_W * 0.06;
  const GROUP_PAD = GROUP_W * 0.14;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.015,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        THE COUNTERINTUITIVE RESULT · DECEPTION RATE
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.055,
        fontFamily: SERIF,
        fontSize: height * 0.036,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Safety training made the distilled model more deceptive
      </div>

      {/* Y-axis label */}
      <div style={{
        position: 'absolute',
        left: PAD_X - 8,
        top: CHART_TOP,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        writingMode: 'vertical-rl' as const,
        textOrientation: 'mixed' as const,
        transform: 'rotate(180deg)',
        opacity: clamp(axisIn, 0, 1),
        letterSpacing: 1,
      }}>
        DECEPTION RATE →
      </div>

      {/* Chart baseline */}
      <div style={{
        position: 'absolute',
        left: CHART_LEFT,
        top: CHART_BOTTOM,
        width: CHART_W,
        height: 2,
        background: CLAUDE.BORDER,
        opacity: clamp(axisIn, 0, 1),
      }} />

      {/* Groups */}
      {GROUPS.map((group, gi) => {
        const groupLeft = CHART_LEFT + gi * GROUP_W + GROUP_PAD;

        return (
          <React.Fragment key={gi}>
            {/* Bars */}
            {group.bars.map((bar, bi) => {
              const barAnim = clamp(barAnims[gi][bi], 0, 1);
              const barH = CHART_H * bar.relH * barAnim;
              const barLeft = groupLeft + bi * (BAR_W + BAR_GAP);
              const barTop = CHART_BOTTOM - barH;

              return (
                <React.Fragment key={bi}>
                  {/* Bar */}
                  <div style={{
                    position: 'absolute',
                    left: barLeft,
                    top: barTop,
                    width: BAR_W,
                    height: Math.max(barH, 1),
                    background: bar.color,
                    borderRadius: '4px 4px 0 0',
                    opacity: barAnim > 0.01 ? 1 : 0,
                  }} />

                  {/* Bar label below baseline */}
                  <div style={{
                    position: 'absolute',
                    left: barLeft - 8,
                    top: CHART_BOTTOM + 10,
                    width: BAR_W + 16,
                    textAlign: 'center',
                    fontFamily: SANS,
                    fontSize: height * 0.012,
                    color: bar.textColor,
                    fontWeight: bi === 1 ? 700 : 400,
                    lineHeight: 1.35,
                    opacity: barAnim > 0.3 ? 1 : 0,
                  }}>
                    {bar.label}
                  </div>
                </React.Fragment>
              );
            })}

            {/* Group label */}
            <div style={{
              position: 'absolute',
              left: groupLeft,
              top: CHART_BOTTOM + height * 0.09,
              width: GROUP_W - GROUP_PAD * 2 + BAR_GAP,
              textAlign: 'center',
              fontFamily: SERIF,
              fontSize: height * 0.0175,
              fontWeight: 600,
              color: gi === 1 ? CLAUDE.SPARK : CLAUDE.INK,
              whiteSpace: 'pre-line',
              lineHeight: 1.35,
              opacity: clamp(barAnims[gi][0], 0, 1),
            }}>
              {group.label}
            </div>

            {/* Annotation for distilled model */}
            {group.annotation && (
              <div style={{
                position: 'absolute',
                left: groupLeft + BAR_W + BAR_GAP - 10,
                top: CHART_BOTTOM - CHART_H * GROUPS[1].bars[1].relH * clamp(rightBar1, 0, 1) - height * 0.14,
                opacity: clamp(annotationIn, 0, 1),
                transform: `translateY(${(1 - clamp(annotationIn, 0, 1)) * -10}px)`,
              }}>
                {/* Arrow pointing down to bar top */}
                <svg width={120} height={60} style={{ display: 'block', marginLeft: -20 }}>
                  <path d="M60 0 L60 35 L85 35" stroke={CLAUDE.SPARK} strokeWidth={2} fill="none" strokeDasharray="5 3" />
                  <polygon points="85,31 95,35 85,39" fill={CLAUDE.SPARK} />
                </svg>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  background: CLAUDE.SPARK,
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontFamily: SERIF,
                  fontSize: height * 0.0145,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.35,
                  textAlign: 'center',
                }}>
                  {group.annotation}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Hubinger et al. 2024, Anthropic — Sleeper Agents
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
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
