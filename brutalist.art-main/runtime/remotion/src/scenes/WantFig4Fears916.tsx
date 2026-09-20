import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { wantFig4FearsSchema } from './WantFig4Fears';
import type { WantFig4FearsProps } from './WantFig4Fears';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig4Fears916 — portrait 9:16 (1080×1920) version of WantFig4Fears.
 * Same schema. 13-item 2-column layout → single column with smaller fonts.
 * Safe zone: top 12% (~230px) and bottom 25% (~480px) reserved for platform UI.
 * Active band: y 230–1440 (1210px tall), x 54–1026.
 * Per REFLOW rule: fill the width, distribute content down the height.
 */

export const wantFig4Fears916Schema = wantFig4FearsSchema;
export type WantFig4Fears916Props = WantFig4FearsProps;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const FEARS = [
  { label: 'Unreliability', pct: 26.7, isAccent: false },
  { label: 'Jobs & economy', pct: 22.3, isAccent: true },
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

export const WantFig4Fears916: React.FC<WantFig4Fears916Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const barAnims = FEARS.map((_, i) =>
    spring({ frame: frame - 15 - i * 7, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );
  const accentIdx = 1;
  const accentIn = spring({ frame: frame - 15 - FEARS.length * 7, fps, config: { damping: 20, stiffness: 65, mass: 1.2 } });
  const sparkIn = spring({ frame: frame - 15 - FEARS.length * 7 + 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 15 - FEARS.length * 7 + 25, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Portrait layout — single column, compact
  const SAFE_TOP = height * 0.12;
  const PAD_X = width * 0.06;
  const PAD_Y = SAFE_TOP;

  // Single column: label left, bar right
  const LABEL_W = width * 0.40;
  const BAR_AREA_W = width * 0.40;
  const BAR_START = PAD_X + LABEL_W + 8;
  // 13 items, active band = ~1210px, title takes ~160px, footer ~120px
  // Available for bars: ~930px → 71px per row (compact but readable)
  const BAR_H = height * 0.028;
  const ROW_GAP = height * 0.046;
  const CHART_TOP = PAD_Y + height * 0.165;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        FEARS · AVG 2.3 CONCERNS EACH
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
        What people worry about
      </div>

      {/* % header */}
      <div style={{
        position: 'absolute',
        left: BAR_START,
        top: CHART_TOP - height * 0.030,
        fontFamily: SANS, fontSize: height * 0.011,
        color: CLAUDE.GHOST, opacity: clamp(titleIn, 0, 1),
      }}>
        % of respondents
      </div>

      {/* Bars — single column */}
      {FEARS.map((fear, i) => {
        const anim = barAnims[i];
        const barW = (fear.pct / MAX_PCT) * BAR_AREA_W * clamp(anim, 0, 1);
        const y = CHART_TOP + i * ROW_GAP;
        const isAccent = fear.isAccent;

        return (
          <React.Fragment key={i}>
            {/* Label */}
            <div style={{
              position: 'absolute',
              left: PAD_X,
              top: y + BAR_H * 0.5 - height * 0.010,
              width: LABEL_W,
              fontFamily: SANS,
              fontSize: height * 0.013,
              fontWeight: isAccent ? 700 : 400,
              color: isAccent && clamp(accentIn, 0, 1) > 0.3 ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'right',
              paddingRight: 8,
              opacity: clamp(anim, 0, 1),
              lineHeight: 1.2,
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
                top: y + BAR_H * 0.5 - height * 0.010,
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
                {clamp(accentIn, 0, 1) > 0.5 && (
                  <div style={{
                    position: 'absolute',
                    left: BAR_START + (fear.pct / MAX_PCT) * BAR_AREA_W + 8,
                    top: y - 6,
                    fontFamily: SERIF, fontSize: height * 0.012,
                    fontStyle: 'italic', color: CLAUDE.SPARK,
                    opacity: clamp(accentIn, 0, 1),
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                  }}>
                    strongest<br />predictor
                  </div>
                )}
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* Footnote */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.14,
        fontFamily: SANS, fontSize: height * 0.012,
        color: CLAUDE.INK_SOFT, opacity: clamp(citeIn, 0, 1),
      }}>
        11% reported no concerns
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.09,
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
