import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig04WorkingMemory — "The Fluency Ceiling"
 * Source: Agent Skills for K-12 Teachers (Anthropic) — k12-lesson-differentiation
 *
 * Manim move: slosh (a conserved working-memory bar redistributes between decoding and comprehension)
 *
 * A capacity bar shown in two scenarios:
 *   Phase 1 (Low fluency): decoding consumes most of the bar → comprehension starved (terracotta)
 *   Phase 2 (High fluency): decoding is tiny → comprehension bar fills, ample room for meaning-making
 *
 * The total bar never changes (working memory is conserved). Only the split sloshe.
 * Terracotta: the comprehension zone in Phase 1 (too small — the crisis).
 */

export const k12Fig04WorkingMemorySchema = z.object({
  sparkLine: z.string().default('Wrong scaffold. Right problem. Wrong level.'),
});
export type K12Fig04WorkingMemoryProps = z.infer<typeof k12Fig04WorkingMemorySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PHASE_SWITCH = 75;

export const K12Fig04WorkingMemory: React.FC<K12Fig04WorkingMemoryProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 24, stiffness: 85, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showP2 = frame >= PHASE_SWITCH;

  const phase2Prog = clamp(phase2In, 0, 1);

  // Low fluency: decoding = 0.78, comprehension = 0.22
  // High fluency: decoding = 0.12, comprehension = 0.88
  // slosh: interpolate decodingShare from 0.78 → 0.12 in phase 2
  const decodingShare = showP2
    ? interpolate(phase2Prog, [0, 1], [0.78, 0.12])
    : 0.78;
  const comprehensionShare = 1 - decodingShare;

  const BAR_LEFT = PAD_X + 60;
  const BAR_RIGHT = width - PAD_X - 60;
  const BAR_W = BAR_RIGHT - BAR_LEFT;
  const BAR_H = height * 0.12;
  const BAR_Y = height * 0.46;

  const decodingW = decodingShare * BAR_W;
  const comprehensionW = comprehensionShare * BAR_W;

  const barAnim = spring({ frame: frame - 10, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
  const barProg = clamp(barAnim, 0, 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        WORKING MEMORY LOAD · GRADES 3–5 READING
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showP2 ? 'Automatic decoding frees the mind.' : 'Decoding takes the whole budget.'}
      </div>

      {/* State label */}
      <div style={{
        position: 'absolute', left: BAR_LEFT, top: BAR_Y - 36,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        color: showP2 ? CLAUDE.INK_SOFT : CLAUDE.SPARK,
        opacity: clamp(titleIn, 0, 1),
      }}>
        {showP2 ? 'HIGH FLUENCY (automatic decoding)' : 'LOW FLUENCY (effortful decoding)'}
      </div>

      {/* Working memory bar */}
      <div style={{
        position: 'absolute', left: BAR_LEFT, top: BAR_Y,
        width: BAR_W * barProg, height: BAR_H,
        borderRadius: 8, overflow: 'hidden',
        display: 'flex', flexDirection: 'row' as const,
      }}>
        {/* Decoding segment */}
        <div style={{
          width: decodingW * barProg,
          height: BAR_H,
          background: showP2 ? CLAUDE.BORDER : CLAUDE.INK,
          transition: 'none',
          flexShrink: 0,
        }} />
        {/* Comprehension segment */}
        <div style={{
          flex: 1,
          height: BAR_H,
          background: showP2 ? CLAUDE.INK : CLAUDE.SPARK,
          transition: 'none',
          opacity: showP2 ? 0.9 : 0.7,
        }} />
      </div>

      {/* Bar border */}
      <div style={{
        position: 'absolute', left: BAR_LEFT, top: BAR_Y,
        width: BAR_W * barProg, height: BAR_H,
        borderRadius: 8, border: `2px solid ${CLAUDE.BORDER}`,
        pointerEvents: 'none',
      }} />

      {/* Labels below bar */}
      {barProg > 0.3 && (
        <>
          <div style={{
            position: 'absolute',
            left: BAR_LEFT, top: BAR_Y + BAR_H + 10,
            width: decodingW,
            fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
            color: showP2 ? CLAUDE.GHOST : CLAUDE.INK,
            textAlign: 'center' as const,
          }}>
            DECODING<br />
            <span style={{ fontWeight: 400 }}>
              {showP2 ? '12%' : '78%'} of capacity
            </span>
          </div>
          <div style={{
            position: 'absolute',
            left: BAR_LEFT + decodingW, top: BAR_Y + BAR_H + 10,
            width: comprehensionW,
            fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
            color: showP2 ? CLAUDE.INK : CLAUDE.SPARK,
            textAlign: 'center' as const,
          }}>
            COMPREHENSION<br />
            <span style={{ fontWeight: 400 }}>
              {showP2 ? '88%' : '22%'} of capacity
            </span>
          </div>
        </>
      )}

      {/* Annotation cards */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: height * 0.72,
        right: PAD_X,
        display: 'flex', gap: 20,
        opacity: clamp(titleIn, 0, 1),
      }}>
        <div style={{
          flex: 1, background: CLAUDE.CARD, borderRadius: 10,
          border: `1px solid ${CLAUDE.BORDER}`, padding: '10px 14px',
        }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST, lineHeight: 1.5 }}>
            <strong style={{ color: CLAUDE.INK }}>Immediate bridge:</strong> read-aloud or partner reading<br />
            frees cognitive load while fluency intervention happens separately.
          </div>
        </div>
        <div style={{
          flex: 1, background: CLAUDE.CARD, borderRadius: 10,
          border: `1px solid ${CLAUDE.BORDER}`, padding: '10px 14px',
        }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST, lineHeight: 1.5 }}>
            <strong style={{ color: CLAUDE.INK }}>Fix:</strong> separate fluency intervention (outside this lesson).<br />
            Comprehension scaffolds alone cannot compensate for a fluency ceiling.
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
