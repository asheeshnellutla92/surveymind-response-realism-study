import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE02Reach — research reach comparison.
 * Left: PDF/paper card (grey, muted) "~3 readers avg"
 * Center: terracotta arrow with BRUTALIST badge
 * Right: video play-button card (terracotta border) "Your actual audience"
 * Beat B01 of hai-brutalist-why-video.
 */

export const haiBrutalistE02ReachSchema = z.object({
  sparkLine: z.string().default('The work is already done. This gives it a face.'),
});
export type HaiBrutalistE02ReachProps = z.infer<typeof haiBrutalistE02ReachSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const HaiBrutalistE02Reach: React.FC<HaiBrutalistE02ReachProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const CARD_W = width * 0.30;
  const CARD_H = height * 0.46;
  const CENTER_Y = height * 0.50;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const leftIn = spring({ frame: frame - 12, fps, config: { damping: 25, stiffness: 80 } });
  const arrowIn = spring({ frame: frame - 40, fps, config: { damping: 25, stiffness: 100 } });
  const rightIn = spring({ frame: frame - 55, fps, config: { damping: 25, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 100 } });

  const LEFT_X = PAD_X;
  const RIGHT_X = width - PAD_X - CARD_W;
  const ARROW_X = LEFT_X + CARD_W + 24;
  const ARROW_W = RIGHT_X - ARROW_X - 24;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        HUMANITARIANS AI · BRUTALIST SERIES
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Research Reach
      </div>

      {/* LEFT card — PDF/paper */}
      <div style={{
        position: 'absolute',
        left: LEFT_X,
        top: CENTER_Y - CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
        background: '#F5F4EF',
        border: `2px solid ${CLAUDE.BORDER}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 16,
        opacity: clamp(leftIn, 0, 1),
        transform: `translateX(${(1 - clamp(leftIn, 0, 1)) * -24}px)`,
      }}>
        {/* Document icon */}
        <svg width={56} height={70} viewBox="0 0 56 70" fill="none">
          <rect x={4} y={4} width={48} height={62} rx={6} fill="#E5E2D9" stroke={CLAUDE.BORDER} strokeWidth={2} />
          <line x1={14} y1={24} x2={42} y2={24} stroke={CLAUDE.GHOST} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={14} y1={32} x2={42} y2={32} stroke={CLAUDE.GHOST} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={14} y1={40} x2={36} y2={40} stroke={CLAUDE.GHOST} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={14} y1={48} x2={34} y2={48} stroke={CLAUDE.GHOST} strokeWidth={2.5} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: CLAUDE.INK_SOFT, textAlign: 'center', lineHeight: 1.4 }}>
          Your Research Week
        </div>
        <div style={{
          background: CLAUDE.BORDER,
          borderRadius: 8,
          padding: '6px 14px',
          fontFamily: SANS, fontSize: 13, fontWeight: 700,
          color: CLAUDE.INK_SOFT,
        }}>
          ~3 readers avg
        </div>
      </div>

      {/* Center arrow + badge */}
      <div style={{
        position: 'absolute',
        left: ARROW_X,
        top: CENTER_Y - 50,
        width: ARROW_W,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        opacity: clamp(arrowIn, 0, 1),
      }}>
        <div style={{
          background: CLAUDE.SPARK,
          borderRadius: 14,
          padding: '5px 14px',
          fontFamily: SANS, fontSize: 11, fontWeight: 700,
          color: '#FFFFFF', letterSpacing: 1.5, textTransform: 'uppercase' as const,
        }}>
          BRUTALIST
        </div>
        <svg width={ARROW_W * 0.6} height={36} viewBox={`0 0 ${ARROW_W * 0.6} 36`}>
          <path d={`M4 18 L${ARROW_W * 0.6 - 20} 18 M${ARROW_W * 0.6 - 28} 8 L${ARROW_W * 0.6 - 8} 18 L${ARROW_W * 0.6 - 28} 28`}
            stroke={CLAUDE.SPARK} strokeWidth={3} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* RIGHT card — video */}
      <div style={{
        position: 'absolute',
        left: RIGHT_X,
        top: CENTER_Y - CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
        background: CLAUDE.CARD,
        border: `2.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 16,
        boxShadow: `0 8px 32px ${CLAUDE.SPARK}28`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 16,
        opacity: clamp(rightIn, 0, 1),
        transform: `translateX(${(1 - clamp(rightIn, 0, 1)) * 24}px)`,
      }}>
        {/* Play button */}
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: CLAUDE.SPARK,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 18px ${CLAUDE.SPARK}50`,
        }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <polygon points="7,4 21,12 7,20" fill="#FFFFFF" />
          </svg>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: CLAUDE.INK, textAlign: 'center', lineHeight: 1.4 }}>
          Your Explainer
        </div>
        <div style={{
          background: `${CLAUDE.SPARK}18`,
          border: `1.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 8,
          padding: '6px 14px',
          fontFamily: SANS, fontSize: 13, fontWeight: 700,
          color: CLAUDE.SPARK,
        }}>
          Your actual audience
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.07,
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
