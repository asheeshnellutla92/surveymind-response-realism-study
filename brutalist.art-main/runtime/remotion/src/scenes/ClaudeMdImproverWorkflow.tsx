import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeMdImproverWorkflow — B02 — 5-phase workflow + diff-with-why format + user tips.
 */

export const claudeMdImproverWorkflowSchema = z.object({
  sparkLine: z.string().default('Report first. Diff-with-why. Minimal additions only.'),
});
export type ClaudeMdImproverWorkflowProps = z.infer<typeof claudeMdImproverWorkflowSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PHASES = [
  { num: '1', label: 'Discovery', note: 'find CLAUDE.md files — capped at 50', color: '#4A7C59' },
  { num: '2', label: 'Quality Assessment', note: 'score each file against 6 criteria', color: '#4A7C59' },
  { num: '3', label: 'Quality Report', note: 'output report BEFORE any edits — hard gate', color: CLAUDE.SPARK },
  { num: '4', label: 'Targeted Updates', note: 'diff-with-why format · user confirmation', color: '#4A7C59' },
  { num: '5', label: 'Apply', note: 'Edit tool · preserve existing structure', color: CLAUDE.INK_SOFT },
];

const TIPS = [
  { icon: '#', label: '# key shortcut', note: 'Auto-incorporates session learnings into CLAUDE.md' },
  { icon: '⊘', label: '.claude.local.md', note: 'Personal preferences — gitignored, not shared with team' },
  { icon: '~', label: 'Global defaults', note: '~/.claude/CLAUDE.md for user-wide preferences' },
];

const DIFF_EXAMPLE = [
  '### Update: ./CLAUDE.md',
  '**Why:** Build command was missing.',
  '```diff',
  '+ ## Quick Start',
  '+ npm install && npm run dev',
  '```',
];

export const ClaudeMdImproverWorkflow: React.FC<ClaudeMdImproverWorkflowProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const phaseSprings = PHASES.map((_, i) =>
    spring({ frame: frame - 6 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const diffIn = spring({ frame: frame - 56, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const tipLabelIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const tipSprings = TIPS.map((_, i) =>
    spring({ frame: frame - 104 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const PHASE_TOP = H * 0.20;
  const PHASE_H = (H * 0.33) / 5 - 5;
  const PHASE_W = W * 0.52;

  const DIFF_LEFT = W * 0.05 + PHASE_W + 14;
  const DIFF_W = W * 0.90 - PHASE_W - 14;
  const DIFF_TOP = H * 0.20;

  const TIP_TOP = H * 0.64;
  const TIP_H = (H * 0.22) / 3 - 6;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE MD IMPROVER · WORKFLOW
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five phases. Report gates the edits.
      </div>

      {/* Phase list */}
      {PHASES.map((ph, i) => {
        const op = clamp(phaseSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: PHASE_TOP + i * (PHASE_H + 5),
            left: W * 0.05, width: PHASE_W,
            height: PHASE_H,
            background: i === 2 ? 'rgba(217,119,87,0.04)' : '#FFFFFF',
            border: `1px solid ${i === 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderLeft: `4px solid ${ph.color}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 12px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: ph.color, minWidth: 20 }}>{ph.num}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK }}>{ph.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 9, color: i === 2 ? CLAUDE.SPARK : CLAUDE.INK_SOFT }}>{ph.note}</span>
            </div>
          </div>
        );
      })}

      {/* Diff-with-why example */}
      <div style={{
        position: 'absolute',
        top: DIFF_TOP, left: DIFF_LEFT, width: DIFF_W,
        height: PHASE_H * 5 + 5 * 4,
        background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, padding: '10px 12px', boxSizing: 'border-box' as const,
        boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
        opacity: clamp(diffIn, 0, 1),
      }}>
        <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, marginBottom: 8 }}>DIFF-WITH-WHY FORMAT</div>
        {DIFF_EXAMPLE.map((line, i) => (
          <div key={i} style={{
            fontFamily: MONO, fontSize: 9,
            color: line.startsWith('+') ? '#4A7C59' : line.startsWith('**') ? CLAUDE.SPARK : CLAUDE.INK,
            lineHeight: 1.5,
          }}>{line}</div>
        ))}
        <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
          Show: which file · what to add · why it helps future sessions
        </div>
        <div style={{ marginTop: 8, fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
          Avoid: restating obvious code · generic best practices · verbose explanations
        </div>
      </div>

      {/* Tips */}
      <div style={{
        position: 'absolute', top: TIP_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(tipLabelIn, 0, 1),
      }}>USER TIPS</div>

      {TIPS.map((tip, i) => {
        const op = clamp(tipSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: TIP_TOP + i * (TIP_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: TIP_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${CLAUDE.SPARK}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 12px', boxSizing: 'border-box' as const,
            opacity: op, transform: `translateY(${(1 - op) * 6}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: CLAUDE.SPARK, minWidth: 24 }}>{tip.icon}</span>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK, minWidth: 160 }}>{tip.label}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{tip.note}</span>
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
