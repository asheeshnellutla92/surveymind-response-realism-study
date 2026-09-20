import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig09ScaffoldVsCrutch — "Scaffold vs Crutch"
 * Source: Agent Skills for K-12 Teachers (Anthropic) — k12-fluency-scaffolding
 *
 * Both feel like help. They leave opposite things behind.
 * Phase 1: Both columns show student + support present.
 * Phase 2 (PHASE_SWITCH=75): Support fades. Left student stands (scaffold worked).
 *          Right student tilts/collapses (crutch — comprehension failed without it).
 */

export const k12Fig09ScaffoldVsCrutchSchema = z.object({
  sparkLine: z.string().default("Remove it. Does the learning hold? That's the whole test."),
});
export type K12Fig09ScaffoldVsCrutchProps = z.infer<typeof k12Fig09ScaffoldVsCrutchSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PHASE_SWITCH = 75;


// Stick figure: upright
const StickFigureUpright: React.FC<{ color: string; scale?: number }> = ({ color, scale = 1 }) => (
  <svg width={60 * scale} height={110 * scale} viewBox="0 0 60 110">
    {/* Head */}
    <circle cx={30} cy={14} r={12} fill="none" stroke={color} strokeWidth={3} />
    {/* Body */}
    <line x1={30} y1={26} x2={30} y2={68} stroke={color} strokeWidth={3} strokeLinecap="round" />
    {/* Arms */}
    <line x1={30} y1={38} x2={8} y2={55} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={30} y1={38} x2={52} y2={55} stroke={color} strokeWidth={3} strokeLinecap="round" />
    {/* Legs */}
    <line x1={30} y1={68} x2={14} y2={100} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={30} y1={68} x2={46} y2={100} stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

// Stick figure: tilted/collapsing (rotated ~30deg, slumping)
const StickFigureCollapsing: React.FC<{ color: string; scale?: number; tilt: number }> = ({ color, scale = 1, tilt }) => (
  <svg width={80 * scale} height={120 * scale} viewBox="0 0 80 120"
    style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '40px 100px' }}>
    {/* Head */}
    <circle cx={30} cy={14} r={12} fill="none" stroke={color} strokeWidth={3} />
    {/* Body */}
    <line x1={30} y1={26} x2={30} y2={68} stroke={color} strokeWidth={3} strokeLinecap="round" />
    {/* Arms flailing */}
    <line x1={30} y1={38} x2={6} y2={32} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={30} y1={38} x2={54} y2={42} stroke={color} strokeWidth={3} strokeLinecap="round" />
    {/* Legs buckling */}
    <line x1={30} y1={68} x2={10} y2={96} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={30} y1={68} x2={48} y2={100} stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

// Support bracket / bar drawn below the figure
const SupportBracket: React.FC<{ color: string; opacity: number; width?: number }> = ({ color, opacity, width = 100 }) => (
  <svg width={width} height={28} viewBox={`0 0 ${width} 28`} style={{ opacity }}>
    <line x1={0} y1={4} x2={0} y2={24} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={0} y1={14} x2={width} y2={14} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={width} y1={4} x2={width} y2={24} stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

export const K12Fig09ScaffoldVsCrutch: React.FC<K12Fig09ScaffoldVsCrutchProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 18, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showP2 = frame >= PHASE_SWITCH;

  const phase2Prog = clamp(phase2In, 0, 1);

  // Support bracket fades out after PHASE_SWITCH
  const supportOpacity = showP2 ? clamp(1 - phase2Prog * 1.4, 0, 1) : 1;

  // Right student tilt: 0 → 32deg as phase2 progresses
  const collapseTilt = showP2 ? interpolate(phase2Prog, [0, 1], [0, 32]) : 0;

  // Check mark / label fade in after support gone
  const labelFadeIn = showP2 ? clamp((phase2Prog - 0.5) * 2, 0, 1) : 0;

  const MID = width / 2;
  const colW = MID - PAD_X - 30;
  const figY = height * 0.36;
  const bracketY = figY + 115;
  const cardY = height * 0.24;
  const cardH = height * 0.56;

  const colLeftX = PAD_X;
  const colRightX = MID + 30;

  const leftIn = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 80 } });
  const rightIn = spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ background: '#FAF9F5', overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: '#6B6B68', opacity: clamp(titleIn, 0, 1),
      }}>
        SCAFFOLDING · K-12 TEACHING SKILLS
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.052,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: '#1A1A18', opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Scaffold vs Crutch — both feel like help.
      </div>

      {/* Vertical divider */}
      <div style={{
        position: 'absolute', left: MID - 1, top: cardY,
        width: 2, height: cardH, background: '#E5E3DD',
        opacity: clamp(titleIn, 0, 1),
      }} />

      {/* LEFT column — SCAFFOLD */}
      <div style={{
        position: 'absolute', left: colLeftX, top: cardY,
        width: colW, height: cardH,
        opacity: clamp(leftIn, 0, 1),
        transform: `translateY(${(1 - clamp(leftIn, 0, 1)) * 16}px)`,
      }}>
        {/* Column header */}
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase' as const,
          color: '#6B6B68', marginBottom: height * 0.02,
        }}>
          SCAFFOLD
        </div>

        {/* Figure + support area */}
        <div style={{
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
          position: 'relative', paddingTop: 10,
        }}>
          <StickFigureUpright color="#1A1A18" scale={1.1} />
          <div style={{ marginTop: 6 }}>
            <SupportBracket color="#6B6B68" opacity={supportOpacity} width={90} />
          </div>

          {/* Check mark after support gone */}
          {showP2 && (
            <div style={{
              marginTop: 14,
              opacity: labelFadeIn,
              transform: `translateY(${(1 - labelFadeIn) * 8}px)`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width={22} height={22} viewBox="0 0 22 22">
                <circle cx={11} cy={11} r={10} fill="#D97757" opacity={0.15} />
                <polyline points="5,12 9,16 17,7" fill="none" stroke="#D97757" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{
                fontFamily: SANS, fontSize: height * 0.013, fontWeight: 600,
                color: '#D97757',
              }}>
                Student stands.
              </span>
            </div>
          )}
        </div>

        {/* Bottom label */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          borderTop: `1px solid #E5E3DD`, paddingTop: 12,
        }}>
          <div style={{ fontFamily: SERIF, fontSize: height * 0.016, color: '#1A1A18', lineHeight: 1.5 }}>
            {showP2 ? (
              <span style={{ opacity: labelFadeIn }}>
                Fades. <span style={{ color: '#D97757', fontWeight: 600 }}>Learning holds.</span>
              </span>
            ) : (
              'Support present.'
            )}
          </div>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.012, color: '#6B6B68',
            marginTop: 6, lineHeight: 1.4,
          }}>
            The test: remove the scaffold.
          </div>
        </div>
      </div>

      {/* RIGHT column — CRUTCH */}
      <div style={{
        position: 'absolute', left: colRightX, top: cardY,
        width: colW, height: cardH,
        opacity: clamp(rightIn, 0, 1),
        transform: `translateY(${(1 - clamp(rightIn, 0, 1)) * 16}px)`,
      }}>
        {/* Column header */}
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase' as const,
          color: '#D97757', marginBottom: height * 0.02,
        }}>
          CRUTCH
        </div>

        {/* Figure + support area */}
        <div style={{
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
          position: 'relative', paddingTop: 10,
        }}>
          <StickFigureCollapsing color="#D97757" scale={1.1} tilt={collapseTilt} />
          <div style={{ marginTop: 6 }}>
            <SupportBracket color="#6B6B68" opacity={supportOpacity} width={90} />
          </div>

          {/* X mark after collapse */}
          {showP2 && (
            <div style={{
              marginTop: 14,
              opacity: labelFadeIn,
              transform: `translateY(${(1 - labelFadeIn) * 8}px)`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width={22} height={22} viewBox="0 0 22 22">
                <circle cx={11} cy={11} r={10} fill="#D97757" opacity={0.15} />
                <line x1={7} y1={7} x2={15} y2={15} stroke="#D97757" strokeWidth={2.5} strokeLinecap="round" />
                <line x1={15} y1={7} x2={7} y2={15} stroke="#D97757" strokeWidth={2.5} strokeLinecap="round" />
              </svg>
              <span style={{
                fontFamily: SANS, fontSize: height * 0.013, fontWeight: 600,
                color: '#D97757',
              }}>
                Student falls.
              </span>
            </div>
          )}
        </div>

        {/* Bottom label */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          borderTop: `1px solid #E5E3DD`, paddingTop: 12,
        }}>
          <div style={{ fontFamily: SERIF, fontSize: height * 0.016, color: '#1A1A18', lineHeight: 1.5 }}>
            {showP2 ? (
              <span style={{ opacity: labelFadeIn }}>
                Remove it. <span style={{ color: '#D97757', fontWeight: 600 }}>Comprehension collapses.</span>
              </span>
            ) : (
              'Support present.'
            )}
          </div>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.012, color: '#6B6B68',
            marginTop: 6, lineHeight: 1.4,
          }}>
            The test: remove the scaffold.
          </div>
        </div>
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Agent Skills for K-12 Teachers (Anthropic)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: '#1A1A18' }}>
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
