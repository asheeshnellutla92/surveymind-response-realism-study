import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ValuesSplitScreen — Figure 5 for "Claude's Values Across Models and Languages"
 * Source: Anthropic (Jul 13, 2026)
 *
 * Two side-by-side Claude composer window mockups (hand-drawn UI skeletons).
 * Left = Hindi. Right = Russian.
 * Same input: "Give me feedback on my business plan."
 *
 * Reply regions animate with text-skeleton lines:
 *   Hindi reply: first line warmth-shaped (longer, gentle, affirmative)
 *   Russian reply: first line rigor-shaped (shorter, direct, critical)
 *
 * ONE terracotta moment: the diverging first lines (terracotta tint on first line of each reply)
 * Clear on-screen label: "Illustration — response shapes, not real transcripts."
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const valuesSplitScreenSchema = z.object({
  sparkLine: z.string().default('Measurable, not random noise.'),
});
export type ValuesSplitScreenProps = z.infer<typeof valuesSplitScreenSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PROMPT_TEXT = 'Give me feedback on my business plan.';

// Hindi reply lines (warmth-shaped: affirmation first, gentle)
const HINDI_LINES = [
  { text: 'What a thoughtful and ambitious plan — there is real potential here.', warmth: true, width: 0.88 },
  { text: 'The market opportunity you have identified is genuine and well-framed.', warmth: false, width: 0.82 },
  { text: 'Your financial assumptions are reasonable for an early-stage venture.', warmth: false, width: 0.78 },
  { text: 'A few areas to develop further as you move forward —', warmth: false, width: 0.70 },
  { text: 'Customer acquisition strategy deserves more specificity.', warmth: false, width: 0.66 },
];

// Russian reply lines (rigor-shaped: critical first, direct)
const RUSSIAN_LINES = [
  { text: 'The core assumption on page 2 is unsupported.', warmth: false, width: 0.62, isFirstRigor: true },
  { text: 'Revenue projections are 3× the sector median — no justification given.', warmth: false, width: 0.84 },
  { text: 'Competitive analysis names three firms but misses the main incumbent.', warmth: false, width: 0.84 },
  { text: 'Unit economics are not shown. This is required before any decision.', warmth: false, width: 0.78 },
  { text: 'Recommend: address these four points before proceeding.', warmth: false, width: 0.68 },
];

// Phases
const PHASE_TITLE = 0;
const PHASE_WINDOWS_IN = 20;
const PHASE_PROMPT_IN = 50;
const PHASE_REPLY_START = 80;
const PHASE_LINE_STAGGER = 18;
const PHASE_LABEL_IN = 210;
const PHASE_SPARK_IN = 240;

// Skeleton line renderer
interface SkeletonLineProps {
  frame: number;
  fps: number;
  startFrame: number;
  widthFraction: number;
  isAccent: boolean; // terracotta
  containerW: number;
  containerH: number;
  isFirst?: boolean;
}

const SkeletonLine: React.FC<SkeletonLineProps> = ({
  frame, fps, startFrame, widthFraction, isAccent, containerW, containerH, isFirst,
}) => {
  const lineIn = spring({ frame: frame - startFrame, fps, config: { damping: 26, stiffness: 100, mass: 0.8 } });
  const t = clamp(lineIn, 0, 1);
  return (
    <div style={{
      width: `${widthFraction * 100 * t}%`,
      height: isFirst ? containerH * 0.06 : containerH * 0.045,
      background: isAccent ? CLAUDE.SPARK : CLAUDE.BORDER,
      borderRadius: 4,
      marginBottom: containerH * 0.025,
      opacity: t,
    }} />
  );
};

// Reply text line
interface ReplyTextLineProps {
  frame: number;
  fps: number;
  startFrame: number;
  text: string;
  isAccent: boolean;
  fontSize: number;
}

const ReplyTextLine: React.FC<ReplyTextLineProps> = ({ frame, fps, startFrame, text, isAccent, fontSize }) => {
  const lineIn = spring({ frame: frame - startFrame, fps, config: { damping: 26, stiffness: 100, mass: 0.8 } });
  const t = clamp(lineIn, 0, 1);
  return (
    <div style={{
      fontFamily: SERIF,
      fontSize,
      fontStyle: isAccent ? 'italic' : 'normal',
      fontWeight: isAccent ? 600 : 400,
      color: isAccent ? CLAUDE.SPARK : CLAUDE.INK,
      lineHeight: 1.5,
      marginBottom: 6,
      opacity: t,
      transform: `translateX(${(1 - t) * 8}px)`,
    }}>
      {text}
    </div>
  );
};

export const ValuesSplitScreen: React.FC<ValuesSplitScreenProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.05;
  const PAD_Y = height * 0.07;
  const GUTTER = width * 0.04;
  const WINDOW_W = (width - PAD_X * 2 - GUTTER) / 2;
  const WINDOW_H = height * 0.70;
  const WINDOW_TOP = PAD_Y + height * 0.18;

  const titleIn = spring({ frame: frame - PHASE_TITLE, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const windowsIn = spring({ frame: frame - PHASE_WINDOWS_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const promptIn = spring({ frame: frame - PHASE_PROMPT_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.8 } });
  const labelIn = spring({ frame: frame - PHASE_LABEL_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const windowA_X = PAD_X;
  const windowB_X = PAD_X + WINDOW_W + GUTTER;

  const CHROME_H = height * 0.06;
  const PROMPT_AREA_H = height * 0.09;
  const REPLY_TOP = CHROME_H + PROMPT_AREA_H + height * 0.025;
  const REPLY_PAD = height * 0.025;
  const FONT_SIZE = height * 0.0135;

  const renderWindow = (
    language: string,
    lines: typeof HINDI_LINES,
    left: number,
  ) => (
    <div style={{
      position: 'absolute',
      left,
      top: WINDOW_TOP,
      width: WINDOW_W,
      height: WINDOW_H,
      background: CLAUDE.CARD,
      border: `1.5px solid ${CLAUDE.BORDER}`,
      borderRadius: 12,
      overflow: 'hidden',
      opacity: clamp(windowsIn, 0, 1),
      transform: `translateY(${(1 - clamp(windowsIn, 0, 1)) * 14}px)`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      {/* Chrome bar */}
      <div style={{
        height: CHROME_H,
        background: CLAUDE.PAGE,
        borderBottom: `1px solid ${CLAUDE.BORDER}`,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 14,
        paddingRight: 14,
        justifyContent: 'space-between',
      }}>
        {/* Window dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[CLAUDE.BORDER, CLAUDE.BORDER, CLAUDE.BORDER].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>
        {/* Language label */}
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
          color: CLAUDE.INK, letterSpacing: 1.5, textTransform: 'uppercase' as const,
        }}>
          {language}
        </div>
        {/* Model indicator */}
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        }}>
          Claude
        </div>
      </div>

      {/* Prompt area */}
      <div style={{
        padding: '14px 18px 10px',
        borderBottom: `1px solid ${CLAUDE.BORDER}`,
        background: CLAUDE.PAGE,
        opacity: clamp(promptIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
          marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' as const,
        }}>
          You
        </div>
        <div style={{
          fontFamily: SERIF, fontSize: FONT_SIZE, color: CLAUDE.INK, lineHeight: 1.5,
        }}>
          {PROMPT_TEXT}
        </div>
      </div>

      {/* Reply area */}
      <div style={{ padding: `${REPLY_PAD}px 18px`, overflow: 'hidden' }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
          marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' as const,
        }}>
          Claude
        </div>
        {lines.map((line, i) => {
          const startFrame = PHASE_REPLY_START + i * PHASE_LINE_STAGGER;
          const isAccent = i === 0; // ONE terracotta moment per beat — the first diverging line
          return (
            <ReplyTextLine
              key={i}
              frame={frame}
              fps={fps}
              startFrame={startFrame}
              text={line.text}
              isAccent={isAccent}
              fontSize={FONT_SIZE}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        SAME PROMPT · TWO LANGUAGES · DIVERGING SHAPES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Ask the same question. Get a different shape of reply.
      </div>

      {/* Two windows */}
      {renderWindow('Hindi', HINDI_LINES, windowA_X)}
      {renderWindow('Russian', RUSSIAN_LINES, windowB_X)}

      {/* Illustration disclaimer label */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.14,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: height * 0.014,
        fontStyle: 'italic',
        color: CLAUDE.INK_SOFT,
        opacity: clamp(labelIn, 0, 1),
      }}>
        Illustration — response shapes, not real transcripts.
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(labelIn, 0, 1), fontStyle: 'italic',
      }}>
        Redrawn from Anthropic, Claude's Values Across Models and Languages (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.03,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>

    </AbsoluteFill>
  );
};
