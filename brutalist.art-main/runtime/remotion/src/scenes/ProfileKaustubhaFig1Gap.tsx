import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileKaustubhaFig1Gap — the spine visual.
 * Two platforms with a widening gap; terracotta bridge spans it.
 * Beat B01 of claude-liam-profile-kaustubha-eluri.
 */

export const profileKaustubhaFig1GapSchema = z.object({
  sparkLine: z.string().default("If you build it, you're responsible."),
});
export type ProfileKaustubhaFig1GapProps = z.infer<typeof profileKaustubhaFig1GapSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const DEV_ITEMS = ['✓ Curated data', '✓ Green metrics', '✓ Passes all tests', '✓ Demo works'];
const PROD_ITEMS = ['Noisy inputs', 'API failures', 'Scale: 1 → 100 users', 'Real deadlines'];
const GAP_LABELS = ['Most projects', 'fall here'];

export const ProfileKaustubhaFig1Gap: React.FC<ProfileKaustubhaFig1GapProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.10;
  const plateW = width * 0.26;
  const plateH = height * 0.50;
  const plateY = height * 0.26;

  const leftX = PAD;
  const rightX = width - PAD - plateW;
  const gapLeft = leftX + plateW;
  const gapW = rightX - gapLeft;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const leftIn = spring({ frame: frame - Math.round(10 * S),  fps, config: { damping: 26, stiffness: 80 } });
  const rightIn = spring({ frame: frame - Math.round(25 * S), fps, config: { damping: 26, stiffness: 80 } });
  const gapIn = spring({ frame: frame - Math.round(45 * S),   fps, config: { damping: 30, stiffness: 80 } });
  const bridgeIn = spring({ frame: frame - Math.round(90 * S), fps, config: { damping: 25, stiffness: 60 } });
  const bridgeLabelIn = spring({ frame: frame - Math.round(110 * S), fps, config: { damping: 30, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - Math.round(130 * S), fps, config: { damping: 28, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.050, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(headerIn, 0, 1), transform: `translateY(${(1 - headerIn) * 10}px)`,
      }}>
        The Gap
      </div>

      {/* LEFT PLATFORM — Development */}
      <div style={{
        position: 'absolute', left: leftX, top: plateY,
        width: plateW, height: plateH,
        background: CLAUDE.CARD, border: `2px solid ${CLAUDE.BORDER}`,
        borderRadius: '14px 0 0 14px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        opacity: clamp(leftIn, 0, 1),
        transform: `translateX(${(1 - leftIn) * -30}px)`,
        boxShadow: '0 4px 20px rgba(61,57,41,0.08)',
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
          letterSpacing: 2.5, textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT, marginBottom: 4,
        }}>
          Works In Development
        </div>
        {DEV_ITEMS.map((item, i) => (
          <div key={i} style={{
            fontFamily: SANS, fontSize: height * 0.022, fontWeight: 600,
            color: '#4A9E6A',
          }}>{item}</div>
        ))}
      </div>

      {/* RIGHT PLATFORM — Production */}
      <div style={{
        position: 'absolute', left: rightX, top: plateY,
        width: plateW, height: plateH,
        background: CLAUDE.CARD, border: `2px solid ${CLAUDE.BORDER}`,
        borderRadius: '0 14px 14px 0',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        opacity: clamp(rightIn, 0, 1),
        transform: `translateX(${(1 - rightIn) * 30}px)`,
        boxShadow: '0 4px 20px rgba(61,57,41,0.08)',
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
          letterSpacing: 2.5, textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT, marginBottom: 4,
        }}>
          Works When Someone<br />Depends On It
        </div>
        {PROD_ITEMS.map((item, i) => (
          <div key={i} style={{
            fontFamily: SANS, fontSize: height * 0.022,
            color: CLAUDE.INK_SOFT,
          }}>{item}</div>
        ))}
      </div>

      {/* THE GAP — shaded void */}
      <div style={{
        position: 'absolute', left: gapLeft, top: plateY,
        width: gapW * clamp(gapIn, 0, 1), height: plateH,
        background: 'linear-gradient(to bottom, rgba(217,119,87,0.03), rgba(217,119,87,0.12))',
        borderTop: `1px dashed ${CLAUDE.BORDER}`, borderBottom: `1px dashed ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        overflow: 'hidden',
        opacity: clamp(gapIn, 0, 1),
      }}>
        {GAP_LABELS.map((label, i) => (
          <div key={i} style={{
            fontFamily: SERIF, fontSize: height * 0.026, fontStyle: 'italic',
            color: `${CLAUDE.SPARK}55`,
          }}>{label}</div>
        ))}
      </div>

      {/* BRIDGE */}
      <div style={{
        position: 'absolute',
        left: gapLeft,
        top: plateY + plateH / 2 - 5,
        width: gapW * clamp(bridgeIn, 0, 1),
        height: 10,
        background: CLAUDE.SPARK,
        borderRadius: 5,
        boxShadow: `0 4px 20px ${CLAUDE.SPARK}50`,
        opacity: clamp(bridgeIn, 0, 1),
      }} />

      {/* Bridge label */}
      <div style={{
        position: 'absolute',
        left: gapLeft + gapW / 2 - 55,
        top: plateY + plateH / 2 - height * 0.055,
        fontFamily: SANS, fontSize: height * 0.016, fontWeight: 700,
        letterSpacing: 2.5, textTransform: 'uppercase' as const,
        color: CLAUDE.SPARK,
        opacity: clamp(bridgeLabelIn, 0, 1),
      }}>
        Kaustubha stayed.
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
        <span style={{ fontFamily: SERIF, fontSize: height * 0.026, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
