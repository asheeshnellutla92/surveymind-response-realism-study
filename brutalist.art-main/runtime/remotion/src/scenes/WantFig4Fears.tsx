import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig4Fears — Figure 4: What People Fear
 * Source: Anthropic, "What 81,000 People Want from AI" (2026)
 *
 * Ranked horizontal bars cascade in.
 * ONE terracotta moment: "Jobs & economy" bar gets a terracotta ring/pulse —
 * "strongest predictor of overall AI sentiment."
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const wantFig4FearsSchema = z.object({
  sparkLine: z.string().default('Jobs fear predicts everything.'),
});
export type WantFig4FearsProps = z.infer<typeof wantFig4FearsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const FEARS = [
  { label: 'Unreliability', pct: 26.7, isAccent: false },
  { label: 'Jobs & economy', pct: 22.3, isAccent: true },  // ONE terracotta accent
  { label: 'Autonomy & agency', pct: 21.9, isAccent: false },
  { label: 'Cognitive atrophy', pct: 16.3, isAccent: false },
  { label: 'Governance', pct: 14.7, isAccent: false },
  { label: 'Misinformation', pct: 13.6, isAccent: false },
  { label: 'Surveillance & privacy', pct: 13.1, isAccent: false },
  { label: 'Malicious use', pct: 13.0, isAccent: false },
  { label: 'Meaning & creativity', pct: 11.7, isAccent: false },
  { label: 'Overrestriction', pct: 11.7, isAccent: false },
  { label: 'Wellbeing & dependency', pct: 11.2, isAccent: false },
  { label: 'Sycophancy', pct: 10.8, isAccent: false },
  { label: 'Existential risk', pct: 6.7, isAccent: false },
];

const MAX_PCT = 30;

export const WantFig4Fears: React.FC<WantFig4FearsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Cascade: each bar delays 8 frames from previous
  const barAnims = FEARS.map((_, i) =>
    spring({ frame: frame - 15 - i * 8, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );

  // Terracotta ring on Jobs & economy (index 1) — after all bars land
  const accentIdx = 1;
  const accentIn = spring({ frame: frame - 15 - FEARS.length * 8, fps, config: { damping: 20, stiffness: 65, mass: 1.2 } });

  const sparkIn = spring({ frame: frame - 15 - FEARS.length * 8 + 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 15 - FEARS.length * 8 + 25, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.06;

  // Two-column layout to fit 13 items
  const COL_COUNT = 2;
  const ROWS_PER_COL = Math.ceil(FEARS.length / COL_COUNT);
  const LABEL_W = width * 0.18;
  const BAR_AREA_W = width * 0.23;
  const BAR_H = height * 0.032;
  const ROW_GAP = height * 0.048;
  const CHART_TOP = PAD_Y + height * 0.20;
  const COL_W = width * 0.46;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        FEARS · % OF RESPONDENTS (THEMES) · AVG 2.3 CONCERNS EACH
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        What people worry about
      </div>

      {/* Bars — two columns */}
      {FEARS.map((fear, i) => {
        const col = Math.floor(i / ROWS_PER_COL);
        const row = i % ROWS_PER_COL;
        const anim = barAnims[i];
        const barW = (fear.pct / MAX_PCT) * BAR_AREA_W * clamp(anim, 0, 1);
        const colX = PAD_X + col * COL_W;
        const BAR_START = colX + LABEL_W + 10;
        const y = CHART_TOP + row * ROW_GAP;
        const isAccent = fear.isAccent;

        return (
          <React.Fragment key={i}>
            {/* Label */}
            <div style={{
              position: 'absolute',
              left: colX,
              top: y + BAR_H * 0.5 - height * 0.011,
              width: LABEL_W,
              fontFamily: SANS,
              fontSize: height * 0.013,
              fontWeight: isAccent ? 700 : 400,
              color: isAccent && clamp(accentIn, 0, 1) > 0.3 ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'right',
              paddingRight: 8,
              opacity: clamp(anim, 0, 1),
              lineHeight: 1.2,
              transition: 'color 0.3s',
            }}>
              {fear.label}
            </div>

            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: BAR_START,
              top: y,
              width: barW,
              height: BAR_H,
              background: CLAUDE.INK,
              borderRadius: '0 3px 3px 0',
              opacity: clamp(anim, 0, 1),
            }} />

            {/* Percentage label */}
            {clamp(anim, 0, 1) > 0.5 && (
              <div style={{
                position: 'absolute',
                left: BAR_START + barW + 5,
                top: y + BAR_H * 0.5 - height * 0.011,
                fontFamily: SANS,
                fontSize: height * 0.012,
                color: CLAUDE.INK_SOFT,
                opacity: clamp(anim, 0, 1),
              }}>
                {fear.pct}%
              </div>
            )}

            {/* Terracotta ring on Jobs & economy */}
            {isAccent && clamp(accentIn, 0, 1) > 0.05 && (
              <>
                {/* Terracotta border around the bar area */}
                <div style={{
                  position: 'absolute',
                  left: BAR_START - 3,
                  top: y - 3,
                  width: (fear.pct / MAX_PCT) * BAR_AREA_W + 6,
                  height: BAR_H + 6,
                  border: `2px solid ${CLAUDE.SPARK}`,
                  borderRadius: 5,
                  opacity: clamp(accentIn, 0, 1) * 0.85,
                }} />
                {/* Callout text */}
                {clamp(accentIn, 0, 1) > 0.5 && (
                  <div style={{
                    position: 'absolute',
                    left: BAR_START + (fear.pct / MAX_PCT) * BAR_AREA_W + 8,
                    top: y - 8,
                    fontFamily: SERIF, fontSize: height * 0.013,
                    fontStyle: 'italic', color: CLAUDE.SPARK,
                    opacity: clamp(accentIn, 0, 1),
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                  }}>
                    strongest predictor<br />of AI sentiment
                  </div>
                )}
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* Footnote */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.18,
        fontFamily: SANS, fontSize: height * 0.013,
        color: CLAUDE.INK_SOFT, opacity: clamp(citeIn, 0, 1),
      }}>
        11% reported no concerns · average 2.3 concerns per person
      </div>

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
