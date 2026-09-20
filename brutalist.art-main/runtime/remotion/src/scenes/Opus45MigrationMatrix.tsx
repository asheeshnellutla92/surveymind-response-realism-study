import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * Opus45MigrationMatrix — B01 — platform string matrix + 6-step workflow.
 */

export const opus45MigrationMatrixSchema = z.object({
  sparkLine: z.string().default('Four platforms. Three source models. One beta header to remove.'),
});
export type Opus45MigrationMatrixProps = z.infer<typeof opus45MigrationMatrixSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TARGETS = [
  { platform: 'Anthropic API', string: 'claude-opus-4-5-20251101', color: '#4A7C59' },
  { platform: 'AWS Bedrock', string: 'anthropic.claude-opus-4-5-20251101-v1:0', color: '#4A7C59' },
  { platform: 'Google Vertex', string: 'claude-opus-4-5@20251101', color: '#4A7C59' },
  { platform: 'Azure AI Foundry', string: 'claude-opus-4-5-20251101', color: '#4A7C59' },
];

const STEPS = [
  { num: '1', label: 'Search', note: 'Find model strings and API calls' },
  { num: '2', label: 'Update Strings', note: 'Replace with Opus 4.5 platform string' },
  { num: '3', label: 'Remove Beta Header', note: 'context-1m-2025-08-07 → leave comment' },
  { num: '4', label: 'Add Effort', note: 'effort: "high"  (see references/effort.md)' },
  { num: '5', label: 'Summarize', note: 'List all changes made' },
  { num: '6', label: 'Handoff', note: 'Offer to help with issues → prompt adjustments' },
];

export const Opus45MigrationMatrix: React.FC<Opus45MigrationMatrixProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const targetSprings = TARGETS.map((_, i) =>
    spring({ frame: frame - 6 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const exclIn = spring({ frame: frame - 42, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const stepLabelIn = spring({ frame: frame - 56, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const stepSprings = STEPS.map((_, i) =>
    spring({ frame: frame - 60 - i * 6, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const TGT_TOP = H * 0.20;
  const TGT_H = (H * 0.26) / 4 - 5;
  const TGT_W = W * 0.60;

  const STEP_TOP = H * 0.60;
  const STEP_H = (H * 0.28) / 6 - 4;
  const STEP_W = W * 0.60;

  const SIDE_LEFT = W * 0.05 + TGT_W + 14;
  const SIDE_W = W * 0.90 - TGT_W - 14;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        OPUS 4.5 MIGRATION · MODEL STRING MATRIX
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Four platforms. One-shot update.
      </div>

      {/* Label */}
      <div style={{
        position: 'absolute', top: TGT_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(targetSprings[0], 0, 1),
      }}>TARGET: OPUS 4.5</div>

      {TARGETS.map((t, i) => {
        const op = clamp(targetSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: TGT_TOP + i * (TGT_H + 5),
            left: W * 0.05, width: TGT_W,
            height: TGT_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${t.color}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 12px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.INK, minWidth: 130 }}>{t.platform}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: t.color }}>{t.string}</span>
          </div>
        );
      })}

      {/* Exclusion + source note */}
      <div style={{
        position: 'absolute',
        top: TGT_TOP, left: SIDE_LEFT, width: SIDE_W,
        height: TGT_H * 4 + 5 * 3,
        background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
        borderLeft: `4px solid ${CLAUDE.SPARK}`,
        borderRadius: 8, padding: '10px 12px', boxSizing: 'border-box' as const,
        opacity: clamp(exclIn, 0, 1),
      }}>
        <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, marginBottom: 6 }}>SOURCE MODELS TO REPLACE</div>
        {['Sonnet 4.0', 'Sonnet 4.5', 'Opus 4.1'].map((m, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 9, color: '#4A7C59', lineHeight: 1.8 }}>✓ {m}</div>
        ))}
        <div style={{ marginTop: 8, fontFamily: SANS, fontSize: 9, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 4 }}>DO NOT MIGRATE</div>
        <div style={{ fontFamily: MONO, fontSize: 9, color: CLAUDE.SPARK }}>✗ Haiku (any version)</div>
        <div style={{ marginTop: 8, fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
          Remove: context-1m-2025-08-07 beta header
        </div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
          {'# Note: 1M context beta not yet'}
          <br />
          {'# supported with Opus 4.5'}
        </div>
      </div>

      {/* Steps */}
      <div style={{
        position: 'absolute', top: STEP_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(stepLabelIn, 0, 1),
      }}>6-STEP WORKFLOW</div>

      {STEPS.map((s, i) => {
        const op = clamp(stepSprings[i], 0, 1);
        const colors = ['#4A7C59', '#4A7C59', CLAUDE.SPARK, '#4A7C59', CLAUDE.INK_SOFT, CLAUDE.INK_SOFT];
        return (
          <div key={i} style={{
            position: 'absolute',
            top: STEP_TOP + i * (STEP_H + 4),
            left: W * 0.05, width: STEP_W,
            height: STEP_H,
            background: i === 2 ? 'rgba(217,119,87,0.04)' : '#FFFFFF',
            border: `1px solid ${i === 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderLeft: `4px solid ${colors[i]}`,
            borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 10px', boxSizing: 'border-box' as const,
            opacity: op, transform: `translateX(${(1 - op) * -8}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: colors[i], minWidth: 16 }}>{s.num}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.INK, minWidth: 130 }}>{s.label}</span>
            <span style={{ fontFamily: SANS, fontSize: 9, color: i === 2 ? CLAUDE.SPARK : CLAUDE.INK_SOFT }}>{s.note}</span>
          </div>
        );
      })}

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
