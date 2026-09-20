import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE01Pipeline — 7-stage pipeline rail for "What Is Brutalist?"
 * Stages: IDEAS → SCRIPT/BEATS → AUDIO → VISUALS → ASSEMBLE → VARIANTS → PUBLISH
 * Each stage is a rounded card; ./art badge appears below as terracotta chip.
 * Cards animate in sequentially; connector arrows between each; PUBLISH is focal.
 * Beat B01 of hai-brutalist-what-is.
 */

export const haiBrutalistE01PipelineSchema = z.object({
  sparkLine: z.string().default('One command. One entry point. One sitting.'),
});
export type HaiBrutalistE01PipelineProps = z.infer<typeof haiBrutalistE01PipelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STAGES = [
  { label: 'IDEAS', sub: 'scout' },
  { label: 'SCRIPT/\nBEATS', sub: 'script-writer' },
  { label: 'AUDIO', sub: 'gen_audio' },
  { label: 'VISUALS', sub: 'Manim/Remotion' },
  { label: 'ASSEMBLE', sub: 'run.sh' },
  { label: 'VARIANTS', sub: 'audience-preset' },
  { label: 'PUBLISH', sub: 'youtube-publisher' },
];

export const HaiBrutalistE01Pipeline: React.FC<HaiBrutalistE01PipelineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.04;
  const CENTER_Y = height * 0.50;
  const NODE_W = 175;
  const NODE_H = 120;
  const TOTAL_W = width - PAD_X * 2;
  const STEP = TOTAL_W / (STAGES.length - 1);

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100 } });
  const badgeIn = spring({ frame: frame - 130, fps, config: { damping: 25, stiffness: 90 } });

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
        The 7-Stage Pipeline
      </div>

      {/* Stage nodes */}
      {STAGES.map((stage, i) => {
        const x = PAD_X + i * STEP;
        const delay = 10 + i * 14;
        const nodeIn = spring({ frame: frame - delay, fps, config: { damping: 25, stiffness: 90, mass: 0.9 } });
        const isFocal = i === STAGES.length - 1;
        const isActive = true;

        return (
          <React.Fragment key={i}>
            {/* Connector arrow */}
            {i < STAGES.length - 1 && (
              <div style={{
                position: 'absolute',
                left: x + NODE_W / 2,
                top: CENTER_Y - 1,
                width: STEP - NODE_W / 2,
                height: 2,
                background: isFocal ? CLAUDE.SPARK : CLAUDE.BORDER,
                opacity: clamp(nodeIn, 0, 1),
              }}>
                <svg style={{ position: 'absolute', right: -8, top: -7 }} width={16} height={16} viewBox="0 0 16 16">
                  <path d="M4 2 L12 8 L4 14" stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            {/* Node card */}
            <div style={{
              position: 'absolute',
              left: x - NODE_W / 2,
              top: CENTER_Y - NODE_H / 2,
              width: NODE_W,
              height: NODE_H,
              background: isFocal ? CLAUDE.SPARK : '#FFF8F5',
              border: `2px solid ${isFocal ? CLAUDE.SPARK : '#F5C4B0'}`,
              borderRadius: 14,
              boxShadow: isFocal
                ? `0 8px 32px ${CLAUDE.SPARK}40`
                : '0 4px 16px rgba(217,119,87,0.12)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 5,
              opacity: clamp(nodeIn, 0, 1),
              transform: `translateY(${(1 - clamp(nodeIn, 0, 1)) * 20}px)`,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: 1.5, textTransform: 'uppercase' as const,
                color: isFocal ? '#FFFFFF' : CLAUDE.SPARK,
                textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3,
              }}>
                {stage.label}
              </div>
              <div style={{
                fontFamily: SANS, fontSize: 10,
                color: isFocal ? 'rgba(255,255,255,0.8)' : CLAUDE.INK_SOFT,
                textAlign: 'center',
              }}>
                {stage.sub}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* ./art badge */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: height * 0.17,
        display: 'flex', justifyContent: 'center',
        opacity: clamp(badgeIn, 0, 1),
        transform: `translateY(${(1 - clamp(badgeIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{
          background: CLAUDE.SPARK,
          borderRadius: 20,
          padding: '6px 22px',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: height * 0.018,
          color: '#FFFFFF',
          letterSpacing: 2,
        }}>
          ./art
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
