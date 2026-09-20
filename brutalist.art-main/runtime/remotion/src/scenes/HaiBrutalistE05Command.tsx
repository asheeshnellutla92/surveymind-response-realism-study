import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE05Command — the run command with token callouts.
 * Central mono: caffeinate claude --dangerously-skip-permissions
 * Token 1: "caffeinate" underlined, callout above: "keeps Mac awake through render"
 * Token 2: "--dangerously-skip-permissions" underlined, callout below
 * Beat B01 of hai-brutalist-run-claude-code.
 */

export const haiBrutalistE05CommandSchema = z.object({
  sparkLine: z.string().default('Awake. Unblocked. End to end.'),
});
export type HaiBrutalistE05CommandProps = z.infer<typeof haiBrutalistE05CommandSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const HaiBrutalistE05Command: React.FC<HaiBrutalistE05CommandProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.08;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const cmdIn = spring({ frame: frame - 14, fps, config: { damping: 25, stiffness: 80 } });
  const callout1In = spring({ frame: frame - 50, fps, config: { damping: 25, stiffness: 100 } });
  const callout2In = spring({ frame: frame - 75, fps, config: { damping: 25, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100 } });

  const CMD_FONT_SIZE = height * 0.032;
  const CMD_Y = height * 0.46;

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
        Run Claude Code
      </div>

      {/* Command block */}
      <div style={{
        position: 'absolute',
        left: PAD_X, right: PAD_X,
        top: CMD_Y,
        background: '#1A1A18',
        borderRadius: 16,
        padding: `${height * 0.028}px ${height * 0.032}px`,
        opacity: clamp(cmdIn, 0, 1),
        transform: `translateY(${(1 - clamp(cmdIn, 0, 1)) * 14}px)`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: CMD_FONT_SIZE,
          lineHeight: 1.5,
          color: '#E8E6DC',
          display: 'flex', flexWrap: 'wrap', gap: '0 6px',
        }}>
          <span style={{
            borderBottom: `2.5px solid ${CLAUDE.SPARK}`,
            color: CLAUDE.SPARK,
          }}>caffeinate</span>
          <span style={{ color: '#8BC8A2' }}>claude</span>
          <span style={{
            borderBottom: `2.5px solid #5B8ED8`,
            color: '#9EC4F8',
          }}>--dangerously-skip-permissions</span>
        </div>
      </div>

      {/* Callout 1 — above: caffeinate */}
      <div style={{
        position: 'absolute',
        left: PAD_X + 20,
        top: CMD_Y - height * 0.13,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12,
        padding: '10px 18px',
        maxWidth: 340,
        opacity: clamp(callout1In, 0, 1),
        transform: `translateY(${(1 - clamp(callout1In, 0, 1)) * -10}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 1, marginBottom: 4 }}>
          CAFFEINATE
        </div>
        <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.4 }}>
          keeps Mac awake through render
        </div>
        {/* Arrow down */}
        <div style={{
          position: 'absolute', bottom: -10, left: 24,
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `10px solid ${CLAUDE.SPARK}`,
        }} />
      </div>

      {/* Callout 2 — below: --dangerously-skip-permissions */}
      <div style={{
        position: 'absolute',
        left: PAD_X + 20,
        top: CMD_Y + height * 0.14,
        background: CLAUDE.CARD,
        border: `1.5px solid #5B8ED8`,
        borderRadius: 12,
        padding: '10px 18px',
        maxWidth: 440,
        opacity: clamp(callout2In, 0, 1),
        transform: `translateY(${(1 - clamp(callout2In, 0, 1)) * 10}px)`,
      }}>
        {/* Arrow up */}
        <div style={{
          position: 'absolute', top: -10, left: 24,
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: `10px solid #5B8ED8`,
        }} />
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#5B8ED8', letterSpacing: 1, marginBottom: 4 }}>
          --DANGEROUSLY-SKIP-PERMISSIONS
        </div>
        <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.4 }}>
          runs end-to-end without permission prompts
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
