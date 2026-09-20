import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileAditiFig1Pivot — the spine visual.
 * A timeline at hour 6 of a countdown that FORKS:
 *   left  → keep the working build (grey, dead-ends)
 *   right → discard and rebuild (terracotta → FinFluent)
 * Beat B01 of claude-liam-profile-aditi-deodhar.
 */

export const profileAditiFig1PivotSchema = z.object({
  sparkLine: z.string().default('Stop. Discard. Build what matters.'),
});
export type ProfileAditiFig1PivotProps = z.infer<typeof profileAditiFig1PivotSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


export const ProfileAditiFig1Pivot: React.FC<ProfileAditiFig1PivotProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.09;
  const cy = height * 0.50;
  const forkX = width * 0.42;
  const stemLeft = PAD;
  const stemRight = forkX;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const eyebrowIn = spring({ frame, fps, config: { damping: 30, stiffness: 100 } });
  const titleIn   = spring({ frame: frame - Math.round(8 * S),   fps, config: { damping: 28, stiffness: 90 } });
  const stemIn    = spring({ frame: frame - Math.round(18 * S),  fps, config: { damping: 26, stiffness: 70 } });
  const nodeIn    = spring({ frame: frame - Math.round(35 * S),  fps, config: { damping: 26, stiffness: 90 } });
  const labelIn   = spring({ frame: frame - Math.round(45 * S),  fps, config: { damping: 28, stiffness: 100 } });
  const forkIn    = spring({ frame: frame - Math.round(60 * S),  fps, config: { damping: 26, stiffness: 65 } });
  const greyIn    = spring({ frame: frame - Math.round(75 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const terIn     = spring({ frame: frame - Math.round(90 * S),  fps, config: { damping: 24, stiffness: 60 } });
  const endLabelIn = spring({ frame: frame - Math.round(120 * S), fps, config: { damping: 28, stiffness: 80 } });
  const questionIn = spring({ frame: frame - Math.round(50 * S), fps, config: { damping: 26, stiffness: 80 } });
  const sparkIn   = spring({ frame: frame - Math.round(160 * S), fps, config: { damping: 28, stiffness: 100 } });

  const stemLength = (forkX - stemLeft) * clamp(stemIn, 0, 1);
  const greyLength = (width * 0.18) * clamp(greyIn, 0, 1);
  const terLength  = (width * 0.28) * clamp(terIn, 0, 1);

  const GREY   = '#A9A491';
  const GREEN  = '#4A9E6A';
  const TER    = CLAUDE.SPARK;

  const forkY_grey = cy - height * 0.13;
  const forkY_ter  = cy + height * 0.13;

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
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        The Pivot
      </div>

      {/* STEM — the shared timeline heading into the fork */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}>
        {/* Stem line */}
        <line
          x1={stemLeft} y1={cy}
          x2={stemLeft + stemLength} y2={cy}
          stroke={GREEN} strokeWidth={6} strokeLinecap="round"
        />
        {/* Node at fork */}
        <circle
          cx={forkX} cy={cy} r={16}
          fill={CLAUDE.CARD} stroke={GREEN} strokeWidth={4}
          opacity={clamp(nodeIn, 0, 1)}
        />
        {/* GREY fork arm */}
        <line
          x1={forkX} y1={cy}
          x2={forkX + greyLength * Math.cos(-0.42)}
          y2={forkY_grey + greyLength * Math.sin(-0.42) * 0.1}
          stroke={GREY} strokeWidth={5} strokeLinecap="round"
          opacity={clamp(greyIn, 0, 1)}
          strokeDasharray="12 8"
        />
        {/* TERRACOTTA fork arm */}
        <line
          x1={forkX} y1={cy}
          x2={forkX + terLength * Math.cos(0.36)}
          y2={forkY_ter + terLength * Math.sin(0.36) * 0.1}
          stroke={TER} strokeWidth={7} strokeLinecap="round"
          opacity={clamp(terIn, 0, 1)}
        />
        {/* Glow on terracotta arm */}
        <line
          x1={forkX} y1={cy}
          x2={forkX + terLength * Math.cos(0.36)}
          y2={forkY_ter + terLength * Math.sin(0.36) * 0.1}
          stroke={TER} strokeWidth={18} strokeLinecap="round"
          opacity={0.12 * clamp(terIn, 0, 1)}
        />
      </svg>

      {/* Chip: 6-Hour Mark */}
      <div style={{
        position: 'absolute',
        left: PAD + 8, top: cy - height * 0.06,
        background: `${GREEN}18`, border: `1.5px solid ${GREEN}55`,
        borderRadius: 8, padding: '6px 14px',
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        color: GREEN, letterSpacing: 1.5,
        opacity: clamp(labelIn, 0, 1),
      }}>
        HOUR 6 — SYMPTOM TRACKER DEMO READY
      </div>

      {/* User question bubble */}
      <div style={{
        position: 'absolute',
        left: forkX - 100, top: cy - height * 0.18,
        maxWidth: 300,
        background: CLAUDE.CARD, border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 14,
        padding: '10px 18px',
        fontFamily: SERIF, fontSize: height * 0.017, fontStyle: 'italic',
        color: CLAUDE.INK,
        boxShadow: `0 4px 20px ${CLAUDE.SPARK}30`,
        opacity: clamp(questionIn, 0, 1),
        transform: `translateY(${(1 - clamp(questionIn, 0, 1)) * -12}px)`,
      }}>
        "How are women supposed to afford this?"
      </div>

      {/* GREY arm label */}
      <div style={{
        position: 'absolute',
        left: forkX + width * 0.10, top: forkY_grey - height * 0.10,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 600,
        color: GREY, letterSpacing: 1,
        opacity: clamp(endLabelIn, 0, 1),
      }}>
        Keep working build
        <br />
        <span style={{ fontSize: height * 0.011, fontWeight: 400 }}>misses the real problem</span>
      </div>

      {/* TER arm label */}
      <div style={{
        position: 'absolute',
        left: forkX + width * 0.14, top: forkY_ter + height * 0.02,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        color: TER, letterSpacing: 0.5,
        opacity: clamp(endLabelIn, 0, 1),
      }}>
        Discard. Rebuild.
        <br />
        <span style={{ fontSize: height * 0.013, color: CLAUDE.INK, fontWeight: 600 }}>→ FinFluent</span>
      </div>

      {/* Fork badge */}
      <div style={{
        position: 'absolute',
        left: forkX + 26, top: cy - height * 0.025,
        background: CLAUDE.SPARK, borderRadius: 6,
        padding: '4px 12px',
        fontFamily: SANS, fontSize: height * 0.011, fontWeight: 800,
        color: '#fff', letterSpacing: 2, textTransform: 'uppercase' as const,
        opacity: clamp(forkIn, 0, 1),
        transform: `scale(${clamp(forkIn, 0, 1)})`,
      }}>
        THE PIVOT
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
