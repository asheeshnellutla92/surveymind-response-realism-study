import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcDecompositionTree — C4 centerpiece for "The 402-Line Prompt"
 * Decomposition tree: 402-line monolith splitting into 15-line core +
 * 5 skill modules + 12 tools, with before/after cost/latency metrics.
 * Source: agent-decomposition/ — CWC Workshop 2026
 */

export const cwcDecompositionTreeSchema = z.object({
  sparkLine: z.string().default('402 lines → 15 core + skills.'),
});
export type CwcDecompositionTreeProps = z.infer<typeof cwcDecompositionTreeSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const SKILLS = [
  'reorder-policy',
  'forecasting',
  'notification-templates',
  'vendor-lookup',
  'audit-logging',
];

export const CwcDecompositionTree: React.FC<CwcDecompositionTreeProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.05;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const monolithIn = spring({ frame: frame - 15, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const beforeIn = spring({ frame: frame - 25, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const arrowSplitIn = spring({ frame: frame - 60, fps, config: { damping: 24, stiffness: 90, mass: 1.1 } });
  const coreIn = spring({ frame: frame - 80, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 280, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Layout: monolith on left, split on right
  const MONO_X = PAD_X;
  const MONO_Y = height * 0.25;
  const MONO_W = width * 0.20;
  const MONO_H = height * 0.35;

  const SPLIT_X = PAD_X + MONO_W + width * 0.12;
  const CORE_Y = height * 0.22;
  const CORE_W = width * 0.16;
  const CORE_H = height * 0.13;

  const SKILL_X = SPLIT_X + CORE_W + width * 0.06;
  const SKILL_Y_START = height * 0.20;
  const SKILL_H = height * 0.075;
  const SKILL_W = width * 0.18;
  const SKILL_GAP = height * 0.095;

  const TOOLS_X = SKILL_X + SKILL_W + width * 0.05;
  const TOOLS_Y = height * 0.38;
  const TOOLS_W = width * 0.12;
  const TOOLS_H = height * 0.12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        AGENT DECOMPOSITION · MONOLITH → CORE + SKILLS
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        402 lines → 15 core: same correctness, 5× faster
      </div>

      {/* MONOLITH block */}
      <div style={{
        position: 'absolute',
        left: MONO_X, top: MONO_Y,
        width: MONO_W, height: MONO_H,
        borderRadius: 10,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        opacity: clamp(monolithIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(monolithIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
          MONOLITH
        </div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.030, fontWeight: 700, color: CLAUDE.SPARK }}>
          402
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>lines + 12 tools</div>
        <div style={{
          width: '80%', height: 2, background: CLAUDE.BORDER, margin: '4px 0',
        }} />
        {/* Compressed text lines representing the prompt */}
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{
            width: `${60 + Math.sin(i * 1.3) * 20}%`, height: 4,
            background: CLAUDE.BORDER, borderRadius: 2, margin: '1px 0',
          }} />
        ))}
      </div>

      {/* Before metrics */}
      <div style={{
        position: 'absolute',
        left: MONO_X, top: MONO_Y + MONO_H + height * 0.02,
        width: MONO_W,
        background: `${CLAUDE.SPARK}12`, border: `1px solid ${CLAUDE.SPARK}`,
        borderRadius: 8, padding: '8px 12px',
        opacity: clamp(beforeIn, 0, 1),
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const }}>Before</div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.014, color: CLAUDE.INK, marginTop: 4, lineHeight: 1.8 }}>
          102 tool calls<br/>488 seconds
        </div>
      </div>

      {/* SPLIT ARROW */}
      <svg style={{
        position: 'absolute', left: MONO_X + MONO_W, top: MONO_Y,
        width: SPLIT_X - (MONO_X + MONO_W), height: MONO_H,
        overflow: 'visible', opacity: clamp(arrowSplitIn, 0, 1),
      }}>
        <defs>
          <marker id="split1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.SPARK} />
          </marker>
        </defs>
        {/* Arrow to core */}
        <line x1={0} y1={MONO_H * 0.35} x2={SPLIT_X - (MONO_X + MONO_W) - 4} y2={CORE_Y - MONO_Y + CORE_H / 2}
          stroke={CLAUDE.SPARK} strokeWidth={2.5} markerEnd="url(#split1)" />
        {/* Arrows to skills (drawn as light lines) */}
        {SKILLS.map((_, i) => {
          const sy = SKILL_Y_START - MONO_Y + i * SKILL_GAP + SKILL_H / 2;
          return (
            <line key={i}
              x1={0} y1={MONO_H * 0.5}
              x2={SPLIT_X - (MONO_X + MONO_W) + CORE_W + width * 0.06 - 4} y2={sy}
              stroke={CLAUDE.INK_SOFT} strokeWidth={1} strokeDasharray="4 4"
            />
          );
        })}
        {/* Split label */}
        <text x={(SPLIT_X - (MONO_X + MONO_W)) / 2} y={MONO_H * 0.25}
          textAnchor="middle" fontFamily={SERIF} fontSize={height * 0.016}
          fontStyle="italic" fill={CLAUDE.SPARK}>split</text>
      </svg>

      {/* CORE block */}
      <div style={{
        position: 'absolute',
        left: SPLIT_X, top: CORE_Y,
        width: CORE_W, height: CORE_H,
        borderRadius: 10,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
        opacity: clamp(coreIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(coreIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, textTransform: 'uppercase' as const }}>Core prompt</div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.028, fontWeight: 700, color: CLAUDE.SPARK }}>15</div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT }}>lines</div>
      </div>

      {/* After metrics */}
      <div style={{
        position: 'absolute',
        left: SPLIT_X, top: CORE_Y + CORE_H + height * 0.02,
        width: CORE_W,
        background: '#4CAF5018', border: '1px solid #4CAF50',
        borderRadius: 8, padding: '8px 12px',
        opacity: clamp(coreIn, 0, 1),
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: '#4CAF50', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const }}>After</div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.013, color: CLAUDE.INK, marginTop: 4, lineHeight: 1.8 }}>
          3 scripts<br/>~100 seconds<br/>≈5× faster
        </div>
      </div>

      {/* SKILL MODULES */}
      {SKILLS.map((skill, i) => {
        const skillIn = spring({ frame: frame - 95 - i * 15, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
        return (
          <div key={skill} style={{
            position: 'absolute',
            left: SKILL_X,
            top: SKILL_Y_START + i * SKILL_GAP,
            width: SKILL_W, height: SKILL_H,
            borderRadius: 8,
            background: CLAUDE.CARD,
            border: `1.5px solid ${CLAUDE.BORDER}`,
            display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 10,
            opacity: clamp(skillIn, 0, 1),
            transform: `translateX(${(1 - clamp(skillIn, 0, 1)) * 14}px)`,
          }}>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
              color: CLAUDE.INK_SOFT, letterSpacing: 1,
              textTransform: 'uppercase' as const,
              minWidth: 48,
            }}>
              skill
            </div>
            <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.INK }}>
              {skill}
            </div>
          </div>
        );
      })}

      {/* TOOLS badge */}
      <div style={{
        position: 'absolute',
        left: TOOLS_X, top: TOOLS_Y,
        width: TOOLS_W, height: TOOLS_H,
        borderRadius: 10,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
        opacity: clamp(coreIn, 0, 1),
      }}>
        <div style={{ fontFamily: MONO, fontSize: height * 0.024, fontWeight: 700, color: CLAUDE.INK }}>12</div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT }}>tools retained</div>
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.12,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Claude Code Workshops (Anthropic) — agent-decomposition (StockPilot)
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
