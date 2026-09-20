import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE08Voices — two-lane voice comparison.
 * LEFT: Kokoro — free, local, am_onyx — green "NO GATE" badge
 * CENTER: vertical dotted separator
 * RIGHT: ElevenLabs — Bear clone — terracotta "GATE P" checkpoint badge
 * Beat B01 of hai-brutalist-voices.
 */

export const haiBrutalistE08VoicesSchema = z.object({
  sparkLine: z.string().default('Free by default. Cloned by choice. Gated always.'),
});
export type HaiBrutalistE08VoicesProps = z.infer<typeof haiBrutalistE08VoicesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const HaiBrutalistE08Voices: React.FC<HaiBrutalistE08VoicesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const LANE_W = (width - PAD_X * 2 - 80) / 2;
  const LANE_H = height * 0.50;
  const LANE_Y = height * 0.28;
  const LEFT_X = PAD_X;
  const RIGHT_X = PAD_X + LANE_W + 80;
  const SEP_X = PAD_X + LANE_W + 40;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const leftIn = spring({ frame: frame - 14, fps, config: { damping: 25, stiffness: 80 } });
  const sepIn = spring({ frame: frame - 30, fps, config: { damping: 25, stiffness: 100 } });
  const rightIn = spring({ frame: frame - 45, fps, config: { damping: 25, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 100 } });

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
        Voices: Free vs Cloned
      </div>

      {/* LEFT lane — Kokoro */}
      <div style={{
        position: 'absolute',
        left: LEFT_X, top: LANE_Y,
        width: LANE_W, height: LANE_H,
        background: '#F0FAF4',
        border: `2px solid #4A9E6A`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 18,
        opacity: clamp(leftIn, 0, 1),
        transform: `translateX(${(1 - clamp(leftIn, 0, 1)) * -22}px)`,
      }}>
        {/* Mic icon */}
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none">
          <rect x={9} y={3} width={6} height={11} rx={3} stroke="#4A9E6A" strokeWidth={2} />
          <path d="M5 11a7 7 0 0 0 14 0" stroke="#4A9E6A" strokeWidth={2} strokeLinecap="round" />
          <line x1={12} y1={18} x2={12} y2={21} stroke="#4A9E6A" strokeWidth={2} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700, color: '#2A6A44', textAlign: 'center' }}>
          Kokoro
        </div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.016, color: '#4A9E6A', textAlign: 'center', lineHeight: 1.6 }}>
          free · local · am_onyx
        </div>
        <div style={{
          background: '#4A9E6A',
          borderRadius: 20,
          padding: '6px 18px',
          fontFamily: SANS, fontSize: 13, fontWeight: 700,
          color: '#FFFFFF', letterSpacing: 1,
        }}>
          ✓ NO GATE
        </div>
      </div>

      {/* Center separator */}
      <div style={{
        position: 'absolute',
        left: SEP_X, top: LANE_Y,
        width: 2, height: LANE_H,
        opacity: clamp(sepIn, 0, 1),
        background: `repeating-linear-gradient(to bottom, ${CLAUDE.BORDER} 0, ${CLAUDE.BORDER} 8px, transparent 8px, transparent 16px)`,
      }} />

      {/* RIGHT lane — ElevenLabs */}
      <div style={{
        position: 'absolute',
        left: RIGHT_X, top: LANE_Y,
        width: LANE_W, height: LANE_H,
        background: '#FFF8F5',
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 18,
        opacity: clamp(rightIn, 0, 1),
        transform: `translateX(${(1 - clamp(rightIn, 0, 1)) * 22}px)`,
      }}>
        {/* Mic icon */}
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none">
          <rect x={9} y={3} width={6} height={11} rx={3} stroke={CLAUDE.SPARK} strokeWidth={2} />
          <path d="M5 11a7 7 0 0 0 14 0" stroke={CLAUDE.SPARK} strokeWidth={2} strokeLinecap="round" />
          <line x1={12} y1={18} x2={12} y2={21} stroke={CLAUDE.SPARK} strokeWidth={2} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700, color: CLAUDE.SEND, textAlign: 'center' }}>
          ElevenLabs
        </div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.016, color: CLAUDE.INK_SOFT, textAlign: 'center', lineHeight: 1.6 }}>
          {"Bear's clone"}
        </div>
        <div style={{
          background: CLAUDE.SPARK,
          borderRadius: 20,
          padding: '6px 18px',
          fontFamily: SANS, fontSize: 12, fontWeight: 700,
          color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center',
        }}>
          GATE P — human approves
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
