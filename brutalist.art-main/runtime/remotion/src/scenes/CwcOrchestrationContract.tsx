import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcOrchestrationContract — Interface contract between head agent and analysts
 * Three-column: Head sends | Contract | Analyst returns
 * Source: research-desk/ — CWC Workshop 2026
 */

export const cwcOrchestrationContractSchema = z.object({
  sparkLine: z.string().default("The contract is what makes parallelism safe."),
});
export type CwcOrchestrationContractProps = z.infer<typeof cwcOrchestrationContractSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const HEAD_SENDS = [
  'task_id: "sweep-001"',
  'company_ticker: "NVDA"',
  'query_focus: "margin_durability"',
];

const CONTRACT_FIELDS = [
  'task_id',
  'ticker',
  'query_focus',
  'findings[]',
  'confidence',
  'sources[]',
];

const ANALYST_RETURNS = [
  'task_id: "sweep-001"',
  'findings: [...]',
  'confidence: 0.92',
  'sources: ["10-K", "Q3"]',
];

export const CwcOrchestrationContract: React.FC<CwcOrchestrationContractProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const headIn = spring({ frame: frame - 20, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const contractIn = spring({ frame: frame - 65, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const analystIn = spring({ frame: frame - 110, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const arrowLIn = spring({ frame: frame - 90, fps, config: { damping: 24, stiffness: 90 } });
  const arrowRIn = spring({ frame: frame - 135, fps, config: { damping: 24, stiffness: 90 } });
  const sparkIn = spring({ frame: frame - 250, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const COL_Y = height * 0.24;
  const COL_H = height * 0.54;
  const COL_W = width * 0.24;
  const HEAD_X = PAD_X;
  const CONTRACT_X = width * 0.38;
  const ANALYST_X = width * 0.70;

  const ARROW_Y = COL_Y + COL_H * 0.4;
  const ARROW_W = CONTRACT_X - (HEAD_X + COL_W);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        ORCHESTRATION CONTRACT · INTERFACE SCHEMA
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        The schema that makes parallel agents safe
      </div>

      {/* HEAD SENDS column */}
      <div style={{
        position: 'absolute', left: HEAD_X, top: COL_Y,
        width: COL_W, height: COL_H,
        borderRadius: 12, background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        overflow: 'hidden',
        opacity: clamp(headIn, 0, 1),
        transform: `translateY(${(1 - clamp(headIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${CLAUDE.BORDER}`, background: CLAUDE.BORDER }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700, letterSpacing: 1, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>Head Sends</div>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HEAD_SENDS.map((field, i) => {
            const fieldIn = spring({ frame: frame - 35 - i * 20, fps, config: { damping: 26, stiffness: 100 } });
            return (
              <div key={i} style={{
                fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK, lineHeight: 1.6,
                opacity: clamp(fieldIn, 0, 1),
              }}>
                {field}
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrow left → contract */}
      <svg style={{
        position: 'absolute', left: HEAD_X + COL_W, top: ARROW_Y - 14,
        width: ARROW_W, height: 28, overflow: 'visible',
        opacity: clamp(arrowLIn, 0, 1),
      }}>
        <defs>
          <marker id="contArrL" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.SPARK} />
          </marker>
        </defs>
        <line x1={0} y1={14} x2={ARROW_W - 4} y2={14}
          stroke={CLAUDE.SPARK} strokeWidth={2.5} markerEnd="url(#contArrL)" />
      </svg>

      {/* CONTRACT column — terracotta border */}
      <div style={{
        position: 'absolute', left: CONTRACT_X, top: COL_Y,
        width: COL_W, height: COL_H,
        borderRadius: 12, background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        overflow: 'hidden',
        opacity: clamp(contractIn, 0, 1),
        transform: `scale(${0.88 + 0.12 * clamp(contractIn, 0, 1)})`,
      }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${CLAUDE.SPARK}40`, background: `${CLAUDE.SPARK}15` }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700, letterSpacing: 1, color: CLAUDE.SPARK, textTransform: 'uppercase' as const }}>Contract</div>
          <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT, marginTop: 2 }}>standard schema</div>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CONTRACT_FIELDS.map((field, i) => {
            const fieldIn = spring({ frame: frame - 75 - i * 15, fps, config: { damping: 26, stiffness: 100 } });
            return (
              <div key={i} style={{
                fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK,
                opacity: clamp(fieldIn, 0, 1),
                paddingLeft: 8,
                borderLeft: `2px solid ${CLAUDE.SPARK}50`,
              }}>
                {field}
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrow contract → analyst */}
      <svg style={{
        position: 'absolute', left: CONTRACT_X + COL_W, top: ARROW_Y - 14,
        width: ANALYST_X - (CONTRACT_X + COL_W), height: 28, overflow: 'visible',
        opacity: clamp(arrowRIn, 0, 1),
      }}>
        <defs>
          <marker id="contArrR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.INK_SOFT} />
          </marker>
        </defs>
        <line x1={0} y1={14} x2={ANALYST_X - (CONTRACT_X + COL_W) - 4} y2={14}
          stroke={CLAUDE.INK_SOFT} strokeWidth={2} strokeDasharray="6 3" markerEnd="url(#contArrR)" />
      </svg>

      {/* ANALYST RETURNS column */}
      <div style={{
        position: 'absolute', left: ANALYST_X, top: COL_Y,
        width: COL_W, height: COL_H,
        borderRadius: 12, background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        overflow: 'hidden',
        opacity: clamp(analystIn, 0, 1),
        transform: `translateY(${(1 - clamp(analystIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${CLAUDE.BORDER}`, background: CLAUDE.BORDER }}>
          <div style={{ fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700, letterSpacing: 1, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>Analyst Returns</div>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ANALYST_RETURNS.map((field, i) => {
            const fieldIn = spring({ frame: frame - 120 - i * 20, fps, config: { damping: 26, stiffness: 100 } });
            return (
              <div key={i} style={{
                fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK, lineHeight: 1.6,
                opacity: clamp(fieldIn, 0, 1),
              }}>
                {field}
              </div>
            );
          })}
        </div>
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
