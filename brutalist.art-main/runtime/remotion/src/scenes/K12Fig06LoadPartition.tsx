import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig06LoadPartition — "Extraneous vs Germane Cognitive Load"
 * Source: Agent Skills for K-12 Teachers (Anthropic)
 *
 * A horizontal "Working Memory Budget" bar:
 *   Phase 1: Left ~40% = EXTRANEOUS (grey), Right ~60% = GERMANE (terracotta). × on extraneous.
 *   Phase 2: Extraneous shrinks to 0; Germane expands to fill the whole bar.
 *   Label: "Eliminate extraneous → Protect germane."
 */

export const k12Fig06LoadPartitionSchema = z.object({
  sparkLine: z.string().default('The scaffold absorbs extraneous. The learner keeps the germane.'),
});
export type K12Fig06LoadPartitionProps = z.infer<typeof k12Fig06LoadPartitionSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PHASE_SWITCH = 75;
const EXT_SHARE_P1 = 0.40;

export const K12Fig06LoadPartition: React.FC<K12Fig06LoadPartitionProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const barIn = spring({ frame: frame - 15, fps, config: { damping: 24, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 18, stiffness: 80 } });
  const showP2 = frame >= PHASE_SWITCH;

  // Animate extraneous share collapsing in phase 2
  const extShare = showP2
    ? interpolate(clamp(phase2In, 0, 1), [0, 1], [EXT_SHARE_P1, 0])
    : EXT_SHARE_P1;
  const germShare = 1 - extShare;

  const BAR_LEFT = PAD_X + 40;
  const BAR_RIGHT = width - PAD_X - 40;
  const BAR_W = BAR_RIGHT - BAR_LEFT;
  const BAR_H = height * 0.13;
  const BAR_Y = height * 0.44;

  const barProg = clamp(barIn, 0, 1);
  const extW = extShare * BAR_W * barProg;
  const germW = germShare * BAR_W * barProg;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        COGNITIVE LOAD PARTITION · WORKING MEMORY BUDGET
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showP2
          ? 'Eliminate extraneous → Protect germane.'
          : 'Two kinds of load. Only one belongs.'}
      </div>

      {/* Budget label */}
      <div style={{
        position: 'absolute', left: BAR_LEFT, top: BAR_Y - height * 0.045,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 1, textTransform: 'uppercase' as const,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
      }}>
        Working Memory Budget
      </div>

      {/* Bar background track */}
      <div style={{
        position: 'absolute', left: BAR_LEFT, top: BAR_Y,
        width: BAR_W * barProg, height: BAR_H,
        borderRadius: 10,
        background: CLAUDE.BORDER,
        overflow: 'hidden',
      }}>
        {/* Extraneous segment (left) */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: extShare * BAR_W,
          height: BAR_H,
          background: '#E5E3DD',
          transition: 'none',
        }} />
        {/* Germane segment (right) */}
        <div style={{
          position: 'absolute',
          left: extShare * BAR_W,
          top: 0,
          width: germShare * BAR_W,
          height: BAR_H,
          background: CLAUDE.SPARK,
          opacity: 0.88,
          transition: 'none',
        }} />
      </div>

      {/* Bar outline */}
      <div style={{
        position: 'absolute', left: BAR_LEFT, top: BAR_Y,
        width: BAR_W * barProg, height: BAR_H,
        borderRadius: 10, border: `2px solid ${CLAUDE.BORDER}`,
        pointerEvents: 'none',
      }} />

      {/* Labels and × over segments */}
      {barProg > 0.2 && (
        <svg style={{ position: 'absolute', left: BAR_LEFT, top: BAR_Y }} width={BAR_W} height={BAR_H}>
          {/* × on extraneous section */}
          {extShare > 0.05 && (
            <g>
              <text
                x={extShare * BAR_W / 2}
                y={BAR_H * 0.55}
                textAnchor="middle"
                fontFamily={SANS}
                fontSize={BAR_H * 0.45}
                fontWeight="700"
                fill={CLAUDE.INK_SOFT}
                opacity={showP2 ? clamp(1 - phase2In, 0, 1) : 0.6}
              >
                ×
              </text>
            </g>
          )}
        </svg>
      )}

      {/* Segment labels below bar */}
      {barProg > 0.3 && (
        <>
          {extShare > 0.04 && (
            <div style={{
              position: 'absolute',
              left: BAR_LEFT,
              top: BAR_Y + BAR_H + height * 0.018,
              width: extShare * BAR_W,
              fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
              color: CLAUDE.INK_SOFT,
              textAlign: 'center' as const,
              opacity: showP2 ? clamp(1 - phase2In * 1.5, 0, 1) : 1,
            }}>
              EXTRANEOUS<br />
              <span style={{ fontWeight: 400, fontSize: height * 0.011 }}>
                {Math.round(extShare * 100)}% — remove this
              </span>
            </div>
          )}
          <div style={{
            position: 'absolute',
            left: BAR_LEFT + extShare * BAR_W,
            top: BAR_Y + BAR_H + height * 0.018,
            width: germShare * BAR_W,
            fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
            color: CLAUDE.SPARK,
            textAlign: 'center' as const,
          }}>
            GERMANE<br />
            <span style={{ fontWeight: 400, fontSize: height * 0.011 }}>
              {Math.round(germShare * 100)}% — protect this
            </span>
          </div>
        </>
      )}

      {/* Phase 2 annotation card */}
      {showP2 && (
        <div style={{
          position: 'absolute',
          left: PAD_X, top: height * 0.72,
          right: PAD_X,
          background: CLAUDE.CARD, borderRadius: 10,
          border: `1px solid ${CLAUDE.BORDER}`,
          padding: '12px 18px',
          opacity: clamp(phase2In, 0, 1),
          transform: `translateY(${(1 - phase2In) * 8}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            <strong style={{ color: CLAUDE.INK }}>Design principle:</strong> Scaffolds and clear worked examples
            absorb extraneous load (unnecessary complexity, confusing format, split attention).
            Every freed resource goes back to germane processing — the actual learning.
          </div>
        </div>
      )}

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
