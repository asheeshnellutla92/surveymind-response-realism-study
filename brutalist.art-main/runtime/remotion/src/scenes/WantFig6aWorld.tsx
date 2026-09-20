import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig6aWorld — Figure 6a: Around the World — Sentiment
 * Source: Anthropic, "What 81,000 People Want from AI" (2026)
 *
 * Horizontal stat band "67% net positive globally · no country below 60%"
 * Then paired chips for No-concerns rates by region.
 *
 * ONE terracotta moment: the contrast chip between wealthier regions (low no-concern)
 * and developing regions (high no-concern) — terracotta highlight on the contrast line.
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const wantFig6aWorldSchema = z.object({
  sparkLine: z.string().default('The wealthy worry more.'),
});
export type WantFig6aWorldProps = z.infer<typeof wantFig6aWorldSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// No-concerns rate (% reporting NO concerns at all)
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

export const WantFig6aWorld: React.FC<WantFig6aWorldProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const statIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const highChipsIn = spring({ frame: frame - 40, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const lowChipsIn = spring({ frame: frame - 65, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const contrastIn = spring({ frame: frame - 90, fps, config: { damping: 20, stiffness: 65, mass: 1.2 } }); // terracotta accent
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        GLOBAL SENTIMENT · AROUND THE WORLD
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Positive everywhere. Worried differently.
      </div>

      {/* Big stat band */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.25,
        right: PAD_X,
        background: CLAUDE.PILL,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: `${height * 0.025}px ${width * 0.04}px`,
        display: 'flex',
        alignItems: 'center',
        gap: width * 0.05,
        opacity: clamp(statIn, 0, 1),
        transform: `translateY(${(1 - statIn) * 12}px)`,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: height * 0.075,
            color: CLAUDE.INK, lineHeight: 1, letterSpacing: '-0.04em',
          }}>
            67%
          </div>
          <div style={{ fontFamily: SANS, fontSize: height * 0.016, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            net positive globally
          </div>
        </div>
        <div style={{ width: 1, height: height * 0.08, background: CLAUDE.BORDER }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: height * 0.060,
            color: CLAUDE.INK, lineHeight: 1, letterSpacing: '-0.03em',
          }}>
            60%+
          </div>
          <div style={{ fontFamily: SANS, fontSize: height * 0.016, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            minimum — no country below 60%
          </div>
        </div>
      </div>

      {/* No-concerns section header */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.47,
        fontFamily: SERIF, fontSize: height * 0.022, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(highChipsIn, 0, 1),
      }}>
        Who reported no concerns at all
      </div>

      {/* High no-concern chips */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.52,
        display: 'flex',
        gap: 16,
        opacity: clamp(highChipsIn, 0, 1),
        transform: `translateY(${(1 - highChipsIn) * 10}px)`,
      }}>
        {HIGH_NO_CONCERN.map((r, i) => (
          <div key={i} style={{
            background: CLAUDE.CARD,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 8,
            padding: `${height * 0.016}px ${width * 0.025}px`,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: SERIF, fontWeight: 700, fontSize: height * 0.040,
              color: CLAUDE.INK, lineHeight: 1,
            }}>
              {r.pct}%
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.013,
              color: CLAUDE.INK_SOFT, marginTop: 4, lineHeight: 1.3,
            }}>
              {r.region}
            </div>
          </div>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center',
          fontFamily: SERIF, fontSize: height * 0.016, fontStyle: 'italic',
          color: CLAUDE.INK_SOFT, paddingLeft: 8,
        }}>
          no concerns
        </div>
      </div>

      {/* Terracotta contrast line / divider — the ONE accent */}
      {clamp(contrastIn, 0, 1) > 0.05 && (
        <div style={{
          position: 'absolute',
          left: PAD_X,
          top: height * 0.655,
          right: PAD_X,
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
          top: height * 0.665,
          fontFamily: SERIF, fontSize: height * 0.015, fontStyle: 'italic',
          color: CLAUDE.SPARK, opacity: clamp(contrastIn, 0, 1),
        }}>
          vs. wealthier regions:
        </div>
      )}

      {/* Low no-concern chips */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.70,
        display: 'flex',
        gap: 16,
        opacity: clamp(lowChipsIn, 0, 1),
        transform: `translateY(${(1 - lowChipsIn) * 10}px)`,
      }}>
        {LOW_NO_CONCERN.map((r, i) => (
          <div key={i} style={{
            background: CLAUDE.PAGE,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 8,
            padding: `${height * 0.016}px ${width * 0.025}px`,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: SERIF, fontWeight: 700, fontSize: height * 0.040,
              color: CLAUDE.INK_SOFT, lineHeight: 1,
            }}>
              {r.pct}%
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.013,
              color: CLAUDE.GHOST, marginTop: 4, lineHeight: 1.3,
            }}>
              {r.region}
            </div>
          </div>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center',
          fontFamily: SERIF, fontSize: height * 0.016, fontStyle: 'italic',
          color: CLAUDE.GHOST, paddingLeft: 8,
        }}>
          no concerns
        </div>
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
