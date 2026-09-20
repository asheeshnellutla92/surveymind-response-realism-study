import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HorrorParadox — B01 for "The Math of Being Afraid Together"
 * Source: Zebonastic essay by Seth Brown & Humanitarians AI, May 17 2026.
 *
 * Two-panel layout:
 * Left: lone figure in dark-tinted box, fear meter pegged high.
 * Right: second figure appears (spring), fear meter drops.
 * Then two sales stamp cards animate in:
 *   "23,000,000 copies — Phasmophobia"
 *   "$113.9M by Jan 2024 — Lethal Company, 1 developer"
 * Terracotta accent: the stamp cards / contradiction line.
 *
 * One terracotta moment per beat (CLAUDE-BRAND.md).
 */

export const horrorParadoxSchema = z.object({
  sparkLine: z.string().default('The gap is the thing to explain.'),
});
export type HorrorParadoxProps = z.infer<typeof horrorParadoxSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Simple stick figure SVG
const StickFigure: React.FC<{ color: string; size: number; opacity?: number }> = ({ color, size, opacity = 1 }) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 40 64" style={{ opacity }}>
    {/* head */}
    <circle cx={20} cy={8} r={7} fill="none" stroke={color} strokeWidth={2.5} />
    {/* body */}
    <line x1={20} y1={15} x2={20} y2={38} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    {/* arms */}
    <line x1={5} y1={24} x2={35} y2={24} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    {/* legs */}
    <line x1={20} y1={38} x2={8} y2={56} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <line x1={20} y1={38} x2={32} y2={56} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);

// Phase timing
const PHASE_PANEL_IN = 0;
const PHASE_FRIEND_IN = 50;
const PHASE_STAMPS_IN = 100;
const PHASE_SPARK_IN = 200;

export const HorrorParadox: React.FC<HorrorParadoxProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const panelIn = spring({ frame: frame - PHASE_PANEL_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const friendIn = spring({ frame: frame - PHASE_FRIEND_IN, fps, config: { damping: 22, stiffness: 120, mass: 0.8 } });
  const stampIn1 = spring({ frame: frame - PHASE_STAMPS_IN, fps, config: { damping: 20, stiffness: 140, mass: 0.7 } });
  const stampIn2 = spring({ frame: frame - PHASE_STAMPS_IN - 18, fps, config: { damping: 20, stiffness: 140, mass: 0.7 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  // Fear meter: left panel always high, right panel drops as friend appears
  const leftFearLevel = 0.85;
  const rightFearLevel = interpolate(clamp(friendIn, 0, 1), [0, 1], [0.85, 0.28]);

  const panelW = width * 0.34;
  const panelH = height * 0.48;
  const panelTop = height * 0.26;
  const leftPanelX = PAD_X + width * 0.04;
  const rightPanelX = width * 0.52;

  const meterW = 18;
  const meterH = panelH * 0.6;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        THE PARADOX · CO-OP HORROR
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Horror needs isolation. The sales don't.
      </div>

      {/* LEFT PANEL — Alone */}
      <div style={{
        position: 'absolute',
        left: leftPanelX,
        top: panelTop,
        width: panelW,
        height: panelH,
        background: '#1A1A1A',
        borderRadius: 12,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        opacity: clamp(panelIn, 0, 1),
        transform: `translateY(${(1 - clamp(panelIn, 0, 1)) * 20}px)`,
      }}>
        {/* Label */}
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
          color: 'rgba(255,255,255,0.5)', letterSpacing: 2,
          textTransform: 'uppercase' as const,
        }}>
          ALONE
        </div>
        <StickFigure color="rgba(255,255,255,0.85)" size={48} />
        {/* Fear meter */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.012, color: 'rgba(255,255,255,0.5)' }}>FEAR</div>
          <div style={{
            width: meterW, height: meterH * 0.6,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
            <div style={{
              width: '100%',
              height: `${leftFearLevel * 100}%`,
              background: `linear-gradient(to top, #C6613F, #D97757)`,
              borderRadius: 4,
              transition: 'height 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Arrow between panels */}
      <div style={{
        position: 'absolute',
        left: leftPanelX + panelW + 8,
        top: panelTop + panelH * 0.45,
        opacity: clamp(friendIn, 0, 1) * 0.7,
        fontFamily: SANS,
        fontSize: height * 0.028,
        color: CLAUDE.INK_SOFT,
      }}>
        →
      </div>

      {/* RIGHT PANEL — With friend */}
      <div style={{
        position: 'absolute',
        left: rightPanelX,
        top: panelTop,
        width: panelW,
        height: panelH,
        background: '#1A1A1A',
        borderRadius: 12,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        opacity: clamp(panelIn, 0, 1),
        transform: `translateY(${(1 - clamp(panelIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
          color: 'rgba(255,255,255,0.5)', letterSpacing: 2,
          textTransform: 'uppercase' as const,
        }}>
          WITH FRIENDS
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <StickFigure color="rgba(255,255,255,0.85)" size={48} />
          <div style={{ opacity: clamp(friendIn, 0, 1), transform: `scale(${0.6 + clamp(friendIn, 0, 1) * 0.4})` }}>
            <StickFigure color="rgba(255,255,255,0.85)" size={48} />
          </div>
        </div>
        {/* Fear meter — lower */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.012, color: 'rgba(255,255,255,0.5)' }}>FEAR</div>
          <div style={{
            width: meterW, height: meterH * 0.6,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
            <div style={{
              width: '100%',
              height: `${rightFearLevel * 100}%`,
              background: `linear-gradient(to top, #4A8F6A, #5BA87A)`,
              borderRadius: 4,
            }} />
          </div>
        </div>
      </div>

      {/* STAMP CARDS — terracotta accent */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: panelTop + panelH + height * 0.04,
        right: PAD_X,
        display: 'flex',
        gap: 20,
      }}>
        {/* Stamp 1 */}
        <div style={{
          flex: 1,
          background: CLAUDE.SPARK,
          borderRadius: 10,
          padding: '16px 24px',
          opacity: clamp(stampIn1, 0, 1),
          transform: `translateY(${(1 - clamp(stampIn1, 0, 1)) * 16}px)`,
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
            color: '#FFFFFF', letterSpacing: '-0.01em',
          }}>
            23,000,000 copies
          </div>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.013, color: 'rgba(255,255,255,0.85)',
            marginTop: 4, fontWeight: 600,
          }}>
            Phasmophobia
          </div>
        </div>
        {/* Stamp 2 */}
        <div style={{
          flex: 1,
          background: CLAUDE.SPARK,
          borderRadius: 10,
          padding: '16px 24px',
          opacity: clamp(stampIn2, 0, 1),
          transform: `translateY(${(1 - clamp(stampIn2, 0, 1)) * 16}px)`,
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
            color: '#FFFFFF', letterSpacing: '-0.01em',
          }}>
            $113.9M by Jan 2024
          </div>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.013, color: 'rgba(255,255,255,0.85)',
            marginTop: 4, fontWeight: 600,
          }}>
            Lethal Company · 1 developer
          </div>
        </div>
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

    </AbsoluteFill>
  );
};
