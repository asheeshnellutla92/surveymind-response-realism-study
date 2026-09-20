import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ExampleCommandDesign — B02 — format reference vs functional demo + allowed-tools tradeoffs.
 */

export const exampleCommandDesignSchema = z.object({
  sparkLine: z.string().default('Format reference, not a demo. Allowed-tools: pre-approved but unscoped in the template.'),
});
export type ExampleCommandDesignProps = z.infer<typeof exampleCommandDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LEFT_CARDS = [
  {
    label: 'Format reference (not a demo)',
    items: [
      'Invoking it produces only: parse → perform → report',
      'No tool calls executed — documentation you can copy',
      'Copy + fill in the body to build a real command',
    ],
    warn: false,
  },
  {
    label: 'Allowed-tools pre-approval',
    items: [
      'Pre-approved tools skip permission prompts during invocation',
      'Scope-limited: applies only while the skill runs',
      'Template lists Read, Glob, Grep, Bash — a broad set for any example',
    ],
    warn: true,
  },
];

const RIGHT_RULES = [
  { label: 'name = directory name', detail: 'The name field must match the directory under skills/. Mismatch = skill not found.', warn: true },
  { label: 'Narrow allowed-tools', detail: 'Copy only the tools your command actually uses. Bash gives full shell — only include if needed.', warn: true },
  { label: 'Legacy equivalence', detail: 'commands/<name>.md loads identically. Choose skills/<name>/SKILL.md for multi-file commands.', warn: false },
  { label: 'model override', detail: '"haiku" · "sonnet" · "opus". No default guidance in template — choose based on task complexity and cost.', warn: false },
];

export const ExampleCommandDesign: React.FC<ExampleCommandDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const leftSprings = LEFT_CARDS.map((_, i) =>
    spring({ frame: frame - 18 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const rightSprings = RIGHT_RULES.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const LEFT_H = (H * 0.57) / 2 - 14;
  const RIGHT_H = (H * 0.57) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        EXAMPLE COMMAND · DESIGN + TRADEOFFS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        A template to copy, not a skill to invoke.
      </div>

      {/* Left: two design cards */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(leftSprings[0], 0, 1),
        }}>
          DESIGN POINTS
        </div>
        {LEFT_CARDS.map((card, i) => {
          const op = clamp(leftSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: card.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${card.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${card.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 14,
              height: LEFT_H, boxSizing: 'border-box' as const,
              boxShadow: card.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: card.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 8 }}>{card.label}</div>
              {card.items.map((item, j) => (
                <div key={j} style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.5, marginBottom: 3 }}>• {item}</div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Right: practical rules */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          PRACTICAL RULES
        </div>
        {RIGHT_RULES.map((row, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 8, padding: '9px 12px', marginBottom: 10,
              height: RIGHT_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 3 }}>{row.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{row.detail}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
