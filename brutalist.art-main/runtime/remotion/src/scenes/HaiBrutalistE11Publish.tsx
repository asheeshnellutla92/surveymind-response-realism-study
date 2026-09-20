import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE11Publish — publish flow with three nodes.
 * Node 1: hr@humanitarians.ai chip → script
 * Node 2: @humanitariansai channel
 * Node 3: Fellows Research playlist row
 * New thumbnail slides in at the end.
 * Beat B01 of hai-brutalist-publish.
 */

export const haiBrutalistE11PublishSchema = z.object({
  sparkLine: z.string().default('One script. Live in Fellows Research.'),
});
export type HaiBrutalistE11PublishProps = z.infer<typeof haiBrutalistE11PublishSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const HaiBrutalistE11Publish: React.FC<HaiBrutalistE11PublishProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const NODE_Y = height * 0.34;
  const NODE_H = height * 0.22;
  const TOTAL_W = width - PAD_X * 2;
  const NODE_W = TOTAL_W * 0.28;
  const STEP = TOTAL_W / 2.5;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const node1In = spring({ frame: frame - 14, fps, config: { damping: 25, stiffness: 90 } });
  const node2In = spring({ frame: frame - 40, fps, config: { damping: 25, stiffness: 90 } });
  const node3In = spring({ frame: frame - 65, fps, config: { damping: 25, stiffness: 90 } });
  const thumbIn = spring({ frame: frame - 90, fps, config: { damping: 22, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100 } });

  const PLAYLIST_Y = height * 0.62;
  const THUMB_W = 80;
  const THUMB_H = 50;

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
        Publish to the Channel
      </div>

      {/* Node 1 — email + script */}
      {[
        { label: 'hr@humanitarians.ai', sub: "Gaurav's script", nodeIn: node1In, isFocal: false, x: PAD_X },
        { label: '@humanitariansai', sub: 'YouTube channel', nodeIn: node2In, isFocal: false, x: PAD_X + STEP },
        { label: 'Fellows Research', sub: 'playlist', nodeIn: node3In, isFocal: true, x: PAD_X + STEP * 2 },
      ].map((node, i) => (
        <React.Fragment key={i}>
          {/* Arrow */}
          {i > 0 && (
            <div style={{
              position: 'absolute',
              left: PAD_X + STEP * (i - 1) + NODE_W + 8,
              top: NODE_Y + NODE_H / 2 - 1,
              width: STEP - NODE_W - 16,
              height: 2,
              background: CLAUDE.SPARK,
              opacity: clamp(node.nodeIn, 0, 1),
            }}>
              <svg style={{ position: 'absolute', right: -8, top: -7 }} width={16} height={16} viewBox="0 0 16 16">
                <path d="M4 2 L12 8 L4 14" stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          {/* Node box */}
          <div style={{
            position: 'absolute',
            left: node.x, top: NODE_Y,
            width: NODE_W, height: NODE_H,
            background: node.isFocal ? CLAUDE.SPARK : CLAUDE.CARD,
            border: `2px solid ${node.isFocal ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderRadius: 14,
            boxShadow: node.isFocal ? `0 8px 32px ${CLAUDE.SPARK}40` : '0 4px 16px rgba(61,57,41,0.08)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: clamp(node.nodeIn, 0, 1),
            transform: `translateY(${(1 - clamp(node.nodeIn, 0, 1)) * 16}px)`,
          }}>
            <div style={{
              fontFamily: MONO, fontSize: 13, fontWeight: 700,
              color: node.isFocal ? '#FFFFFF' : CLAUDE.SPARK,
              textAlign: 'center',
            }}>
              {node.label}
            </div>
            <div style={{
              fontFamily: SANS, fontSize: 12,
              color: node.isFocal ? 'rgba(255,255,255,0.8)' : CLAUDE.INK_SOFT,
              textAlign: 'center',
            }}>
              {node.sub}
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Playlist thumbnail row */}
      <div style={{
        position: 'absolute',
        left: PAD_X + STEP * 2, top: PLAYLIST_Y,
        width: NODE_W,
        display: 'flex', gap: 8, flexWrap: 'wrap',
        opacity: clamp(node3In, 0, 1),
      }}>
        {/* Existing thumbnails */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: THUMB_W * 0.6, height: THUMB_H * 0.6,
            background: '#EBEBEB',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 6,
          }} />
        ))}
        {/* New thumbnail slides in */}
        <div style={{
          width: THUMB_W * 0.6, height: THUMB_H * 0.6,
          background: `${CLAUDE.SPARK}20`,
          border: `2px solid ${CLAUDE.SPARK}`,
          borderRadius: 6,
          opacity: clamp(thumbIn, 0, 1),
          transform: `translateX(${(1 - clamp(thumbIn, 0, 1)) * 20}px)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <polygon points="7,4 21,12 7,20" fill={CLAUDE.SPARK} />
          </svg>
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
