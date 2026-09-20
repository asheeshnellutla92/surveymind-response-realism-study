import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcEvalScoring — How the two-layer eval scores a response
 * Layer 1: structural JSON schema check → pass/fail
 * Layer 2: LLM grader → 0-10 score
 * Source: eval-driven-agent-development/ — CWC Workshop 2026
 */

export const cwcEvalScoringSchema = z.object({
  sparkLine: z.string().default("Structure first. Semantics second."),
});
export type CwcEvalScoringProps = z.infer<typeof cwcEvalScoringSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GREEN = '#4CAF50';

const L1_CHECKS = [
  { label: 'JSON valid', result: 'PASS', pass: true },
  { label: 'Required fields', result: 'PASS', pass: true },
  { label: 'Font consistency', result: 'PASS', pass: true },
  { label: 'Color contrast', result: 'FAIL', pass: false },
];

const L2_CRITERIA = [
  { label: 'Visual impact', score: 8 },
  { label: 'Information density', score: 7 },
  { label: 'Layout clarity', score: 9 },
];

export const CwcEvalScoring: React.FC<CwcEvalScoringProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const layer1In = spring({ frame: frame - 20, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const arrowIn = spring({ frame: frame - 120, fps, config: { damping: 24, stiffness: 90 } });
  const layer2In = spring({ frame: frame - 145, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 260, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const COL_W = width * 0.38;
  const COL_Y = height * 0.23;
  const L1_X = PAD_X;
  const L2_X = width * 0.54;

  const ARROW_MID_X = L1_X + COL_W + (L2_X - L1_X - COL_W) / 2;
  const ARROW_Y = COL_Y + height * 0.18;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        EVAL SCORING · TWO-LAYER PIPELINE
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Structural check first — then semantic judgment
      </div>

      {/* Layer 1 card */}
      <div style={{
        position: 'absolute', left: L1_X, top: COL_Y,
        width: COL_W,
        background: CLAUDE.CARD, border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 12, overflow: 'hidden',
        opacity: clamp(layer1In, 0, 1),
        transform: `translateY(${(1 - clamp(layer1In, 0, 1)) * 14}px)`,
      }}>
        <div style={{ padding: '12px 18px', background: CLAUDE.BORDER, borderBottom: `1px solid ${CLAUDE.BORDER}` }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700, color: CLAUDE.INK_SOFT, letterSpacing: 1, textTransform: 'uppercase' as const }}>
            Layer 1: Structural
          </div>
          <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT, marginTop: 3 }}>
            JSON schema check — no LLM needed
          </div>
        </div>
        {L1_CHECKS.map((check, i) => {
          const checkIn = spring({ frame: frame - 35 - i * 22, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 18px',
              borderBottom: i < L1_CHECKS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              opacity: clamp(checkIn, 0, 1),
            }}>
              <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK }}>{check.label}</div>
              <div style={{
                fontFamily: MONO, fontSize: height * 0.011, fontWeight: 700,
                color: check.pass ? GREEN : CLAUDE.SPARK,
                background: check.pass ? `${GREEN}18` : `${CLAUDE.SPARK}18`,
                padding: '2px 10px', borderRadius: 4,
              }}>
                {check.result}
              </div>
            </div>
          );
        })}
        {/* Pass/fail summary bar */}
        {(() => {
          const barIn = spring({ frame: frame - 120, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div style={{
              padding: '10px 18px', background: `${GREEN}12`,
              borderTop: `1px solid ${GREEN}40`,
              display: 'flex', justifyContent: 'space-between',
              opacity: clamp(barIn, 0, 1),
            }}>
              <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT }}>Structural score</div>
              <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: GREEN, fontWeight: 700 }}>3/4 PASS</div>
            </div>
          );
        })()}
      </div>

      {/* Arrow between layers */}
      <svg style={{
        position: 'absolute',
        left: L1_X + COL_W,
        top: ARROW_Y - 14,
        width: L2_X - (L1_X + COL_W),
        height: 28, overflow: 'visible',
        opacity: clamp(arrowIn, 0, 1),
      }}>
        <defs>
          <marker id="evalArr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.SPARK} />
          </marker>
        </defs>
        <line x1={0} y1={14} x2={L2_X - (L1_X + COL_W) - 4} y2={14}
          stroke={CLAUDE.SPARK} strokeWidth={2.5} markerEnd="url(#evalArr)" />
        <text x={(L2_X - (L1_X + COL_W)) / 2} y={8}
          textAnchor="middle" fontFamily={SANS} fontSize={height * 0.009}
          fill={CLAUDE.INK_SOFT} fontWeight={700} letterSpacing={1}>
          SCORES FLOW DOWN
        </text>
      </svg>

      {/* Layer 2 card */}
      <div style={{
        position: 'absolute', left: L2_X, top: COL_Y,
        width: COL_W,
        background: CLAUDE.CARD, border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, overflow: 'hidden',
        opacity: clamp(layer2In, 0, 1),
        transform: `translateY(${(1 - clamp(layer2In, 0, 1)) * 14}px)`,
      }}>
        <div style={{ padding: '12px 18px', background: `${CLAUDE.SPARK}18`, borderBottom: `1px solid ${CLAUDE.SPARK}40` }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 1, textTransform: 'uppercase' as const }}>
            Layer 2: Semantic
          </div>
          <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT, marginTop: 3 }}>
            LLM grader prompt → 0–10 score
          </div>
        </div>
        {L2_CRITERIA.map((crit, i) => {
          const critIn = spring({ frame: frame - 160 - i * 22, fps, config: { damping: 26, stiffness: 100 } });
          const barW = (crit.score / 10) * (COL_W - 80);
          const barIn = spring({ frame: frame - 170 - i * 22, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={i} style={{
              padding: '10px 18px',
              borderBottom: i < L2_CRITERIA.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              opacity: clamp(critIn, 0, 1),
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK }}>{crit.label}</div>
                <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.SPARK, fontWeight: 700 }}>{crit.score}/10</div>
              </div>
              <div style={{ height: 6, background: CLAUDE.BORDER, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: barW * clamp(barIn, 0, 1),
                  background: CLAUDE.SPARK, borderRadius: 3,
                }} />
              </div>
            </div>
          );
        })}
        {/* Semantic total */}
        {(() => {
          const totIn = spring({ frame: frame - 240, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div style={{
              padding: '10px 18px', background: `${CLAUDE.SPARK}10`,
              borderTop: `1px solid ${CLAUDE.SPARK}40`,
              display: 'flex', justifyContent: 'space-between',
              opacity: clamp(totIn, 0, 1),
            }}>
              <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT }}>Semantic score</div>
              <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.SPARK, fontWeight: 700 }}>8.0 / 10</div>
            </div>
          );
        })()}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
