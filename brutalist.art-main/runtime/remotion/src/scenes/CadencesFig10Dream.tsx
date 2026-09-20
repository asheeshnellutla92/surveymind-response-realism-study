import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig10Dream — "Dream Big" closing graphic.
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Three theme bands rise like a skyline:
 *   Augmentation — collaborate with AI on meaningful work: >50%
 *   Automation   — AI takes the drudgery, more free time: just over 50%
 *   Shared prosperity — gains widely shared: ~1/3
 *
 * The three bars animate sequentially from bottom up.
 * No terracotta accent — all three are the landing; the moment is the whole frame.
 * (One ink-weight exception: the "collaboration" bar is the deepest ink as the
 *  primary ask the report ends on.)
 */

export const cadencesFig10DreamSchema = z.object({
  sparkLine: z.string().default('Not replacement. Not rescue. Collaboration.'),
});
export type CadencesFig10DreamProps = z.infer<typeof cadencesFig10DreamSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const THEMES = [
  {
    label: 'Augmentation',
    sub: 'Collaborate with AI on meaningful work',
    pct: 52,
    color: CLAUDE.INK,
  },
  {
    label: 'Automation',
    sub: 'AI takes the drudgery, more free time',
    pct: 51,
    color: CLAUDE.INK_SOFT,
  },
  {
    label: 'Shared prosperity',
    sub: 'Gains widely shared across society',
    pct: 33,
    color: CLAUDE.GHOST,
  },
];

export const CadencesFig10Dream: React.FC<CadencesFig10DreamProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 95, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CHART_TOP    = height * 0.28;
  const CHART_BOTTOM = height * 0.78;
  const CHART_H      = CHART_BOTTOM - CHART_TOP;
  const CHART_LEFT   = PAD_X;
  const CHART_RIGHT  = width - PAD_X;
  const CHART_W      = CHART_RIGHT - CHART_LEFT;
  const BAR_W        = CHART_W / THEMES.length - 40;
  const GROUP_W      = CHART_W / THEMES.length;
  const MAX_PCT      = 60;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        SURVEY: "WHAT DO YOU HOPE AI LOOKS LIKE IN 10 YEARS?"
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        What users are actually asking for.
      </div>

      {/* Y gridlines */}
      {[0, 25, 50].map(v => {
        const y = CHART_BOTTOM - (v / MAX_PCT) * CHART_H;
        return (
          <React.Fragment key={v}>
            <div style={{
              position: 'absolute', left: CHART_LEFT, top: y,
              width: CHART_W, height: 1, background: CLAUDE.BORDER, opacity: 0.5,
            }} />
            <div style={{
              position: 'absolute', right: width - CHART_LEFT + 6, top: y - 9,
              fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
            }}>
              {v}%
            </div>
          </React.Fragment>
        );
      })}

      {/* Bars */}
      {THEMES.map((t, i) => {
        const bAnim = spring({ frame: frame - 10 - i * 15, fps, config: { damping: 22, stiffness: 70, mass: 1.1 } });
        const bx = CHART_LEFT + i * GROUP_W + (GROUP_W - BAR_W) / 2;
        const barH = (t.pct / MAX_PCT) * CHART_H * clamp(bAnim, 0, 1);

        return (
          <React.Fragment key={t.label}>
            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: bx, top: CHART_BOTTOM - barH,
              width: BAR_W, height: barH,
              background: t.color,
              borderRadius: '8px 8px 0 0',
            }} />

            {/* % label */}
            {clamp(bAnim, 0, 1) > 0.8 && (
              <div style={{
                position: 'absolute',
                left: bx, top: CHART_BOTTOM - barH - 28,
                width: BAR_W, fontFamily: SERIF,
                fontSize: height * 0.030, fontWeight: 700,
                color: t.color, textAlign: 'center' as const,
              }}>
                {t.pct > 50 ? `>${t.pct}%` : `~${t.pct}%`}
              </div>
            )}

            {/* Theme label */}
            <div style={{
              position: 'absolute',
              left: bx, top: CHART_BOTTOM + 14,
              width: BAR_W,
              fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 700,
              color: CLAUDE.INK, textAlign: 'center' as const,
              opacity: clamp(bAnim, 0, 1),
            }}>
              {t.label}
            </div>

            {/* Sub label */}
            <div style={{
              position: 'absolute',
              left: bx, top: CHART_BOTTOM + 14 + height * 0.035,
              width: BAR_W,
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.INK_SOFT, textAlign: 'center' as const,
              lineHeight: 1.3,
              opacity: clamp(bAnim, 0, 1) * 0.85,
            }}>
              {t.sub}
            </div>
          </React.Fragment>
        );
      })}

      {/* Caveats chip */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y + height * 0.10,
        background: CLAUDE.CARD, borderRadius: 12, border: `1px solid ${CLAUDE.BORDER}`,
        padding: '12px 16px', maxWidth: 260,
        opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST, lineHeight: 1.5 }}>
          Caveats: Claude users, not general pop. 30% computer & math
          (4% of US employment). 12% women. Self-report limitations.
        </div>
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data: Anthropic Economic Index, Cadences (June 2026)
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
