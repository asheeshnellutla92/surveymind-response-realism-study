import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const mathOlympiadAnatomySchema = z.object({
  sparkLine: z.string().default('Interpretation check. Strip thinking trace. Pattern-armed attack. Asymmetric vote. Abstain honestly.'),
});
export type MathOlympiadAnatomyProps = z.infer<typeof mathOlympiadAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const WORKFLOW = [
  { label: 'Interpretation check first', note: '2-3 readings → identify intended hard one — 50/63 prior errors were wrong reading', color: '#4A7C59' },
  { label: '8-12 parallel solvers', note: 'internal refine: solve→self-improve→self-verify→correct · no computation', color: CLAUDE.SPARK },
  { label: 'Strip thinking trace', note: 'false starts + exploration prose removed — verifier seeing reasoning biases toward agreement', color: CLAUDE.SPARK },
  { label: 'Adversarial verify', note: 'fresh context, pattern-armed attack from reference files — not generic is-this-correct', color: '#4A7C59' },
];

const VOTE = [
  { label: 'Asymmetric vote', note: '4 HOLDS to confirm · 2 HOLE FOUND to refute · pigeonhole early exit', color: '#4A7C59' },
  { label: 'Calibrated abstention', note: 'no confident solution over guessing — conditional accuracy over coverage', color: '#4A7C59' },
  { label: 'Deep mode before abstain', note: 'step 6d not optional — focused agent + bounded computation before final abstention', color: '#4A7C59' },
];

export const MathOlympiadAnatomy: React.FC<MathOlympiadAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 125, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const wfSprings = WORKFLOW.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const voteSprings = VOTE.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.43;
  const RIGHT_W = W * 0.42;
  const ITEM_H = (H * 0.64) / 4 - 10;
  const RIGHT_ITEM_H = (H * 0.45) / 3 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        MATH-OLYMPIAD · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Verification architecture
      </div>

      {/* Workflow — left */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(wfSprings[0], 0, 1),
        }}>
          WORKFLOW
        </div>
        {WORKFLOW.map((item, i) => {
          const op = clamp(wfSprings[i], 0, 1);
          const isWarn = item.color === CLAUDE.SPARK;
          return (
            <div key={i} style={{
              background: isWarn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${isWarn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isWarn ? '0 1px 6px rgba(217,119,87,0.07)' : '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isWarn ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Vote + abstention — right */}
      <div style={{ position: 'absolute', left: W * 0.54, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(voteSprings[0], 0, 1),
        }}>
          VOTE + ABSTAIN
        </div>
        {VOTE.map((item, i) => {
          const op = clamp(voteSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 10,
              height: RIGHT_ITEM_H, boxSizing: 'border-box' as const,
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
