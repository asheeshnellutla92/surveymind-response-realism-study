import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InternalCommsAnatomy — B01 — 7 comm types mapped to 4 guideline files + routing workflow.
 */

export const internalCommsAnatomySchema = z.object({
  sparkLine: z.string().default('Identify the type. Load the guide. Follow it exactly.'),
});
export type InternalCommsAnatomyProps = z.infer<typeof internalCommsAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const COMM_TYPES = [
  { type: '3P Updates', file: 'examples/3p-updates.md', accent: true },
  { type: 'Company Newsletter', file: 'examples/company-newsletter.md', accent: false },
  { type: 'FAQ Responses', file: 'examples/faq-answers.md', accent: false },
  { type: 'Status Reports', file: 'examples/general-comms.md', accent: false },
  { type: 'Leadership Updates', file: 'examples/general-comms.md', accent: false },
  { type: 'Project Updates', file: 'examples/general-comms.md', accent: false },
  { type: 'Incident Reports', file: 'examples/general-comms.md', accent: false },
];

const STEPS = [
  { num: 1, label: 'Identify type', detail: 'Match the request to one of 7 comm types' },
  { num: 2, label: 'Load guide', detail: 'Open the matching file in examples/ — it is authoritative' },
  { num: 3, label: 'Follow format', detail: 'Never free-style — the file owns format, tone, and tools' },
];

export const InternalCommsAnatomy: React.FC<InternalCommsAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const typeSprings = COMM_TYPES.map((_, i) =>
    spring({ frame: frame - 20 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const stepSprings = STEPS.map((_, i) =>
    spring({ frame: frame - 55 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.45;
  const RIGHT_X = W * 0.52;
  const RIGHT_W = W * 0.42;
  const TYPE_H = (H * 0.66) / 7 - 8;
  const STEP_H = (H * 0.50) / 3 - 14;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        INTERNAL COMMS · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Seven types. Four files. One rule.
      </div>

      {/* Left: 7 comm types → guide file mapping */}
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
            "weekly update" · "3P" · "newsletter" · "FAQ" · "status report" · "leadership update" · "incident report"
          </div>
        </div>

        {COMM_TYPES.map((ct, i) => {
          const op = clamp(typeSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: ct.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${ct.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${ct.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 8, padding: '8px 14px',
              height: TYPE_H, boxSizing: 'border-box' as const,
              marginBottom: 8,
              boxShadow: ct.accent ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: ct.accent ? CLAUDE.SPARK : CLAUDE.INK }}>
                {ct.type}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT, flexShrink: 0 }}>
                {ct.file}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: 3-step routing workflow */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 16,
          opacity: clamp(stepSprings[0], 0, 1),
        }}>
          ROUTING WORKFLOW:
        </div>
        {STEPS.map((step, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          return (
            <div key={i}>
              <div style={{
                background: i === 1 ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
                border: `1px solid ${i === 1 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderLeft: `5px solid ${i === 1 ? CLAUDE.SPARK : CLAUDE.INK}`,
                borderRadius: 14, padding: '16px 20px',
                height: STEP_H, boxSizing: 'border-box' as const,
                boxShadow: i === 1 ? '0 6px 20px rgba(217,119,87,0.12)' : '0 4px 12px rgba(61,57,41,0.05)',
                opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: i === 1 ? CLAUDE.SPARK : CLAUDE.INK,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#FFF',
                  }}>
                    {step.num}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: CLAUDE.INK }}>
                    {step.label}
                  </div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
                  {step.detail}
                </div>
              </div>
              {i < 2 && (
                <div style={{
                  textAlign: 'center', fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT,
                  height: 20, lineHeight: '20px', marginBottom: 6,
                  opacity: clamp(stepSprings[i + 1], 0, 1),
                }}>↓</div>
              )}
            </div>
          );
        })}

        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 10, padding: '12px 16px', marginTop: 10,
          boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
          opacity: clamp(stepSprings[2], 0, 1),
        }}>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4 }}>
            If the type doesn't match: <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>ask for clarification</span> — never guess the format.
          </div>
        </div>
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
