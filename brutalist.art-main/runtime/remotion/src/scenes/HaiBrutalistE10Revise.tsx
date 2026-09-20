import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE10Revise — revision loop + QC frame grid.
 * Top half: revision cycle — Watch → Note → Ask Claude → Updated Video → back
 * Bottom half: QC frame grid — 6 thumbnails, one marked with "FIXED" badge
 * Beat B01 of hai-brutalist-watch-revise.
 */

export const haiBrutalistE10ReviseSchema = z.object({
  sparkLine: z.string().default('Plain language in, better video out.'),
});
export type HaiBrutalistE10ReviseProps = z.infer<typeof haiBrutalistE10ReviseSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const CYCLE_STEPS = ['Watch', 'Note', 'Ask Claude', 'Updated Video'];
const FIXED_FRAME_IDX = 3;

export const HaiBrutalistE10Revise: React.FC<HaiBrutalistE10ReviseProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.08;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const cycleIn = spring({ frame: frame - 14, fps, config: { damping: 25, stiffness: 80 } });
  const gridIn = spring({ frame: frame - 65, fps, config: { damping: 25, stiffness: 80 } });
  const badgeIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100 } });

  // Cycle layout: 4 nodes + arrows in a row
  const CYCLE_Y = height * 0.30;
  const CYCLE_TOP = height * 0.24;
  const NODE_W = 130;
  const NODE_H = 50;
  const TOTAL_CYCLE_W = width - PAD_X * 2;
  const STEP_W = TOTAL_CYCLE_W / (CYCLE_STEPS.length - 0.5);

  // QC grid layout
  const GRID_Y = height * 0.56;
  const THUMB_W = (width - PAD_X * 2 - 50) / 6;
  const THUMB_H = height * 0.14;

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
        Watch {'&'} Revise
      </div>

      {/* Revision cycle */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: CYCLE_TOP,
        right: PAD_X,
        opacity: clamp(cycleIn, 0, 1),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {CYCLE_STEPS.map((step, i) => {
            const isActive = i === 2; // "Ask Claude" is terracotta
            return (
              <React.Fragment key={i}>
                <div style={{
                  width: NODE_W,
                  height: NODE_H,
                  background: isActive ? CLAUDE.SPARK : CLAUDE.CARD,
                  border: `2px solid ${isActive ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? `0 4px 16px ${CLAUDE.SPARK}40` : '0 2px 8px rgba(61,57,41,0.06)',
                }}>
                  <span style={{
                    fontFamily: SANS, fontSize: 14, fontWeight: 700,
                    color: isActive ? '#FFFFFF' : CLAUDE.INK,
                  }}>
                    {step}
                  </span>
                </div>
                {i < CYCLE_STEPS.length - 1 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width={32} height={20} viewBox="0 0 32 20">
                      <path d="M2 10 L26 10 M20 4 L28 10 L20 16"
                        stroke={CLAUDE.SPARK} strokeWidth={2.2} fill="none"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* Return arrow (loop back) */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          marginTop: 8, paddingRight: 8,
        }}>
          <svg width={width - PAD_X * 2 - NODE_W} height={24} viewBox={`0 0 ${width - PAD_X * 2 - NODE_W} 24`}>
            <path
              d={`M${width - PAD_X * 2 - NODE_W - 4} 8 L12 8 M8 4 L0 12 L8 20`}
              stroke={CLAUDE.BORDER} strokeWidth={2} fill="none"
              strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" />
          </svg>
        </div>
      </div>

      {/* QC grid label */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: GRID_Y - 26,
        fontFamily: SANS, fontSize: 12, fontWeight: 700,
        color: CLAUDE.INK_SOFT, letterSpacing: 2, textTransform: 'uppercase' as const,
        opacity: clamp(gridIn, 0, 1),
      }}>
        QC FRAME AUDIT
      </div>

      {/* QC frame thumbnails */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: GRID_Y,
        right: PAD_X,
        display: 'flex', gap: 10,
        opacity: clamp(gridIn, 0, 1),
      }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: THUMB_H,
            background: i === FIXED_FRAME_IDX ? `${CLAUDE.SPARK}10` : '#EBEBEB',
            border: `1.5px solid ${i === FIXED_FRAME_IDX ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Frame number */}
            <span style={{ fontFamily: SANS, fontSize: 11, color: i === FIXED_FRAME_IDX ? CLAUDE.SPARK : CLAUDE.GHOST }}>
              F{i + 1}
            </span>
            {/* Fixed badge */}
            {i === FIXED_FRAME_IDX && (
              <div style={{
                position: 'absolute', bottom: 6, left: '50%',
                transform: `translateX(-50%) translateY(${(1 - clamp(badgeIn, 0, 1)) * 12}px)`,
                background: CLAUDE.SPARK,
                borderRadius: 6,
                padding: '3px 8px',
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                color: '#FFFFFF',
                opacity: clamp(badgeIn, 0, 1),
                whiteSpace: 'nowrap',
              }}>
                ✓ FIXED
              </div>
            )}
          </div>
        ))}
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
