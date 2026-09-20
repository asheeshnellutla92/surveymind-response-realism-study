import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeMdImproverLocations — B01 — five locations + quality rubric.
 */

export const claudeMdImproverLocationsSchema = z.object({
  sparkLine: z.string().default('Five locations. Six criteria. Score before you touch.'),
});
export type ClaudeMdImproverLocationsProps = z.infer<typeof claudeMdImproverLocationsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LOCATIONS = [
  { path: './CLAUDE.md', label: 'Project Root', note: 'Primary context — shared, checked into git', color: '#4A7C59' },
  { path: './.claude.local.md', label: 'Local Override', note: 'Personal settings — gitignored, not shared', color: CLAUDE.SPARK },
  { path: '~/.claude/CLAUDE.md', label: 'Global Defaults', note: 'User-wide across all projects', color: CLAUDE.INK_SOFT },
  { path: './packages/*/CLAUDE.md', label: 'Package-specific', note: 'Module-level context in monorepos', color: '#4A7C59' },
  { path: './any/nested/', label: 'Subdirectory', note: 'Feature or domain-specific context', color: CLAUDE.INK_SOFT },
];

const RUBRIC = [
  { criterion: 'Commands / Workflows', weight: 'High', color: '#4A7C59' },
  { criterion: 'Architecture Clarity', weight: 'High', color: '#4A7C59' },
  { criterion: 'Non-obvious Patterns', weight: 'Medium', color: CLAUDE.SPARK },
  { criterion: 'Conciseness', weight: 'Medium', color: CLAUDE.SPARK },
  { criterion: 'Currency', weight: 'High', color: '#4A7C59' },
  { criterion: 'Actionability', weight: 'High', color: '#4A7C59' },
];

const GRADES = ['A 90–100', 'B 70–89', 'C 50–69', 'D 30–49', 'F 0–29'];

export const ClaudeMdImproverLocations: React.FC<ClaudeMdImproverLocationsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const locSprings = LOCATIONS.map((_, i) =>
    spring({ frame: frame - 6 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const rubLabelIn = spring({ frame: frame - 52, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const rubSprings = RUBRIC.map((_, i) =>
    spring({ frame: frame - 56 - i * 6, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const gradeLabelIn = spring({ frame: frame - 92, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const gradeSprings = GRADES.map((_, i) =>
    spring({ frame: frame - 96 - i * 5, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const LOC_TOP = H * 0.20;
  const LOC_H = (H * 0.32) / 5 - 5;

  const RUB_TOP = H * 0.62;
  const RUB_H = (H * 0.24) / 6 - 4;
  const RUB_W = (W * 0.60) - W * 0.05;

  const GRD_TOP = H * 0.62;
  const GRD_H = RUB_H;
  const GRD_W = W * 0.27;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE MD IMPROVER · FIVE LOCATIONS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five locations. Six criteria. Score before you touch.
      </div>

      {LOCATIONS.map((loc, i) => {
        const op = clamp(locSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: LOC_TOP + i * (LOC_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: LOC_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${loc.color}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 0,
            padding: '0 12px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: loc.color, minWidth: 240 }}>{loc.path}</span>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK, minWidth: 160 }}>{loc.label}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{loc.note}</span>
          </div>
        );
      })}

      {/* Rubric label */}
      <div style={{
        position: 'absolute', top: RUB_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(rubLabelIn, 0, 1),
      }}>QUALITY CRITERIA</div>

      {/* Grades label */}
      <div style={{
        position: 'absolute', top: RUB_TOP - 22, left: W * 0.05 + RUB_W + 16,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(gradeLabelIn, 0, 1),
      }}>GRADES</div>

      {RUBRIC.map((r, i) => {
        const op = clamp(rubSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: RUB_TOP + i * (RUB_H + 4),
            left: W * 0.05, width: RUB_W,
            height: RUB_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${r.color}`,
            borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 10px', boxSizing: 'border-box' as const,
            opacity: op, transform: `translateX(${(1 - op) * -8}px)`,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK, flex: 1 }}>{r.criterion}</span>
            <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: r.color }}>{r.weight}</span>
          </div>
        );
      })}

      {GRADES.map((g, i) => {
        const op = clamp(gradeSprings[i], 0, 1);
        const colors = ['#4A7C59', '#6B9E7A', CLAUDE.SPARK, '#C8956A', '#B5503A'];
        return (
          <div key={i} style={{
            position: 'absolute',
            top: GRD_TOP + i * (GRD_H + 4),
            left: W * 0.05 + RUB_W + 16, width: GRD_W,
            height: GRD_H,
            background: i === 0 ? 'rgba(74,124,89,0.06)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${colors[i]}`,
            borderRadius: 6, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            opacity: op, transform: `translateX(${(1 - op) * 8}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: colors[i] }}>{g}</span>
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
