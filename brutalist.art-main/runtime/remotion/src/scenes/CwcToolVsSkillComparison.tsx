import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcToolVsSkillComparison — Side-by-side tool vs skill comparison
 * LEFT: Tool (stateless) | RIGHT: Skill (stateful)
 * Source: agent-decomposition/ — CWC Workshop 2026
 */

export const cwcToolVsSkillComparisonSchema = z.object({
  sparkLine: z.string().default("Tools call. Skills think."),
});
export type CwcToolVsSkillComparisonProps = z.infer<typeof cwcToolVsSkillComparisonSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const TOOL_ROWS = [
  { label: 'Type', value: 'Stateless function' },
  { label: 'Memory', value: 'None' },
  { label: 'Steps', value: 'Single call' },
  { label: 'Returns', value: 'Typed result' },
  { label: 'Context', value: 'Not consumed' },
];

const SKILL_ROWS = [
  { label: 'Type', value: 'Sub-agent' },
  { label: 'Memory', value: 'Own context window' },
  { label: 'Steps', value: 'Multi-step plan' },
  { label: 'Returns', value: 'Structured output' },
  { label: 'Context', value: 'Isolated budget' },
];

export const CwcToolVsSkillComparison: React.FC<CwcToolVsSkillComparisonProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const toolHeaderIn = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const skillHeaderIn = spring({ frame: frame - 35, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const whenIn = spring({ frame: frame - 220, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 260, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const COL_W = width * 0.38;
  const COL_H = height * 0.52;
  const COL_Y = height * 0.23;
  const TOOL_X = PAD_X;
  const SKILL_X = width * 0.54;
  const ROW_H = COL_H / (TOOL_ROWS.length + 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        TOOL VS SKILL · WHEN TO USE EACH
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Stateless call vs. stateful sub-agent
      </div>

      {/* TOOL column */}
      <div style={{
        position: 'absolute', left: TOOL_X, top: COL_Y,
        width: COL_W, borderRadius: 12,
        background: CLAUDE.CARD, border: `1.5px solid ${CLAUDE.BORDER}`,
        overflow: 'hidden',
        opacity: clamp(toolHeaderIn, 0, 1),
        transform: `translateY(${(1 - clamp(toolHeaderIn, 0, 1)) * 16}px)`,
      }}>
        {/* Header row */}
        <div style={{
          background: CLAUDE.BORDER, padding: '12px 20px',
          fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
          color: CLAUDE.INK_SOFT, letterSpacing: 2, textTransform: 'uppercase' as const,
        }}>
          Tool (stateless)
        </div>
        {/* Code sig */}
        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${CLAUDE.BORDER}` }}>
          <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK }}>
            lookup_price(ticker: str) -&gt; float
          </div>
        </div>
        {/* Rows */}
        {TOOL_ROWS.map((row, i) => {
          const rowIn = spring({ frame: frame - 45 - i * 18, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 20px',
              borderBottom: i < TOOL_ROWS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              opacity: clamp(rowIn, 0, 1),
            }}>
              <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT, fontWeight: 600 }}>{row.label}</div>
              <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK }}>{row.value}</div>
            </div>
          );
        })}
      </div>

      {/* SKILL column */}
      <div style={{
        position: 'absolute', left: SKILL_X, top: COL_Y,
        width: COL_W, borderRadius: 12,
        background: CLAUDE.CARD, border: `1.5px solid ${CLAUDE.SPARK}`,
        overflow: 'hidden',
        opacity: clamp(skillHeaderIn, 0, 1),
        transform: `translateY(${(1 - clamp(skillHeaderIn, 0, 1)) * 16}px)`,
      }}>
        {/* Header row — terracotta accent */}
        <div style={{
          background: `${CLAUDE.SPARK}22`, padding: '12px 20px',
          fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
          color: CLAUDE.SPARK, letterSpacing: 2, textTransform: 'uppercase' as const,
          borderBottom: `1px solid ${CLAUDE.SPARK}`,
        }}>
          Skill (stateful)
        </div>
        {/* Code sig */}
        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${CLAUDE.BORDER}` }}>
          <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK }}>
            run_skill("forecasting", ctx)
          </div>
        </div>
        {/* Rows */}
        {SKILL_ROWS.map((row, i) => {
          const rowIn = spring({ frame: frame - 60 - i * 18, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 20px',
              borderBottom: i < SKILL_ROWS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              opacity: clamp(rowIn, 0, 1),
            }}>
              <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT, fontWeight: 600 }}>{row.label}</div>
              <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.SPARK, fontWeight: 600 }}>{row.value}</div>
            </div>
          );
        })}
      </div>

      {/* When to use */}
      <div style={{
        position: 'absolute',
        left: PAD_X, right: PAD_X,
        top: COL_Y + COL_H + height * 0.03,
        background: `${CLAUDE.INK_SOFT}10`,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, padding: '12px 20px',
        opacity: clamp(whenIn, 0, 1),
      }}>
        <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, fontWeight: 700 }}>
          When to use:
        </span>
        <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK, marginLeft: 12 }}>
          Tool: lookup, calculate, fetch.
        </span>
        <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.SPARK, marginLeft: 12, fontWeight: 700 }}>
          Skill: plan, execute, verify.
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
