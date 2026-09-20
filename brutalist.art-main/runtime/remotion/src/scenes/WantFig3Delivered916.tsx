import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { wantFig3DeliveredSchema } from './WantFig3Delivered';
import type { WantFig3DeliveredProps } from './WantFig3Delivered';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig3Delivered916 — portrait 9:16 (1080×1920) version of WantFig3Delivered.
 * Same schema. 81% stat card stacks ABOVE the bars (not side-by-side).
 * Safe zone: top 12% (~230px) and bottom 25% (~480px) reserved for platform UI.
 * Active band: y 230–1440 (1210px tall), x 54–1026.
 * Per REFLOW rule: fill the width, distribute content down the height.
 */

export const wantFig3Delivered916Schema = wantFig3DeliveredSchema;
export type WantFig3Delivered916Props = WantFig3DeliveredProps;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const DELIVERED = [
  { label: 'Productivity', pct: 32.0, isMuted: false, isAccent: false },
  { label: "AI hasn't delivered", pct: 18.9, isMuted: true, isAccent: false },
  { label: 'Cognitive partnership', pct: 17.2, isMuted: false, isAccent: false },
  { label: 'Learning', pct: 9.9, isMuted: false, isAccent: false },
  { label: 'Technical accessibility', pct: 8.7, isMuted: false, isAccent: false },
  { label: 'Research synthesis', pct: 7.2, isMuted: false, isAccent: false },
  { label: 'Emotional support', pct: 6.1, isMuted: false, isAccent: true },
];

const MAX_PCT = 34;

export const WantFig3Delivered916: React.FC<WantFig3Delivered916Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const statIn = spring({ frame, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const titleIn = spring({ frame: frame - 20, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  const barOffset = 40;
  const barAnims = DELIVERED.map((_, i) =>
    spring({ frame: frame - barOffset - i * 12, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );

  const accentIdx = DELIVERED.length - 1;
  const accentIn = spring({ frame: frame - barOffset - accentIdx * 12 - 20, fps, config: { damping: 20, stiffness: 65, mass: 1.2 } });
  const sparkIn = spring({ frame: frame - barOffset - DELIVERED.length * 12 + 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - barOffset - DELIVERED.length * 12 + 25, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Portrait layout
  // Safe zones: top 12% = ~230px, bottom 25% = ~480px
  const SAFE_TOP = height * 0.13;
  const PAD_X = width * 0.07;
  const PAD_Y = SAFE_TOP;

  // 81% stat card — top section, spans full width
  const STAT_TOP = PAD_Y + height * 0.075;
  const STAT_BLOCK_H = height * 0.11;

  // Chart starts below stat block
  const CHART_TOP = STAT_TOP + STAT_BLOCK_H + height * 0.035;

  // Bar chart layout — full width bars
  const LABEL_W = width * 0.36;
  const BAR_AREA_W = width * 0.48;
  const BAR_START = PAD_X + LABEL_W + 8;
  const BAR_H = height * 0.038;
  const ROW_GAP = height * 0.053;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        HOW AI HAS DELIVERED
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, right: PAD_X, top: PAD_Y + height * 0.040,
        fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
        lineHeight: 1.2,
      }}>
        Where progress happened
      </div>

      {/* Big 81% stat card — stacked above chart, centered */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: STAT_TOP,
        right: PAD_X,
        opacity: clamp(statIn, 0, 1),
        transform: `scale(${0.90 + 0.10 * clamp(statIn, 0, 1)})`,
        transformOrigin: 'left top',
        display: 'flex',
        alignItems: 'center',
        gap: width * 0.06,
      }}>
        <div>
          <div style={{
            fontFamily: SERIF, fontWeight: 700,
            fontSize: height * 0.085,
            color: CLAUDE.INK,
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}>
            81%
          </div>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.016,
            color: CLAUDE.INK_SOFT, marginTop: 4,
            maxWidth: 260, lineHeight: 1.4,
          }}>
            said AI has taken a step toward their vision
          </div>
        </div>
      </div>

      {/* Bars */}
      {DELIVERED.map((item, i) => {
        const anim = barAnims[i];
        const barW = (item.pct / MAX_PCT) * BAR_AREA_W * clamp(anim, 0, 1);
        const y = CHART_TOP + i * ROW_GAP;
        const color = item.isMuted ? CLAUDE.GHOST : CLAUDE.INK;

        return (
          <React.Fragment key={i}>
            {/* Label */}
            <div style={{
              position: 'absolute',
              left: PAD_X,
              top: y + BAR_H * 0.5 - height * 0.012,
              width: LABEL_W,
              fontFamily: SANS,
              fontSize: height * 0.013,
              fontWeight: item.isMuted ? 400 : 500,
              color: item.isMuted ? CLAUDE.GHOST : CLAUDE.INK,
              textAlign: 'right',
              paddingRight: 8,
              opacity: clamp(anim, 0, 1),
              lineHeight: 1.2,
            }}>
              {item.label}
            </div>

            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: BAR_START,
              top: y,
              width: barW,
              height: BAR_H,
              background: color,
              borderRadius: '0 3px 3px 0',
              opacity: clamp(anim, 0, 1) * (item.isMuted ? 0.45 : 1),
            }} />

            {/* Percentage label */}
            {clamp(anim, 0, 1) > 0.5 && (
              <div style={{
                position: 'absolute',
                left: BAR_START + barW + 7,
                top: y + BAR_H * 0.5 - height * 0.011,
                fontFamily: SANS,
                fontSize: height * 0.012,
                fontWeight: 500,
                color: item.isMuted ? CLAUDE.GHOST : CLAUDE.INK_SOFT,
                opacity: clamp(anim, 0, 1),
              }}>
                {item.pct}%
              </div>
            )}

            {/* Emotional support terracotta accent underline */}
            {item.isAccent && clamp(accentIn, 0, 1) > 0.05 && (
              <div style={{
                position: 'absolute',
                left: BAR_START,
                top: y + BAR_H + 3,
                width: (item.pct / MAX_PCT) * BAR_AREA_W * clamp(accentIn, 0, 1),
                height: 2,
                background: CLAUDE.SPARK,
                borderRadius: 1,
              }} />
            )}

            {/* Emotional support callout */}
            {item.isAccent && clamp(accentIn, 0, 1) > 0.5 && (
              <div style={{
                position: 'absolute',
                left: BAR_START + (item.pct / MAX_PCT) * BAR_AREA_W + 7,
                top: y + BAR_H * 0.5 - height * 0.011,
                fontFamily: SANS, fontSize: height * 0.012,
                color: CLAUDE.SPARK, fontWeight: 700,
                opacity: clamp(accentIn, 0, 1),
                whiteSpace: 'nowrap',
              }}>
                ← smallest bar
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.10,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Data: Anthropic, What 81,000 People Want from AI (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.04,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.020, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
