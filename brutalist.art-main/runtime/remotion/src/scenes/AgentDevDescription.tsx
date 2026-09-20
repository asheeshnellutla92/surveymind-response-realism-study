import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AgentDevDescription — B02 — description field anatomy + creation paths.
 */

export const agentDevDescriptionSchema = z.object({
  sparkLine: z.string().default('Examples teach triggering. No examples, no trigger.'),
});
export type AgentDevDescriptionProps = z.infer<typeof agentDevDescriptionSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const DESC_RULES = [
  { label: 'Lead with conditions', detail: '"Use this agent when [conditions]. Examples:"', mono: true },
  { label: 'Example block required', detail: 'Context: scenario · user: request · assistant: response · <commentary>: why', mono: false },
  { label: '2-4 example blocks', detail: 'Cover different phrasings + at least one when-NOT-to-use case', mono: false },
  { label: 'Be specific about NOT using', detail: 'Prevents false positives — what looks similar but should not trigger?', mono: false },
];

const CREATION_PATHS = [
  {
    label: 'AI-ASSISTED',
    steps: [
      'Prompt Claude: request JSON with identifier, whenToUse, systemPrompt',
      'Convert JSON output to agent file format with frontmatter',
      'Validate + test triggering',
    ],
    color: CLAUDE.SPARK,
  },
  {
    label: 'MANUAL (9 STEPS)',
    steps: [
      'Choose identifier → write description → select model → choose color',
      'Define tools → write system prompt → save agents/agent-name.md',
      'Validate with validate-agent.sh → test with test-agent-trigger.sh',
    ],
    color: '#4A7C59',
  },
];

export const AgentDevDescription: React.FC<AgentDevDescriptionProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const descSprings = DESC_RULES.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const pathSprings = CREATION_PATHS.map((_, i) =>
    spring({ frame: frame - 80 - i * 12, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } })
  );

  const COL_TOP = H * 0.28;
  const COL_W = W * 0.40;
  const RULE_H = (H * 0.44) / 4 - 11;
  const PATH_H = (H * 0.22) / 2 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        AGENT DEVELOPMENT · DESCRIPTION FIELD + CREATION
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        description: the triggering contract.
      </div>

      {/* Description rules column */}
      <div style={{ position: 'absolute', left: W * 0.06, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(descSprings[0], 0, 1),
        }}>
          DESCRIPTION FIELD RULES
        </div>
        {DESC_RULES.map((rule, i) => {
          const op = clamp(descSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: `rgba(217,119,87,0.05)`, border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '12px 14px', marginBottom: 10,
              height: RULE_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 10px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{rule.label}</div>
              <div style={{
                fontFamily: rule.mono ? MONO : SANS,
                fontSize: rule.mono ? 11 : 12,
                color: CLAUDE.INK_SOFT, lineHeight: 1.4,
              }}>
                {rule.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Example block format box */}
      <div style={{
        position: 'absolute', left: W * 0.53, top: COL_TOP, width: COL_W,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(descSprings[0], 0, 1),
        }}>
          EXAMPLE BLOCK FORMAT
        </div>
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderLeft: `4px solid #4A7C59`,
          borderRadius: 10, padding: '14px 18px',
          boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
          opacity: clamp(descSprings[0], 0, 1),
          transform: `translateX(${(1 - clamp(descSprings[0], 0, 1)) * 12}px)`,
        }}>
          {[
            ['<example>', ''],
            ['Context:', 'Scenario description'],
            ['user:', '"What user says"'],
            ['assistant:', '"How Claude responds"'],
            ['<commentary>', 'Why this agent fires'],
            ['</example>', ''],
          ].map(([key, val], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK, minWidth: 100 }}>{key}</span>
              {val && <span style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT }}>{val}</span>}
            </div>
          ))}
        </div>

        {/* Color guide */}
        <div style={{
          marginTop: 16, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 10, padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
          opacity: clamp(descSprings[1], 0, 1),
          transform: `translateX(${(1 - clamp(descSprings[1], 0, 1)) * 12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK_SOFT, letterSpacing: 2, marginBottom: 8 }}>COLOR GUIDE</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {[
              { c: '#0066CC', label: 'blue/cyan: analysis' },
              { c: '#4A7C59', label: 'green: success' },
              { c: '#B8860B', label: 'yellow: caution' },
              { c: '#CC0000', label: 'red: security' },
              { c: '#8B008B', label: 'magenta: creative' },
            ].map(({ c, label }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creation paths */}
      <div style={{
        position: 'absolute',
        top: COL_TOP + (H * 0.44) + 16,
        left: W * 0.06, right: W * 0.06,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(pathSprings[0], 0, 1),
        }}>
          CREATION PATHS
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {CREATION_PATHS.map((path, i) => {
            const op = clamp(pathSprings[i], 0, 1);
            return (
              <div key={i} style={{
                flex: 1, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
                borderTop: `3px solid ${path.color}`,
                borderRadius: 8, padding: '12px 14px',
                height: PATH_H, boxSizing: 'border-box' as const,
                boxShadow: '0 2px 8px rgba(61,57,41,0.04)',
                opacity: op, transform: `translateY(${(1 - op) * 10}px)`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: path.color, marginBottom: 6 }}>{path.label}</div>
                {path.steps.map((step, j) => (
                  <div key={j} style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4, marginBottom: 3 }}>• {step}</div>
                ))}
              </div>
            );
          })}
        </div>
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
