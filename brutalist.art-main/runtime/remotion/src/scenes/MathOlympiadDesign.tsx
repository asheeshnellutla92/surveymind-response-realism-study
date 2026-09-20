import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const mathOlympiadDesignSchema = z.object({
  sparkLine: z.string().default('Check interpretation. Label every agent. Deep mode before abstain. Presentation is separate from correctness.'),
});
export type MathOlympiadDesignProps = z.infer<typeof mathOlympiadDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const WORKFLOW_STEPS = [
  { label: 'Check interpretation first', note: 'state which reading + why intended — hard reading almost always correct', color: '#4A7C59' },
  { label: 'Label every agent', note: 'batch: problem ID on every solver+verifier+deep call — 36 unlabeled results are chaos', color: '#4A7C59' },
  { label: 'Deep mode before abstaining', note: 'step 6d not optional — partial proof + gap descriptions → focused agent, bounded computation', color: '#4A7C59' },
  { label: 'Presentation is separate', note: 'launch fresh agent with verified proof — find 3-line hindsight proof, inline/standalone lemmas', color: '#4A7C59' },
];

const GOTCHAS = [
  { label: 'VERBATIM solver prompt', note: 'tool restriction enforced by text only — paraphrase loses the behavior silently, no error', color: CLAUDE.SPARK },
  { label: 'Solver cannot verify itself', note: 'always different agent, fresh context — dual context isolation requires this', color: CLAUDE.SPARK },
  { label: 'Computation bounds in deep mode', note: 'doubly-exponential recursions fail at n~30 — work in Z/2^m, track v_p(), never run unbounded', color: CLAUDE.SPARK },
  { label: 'Load reference files', note: 'adversarial_prompts.md + verifier_patterns.md required — without them verifier does generic check', color: CLAUDE.SPARK },
];

export const MathOlympiadDesign: React.FC<MathOlympiadDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stepSprings = WORKFLOW_STEPS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const gotchaSprings = GOTCHAS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.28;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.41;
  const ITEM_H = (H * 0.62) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        MATH-OLYMPIAD · DESIGN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Workflow + key patterns
      </div>

      {/* Workflow steps — left */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(stepSprings[0], 0, 1),
        }}>
          WORKFLOW
        </div>
        {WORKFLOW_STEPS.map((item, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.INK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Gotchas — right */}
      <div style={{ position: 'absolute', left: W * 0.54, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(gotchaSprings[0], 0, 1),
        }}>
          GOTCHAS
        </div>
        {GOTCHAS.map((item, i) => {
          const op = clamp(gotchaSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
          <polygon points="8,1 10,6 15,6 11,10 13,15 8,12 3,15 5,10 1,6 6,6" fill={CLAUDE.SPARK} />
        </svg>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
