import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';
import { AnimationName, computeAnimation, MascotSVG } from './ClaudeMascotScene';

/**
 * ClaudeMascotShortGrid — portrait 9:16 (1080×1920) mascot showcase grid.
 * Shows 6 animations per page in a 2×3 layout; each mascot is large enough
 * to be legible on a phone screen. Three beats cover all 18 animations.
 *
 * PIXEL-ART LAW applies: inherits from ClaudeMascotScene — no rotation, ever.
 */

const cellSchema = z.object({
  animationName: z.string(),
  caption: z.string(),
});

export const claudeMascotShortGridSchema = z.object({
  cells: z.array(cellSchema).min(1).max(6),
  bgColor: z.string().default(CLAUDE.PAGE),
  pageLabel: z.string().default(''),
});
export type ClaudeMascotShortGridProps = z.infer<typeof claudeMascotShortGridSchema>;

const SAFE_X = 40;
const SAFE_Y = 60;
const GAP    = 12;

// Mascot height per cell — 260px is large at 1080px canvas width
const MASCOT_H = 260;
const MASCOT_W = Math.round((136 / 86) * MASCOT_H); // ≈ 411px

export const ClaudeMascotShortGrid: React.FC<ClaudeMascotShortGridProps> = ({
  cells,
  bgColor,
  pageLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{
      backgroundColor: bgColor,
      padding: `${SAFE_Y}px ${SAFE_X}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Optional page label at top */}
      {pageLabel ? (
        <div style={{
          fontFamily: CLAUDE_FONT.ui,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: CLAUDE.INK_SOFT,
          lineHeight: 1,
          marginBottom: 14,
          flexShrink: 0,
          textAlign: 'center',
        }}>
          {pageLabel}
        </div>
      ) : null}

      {/* 2-column × 3-row grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: GAP,
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
              borderRadius: 8,
              overflow: 'hidden',
              padding: '10px 6px 8px',
            }}>
              {/* Animation — fills remaining vertical space */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: 0,
              }}>
                <div style={{ width: MASCOT_W, height: MASCOT_H, overflow: 'visible' }}>
                  <MascotSVG s={s} scale={1} />
                </div>
              </div>

              {/* Animation name — terracotta small-caps */}
              <div style={{
                fontFamily: CLAUDE_FONT.ui,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: CLAUDE.SPARK,
                lineHeight: 1,
                marginTop: 8,
                marginBottom: 4,
                flexShrink: 0,
              }}>
                {cell.animationName}
              </div>

              {/* One-line caption */}
              <div style={{
                fontFamily: CLAUDE_FONT.ui,
                fontSize: 15,
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
