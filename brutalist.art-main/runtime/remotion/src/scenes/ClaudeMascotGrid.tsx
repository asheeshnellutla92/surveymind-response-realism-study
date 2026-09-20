import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';
import { AnimationName, computeAnimation, MascotSVG } from './ClaudeMascotScene';

/**
 * ClaudeMascotGrid — 3×3 showcase grid of 9 mascot animations, each captioned.
 * Two beats cover all 18 animations: Group 1 (states) and Group 2 (events).
 * All 9 animations play simultaneously, frame-driven, Remotion-native.
 */

const cellSchema = z.object({
  animationName: z.string(),
  caption: z.string(),
});

export const claudeMascotGridSchema = z.object({
  cells: z.array(cellSchema).min(9).max(9),
  bgColor: z.string().default(CLAUDE.PAGE),
});
export type ClaudeMascotGridProps = z.infer<typeof claudeMascotGridSchema>;

// Title-safe insets matching the rest of the claude scene family
const SAFE_X = 96;
const SAFE_Y = 54;
const GAP = 14;

// Mascot size inside each grid cell — 140px tall keeps the figure readable
// while leaving room for the animation name and caption below.
const MASCOT_H = 140;
const MASCOT_W = Math.round((136 / 86) * MASCOT_H); // ≈ 221px

export const ClaudeMascotGrid: React.FC<ClaudeMascotGridProps> = ({ cells, bgColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{
      backgroundColor: bgColor,
      padding: `${SAFE_Y}px ${SAFE_X}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: GAP,
        width: '100%',
        height: '100%',
      }}>
        {cells.map((cell, i) => {
          const anim = cell.animationName as AnimationName;
          const s = computeAnimation(anim, frame, fps);
          return (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: CLAUDE.PAGE,
              border: `2px solid ${CLAUDE.BORDER}`,
              borderRadius: 6,
              overflow: 'hidden',
              padding: '12px 8px 10px',
            }}>
              {/* Animation — fills remaining vertical space */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}>
                <div style={{ width: MASCOT_W, height: MASCOT_H, overflow: 'visible' }}>
                  <MascotSVG s={s} scale={1} />
                </div>
              </div>

              {/* Animation name — terracotta, small-caps */}
              <div style={{
                fontFamily: CLAUDE_FONT.ui,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: CLAUDE.SPARK,
                lineHeight: 1,
                marginTop: 8,
                marginBottom: 5,
                flexShrink: 0,
              }}>
                {cell.animationName}
              </div>

              {/* One-line caption */}
              <div style={{
                fontFamily: CLAUDE_FONT.ui,
                fontSize: 13,
                color: CLAUDE.INK_SOFT,
                textAlign: 'center',
                lineHeight: 1.3,
                flexShrink: 0,
              }}>
                {cell.caption}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
