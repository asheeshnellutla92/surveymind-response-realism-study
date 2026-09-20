import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileKaustubhaFig5CitedUsed — cited vs used.
 * Two columns: what the industry celebrates (left) vs what makes a system work (right).
 * Terracotta on the USED column + landing line.
 * Beat B05 of claude-liam-profile-kaustubha-eluri.
 */

export const profileKaustubhaFig5CitedUsedSchema = z.object({
  sparkLine: z.string().default('The engineering that gets you used.'),
});
export type ProfileKaustubhaFig5CitedUsedProps = z.infer<typeof profileKaustubhaFig5CitedUsedSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const CITED_ITEMS = [
  'Benchmark +2% improvement',
  'Novel architecture',
  'The accepted paper',
  'Citation count',
];

const USED_ITEMS = [
  'Stable under real load',
  'Graceful API failure handling',
  'Explainability clinicians trust',
  'Latency that meets deadlines',
];

export const ProfileKaustubhaFig5CitedUsed: React.FC<ProfileKaustubhaFig5CitedUsedProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.10;
  const colW = (width - PAD * 2 - 60) / 2;
  const colY = height * 0.26;
  const colH = height * 0.50;
  const leftX = PAD;
  const rightX = PAD + colW + 60;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const leftHeaderIn = spring({ frame: frame - Math.round(12 * S),  fps, config: { damping: 28, stiffness: 90 } });
  const rightHeaderIn = spring({ frame: frame - Math.round(20 * S), fps, config: { damping: 28, stiffness: 90 } });
  const quoteIn = spring({ frame: frame - Math.round(155 * S),      fps, config: { damping: 28, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - Math.round(180 * S),      fps, config: { damping: 28, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(headerIn, 0, 1), transform: `translateY(${(1 - headerIn) * 10}px)`,
      }}>
        Cited vs Used
      </div>

      {/* CENTER DIVIDER */}
      <div style={{
        position: 'absolute',
        left: leftX + colW + 28,
        top: colY,
        width: 4,
        height: colH,
        background: CLAUDE.BORDER,
        borderRadius: 2,
        opacity: clamp(leftHeaderIn, 0, 1),
      }} />

      {/* LEFT COLUMN — CITED */}
      <div style={{
        position: 'absolute',
        left: leftX, top: colY,
        width: colW, height: colH,
        opacity: clamp(leftHeaderIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
          letterSpacing: 2.5, textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT, marginBottom: 20,
        }}>
          The Industry Celebrates
        </div>
        {CITED_ITEMS.map((item, i) => {
          const itemDelay = Math.round((40 + i * 15) * S);
          const itemIn = spring({ frame: frame - itemDelay, fps, config: { damping: 26, stiffness: 80 } });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginBottom: 18,
              opacity: clamp(itemIn, 0, 1),
              transform: `translateX(${(1 - clamp(itemIn, 0, 1)) * -16}px)`,
            }}>
              <div style={{
                flexShrink: 0, width: 22, height: 22,
                borderRadius: '50%', background: CLAUDE.PILL,
                border: `1.5px solid ${CLAUDE.BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
              }}>
                <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>★</span>
              </div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.017,
                color: CLAUDE.INK_SOFT, lineHeight: 1.4,
              }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT COLUMN — USED */}
      <div style={{
        position: 'absolute',
        left: rightX, top: colY,
        width: colW, height: colH,
        opacity: clamp(rightHeaderIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
          letterSpacing: 2.5, textTransform: 'uppercase' as const,
          color: CLAUDE.SPARK, marginBottom: 20,
        }}>
          What Makes It Work
        </div>
        {USED_ITEMS.map((item, i) => {
          const itemDelay = Math.round((55 + i * 15) * S);
          const itemIn = spring({ frame: frame - itemDelay, fps, config: { damping: 26, stiffness: 80 } });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginBottom: 18,
              opacity: clamp(itemIn, 0, 1),
              transform: `translateX(${(1 - clamp(itemIn, 0, 1)) * 16}px)`,
            }}>
              <div style={{
                flexShrink: 0, width: 22, height: 22,
                borderRadius: '50%', background: `${CLAUDE.SPARK}18`,
                border: `1.5px solid ${CLAUDE.SPARK}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
              }}>
                <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.SPARK, fontWeight: 700 }}>✓</span>
              </div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.017,
                color: CLAUDE.INK, lineHeight: 1.4,
              }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      {/* Landing quote */}
      <div style={{
        position: 'absolute',
        left: PAD, right: PAD,
        bottom: height * 0.14,
        textAlign: 'center',
        fontFamily: SERIF, fontSize: height * 0.028, fontStyle: 'italic',
        color: CLAUDE.INK,
        opacity: clamp(quoteIn, 0, 1),
        transform: `translateY(${(1 - clamp(quoteIn, 0, 1)) * 12}px)`,
      }}>
        "This is not the engineering that gets you cited.<br />
        <span style={{ color: CLAUDE.SPARK }}>This is the engineering that gets you used.</span>"
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
