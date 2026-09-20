import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * McpIntPatterns — B02 — tool naming format + integration patterns + lifecycle.
 */

export const mcpIntPatternsSchema = z.object({
  sparkLine: z.string().default("Tool name is the contract. One underscore wrong: silent failure."),
});
export type McpIntPatternsProps = z.infer<typeof mcpIntPatternsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PATTERNS = [
  {
    label: 'SIMPLE WRAPPER',
    detail: 'Command + allowed-tools + user interaction for validation',
    color: CLAUDE.SPARK,
  },
  {
    label: 'AUTONOMOUS AGENT',
    detail: 'Agent uses MCP tools across multi-step workflows, no user needed',
    color: '#4A7C59',
  },
  {
    label: 'MULTI-SERVER',
    detail: 'One plugin bundles multiple servers — GitHub + Jira in one workflow',
    color: CLAUDE.SPARK,
  },
];

export const McpIntPatterns: React.FC<McpIntPatternsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const nameIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const patternSprings = PATTERNS.map((_, i) =>
    spring({ frame: frame - 76 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const lifecycleIn = spring({ frame: frame - 105, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });

  const NAME_TOP = H * 0.27;
  const PATTERN_TOP = H * 0.57;
  const PATTERN_H = (H * 0.28) / 3 - 9;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        MCP INTEGRATION · TOOL NAMING + PATTERNS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Tool name: exact match required.
      </div>

      {/* Tool naming format box */}
      <div style={{
        position: 'absolute', top: NAME_TOP, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 14, padding: '18px 26px',
        opacity: clamp(nameIn, 0, 1),
        transform: `translateY(${(1 - clamp(nameIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, marginBottom: 10 }}>TOOL NAMING FORMAT</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' as const, marginBottom: 12 }}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT }}>mcp</span>
          <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: CLAUDE.SPARK }}>__</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: '#4A7C59' }}>plugin</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT }}>_</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, fontStyle: 'italic' }}>plugin-name</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT }}>_</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, fontStyle: 'italic' }}>server-name</span>
          <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: CLAUDE.SPARK }}>__</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, fontStyle: 'italic' }}>tool-name</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, marginBottom: 3 }}>Example: plugin=asana, server=asana, tool=create_task</div>
            <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.INK }}>mcp__plugin_asana_asana__asana_create_task</div>
          </div>
          <div style={{
            background: 'rgba(217,119,87,0.10)', border: `1px solid ${CLAUDE.SPARK}`,
            borderRadius: 6, padding: '4px 10px',
            fontFamily: SANS, fontSize: 11, color: CLAUDE.SPARK, whiteSpace: 'nowrap' as const,
          }}>
            Wrong → silent fail
          </div>
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 20 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, color: '#4A7C59' }}>
            ✓ <span style={{ fontFamily: MONO }}>mcp__plugin_asana_asana__asana_create_task</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.SPARK }}>
            ✗ <span style={{ fontFamily: MONO }}>mcp__plugin_asana_asana__*</span> (wildcard)
          </div>
        </div>
      </div>

      {/* Patterns section */}
      <div style={{
        position: 'absolute', top: PATTERN_TOP - 20, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(patternSprings[0], 0, 1),
      }}>
        INTEGRATION PATTERNS
      </div>

      {PATTERNS.map((p, i) => {
        const op = clamp(patternSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: PATTERN_TOP + i * (PATTERN_H + 10),
            left: W * 0.05, width: W * 0.52,
            height: PATTERN_H, boxSizing: 'border-box' as const,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${p.color}`,
            borderRadius: 9, padding: '10px 14px',
            boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: p.color, marginBottom: 3 }}>{p.label}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{p.detail}</div>
          </div>
        );
      })}

      {/* Lifecycle callout */}
      <div style={{
        position: 'absolute',
        top: PATTERN_TOP,
        left: W * 0.60, width: W * 0.35,
        background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
        borderTop: `3px solid #4A7C59`,
        borderRadius: 10, padding: '12px 16px',
        opacity: clamp(lifecycleIn, 0, 1),
        transform: `translateY(${(1 - clamp(lifecycleIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#4A7C59', marginBottom: 8 }}>LIFECYCLE</div>
        {[
          'Plugin enables → server starts',
          'First tool use → connection established',
          'Tools available as mcp__...',
          'Config change → restart required',
        ].map((step, i) => (
          <div key={i} style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, marginBottom: 5 }}>
            <span style={{ color: CLAUDE.SPARK, fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>{step}
          </div>
        ))}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 26, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
