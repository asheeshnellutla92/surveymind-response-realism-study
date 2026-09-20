import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * McpBuilderAnatomy — B01 — 4-phase workflow + tool quality principles.
 */

export const mcpBuilderAnatomySchema = z.object({
  sparkLine: z.string().default('Research first. Code second. Evaluate third.'),
});
export type McpBuilderAnatomyProps = z.infer<typeof mcpBuilderAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PHASES = [
  { num: '01', label: 'Research', detail: 'MCP spec, SDK docs, API endpoints, tool plan', accent: false },
  { num: '02', label: 'Implement', detail: 'Project setup → API client → Zod tools → structuredContent', accent: true },
  { num: '03', label: 'Review & Test', detail: 'DRY check, MCP Inspector, quality checklist', accent: false },
  { num: '04', label: 'Evaluate', detail: '10 read-only, complex, verifiable XML questions', accent: false },
];

const PRINCIPLES = [
  { label: 'Naming', detail: 'Consistent prefix + action', example: 'github_create_issue' },
  { label: 'Coverage', detail: 'Comprehensive API over workflow shortcuts', example: 'all major endpoints' },
  { label: 'Transport', detail: 'Streamable HTTP (remote) · stdio (local)', example: 'stateless JSON' },
  { label: 'Stack', detail: 'TypeScript + Zod recommended', example: 'Python/Pydantic alternative' },
  { label: 'Errors', detail: 'Actionable messages with next steps', example: 'not just "failed"' },
];

export const McpBuilderAnatomy: React.FC<McpBuilderAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const phaseSprings = PHASES.map((_, i) =>
    spring({ frame: frame - 20 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const principleSprings = PRINCIPLES.map((_, i) =>
    spring({ frame: frame - 48 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.42;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const PHASE_H = (H * 0.64) / 4 - 14;
  const PRIN_H = (H * 0.60) / 5 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        MCP BUILDER · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Four phases. One quality bar.
      </div>

      {/* Left: 4 phases */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 12, padding: '10px 14px',
          marginBottom: 14, opacity: clamp(triggerIn, 0, 1),
          transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 10}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>
            TRIGGER
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.45 }}>
            "build MCP server" · "integrate API with Claude" · "create MCP tools"
          </div>
        </div>

        {PHASES.map((phase, i) => {
          const op = clamp(phaseSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: phase.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${phase.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${phase.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 8, padding: '10px 14px',
              height: PHASE_H, boxSizing: 'border-box' as const,
              marginBottom: 10,
              boxShadow: phase.accent ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                fontFamily: MONO, fontSize: 18, fontWeight: 700, color: CLAUDE.SPARK,
                flexShrink: 0, width: 28,
              }}>
                {phase.num}
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: phase.accent ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 3 }}>
                  {phase.label}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT }}>
                  {phase.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: 5 tool quality principles */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 14,
          opacity: clamp(principleSprings[0], 0, 1),
        }}>
          TOOL QUALITY PRINCIPLES:
        </div>
        {PRINCIPLES.map((p, i) => {
          const op = clamp(principleSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.INK}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              height: PRIN_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{p.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>{p.example}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT }}>{p.detail}</div>
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
