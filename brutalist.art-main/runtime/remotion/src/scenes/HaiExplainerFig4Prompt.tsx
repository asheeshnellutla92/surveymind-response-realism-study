import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiExplainerFig4Prompt — Step 4: the key teaching beat.
 * Split panel: left = greyed generic prompt; right = specific version
 * with terracotta insertions. Sign-in callout shown separately.
 * Beat B04 of claude-liam-hai-how-to-explainer-videos.
 */

export const haiExplainerFig4PromptSchema = z.object({
  sparkLine: z.string().default('The specifics are what make it yours.'),
});
export type HaiExplainerFig4PromptProps = z.infer<typeof haiExplainerFig4PromptSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const HaiExplainerFig4Prompt: React.FC<HaiExplainerFig4PromptProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const leftIn = spring({ frame: frame - 10, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const arrowIn = spring({ frame: frame - 30, fps, config: { damping: 25, stiffness: 100 } });
  const rightIn = spring({ frame: frame - 45, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const calloutIn = spring({ frame: frame - 80, fps, config: { damping: 25, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100 } });

  const PANEL_TOP = height * 0.26;
  const PANEL_H = height * 0.44;
  const PANEL_W = (width - PAD_X * 2 - 60) / 2;
  const LEFT_X = PAD_X;
  const RIGHT_X = PAD_X + PANEL_W + 60;

  const GENERIC = `create a claude-explainer
in the Liam voice
for every video idea
in this folder`;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 4 · YOUR SPECIFIC PROMPT
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Generic Seed → Your Specifics
      </div>

      {/* LEFT panel — generic (greyed) */}
      <div style={{
        position: 'absolute',
        left: LEFT_X,
        top: PANEL_TOP,
        width: PANEL_W,
        minHeight: PANEL_H,
        background: '#F5F4EF',
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 14,
        padding: '24px 28px',
        opacity: clamp(leftIn, 0, 1),
        transform: `translateX(${(1 - clamp(leftIn, 0, 1)) * -20}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: CLAUDE.GHOST, marginBottom: 14,
        }}>
          Generic Seed
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 17, lineHeight: 1.7,
          color: CLAUDE.GHOST, whiteSpace: 'pre-line',
        }}>
          {GENERIC}
        </div>
      </div>

      {/* Arrow divider */}
      <div style={{
        position: 'absolute',
        left: LEFT_X + PANEL_W + 8,
        top: PANEL_TOP + PANEL_H / 2 - 20,
        width: 44,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(arrowIn, 0, 1),
      }}>
        <svg width={44} height={40} viewBox="0 0 44 40">
          <path d="M4 20 L36 20 M28 10 L38 20 L28 30"
            stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700,
          color: CLAUDE.SPARK, letterSpacing: 1, textAlign: 'center',
          textTransform: 'uppercase' as const,
        }}>
          ADD<br />YOURS
        </div>
      </div>

      {/* RIGHT panel — specific (terracotta accents) */}
      <div style={{
        position: 'absolute',
        left: RIGHT_X,
        top: PANEL_TOP,
        width: PANEL_W,
        minHeight: PANEL_H,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 14,
        padding: '24px 28px',
        boxShadow: `0 8px 32px ${CLAUDE.SPARK}25`,
        opacity: clamp(rightIn, 0, 1),
        transform: `translateX(${(1 - clamp(rightIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 14,
        }}>
          Your Version
        </div>
        {/* Prompt lines with terracotta insertions */}
        <div style={{ fontFamily: MONO, fontSize: 16, lineHeight: 1.9, color: CLAUDE.INK }}>
          <span>create a claude-explainer</span><br />
          <span>in the Liam voice for every</span><br />
          <span>video idea in this folder —</span><br />
          <span style={{ color: CLAUDE.SPARK }}>my project is [your topic].</span><br />
          <span style={{ color: CLAUDE.SPARK }}>Key result: [your result].</span><br />
          <span style={{ color: CLAUDE.SPARK }}>Show [your key figure].</span><br />
          <span style={{ color: CLAUDE.SPARK }}>One takeaway: [your idea].</span>
        </div>

        {/* Sign-in line callout */}
        <div style={{
          marginTop: 20,
          background: '#FFF8F5',
          border: `1.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 10,
          padding: '10px 16px',
          opacity: clamp(calloutIn, 0, 1),
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 4, letterSpacing: 1 }}>
            SIGN-IN LINE
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.5 }}>
            "…and have Liam say<br />
            <span style={{ color: CLAUDE.SPARK }}>'Liam, for [your name]</span><br />
            <span style={{ color: CLAUDE.SPARK }}>&nbsp;and Humanitarians AI.'"</span>
          </div>
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
