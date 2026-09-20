import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig3Delivered — Figure 3: Where AI Has Delivered
 * Source: Anthropic, "What 81,000 People Want from AI" (2026)
 *
 * Big "81%" stat card animates first, then ranked horizontal bars.
 * ONE terracotta moment: lingering attention on Emotional support bar (6.1%) —
 * it gets a terracotta ring/underline after all bars are visible.
 *
 * "AI hasn't delivered" bar renders gray/muted; all others in ink.
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const wantFig3DeliveredSchema = z.object({
  sparkLine: z.string().default('81% say yes. But look at the smallest bar.'),
});
export type WantFig3DeliveredProps = z.infer<typeof wantFig3DeliveredSchema>;

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
  { label: 'Emotional support', pct: 6.1, isMuted: false, isAccent: true }, // ONE terracotta accent
];

const MAX_PCT = 34;

export const WantFig3Delivered: React.FC<WantFig3DeliveredProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Big stat card comes in first
  const statIn = spring({ frame, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const titleIn = spring({ frame: frame - 20, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Bars cascade after stat card settles
  const barOffset = 40;
  const barAnims = DELIVERED.map((_, i) =>
    spring({ frame: frame - barOffset - i * 12, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );

  const accentIdx = DELIVERED.length - 1; // Emotional support
  const accentIn = spring({ frame: frame - barOffset - accentIdx * 12 - 20, fps, config: { damping: 20, stiffness: 65, mass: 1.2 } });

  const sparkIn = spring({ frame: frame - barOffset - DELIVERED.length * 12 + 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - barOffset - DELIVERED.length * 12 + 25, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const LABEL_W = width * 0.24;
  const BAR_AREA_W = width * 0.52;
  const BAR_START = width * 0.35;
  const BAR_H = height * 0.040;
  const ROW_GAP = height * 0.0575;
  const CHART_TOP = PAD_Y + height * 0.20;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Big 81% stat card — top-left hero number */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.06,
        opacity: clamp(statIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(statIn, 0, 1)})`,
        transformOrigin: 'left top',
      }}>
        <div style={{
          fontFamily: SERIF, fontWeight: 700,
          fontSize: height * 0.10,
          color: CLAUDE.INK,
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}>
          81%
        </div>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.018,
          color: CLAUDE.INK_SOFT, marginTop: 4,
          maxWidth: 280, lineHeight: 1.4,
        }}>
          said AI has taken a step toward their vision
        </div>
      </div>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: width * 0.35, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        HOW AI HAS DELIVERED · % OF RESPONDENTS
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: width * 0.35, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Where progress happened
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
              top: y + BAR_H * 0.5 - height * 0.013,
              width: LABEL_W,
              fontFamily: SANS,
              fontSize: height * 0.014,
              fontWeight: item.isMuted ? 400 : 500,
              color: item.isMuted ? CLAUDE.GHOST : CLAUDE.INK,
              textAlign: 'right',
              paddingRight: 10,
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
                top: y + BAR_H * 0.5 - height * 0.012,
                fontFamily: SANS,
                fontSize: height * 0.013,
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

            {/* Emotional support label accent */}
            {item.isAccent && clamp(accentIn, 0, 1) > 0.5 && (
              <div style={{
                position: 'absolute',
                left: BAR_START + (item.pct / MAX_PCT) * BAR_AREA_W + 7,
                top: y + BAR_H * 0.5 - height * 0.012,
                fontFamily: SANS, fontSize: height * 0.013,
                color: CLAUDE.SPARK, fontWeight: 700,
                opacity: clamp(accentIn, 0, 1),
              }}>
                {item.pct}% ← the smallest bar
              </div>
            )}
          </React.Fragment>
        );
      })}

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
