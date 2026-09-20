import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcWhenToEval — Decision guide: when to run evals
 * Three trigger cards: Before deploying | After prompt change | On regression reports
 * Source: eval-driven-agent-development/ — CWC Workshop 2026
 */

export const cwcWhenToEvalSchema = z.object({
  sparkLine: z.string().default("No eval, no signal."),
});
export type CwcWhenToEvalProps = z.infer<typeof cwcWhenToEvalSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const TRIGGERS = [
  {
    title: 'Before deploying',
    icon: '▶',
    desc: 'Establish a baseline score. You need a number to beat before you can claim improvement.',
    highlight: false,
  },
  {
    title: 'After any prompt change',
    icon: '✎',
    desc: 'The most common trigger. Every edit to the system prompt is a hypothesis — the eval tests it.',
    highlight: true,
  },
  {
    title: 'On regression reports',
    icon: '↓',
    desc: 'When production quality drops, run the eval immediately to isolate which metric regressed.',
    highlight: false,
  },
];

export const CwcWhenToEval: React.FC<CwcWhenToEvalProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const blindIn = spring({ frame: frame - 200, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 250, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CARD_W = width * 0.26;
  const CARD_H = height * 0.40;
  const CARD_Y = height * 0.26;
  const CARD_GAP = width * 0.03;
  const TOTAL_W = CARD_W * 3 + CARD_GAP * 2;
  const CARD_START_X = (width - TOTAL_W) / 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        WHEN TO EVAL · TRIGGER GUIDE
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Three moments that demand measurement
      </div>

      {/* Trigger cards */}
      {TRIGGERS.map((trigger, i) => {
        const cardIn = spring({ frame: frame - 25 - i * 40, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
        const cardX = CARD_START_X + i * (CARD_W + CARD_GAP);

        return (
          <div key={trigger.title} style={{
            position: 'absolute',
            left: cardX, top: CARD_Y,
            width: CARD_W, height: CARD_H,
            borderRadius: 14,
            background: trigger.highlight ? `${CLAUDE.SPARK}12` : CLAUDE.CARD,
            border: trigger.highlight ? `2.5px solid ${CLAUDE.SPARK}` : `1.5px solid ${CLAUDE.BORDER}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 20px', gap: 14,
            opacity: clamp(cardIn, 0, 1),
            transform: `scale(${trigger.highlight ? 1.03 : 1}) translateY(${(1 - clamp(cardIn, 0, 1)) * 20}px)`,
          }}>
            {/* Icon */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.032,
              color: trigger.highlight ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              lineHeight: 1,
            }}>
              {trigger.icon}
            </div>
            {/* Title */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
              color: trigger.highlight ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'center' as const, lineHeight: 1.3,
            }}>
              {trigger.title}
            </div>
            <div style={{ width: '60%', height: 1, background: trigger.highlight ? `${CLAUDE.SPARK}40` : CLAUDE.BORDER }} />
            {/* Description */}
            <div style={{
              fontFamily: SERIF, fontSize: height * 0.013,
              color: CLAUDE.INK, lineHeight: 1.6,
              textAlign: 'center' as const, fontStyle: 'italic',
            }}>
              {trigger.desc}
            </div>
          </div>
        );
      })}

      {/* Blind flying callout */}
      <div style={{
        position: 'absolute', left: PAD_X, right: PAD_X,
        top: CARD_Y + CARD_H + height * 0.04,
        background: `${CLAUDE.INK}06`,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: clamp(blindIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.016, color: CLAUDE.INK, fontStyle: 'italic' }}>
          "If you changed the prompt but skipped the eval — you are flying blind."
        </span>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
