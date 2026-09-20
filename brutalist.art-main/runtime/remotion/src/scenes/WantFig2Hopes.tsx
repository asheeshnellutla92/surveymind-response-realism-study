import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig2Hopes — Figure 2: What People Hope For
 * Source: Anthropic, "What 81,000 People Want from AI" (2026)
 *
 * Ranked horizontal bars growing left to right.
 * ONE terracotta moment: "making room for life" group highlight —
 * Life management + Time freedom + Financial independence bars get terracotta tint.
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const wantFig2HopesSchema = z.object({
  sparkLine: z.string().default('A third want time, not work.'),
});
export type WantFig2HopesProps = z.infer<typeof wantFig2HopesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// "making room for life" = Life management + Time freedom + Financial independence
const HOPES = [
  { label: 'Professional excellence', pct: 18.8, isLife: false },
  { label: 'Personal transformation', pct: 13.7, isLife: false },
  { label: 'Life management', pct: 13.5, isLife: true },
  { label: 'Time freedom', pct: 11.1, isLife: true },
  { label: 'Financial independence', pct: 9.7, isLife: true },
  { label: 'Societal transformation', pct: 9.4, isLife: false },
  { label: 'Entrepreneurship', pct: 8.7, isLife: false },
  { label: 'Learning & growth', pct: 8.4, isLife: false },
  { label: 'Creative expression', pct: 5.6, isLife: false },
];

const MAX_PCT = 20;

export const WantFig2Hopes: React.FC<WantFig2HopesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const highlightIn = spring({ frame: frame - HOPES.length * 12 + 10, fps, config: { damping: 22, stiffness: 70, mass: 1.1 } });
  const sparkIn = spring({ frame: frame - HOPES.length * 12 + 30, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - HOPES.length * 12 + 35, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const barAnims = HOPES.map((_, i) =>
    spring({ frame: frame - 15 - i * 12, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const LABEL_W = width * 0.25;
  const BAR_AREA_W = width * 0.55;
  const BAR_START = PAD_X + LABEL_W + 12;
  const BAR_H = height * 0.040;
  const ROW_GAP = height * 0.058;
  const CHART_TOP = PAD_Y + height * 0.18;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        HOPES · % OF RESPONDENTS (THEMES)
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        What people hope AI will do for them
      </div>

      {/* "Making room for life" bracket label */}
      {clamp(highlightIn, 0, 1) > 0.1 && (
        <div style={{
          position: 'absolute',
          right: PAD_X,
          top: CHART_TOP + 2 * ROW_GAP,
          height: 3 * ROW_GAP - BAR_H * 0.3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: clamp(highlightIn, 0, 1),
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: height * 0.016, fontStyle: 'italic',
            color: CLAUDE.SPARK, textAlign: 'right', lineHeight: 1.4,
            borderRight: `2px solid ${CLAUDE.SPARK}`,
            paddingRight: 10,
          }}>
            making room<br />for life
          </div>
        </div>
      )}

      {/* Bars */}
      {HOPES.map((hope, i) => {
        const anim = barAnims[i];
        const barW = (hope.pct / MAX_PCT) * BAR_AREA_W * clamp(anim, 0, 1);
        const y = CHART_TOP + i * ROW_GAP;
        const isLife = hope.isLife;
        const highlight = isLife && clamp(highlightIn, 0, 1) > 0.1;

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
              fontWeight: highlight ? 600 : 400,
              color: highlight ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'right',
              paddingRight: 10,
              opacity: clamp(anim, 0, 1),
              lineHeight: 1.2,
            }}>
              {hope.label}
            </div>

            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: BAR_START,
              top: y,
              width: barW,
              height: BAR_H,
              background: highlight ? CLAUDE.SPARK : CLAUDE.INK,
              borderRadius: '0 3px 3px 0',
              opacity: clamp(anim, 0, 1),
            }} />

            {/* Percentage label */}
            {clamp(anim, 0, 1) > 0.5 && (
              <div style={{
                position: 'absolute',
                left: BAR_START + barW + 6,
                top: y + BAR_H * 0.5 - height * 0.012,
                fontFamily: SANS,
                fontSize: height * 0.014,
                fontWeight: 600,
                color: highlight ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                opacity: clamp(anim, 0, 1),
              }}>
                {hope.pct}%
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
