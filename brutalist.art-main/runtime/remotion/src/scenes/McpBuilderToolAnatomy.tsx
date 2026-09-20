import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * McpBuilderToolAnatomy — B02 — Tool anatomy verbatim: Zod schema, annotations, outputSchema, naming.
 */

export const mcpBuilderToolAnatomySchema = z.object({
  sparkLine: z.string().default('Name it clearly. Type it strictly. Describe it once.'),
});
export type McpBuilderToolAnatomyProps = z.infer<typeof mcpBuilderToolAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const TOOL_PARTS = [
  {
    label: 'Input Schema',
    code: 'z.object({ repo: z.string(), title: z.string() })',
    detail: 'Zod (TS) or Pydantic (Python) — typed, constrained, descriptions + examples',
    accent: true,
  },
  {
    label: 'Output Schema',
    code: 'outputSchema: IssueSchema',
    detail: 'Define structuredContent so clients know what to expect',
    accent: false,
  },
  {
    label: 'Annotations',
    code: 'readOnlyHint · destructiveHint · idempotentHint · openWorldHint',
    detail: 'Tell agents how to use the tool safely',
    accent: false,
  },
  {
    label: 'Error Messages',
    code: '"Rate limit exceeded. Retry after 60s."',
    detail: 'Actionable — name the problem, suggest the fix',
    accent: false,
  },
];

const NAMING_RULES = [
  { rule: 'Consistent prefix', example: 'github_', note: 'matches the service' },
  { rule: 'Action verb', example: 'create · list · get · delete', note: 'operation type clear' },
  { rule: 'Resource noun', example: 'issue · repo · pr', note: 'what it acts on' },
  { rule: 'Full example', example: 'github_create_issue', note: 'no ambiguity' },
  { rule: 'Concise description', example: '1 sentence + params + return', note: 'not a paragraph' },
];

export const McpBuilderToolAnatomy: React.FC<McpBuilderToolAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const partSprings = TOOL_PARTS.map((_, i) =>
    spring({ frame: frame - 22 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const namingSprings = NAMING_RULES.map((_, i) =>
    spring({ frame: frame - 50 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const PART_H = (H * 0.60) / 4 - 12;
  const NAMING_H = (H * 0.58) / 5 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        MCP BUILDER · TOOL ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Schema. Output. Annotations. Errors.
      </div>

      {/* Left: 4 tool parts */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 12, padding: '10px 14px', marginBottom: 14,
          opacity: clamp(calloutIn, 0, 1),
          transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 10}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>
            EVERY TOOL NEEDS ALL FOUR:
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.5 }}>
            InputSchema · OutputSchema · Annotations · ActionableErrors
          </div>
        </div>

        {TOOL_PARTS.map((part, i) => {
          const op = clamp(partSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: part.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${part.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${part.accent ? CLAUDE.SPARK : CLAUDE.INK}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10,
              height: PART_H, boxSizing: 'border-box' as const,
              boxShadow: part.accent ? '0 6px 18px rgba(217,119,87,0.12)' : '0 4px 12px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: part.accent ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 5 }}>
                {part.label}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.SPARK, marginBottom: 4 }}>
                {part.code}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>
                {part.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: naming + description rules */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 14,
          opacity: clamp(namingSprings[0], 0, 1),
        }}>
          NAMING RULES:
        </div>
        {NAMING_RULES.map((n, i) => {
          const op = clamp(namingSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.INK}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              height: NAMING_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: CLAUDE.INK }}>{n.rule}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>{n.example}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{n.note}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
