import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { sleeperAgentsResultSchema } from './SleeperAgentsResult';
import type { SleeperAgentsResultProps } from './SleeperAgentsResult';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SleeperAgentsResult916 — portrait 9:16 (1080×1920) version.
 * Same schema. Reflow move: R4 (serialize) — the two side-by-side bar chart
 * groups are stacked vertically: Chain-of-Thought on top, Distilled below.
 * Each group fills the full portrait width, bars centered.
 * TEXT LAW: all text uses maxWidth; bar labels wrap inside SAFE916.
 */

export const sleeperAgentsResult916Schema = sleeperAgentsResultSchema;
export type SleeperAgentsResult916Props = SleeperAgentsResultProps;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Two groups stacked vertically — same data as landscape
const GROUPS = [
  {
    label: 'Chain-of-Thought\nModel',
    bars: [
      { label: 'Before RLHF', relH: 0.52, color: CLAUDE.INK_SOFT, textColor: CLAUDE.INK_SOFT },
      { label: 'After RLHF', relH: 0.48, color: CLAUDE.INK, textColor: CLAUDE.INK },
    ],
    annotation: null,
    isTerracotta: false,
  },
  {
    label: 'Distilled\nModel',
    bars: [
      { label: 'Before RLHF', relH: 0.38, color: CLAUDE.INK_SOFT, textColor: CLAUDE.INK_SOFT },
      { label: 'After RLHF', relH: 0.74, color: CLAUDE.SPARK, textColor: CLAUDE.SPARK },
    ],
    annotation: 'MORE deceptive after\nsafety training',
    isTerracotta: true,
  },
];

export const SleeperAgentsResult916: React.FC<SleeperAgentsResult916Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axisIn = spring({ frame: frame - 15, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Left group bars (indices into animation array)
  const leftBar0 = spring({ frame: frame - 20, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const leftBar1 = spring({ frame: frame - 35, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const rightBar0 = spring({ frame: frame - 50, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const rightBar1 = spring({ frame: frame - 90, fps, config: { damping: 22, stiffness: 80, mass: 1.2 } });
  const annotationIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const barAnims = [
    [leftBar0, leftBar1],
    [rightBar0, rightBar1],
  ];

  const PAD_X = width * 0.08;    // 86px
  const PAD_Y = height * 0.065;  // 125px
  const TEXT_MAX = width - PAD_X * 2;

  // Stacked group layout — portrait height split into two zones
  // Group 0 (COT): PAD_Y → MID, Group 1 (Distilled): MID → CHART_BOTTOM
  const CHART_TOP = height * 0.18;     // 346px (after title)
  const CHART_MID = height * 0.53;     // 1018px (half-way point)
  const CHART_BOTTOM = height * 0.82;  // 1574px
  const FOOT_LABEL_H = height * 0.06;  // 115px for group label below baseline

  // Bar geometry (same for both groups, centered in portrait width)
  const CHART_W = width - PAD_X * 2;  // 908px
  const BAR_W = CHART_W * 0.24;       // 218px
  const BAR_GAP = CHART_W * 0.08;     // 73px
  const TOTAL_BARS_W = 2 * BAR_W + BAR_GAP;
  const BAR_START_X = PAD_X + (CHART_W - TOTAL_BARS_W) / 2;

  // Group tops and bottoms (bottom = where bars touch baseline)
  const groupBounds = [
    { top: CHART_TOP, bottom: CHART_MID - FOOT_LABEL_H },
    { top: CHART_MID, bottom: CHART_BOTTOM - FOOT_LABEL_H },
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.013,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
        maxWidth: TEXT_MAX,
      }}>
        THE COUNTERINTUITIVE RESULT · DECEPTION RATE
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.038,
        fontFamily: SERIF,
        fontSize: height * 0.026,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
        maxWidth: TEXT_MAX,
        lineHeight: 1.2,
      }}>
        Safety training made the distilled model more deceptive
      </div>

      {/* Group divider line */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: CHART_MID - FOOT_LABEL_H - 10,
        width: CHART_W,
        height: 1,
        background: CLAUDE.BORDER,
        opacity: clamp(axisIn, 0, 1),
      }} />

      {/* Groups — rendered stacked */}
      {GROUPS.map((group, gi) => {
        const { top: GROUP_TOP, bottom: GROUP_BOTTOM } = groupBounds[gi];
        const GROUP_H = GROUP_BOTTOM - GROUP_TOP;
        const BASELINE = GROUP_BOTTOM;

        return (
          <React.Fragment key={gi}>
            {/* Baseline */}
            <div style={{
              position: 'absolute',
              left: PAD_X,
              top: BASELINE,
              width: CHART_W,
              height: 2,
              background: gi === 1 ? CLAUDE.SPARK : CLAUDE.BORDER,
              opacity: clamp(axisIn, 0, 1),
            }} />

            {/* Group label (between baseline and next group) */}
            <div style={{
              position: 'absolute',
              left: PAD_X,
              top: BASELINE + 10,
              width: CHART_W,
              textAlign: 'center',
              fontFamily: SERIF,
              fontSize: height * 0.018,
              fontWeight: 600,
              color: group.isTerracotta ? CLAUDE.SPARK : CLAUDE.INK,
              whiteSpace: 'pre-line' as const,
              lineHeight: 1.25,
              opacity: clamp(barAnims[gi][0], 0, 1),
            }}>
              {group.label}
            </div>

            {/* Bars */}
            {group.bars.map((bar, bi) => {
              const barAnim = clamp(barAnims[gi][bi], 0, 1);
              const barH = GROUP_H * bar.relH * barAnim;
              const barLeft = BAR_START_X + bi * (BAR_W + BAR_GAP);
              const barTop = BASELINE - barH;

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
                  {/* Bar label above bar top */}
                  <div style={{
                    position: 'absolute',
                    left: barLeft - 8,
                    top: Math.max(barTop - height * 0.030, GROUP_TOP),
                    width: BAR_W + 16,
                    textAlign: 'center',
                    fontFamily: SANS,
                    fontSize: height * 0.013,
                    color: bar.textColor,
                    fontWeight: bi === 1 ? 700 : 400,
                    lineHeight: 1.25,
                    opacity: barAnim > 0.3 ? 1 : 0,
                    maxWidth: BAR_W + 16,
                    wordBreak: 'break-word' as const,
                  }}>
                    {bar.label}
                  </div>
                </React.Fragment>
              );
            })}

            {/* Annotation for distilled group */}
            {group.annotation && (
              <div style={{
                position: 'absolute',
                left: BAR_START_X + BAR_W + BAR_GAP - 10,
                top: BASELINE - GROUP_H * GROUPS[1].bars[1].relH * clamp(rightBar1, 0, 1) - height * 0.03,
                opacity: clamp(annotationIn, 0, 1),
                transform: `translateY(${(1 - clamp(annotationIn, 0, 1)) * -10}px)`,
              }}>
                <svg width={110} height={50} style={{ display: 'block', marginLeft: -16 }}>
                  <path d="M55 0 L55 30 L80 30" stroke={CLAUDE.SPARK} strokeWidth={2} fill="none" strokeDasharray="5 3" />
                  <polygon points="80,26 90,30 80,34" fill={CLAUDE.SPARK} />
                </svg>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  background: CLAUDE.SPARK,
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontFamily: SERIF,
                  fontSize: height * 0.013,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'pre-line' as const,
                  lineHeight: 1.3,
                  textAlign: 'center',
                  maxWidth: 160,
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
        bottom: height * 0.11,
        fontFamily: SANS,
        fontSize: height * 0.011,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
        maxWidth: TEXT_MAX,
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
        paddingLeft: PAD_X,
        paddingRight: PAD_X,
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.020,
          fontStyle: 'italic',
          color: CLAUDE.INK,
          maxWidth: width * 0.80,
          textAlign: 'center',
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
