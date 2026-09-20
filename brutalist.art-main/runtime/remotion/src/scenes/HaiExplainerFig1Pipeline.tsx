import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiExplainerFig1Pipeline — the one-sitting pipeline map.
 * Five nodes left-to-right; each lights terracotta as the video progresses.
 * Beat B01 of claude-liam-hai-how-to-explainer-videos.
 * Per CLAUDE-BRAND.md: one terracotta accent per beat — the rightmost lit node.
 */

export const haiExplainerFig1PipelineSchema = z.object({
  sparkLine: z.string().default('Five steps. One sitting.'),
  activeIndex: z.number().default(4),
});
export type HaiExplainerFig1PipelineProps = z.infer<typeof haiExplainerFig1PipelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const NODES = [
  { label: "YOUR WEEK'S\nFOLDER", sub: 'notes, code, figures' },
  { label: 'BRUTALIST\nSKILLS', sub: 'toolkit + setup' },
  { label: 'CLAUDE\nCODE', sub: 'builds the video' },
  { label: 'WATCH &\nREVISE', sub: 'plain language edits' },
  { label: 'PUBLISH', sub: 'Fellows Research' },
];

export const HaiExplainerFig1Pipeline: React.FC<HaiExplainerFig1PipelineProps> = ({ sparkLine, activeIndex }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // PAD_X = 11% → safe left/right margins; NODE_W sized so rightmost edge stays inside safe zone
  const PAD_X = width * 0.11;
  const CENTER_Y = height * 0.48;
  const NODE_W = 195;
  const NODE_H = 130;
  const TOTAL_W = width - PAD_X * 2;
  const STEP = TOTAL_W / (NODES.length - 1);

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Title eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        HUMANITARIANS AI · BRUTALIST PIPELINE
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        The One-Sitting Pipeline
      </div>

      {/* Node row */}
      {NODES.map((node, i) => {
        const x = PAD_X + i * STEP;
        const nodeDelay = 8 + i * 18;
        const nodeIn = spring({ frame: frame - nodeDelay, fps, config: { damping: 25, stiffness: 90, mass: 0.9 } });
        const isActive = i <= activeIndex;
        const isFocal = i === activeIndex;

        return (
          <React.Fragment key={i}>
            {/* Arrow connector */}
            {i < NODES.length - 1 && (
              <div style={{
                position: 'absolute',
                left: x + NODE_W / 2,
                top: CENTER_Y - 1,
                width: STEP - NODE_W / 2,
                height: 2,
                background: isActive ? CLAUDE.SPARK : CLAUDE.BORDER,
                opacity: clamp(nodeIn, 0, 1),
                transition: 'background 0.3s',
              }}>
                {/* Arrowhead */}
                <svg style={{ position: 'absolute', right: -8, top: -7 }}
                  width={16} height={16} viewBox="0 0 16 16">
                  <path d="M4 2 L12 8 L4 14" stroke={isActive ? CLAUDE.SPARK : CLAUDE.BORDER}
                    strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            {/* Node box */}
            <div style={{
              position: 'absolute',
              left: x - NODE_W / 2,
              top: CENTER_Y - NODE_H / 2,
              width: NODE_W,
              height: NODE_H,
              background: isFocal ? CLAUDE.SPARK : isActive ? '#FFF8F5' : CLAUDE.CARD,
              border: `2px solid ${isFocal ? CLAUDE.SPARK : isActive ? '#F5C4B0' : CLAUDE.BORDER}`,
              borderRadius: 16,
              boxShadow: isFocal
                ? `0 8px 32px ${CLAUDE.SPARK}40`
                : isActive ? '0 4px 16px rgba(217,119,87,0.15)' : '0 4px 16px rgba(61,57,41,0.08)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 6,
              opacity: clamp(nodeIn, 0, 1),
              transform: `translateY(${(1 - nodeIn) * 20}px)`,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: 13, fontWeight: 700,
                letterSpacing: 1.5, textTransform: 'uppercase' as const,
                color: isFocal ? '#FFFFFF' : isActive ? CLAUDE.SPARK : CLAUDE.INK,
                textAlign: 'center',
                whiteSpace: 'pre-line',
                lineHeight: 1.3,
              }}>
                {node.label}
              </div>
              <div style={{
                fontFamily: SANS, fontSize: 11,
                color: isFocal ? 'rgba(255,255,255,0.8)' : CLAUDE.INK_SOFT,
                textAlign: 'center',
              }}>
                {node.sub}
              </div>
            </div>

            {/* Step number */}
            <div style={{
              position: 'absolute',
              left: x - 12,
              top: CENTER_Y + NODE_H / 2 + 14,
              fontFamily: SANS, fontSize: 14, fontWeight: 700,
              color: isActive ? CLAUDE.SPARK : CLAUDE.GHOST,
              opacity: clamp(nodeIn, 0, 1),
            }}>
              {i === NODES.length - 1 ? '—' : `${i + 1}`}
            </div>
          </React.Fragment>
        );
      })}

      {/* Bottom spark line */}
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
