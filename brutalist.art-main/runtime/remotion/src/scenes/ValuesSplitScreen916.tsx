import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { valuesSplitScreenSchema } from './ValuesSplitScreen';
import type { ValuesSplitScreenProps } from './ValuesSplitScreen';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ValuesSplitScreen916 — portrait 9:16 (1080×1920) version of ValuesSplitScreen.
 * Same schema. Side-by-side windows → stacked top/bottom.
 * Safe zone: top 12% (~230px) and bottom 25% (~480px) reserved for platform UI.
 * Active content band: y 230–1440 (1210px tall), x 54–1026.
 * Per REFLOW rule: fill the width, stack panels top-to-bottom.
 */

export const valuesSplitScreen916Schema = valuesSplitScreenSchema;
export type ValuesSplitScreen916Props = ValuesSplitScreenProps;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PROMPT_TEXT = 'Give me feedback on my business plan.';

const HINDI_LINES = [
  { text: 'What a thoughtful and ambitious plan — there is real potential here.', warmth: true, width: 0.88 },
  { text: 'The market opportunity you have identified is genuine and well-framed.', warmth: false, width: 0.82 },
  { text: 'A few areas to develop further as you move forward —', warmth: false, width: 0.70 },
];

const RUSSIAN_LINES = [
  { text: 'The core assumption on page 2 is unsupported.', warmth: false, width: 0.62, isFirstRigor: true },
  { text: 'Revenue projections are 3× the sector median — no justification given.', warmth: false, width: 0.84 },
  { text: 'Unit economics are not shown. This is required before any decision.', warmth: false, width: 0.78 },
];

const PHASE_TITLE = 0;
const PHASE_WINDOWS_IN = 20;
const PHASE_PROMPT_IN = 50;
const PHASE_REPLY_START = 80;
const PHASE_LINE_STAGGER = 18;
const PHASE_LABEL_IN = 180;
const PHASE_SPARK_IN = 210;

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
      lineHeight: 1.45,
      marginBottom: 6,
      opacity: t,
      transform: `translateX(${(1 - t) * 8}px)`,
    }}>
      {text}
    </div>
  );
};

export const ValuesSplitScreen916: React.FC<ValuesSplitScreen916Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Portrait layout — full width, stacked panels
  // Safe zones: top 12% = 230px, bottom 25% = 480px
  // Active band: 230px to 1440px = 1210px usable
  const SAFE_TOP = height * 0.14;   // give a bit more breathing room (eyebrow + title)
  const PAD_X = width * 0.05;
  const WINDOW_W = width - PAD_X * 2;  // ~972px, ~90% of 1080

  // Two windows stacked: each gets ~42% of height in active band
  // Total active: 1440-230 = 1210px, but title takes ~160px, footer takes ~120px
  // Window area: ~1210 - 160 - 120 = 930px; each window = ~450px (with 10px gap)
  const TITLE_AREA_H = height * 0.14;
  const WINDOW_H = height * 0.34;
  const WINDOW_GAP = height * 0.012;
  const WINDOW_A_TOP = SAFE_TOP + TITLE_AREA_H;
  const WINDOW_B_TOP = WINDOW_A_TOP + WINDOW_H + WINDOW_GAP;
  const CHROME_H = height * 0.055;
  const PROMPT_AREA_H = height * 0.075;
  const REPLY_PAD = height * 0.018;
  const FONT_SIZE = height * 0.014;

  const titleIn = spring({ frame: frame - PHASE_TITLE, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const windowsIn = spring({ frame: frame - PHASE_WINDOWS_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const promptIn = spring({ frame: frame - PHASE_PROMPT_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.8 } });
  const labelIn = spring({ frame: frame - PHASE_LABEL_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const renderWindow = (
    language: string,
    lines: typeof HINDI_LINES,
    top: number,
  ) => (
    <div style={{
      position: 'absolute',
      left: PAD_X,
      top,
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
        <div style={{ display: 'flex', gap: 6 }}>
          {[CLAUDE.BORDER, CLAUDE.BORDER, CLAUDE.BORDER].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
          color: CLAUDE.INK, letterSpacing: 1.5, textTransform: 'uppercase' as const,
        }}>
          {language}
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST }}>
          Claude
        </div>
      </div>

      {/* Prompt area */}
      <div style={{
        padding: `10px 16px 8px`,
        borderBottom: `1px solid ${CLAUDE.BORDER}`,
        background: CLAUDE.PAGE,
        opacity: clamp(promptIn, 0, 1),
        minHeight: PROMPT_AREA_H,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
          marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' as const,
        }}>
          You
        </div>
        <div style={{
          fontFamily: SERIF, fontSize: FONT_SIZE, color: CLAUDE.INK, lineHeight: 1.4,
        }}>
          {PROMPT_TEXT}
        </div>
      </div>

      {/* Reply area */}
      <div style={{ padding: `${REPLY_PAD}px 16px`, overflow: 'hidden' }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
          marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' as const,
        }}>
          Claude
        </div>
        {lines.map((line, i) => {
          const startFrame = PHASE_REPLY_START + i * PHASE_LINE_STAGGER;
          const isAccent = i === 0;
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
        position: 'absolute', left: PAD_X, top: SAFE_TOP,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        SAME PROMPT · TWO LANGUAGES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, right: PAD_X,
        top: SAFE_TOP + height * 0.040,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
        lineHeight: 1.2,
      }}>
        Same question. Different shape of reply.
      </div>

      {/* Window A — Hindi (top) */}
      {renderWindow('Hindi', HINDI_LINES, WINDOW_A_TOP)}

      {/* Window B — Russian (bottom) */}
      {renderWindow('Russian', RUSSIAN_LINES, WINDOW_B_TOP)}

      {/* Illustration disclaimer */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: WINDOW_B_TOP + WINDOW_H + height * 0.015,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: height * 0.013,
        fontStyle: 'italic',
        color: CLAUDE.INK_SOFT,
        opacity: clamp(labelIn, 0, 1),
      }}>
        Illustration — response shapes, not real transcripts.
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
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
        <span style={{ fontFamily: SERIF, fontSize: height * 0.020, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
