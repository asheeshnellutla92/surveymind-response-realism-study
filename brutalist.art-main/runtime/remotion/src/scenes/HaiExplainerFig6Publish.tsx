import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiExplainerFig6Publish — Step 6: publish to the channel.
 * Flow: Gaurav's script (email chip) → @HumanitariansAI channel → Fellows Research playlist.
 * Terracotta on "Fellows Research."
 * Beat B06 of claude-liam-hai-how-to-explainer-videos.
 */

export const haiExplainerFig6PublishSchema = z.object({
  sparkLine: z.string().default('Your research deserves an audience.'),
});
export type HaiExplainerFig6PublishProps = z.infer<typeof haiExplainerFig6PublishSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Simple play button SVG for the playlist card thumbnails
const Thumbnail: React.FC<{ label: string; isNew?: boolean }> = ({ label, isNew }) => (
  <div style={{
    width: 140,
    height: 80,
    background: isNew ? '#FFF8F5' : CLAUDE.PAGE,
    border: `1.5px solid ${isNew ? CLAUDE.SPARK : CLAUDE.BORDER}`,
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column',
    gap: 4,
    boxShadow: isNew ? `0 4px 16px ${CLAUDE.SPARK}30` : '0 2px 8px rgba(61,57,41,0.08)',
  }}>
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <circle cx={12} cy={12} r={10} stroke={isNew ? CLAUDE.SPARK : CLAUDE.BORDER} strokeWidth={1.5} />
      <polygon points="10,8 18,12 10,16" fill={isNew ? CLAUDE.SPARK : CLAUDE.GHOST} />
    </svg>
    <div style={{
      fontFamily: SANS, fontSize: 9, color: isNew ? CLAUDE.SPARK : CLAUDE.GHOST,
      fontWeight: isNew ? 700 : 400, textAlign: 'center',
      maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  </div>
);

export const HaiExplainerFig6Publish: React.FC<HaiExplainerFig6PublishProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const scriptIn = spring({ frame: frame - 10, fps, config: { damping: 25, stiffness: 90, mass: 0.9 } });
  const channelIn = spring({ frame: frame - 35, fps, config: { damping: 22, stiffness: 80, mass: 1.0 } });
  const playlistIn = spring({ frame: frame - 60, fps, config: { damping: 22, stiffness: 80, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 95, fps, config: { damping: 28, stiffness: 100 } });

  const FLOW_Y = height * 0.46;
  const ITEM_W = 260;
  const GAP = 80;
  const TOTAL_W = ITEM_W * 3 + GAP * 2;
  const START_X = (width - TOTAL_W) / 2;

  const Arrow: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) => (
    <svg style={{ position: 'absolute', left: x, top: FLOW_Y - 20, opacity }}
      width={GAP} height={40} viewBox={`0 0 ${GAP} 40`}>
      <line x1={0} y1={20} x2={GAP - 16} y2={20} stroke={CLAUDE.SPARK} strokeWidth={2} strokeDasharray="6 4" />
      <path d={`M ${GAP - 18} 12 L ${GAP - 4} 20 L ${GAP - 18} 28`}
        stroke={CLAUDE.SPARK} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 6 · PUBLISH TO THE CHANNEL
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Publish to Fellows Research
      </div>

      {/* Node 1: Gaurav's script */}
      <div style={{
        position: 'absolute',
        left: START_X,
        top: FLOW_Y - 70,
        width: ITEM_W,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: '0 4px 16px rgba(61,57,41,0.08)',
        opacity: clamp(scriptIn, 0, 1),
        transform: `translateY(${(1 - clamp(scriptIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 10 }}>
          Gaurav's Publishing Script
        </div>
        <div style={{
          background: '#F5F4EF', borderRadius: 8, padding: '8px 12px',
          fontFamily: MONO, fontSize: 13, color: CLAUDE.SPARK,
          marginBottom: 10,
        }}>
          hr@humanitarians.ai
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
          runs the YouTube Data API upload — one command
        </div>
      </div>

      {/* Arrow 1 */}
      <Arrow x={START_X + ITEM_W} opacity={clamp(channelIn, 0, 1)} />

      {/* Node 2: Channel */}
      <div style={{
        position: 'absolute',
        left: START_X + ITEM_W + GAP,
        top: FLOW_Y - 70,
        width: ITEM_W,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: '0 4px 16px rgba(61,57,41,0.08)',
        opacity: clamp(channelIn, 0, 1),
        transform: `translateY(${(1 - clamp(channelIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 10 }}>
          Channel
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 16, fontWeight: 700,
          color: CLAUDE.INK, marginBottom: 6,
        }}>
          @HumanitariansAI
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT }}>
          youtube.com/@humanitariansai
        </div>
      </div>

      {/* Arrow 2 */}
      <Arrow x={START_X + (ITEM_W + GAP) * 2} opacity={clamp(playlistIn, 0, 1)} />

      {/* Node 3: Fellows Research playlist */}
      <div style={{
        position: 'absolute',
        left: START_X + (ITEM_W + GAP) * 2,
        top: FLOW_Y - 70,
        width: ITEM_W,
        background: '#FFF8F5',
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: `0 8px 32px ${CLAUDE.SPARK}25`,
        opacity: clamp(playlistIn, 0, 1),
        transform: `translateY(${(1 - clamp(playlistIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 10 }}>
          Playlist
        </div>
        <div style={{
          fontFamily: SERIF, fontSize: 18, fontWeight: 700,
          color: CLAUDE.SPARK, marginBottom: 10,
        }}>
          Fellows Research
        </div>
        {/* Playlist thumbnails row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <Thumbnail label="Fellow video 1" />
          <Thumbnail label="Your video →" isNew />
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
