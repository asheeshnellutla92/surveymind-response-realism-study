import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileAditiFig6Quote — The Pivot, Paid Off.
 * FinFluent as the terracotta destination, the direct quote at center.
 * Beat B06 of claude-liam-profile-aditi-deodhar.
 *
 * HONESTY NOTE: The direct quote is verbatim from the article.
 * "I'm not done figuring it all out. Miles to go. But I feel like I'm getting there."
 */

export const profileAditiFig6QuoteSchema = z.object({
  sparkLine: z.string().default('The pivot has a cost. She keeps paying it.'),
});
export type ProfileAditiFig6QuoteProps = z.infer<typeof profileAditiFig6QuoteSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const TRACES = [
  { from: 'MediPedia', arrow: 'Confidence to rebuild' },
  { from: 'Jutly co-op', arrow: 'Instinct to listen and change course' },
  { from: 'MIT Women\'s Health', arrow: 'Drive to build for women' },
  { from: 'Pitch practice', arrow: 'Maturity to lead the pitch' },
];

export const ProfileAditiFig6Quote: React.FC<ProfileAditiFig6QuoteProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.09;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const eyebrowIn = spring({ frame, fps, config: { damping: 30, stiffness: 100 } });
  const titleIn   = spring({ frame: frame - Math.round(8 * S),   fps, config: { damping: 28, stiffness: 90 } });
  const destIn    = spring({ frame: frame - Math.round(20 * S),  fps, config: { damping: 24, stiffness: 65 } });
  const tracesIn  = spring({ frame: frame - Math.round(55 * S),  fps, config: { damping: 26, stiffness: 70 } });
  const quoteIn   = spring({ frame: frame - Math.round(130 * S), fps, config: { damping: 24, stiffness: 55 } });
  const sparkIn   = spring({ frame: frame - Math.round(220 * S), fps, config: { damping: 28, stiffness: 100 } });

  const destX = width * 0.58;
  const destY = height * 0.40;
  const destW = width * 0.34;
  const destH = height * 0.20;

  const traceBaseY = height * 0.26;
  const traceXStart = PAD;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(eyebrowIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.032, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        The Pivot, Paid Off
      </div>

      {/* FinFluent destination card */}
      <div style={{
        position: 'absolute',
        left: destX, top: destY,
        width: destW, height: destH,
        background: `${CLAUDE.SPARK}12`,
        border: `2.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        boxShadow: `0 6px 32px ${CLAUDE.SPARK}22`,
        opacity: clamp(destIn, 0, 1),
        transform: `scale(${clamp(destIn, 0.8, 1)})`,
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700,
          color: CLAUDE.SPARK,
        }}>FinFluent</div>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013,
          color: CLAUDE.INK_SOFT, textAlign: 'center' as const,
          maxWidth: destW * 0.85,
        }}>DreamAI 2025 finalist · Aditi led the pitch</div>
        <div style={{
          background: CLAUDE.SPARK, borderRadius: 6, padding: '3px 12px',
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 800,
          color: '#fff', letterSpacing: 2, textTransform: 'uppercase' as const,
          marginTop: 4,
        }}>Finalist</div>
      </div>

      {/* Traces */}
      {TRACES.map((t, i) => {
        const itemIn = spring({ frame: frame - Math.round((55 + i * 18) * S), fps, config: { damping: 26, stiffness: 75 } });
        const ty = traceBaseY + i * height * 0.14;
        const chipW = width * 0.20;
        return (
          <div key={i}>
            {/* Source chip */}
            <div style={{
              position: 'absolute',
              left: traceXStart, top: ty,
              width: chipW,
              background: CLAUDE.CARD, border: `1.5px solid ${CLAUDE.BORDER}`,
              borderRadius: 8, padding: '8px 14px',
              fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
              color: CLAUDE.INK,
              opacity: clamp(itemIn, 0, 1),
              transform: `translateX(${(1 - clamp(itemIn, 0, 1)) * -16}px)`,
            }}>{t.from}</div>

            {/* Arrow + label */}
            <svg style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}>
              <line
                x1={traceXStart + chipW + 4} y1={ty + 17}
                x2={destX - 8} y2={destY + destH / 2}
                stroke={CLAUDE.BORDER} strokeWidth={1.5}
                strokeOpacity={0.6 * clamp(itemIn, 0, 1)}
                strokeDasharray="6 6"
              />
            </svg>

            {/* Arrow label */}
            <div style={{
              position: 'absolute',
              left: traceXStart + chipW + 16, top: ty - 2,
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.INK_SOFT,
              opacity: clamp(itemIn, 0, 1),
              whiteSpace: 'nowrap' as const,
            }}>{t.arrow}</div>
          </div>
        );
      })}

      {/* Direct quote */}
      <div style={{
        position: 'absolute',
        left: PAD, right: PAD * 0.6,
        bottom: height * 0.16,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderLeft: `5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12,
        padding: '16px 24px',
        fontFamily: SERIF, fontSize: height * 0.018, fontStyle: 'italic',
        color: CLAUDE.INK, lineHeight: 1.5,
        opacity: clamp(quoteIn, 0, 1),
        transform: `translateY(${(1 - clamp(quoteIn, 0, 1)) * 16}px)`,
      }}>
        "I'm not done figuring it all out. Miles to go. But I feel like I'm getting there."
        <div style={{
          marginTop: 8,
          fontFamily: SANS, fontSize: height * 0.011, fontStyle: 'normal',
          color: CLAUDE.INK_SOFT,
        }}>— Aditi Deodhar · NortheasternISE · Feb 27, 2026</div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.07,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `scale(${idlePulse})`,
      }}>
        <div style={{ transform: `rotate(${frame * 0.15}deg)` }}>
        </div>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
