import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeApiSurfaces — B02 — three API surfaces + decision tree.
 * Three stacked tiers with connecting arrows and decision criteria.
 * FILL-THE-CANVAS: header 20%, tiers span 21%–90%.
 */

export const claudeApiSurfacesSchema = z.object({
  sparkLine: z.string().default('Default to the simplest tier.'),
});
export type ClaudeApiSurfacesProps = z.infer<typeof claudeApiSurfacesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const SURFACES = [
  {
    tier: 'Tier 1',
    label: 'Claude API',
    sub: 'Single LLM call',
    uses: 'Classification · Summarization · Extraction · Q&A · Batch processing',
    note: 'One request, one response.',
    accent: false,
    delay: 0,
  },
  {
    tier: 'Tier 2',
    label: 'Claude API + Tool Use',
    sub: 'Workflow or agent — you control the loop',
    uses: 'Multi-step pipelines · Custom tools · You host the compute',
    note: 'Maximum flexibility.',
    accent: false,
    delay: 18,
  },
  {
    tier: 'Tier 3',
    label: 'Managed Agents',
    sub: 'Server-managed — Anthropic runs the loop',
    uses: 'Stateful sessions · Per-session container · File ops · SSE event stream',
    note: 'Anthropic runs the agent loop and hosts the workspace.',
    accent: true,
    delay: 36,
  },
];

const CRITERIA = [
  'Complexity — multi-step, hard to specify in advance?',
  'Value — outcome justifies higher cost and latency?',
  'Viability — is Claude capable at this task type?',
  'Cost of error — can errors be caught and recovered?',
];

export const ClaudeApiSurfaces: React.FC<ClaudeApiSurfacesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const criteriaIn = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const surfaceSprings = SURFACES.map(s =>
    spring({ frame: frame - s.delay, fps, config: { damping: 30, stiffness: 110, mass: 0.95 } })
  );
  const criteriaSprings = CRITERIA.map((_, i) =>
    spring({ frame: frame - 58 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.20;
  const LEFT_W = W * 0.50;
  const RIGHT_X = W * 0.57;
  const RIGHT_W = W * 0.37;
  const CARD_H = (H * 0.70) / 3 - 16;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE API · THREE SURFACES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Start simple. Escalate only when needed.
      </div>

      {/* Left: Three surface tiers */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        {SURFACES.map((surf, i) => {
          const op = clamp(surfaceSprings[i], 0, 1);
          return (
            <div key={i}>
              <div style={{
                background: surf.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
                border: `1px solid ${surf.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderLeft: `5px solid ${surf.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderRadius: 14, padding: '18px 22px',
                height: CARD_H, boxSizing: 'border-box' as const,
                boxShadow: surf.accent ? '0 8px 28px rgba(217,119,87,0.15)' : '0 5px 16px rgba(61,57,41,0.07)',
                opacity: op, transform: `translateX(${(1 - op) * 18}px)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <div style={{
                    fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: 2,
                    color: surf.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                    textTransform: 'uppercase' as const,
                  }}>
                    {surf.tier}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: CLAUDE.INK }}>
                    {surf.label}
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 14, color: surf.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT, marginBottom: 6 }}>
                  {surf.sub}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK_SOFT, lineHeight: 1.45, marginBottom: 4 }}>
                  {surf.uses}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, fontStyle: 'italic' }}>
                  {surf.note}
                </div>
              </div>
              {i < 2 && (
                <div style={{
                  display: 'flex', alignItems: 'center', marginLeft: 24, marginTop: 4, marginBottom: 4,
                  fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT, height: 20,
                  opacity: clamp(surfaceSprings[i + 1], 0, 1),
                }}>
                  ↓ add when: {i === 0 ? 'multi-step + code-controlled logic' : 'want Anthropic to run the loop + host compute'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Agent criteria */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 14, padding: '18px 20px',
          opacity: clamp(criteriaIn, 0, 1),
          transform: `translateX(${(1 - clamp(criteriaIn, 0, 1)) * 20}px)`,
        }}>
          <div style={{
            fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 16,
          }}>
            4 criteria before agent tier:
          </div>
          {CRITERIA.map((c, i) => {
            const op = clamp(criteriaSprings[i], 0, 1);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16,
                opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: CLAUDE.SPARK, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: SANS, fontSize: 12, fontWeight: 700, color: '#FFFFFF', marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 17, color: CLAUDE.INK, lineHeight: 1.4 }}>
                  {c}
                </div>
              </div>
            );
          })}
          <div style={{
            fontFamily: SERIF, fontSize: 16, color: CLAUDE.INK, fontStyle: 'italic', lineHeight: 1.5,
            marginTop: 8, borderTop: `1px solid ${CLAUDE.BORDER}`, paddingTop: 12,
            opacity: clamp(criteriaSprings[3], 0, 1),
          }}>
            "No to any → stay at a simpler tier."
          </div>
        </div>
      </div>

      {/* Spark line */}
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
