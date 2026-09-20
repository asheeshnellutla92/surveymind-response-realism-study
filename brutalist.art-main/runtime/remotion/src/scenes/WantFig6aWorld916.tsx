import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { wantFig6aWorldSchema } from './WantFig6aWorld';
import type { WantFig6aWorldProps } from './WantFig6aWorld';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig6aWorld916 — portrait 9:16 (1080×1920) version of WantFig6aWorld.
 * Same schema. Chips reflowed to fill portrait width.
 * Safe zone: top 12% (~230px) and bottom 25% (~480px) reserved for platform UI.
 * Active band: y 230–1440 (1210px tall), x 54–1026.
 * Per REFLOW rule: fill the width, distribute content down the height.
 */

export const wantFig6aWorld916Schema = wantFig6aWorldSchema;
export type WantFig6aWorld916Props = WantFig6aWorldProps;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const HIGH_NO_CONCERN = [
  { region: 'Sub-Saharan Africa', pct: 18 },
  { region: 'Central Asia', pct: 17 },
  { region: 'South Asia', pct: 17 },
];
const LOW_NO_CONCERN = [
  { region: 'North America', pct: 8 },
  { region: 'Oceania', pct: 8 },
  { region: 'Western Europe', pct: 9 },
];

export const WantFig6aWorld916: React.FC<WantFig6aWorld916Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const statIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const highChipsIn = spring({ frame: frame - 40, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const lowChipsIn = spring({ frame: frame - 65, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const contrastIn = spring({ frame: frame - 90, fps, config: { damping: 20, stiffness: 65, mass: 1.2 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Portrait layout
  // Safe zones: top 12% = ~230px, bottom 25% = ~480px
  const SAFE_TOP = height * 0.13;
  const PAD_X = width * 0.07;
  const PAD_Y = SAFE_TOP;
  const CONTENT_W = width - PAD_X * 2;

  // Stat band — two stats side by side, full width
  const STAT_TOP = PAD_Y + height * 0.155;
  // "Who reported no concerns" section
  const SECTION_TOP = STAT_TOP + height * 0.130;
  // High no-concern chips
  const HIGH_CHIPS_TOP = SECTION_TOP + height * 0.040;
  // Contrast line
  const CONTRAST_TOP = HIGH_CHIPS_TOP + height * 0.110;
  // Low chips
  const LOW_CHIPS_TOP = CONTRAST_TOP + height * 0.030;

  // Chip width for 3 chips across
  const CHIP_W = (CONTENT_W - 16 * 2) / 3;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        GLOBAL SENTIMENT
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, right: PAD_X, top: PAD_Y + height * 0.038,
        fontFamily: SERIF, fontSize: height * 0.032, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
        lineHeight: 1.2,
      }}>
        Positive everywhere. Worried differently.
      </div>

      {/* Big stat band — two stats side by side */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: STAT_TOP,
        width: CONTENT_W,
        background: CLAUDE.PILL,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        padding: `${height * 0.022}px ${width * 0.04}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        opacity: clamp(statIn, 0, 1),
        transform: `translateY(${(1 - statIn) * 12}px)`,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: height * 0.065,
            color: CLAUDE.INK, lineHeight: 1, letterSpacing: '-0.04em',
          }}>
            67%
          </div>
          <div style={{ fontFamily: SANS, fontSize: height * 0.014, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            net positive globally
          </div>
        </div>
        <div style={{ width: 1, height: height * 0.072, background: CLAUDE.BORDER }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: height * 0.052,
            color: CLAUDE.INK, lineHeight: 1, letterSpacing: '-0.03em',
          }}>
            60%+
          </div>
          <div style={{ fontFamily: SANS, fontSize: height * 0.014, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            no country below 60%
          </div>
        </div>
      </div>

      {/* "Who reported no concerns" section header */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: SECTION_TOP,
        fontFamily: SERIF, fontSize: height * 0.020, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(highChipsIn, 0, 1),
      }}>
        Who reported no concerns at all
      </div>

      {/* High no-concern chips — 3 across, portrait-width */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: HIGH_CHIPS_TOP,
        width: CONTENT_W,
        display: 'flex',
        gap: 16,
        opacity: clamp(highChipsIn, 0, 1),
        transform: `translateY(${(1 - highChipsIn) * 10}px)`,
      }}>
        {HIGH_NO_CONCERN.map((r, i) => (
          <div key={i} style={{
            flex: 1,
            background: CLAUDE.CARD,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 8,
            padding: `${height * 0.014}px ${width * 0.020}px`,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: SERIF, fontWeight: 700, fontSize: height * 0.038,
              color: CLAUDE.INK, lineHeight: 1,
            }}>
              {r.pct}%
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.INK_SOFT, marginTop: 4, lineHeight: 1.3,
            }}>
              {r.region}
            </div>
          </div>
        ))}
      </div>

      {/* Terracotta contrast line — the ONE accent */}
      {clamp(contrastIn, 0, 1) > 0.05 && (
        <div style={{
          position: 'absolute',
          left: PAD_X,
          top: CONTRAST_TOP,
          width: CONTENT_W * clamp(contrastIn, 0, 1),
          height: 2,
          background: CLAUDE.SPARK,
          opacity: clamp(contrastIn, 0, 1) * 0.7,
          borderRadius: 1,
        }} />
      )}

      {/* Contrast label */}
      {clamp(contrastIn, 0, 1) > 0.3 && (
        <div style={{
          position: 'absolute',
          left: PAD_X,
          top: CONTRAST_TOP + height * 0.010,
          fontFamily: SERIF, fontSize: height * 0.014, fontStyle: 'italic',
          color: CLAUDE.SPARK, opacity: clamp(contrastIn, 0, 1),
        }}>
          vs. wealthier regions:
        </div>
      )}

      {/* Low no-concern chips — 3 across */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: LOW_CHIPS_TOP,
        width: CONTENT_W,
        display: 'flex',
        gap: 16,
        opacity: clamp(lowChipsIn, 0, 1),
        transform: `translateY(${(1 - lowChipsIn) * 10}px)`,
      }}>
        {LOW_NO_CONCERN.map((r, i) => (
          <div key={i} style={{
            flex: 1,
            background: CLAUDE.PAGE,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 8,
            padding: `${height * 0.014}px ${width * 0.020}px`,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: SERIF, fontWeight: 700, fontSize: height * 0.038,
              color: CLAUDE.INK_SOFT, lineHeight: 1,
            }}>
              {r.pct}%
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.GHOST, marginTop: 4, lineHeight: 1.3,
            }}>
              {r.region}
            </div>
          </div>
        ))}
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
