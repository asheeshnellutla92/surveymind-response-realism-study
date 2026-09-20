import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DocCoauthoringStage2 — B03 — Stage 2: Refinement & Structure.
 * Six-step section workflow rendered as horizontal flow with stagger.
 * Right: quality-check rule + near-completion note.
 */

export const docCoauthoringStage2Schema = z.object({
  sparkLine: z.string().default('Brainstorm 20. Curate to what matters.'),
});
export type DocCoauthoringStage2Props = z.infer<typeof docCoauthoringStage2Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEPS = [
  { num: 1, label: 'Clarify', desc: '5–10 questions\nper section', delay: 10 },
  { num: 2, label: 'Brainstorm', desc: '5–20 options\nto consider', delay: 22 },
  { num: 3, label: 'Curate', desc: 'Keep · Remove\nCombine', delay: 34 },
  { num: 4, label: 'Gap Check', desc: 'What\'s missing\nfor this section?', delay: 46 },
  { num: 5, label: 'Draft', desc: 'str_replace fills\nthe placeholder', delay: 58 },
  { num: 6, label: 'Refine', desc: 'Iterate until\nno changes', delay: 70 },
];

export const DocCoauthoringStage2: React.FC<DocCoauthoringStage2Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const rulesIn = spring({ frame: frame - 78, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const stepSprings = STEPS.map(s =>
    spring({ frame: frame - s.delay, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const STEP_W = (W * 0.90) / 6 - 10;
  const STEP_LEFT = W * 0.05;
  const STEP_H = H * 0.52;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DOC CO-AUTHORING · STAGE 2 · REFINEMENT
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Section by section. Surgical edits only.
      </div>

      {/* Six-step flow */}
      <div style={{
        position: 'absolute', top: CONTENT_TOP,
        left: STEP_LEFT, right: W * 0.05,
        display: 'flex', gap: 10, alignItems: 'stretch',
      }}>
        {STEPS.map((step, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          const isKey = i === 1 || i === 4;
          return (
            <div key={i} style={{
              width: STEP_W, flexShrink: 0,
              opacity: op, transform: `translateY(${(1 - op) * 16}px)`,
              display: 'flex', flexDirection: 'column' as const, gap: 6,
              alignItems: 'center',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isKey ? CLAUDE.SPARK : CLAUDE.INK,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SANS, fontSize: 16, fontWeight: 700, color: '#FFF',
              }}>
                {step.num}
              </div>
              {i < 5 && (
                <div style={{
                  position: 'absolute',
                  left: STEP_LEFT + i * (STEP_W + 10) + STEP_W + 5,
                  top: CONTENT_TOP + 20,
                  fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT,
                }}>→</div>
              )}
              <div style={{
                background: isKey ? 'rgba(217,119,87,0.07)' : '#FFFFFF',
                border: `1px solid ${isKey ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderRadius: 12, padding: '14px 10px',
                height: STEP_H, boxSizing: 'border-box' as const,
                display: 'flex', flexDirection: 'column' as const,
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                width: '100%',
                boxShadow: isKey ? '0 6px 20px rgba(217,119,87,0.14)' : '0 4px 12px rgba(61,57,41,0.07)',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: isKey ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 8 }}>
                  {step.label}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.4, whiteSpace: 'pre-line' as const }}>
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom rules */}
      <div style={{
        position: 'absolute', bottom: H * 0.10, left: W * 0.05, right: W * 0.05,
        display: 'flex', gap: 16,
        opacity: clamp(rulesIn, 0, 1),
      }}>
        <div style={{
          flex: 1, background: 'rgba(217,119,87,0.06)', border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 12, padding: '14px 18px',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.SPARK, fontWeight: 700, marginBottom: 4 }}>
            QUALITY GATE
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.5 }}>
            After 3 iterations with no substantial change → ask if anything can be removed without losing information.
          </div>
        </div>
        <div style={{
          flex: 1, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(61,57,41,0.07)',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK, fontWeight: 700, marginBottom: 4 }}>
            NEAR COMPLETION (80%+)
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.5 }}>
            Re-read entire doc. Check for flow, redundancy, "slop", and whether every sentence carries weight.
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
