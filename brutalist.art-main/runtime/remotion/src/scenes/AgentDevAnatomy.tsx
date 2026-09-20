import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AgentDevAnatomy — B01 — Frontmatter fields + system prompt structure.
 */

export const agentDevAnatomySchema = z.object({
  sparkLine: z.string().default('Frontmatter triggers. Body becomes the system prompt.'),
});
export type AgentDevAnatomyProps = z.infer<typeof agentDevAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FRONTMATTER = [
  { field: 'name', detail: '3-50 chars · lowercase-hyphens · alphanumeric start/end', highlight: false },
  { field: 'description', detail: '"Use this agent when…" + 2-4 example blocks — MOST CRITICAL', highlight: true },
  { field: 'model', detail: 'inherit (recommended) · sonnet · opus · haiku', highlight: false },
  { field: 'color', detail: 'blue/cyan=analysis · green=success · yellow=caution · red=security · magenta=creative', highlight: false },
  { field: 'tools?', detail: 'Array of tool names — omit = all tools; list = least privilege', highlight: false },
];

const SYSTEM_PROMPT = [
  { n: '01', label: 'Core Responsibilities', detail: 'Numbered list of what the agent does' },
  { n: '02', label: 'Analysis Process', detail: 'Numbered step-by-step workflow' },
  { n: '03', label: 'Quality Standards', detail: 'Bulleted criteria for output quality' },
  { n: '04', label: 'Output Format', detail: 'What to return and how to structure it' },
  { n: '05', label: 'Edge Cases', detail: 'Named situations and how to handle them' },
];

export const AgentDevAnatomy: React.FC<AgentDevAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 110, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const fmSprings = FRONTMATTER.map((_, i) =>
    spring({ frame: frame - 24 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const spSprings = SYSTEM_PROMPT.map((_, i) =>
    spring({ frame: frame - 24 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.31;
  const COL_W = W * 0.40;
  const FM_H = (H * 0.57) / 5 - 10;
  const SP_H = (H * 0.57) / 5 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        AGENT DEVELOPMENT · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Frontmatter triggers. Body is the system prompt.
      </div>

      {/* TRIGGER */}
      <div style={{
        position: 'absolute', top: H * 0.228, left: W * 0.08, right: W * 0.08,
        background: `rgba(217,119,87,0.07)`, border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 14, padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        opacity: clamp(triggerIn, 0, 1),
        transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: CLAUDE.SPARK, whiteSpace: 'nowrap' as const }}>AGENTS</span>
        <span style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK }}>
          Autonomous multi-step tasks —{' '}
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>not commands</span>{' '}
          (user-initiated). Markdown file: YAML frontmatter + body as system prompt.
        </span>
      </div>

      {/* Frontmatter column */}
      <div style={{ position: 'absolute', left: W * 0.06, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(fmSprings[0], 0, 1),
        }}>
          YAML FRONTMATTER
        </div>
        {FRONTMATTER.map((fm, i) => {
          const op = clamp(fmSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: fm.highlight ? 'rgba(217,119,87,0.08)' : '#FFFFFF',
              border: `1px solid ${fm.highlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${fm.highlight ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              height: FM_H, boxSizing: 'border-box' as const,
              boxShadow: fm.highlight ? '0 3px 12px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: fm.highlight ? CLAUDE.SPARK : '#4A7C59' }}>{fm.field}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4, marginTop: 3 }}>{fm.detail}</div>
            </div>
          );
        })}
      </div>

      {/* System prompt column */}
      <div style={{ position: 'absolute', left: W * 0.53, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(spSprings[0], 0, 1),
        }}>
          SYSTEM PROMPT BODY (2ND PERSON)
        </div>
        {SYSTEM_PROMPT.map((sp, i) => {
          const op = clamp(spSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              height: SP_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#4A7C59' }}>{sp.n}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{sp.label}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4, marginTop: 3 }}>{sp.detail}</div>
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
