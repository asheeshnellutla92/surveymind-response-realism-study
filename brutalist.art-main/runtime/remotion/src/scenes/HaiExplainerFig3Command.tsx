import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiExplainerFig3Command — Steps 2+3 visual: email chip + the exact command.
 * Clean house-style mock (not a screenshot): cream page, monospace command,
 * callout annotations per token. The terminal IS the subject (Illustrate Law OK).
 * Beat B03 of claude-liam-hai-how-to-explainer-videos.
 */

export const haiExplainerFig3CommandSchema = z.object({
  sparkLine: z.string().default('The whole pipeline. One command.'),
});
export type HaiExplainerFig3CommandProps = z.infer<typeof haiExplainerFig3CommandSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const HaiExplainerFig3Command: React.FC<HaiExplainerFig3CommandProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.08;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const emailIn = spring({ frame: frame - 12, fps, config: { damping: 25, stiffness: 90, mass: 0.9 } });
  const blockIn = spring({ frame: frame - 30, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const callout1In = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 100 } });
  const callout2In = spring({ frame: frame - 75, fps, config: { damping: 28, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 100 } });

  const BLOCK_LEFT = PAD_X;
  const BLOCK_TOP = height * 0.32;
  const BLOCK_W = width - PAD_X * 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEPS 2–3 · GET THE SYSTEM · OPEN CLAUDE CODE
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        The Setup and the Command
      </div>

      {/* Email chip — Step 2 */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.26,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: clamp(emailIn, 0, 1),
        transform: `translateY(${(1 - clamp(emailIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{
          background: CLAUDE.CARD,
          border: `1.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 999,
          padding: '8px 20px',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 2px 8px rgba(61,57,41,0.08)',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <rect x={3} y={5} width={18} height={14} rx={2} stroke={CLAUDE.INK_SOFT} strokeWidth={2} />
            <path d="M3 9l9 5 9-5" stroke={CLAUDE.INK_SOFT} strokeWidth={2} />
          </svg>
          <span style={{ fontFamily: MONO, fontSize: 16, color: CLAUDE.SPARK, fontWeight: 600 }}>
            hr@humanitarians.ai
          </span>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK_SOFT }}>
          → Brutalist system + setup help
        </span>
      </div>

      {/* Command block — Step 3 */}
      <div style={{
        position: 'absolute',
        left: BLOCK_LEFT,
        top: BLOCK_TOP,
        width: BLOCK_W,
        background: '#1E1C17',
        borderRadius: 14,
        padding: '28px 36px',
        boxShadow: '0 8px 32px rgba(61,57,41,0.20)',
        opacity: clamp(blockIn, 0, 1),
        transform: `translateY(${(1 - clamp(blockIn, 0, 1)) * 18}px)`,
      }}>
        {/* Shell prompt */}
        <div style={{
          fontFamily: MONO, fontSize: 14, color: '#5A9B5A', marginBottom: 12,
        }}>
          $ <span style={{ color: '#888' }}>in your research folder:</span>
        </div>

        {/* The command line */}
        <div style={{
          fontFamily: MONO, fontSize: 26, fontWeight: 500,
          lineHeight: 1.4, color: '#F0EDE4',
          letterSpacing: '-0.01em',
        }}>
          <span style={{ color: '#88CCAA' }}>caffeinate</span>{' '}
          <span style={{ color: CLAUDE.SPARK }}>claude</span>{' '}
          <span style={{ color: '#AAC4E8' }}>--dangerously-skip-permissions</span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#333', marginTop: 20 }} />

        {/* Status line */}
        <div style={{
          fontFamily: MONO, fontSize: 13, color: '#666', marginTop: 12,
        }}>
          ✳ Claude Code initializing pipeline…
        </div>
      </div>

      {/* Callout 1: caffeinate */}
      <div style={{
        position: 'absolute',
        left: BLOCK_LEFT + 36,
        top: BLOCK_TOP + 140,
        opacity: clamp(callout1In, 0, 1),
        transform: `translateY(${(1 - clamp(callout1In, 0, 1)) * 10}px)`,
      }}>
        <div style={{
          background: CLAUDE.CARD,
          border: `1.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 10,
          padding: '10px 16px',
          maxWidth: 300,
          boxShadow: '0 4px 16px rgba(61,57,41,0.12)',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 13, color: '#88CCAA', fontWeight: 700 }}>caffeinate</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, marginTop: 4 }}>
            keeps the Mac awake for the full render — no sleep interruptions
          </div>
        </div>
        {/* Line pointing up into the block */}
        <svg style={{ position: 'absolute', top: -28, left: 40 }} width={2} height={30}>
          <line x1={1} y1={0} x2={1} y2={30} stroke={CLAUDE.BORDER} strokeWidth={1.5} strokeDasharray="4 3" />
        </svg>
      </div>

      {/* Callout 2: --dangerously-skip-permissions */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        top: BLOCK_TOP + 140,
        opacity: clamp(callout2In, 0, 1),
        transform: `translateY(${(1 - clamp(callout2In, 0, 1)) * 10}px)`,
      }}>
        <div style={{
          background: CLAUDE.CARD,
          border: `1.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 10,
          padding: '10px 16px',
          maxWidth: 380,
          boxShadow: '0 4px 16px rgba(61,57,41,0.12)',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: '#AAC4E8', fontWeight: 700 }}>--dangerously-skip-permissions</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, marginTop: 4 }}>
            runs the whole pipeline unattended — no mid-build permission prompts
          </div>
        </div>
        <svg style={{ position: 'absolute', top: -28, right: 60 }} width={2} height={30}>
          <line x1={1} y1={0} x2={1} y2={30} stroke={CLAUDE.BORDER} strokeWidth={1.5} strokeDasharray="4 3" />
        </svg>
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
