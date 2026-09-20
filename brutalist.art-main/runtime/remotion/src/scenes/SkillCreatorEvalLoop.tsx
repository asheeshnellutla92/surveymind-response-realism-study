import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SkillCreatorEvalLoop — B02 — Eval architecture: parallel runs, grader, viewer.
 */

export const skillCreatorEvalLoopSchema = z.object({
  sparkLine: z.string().default('Parallel runs. Quantitative grades. Human review first.'),
});
export type SkillCreatorEvalLoopProps = z.infer<typeof skillCreatorEvalLoopSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const EVAL_STEPS = [
  { step: 'Step 1: Spawn all runs in one turn', detail: 'with-skill AND baseline simultaneously — not sequentially', accent: true },
  { step: 'Step 2: Draft assertions while runs are in progress', detail: 'Don\'t wait idle — write objectively verifiable checks now' },
  { step: 'Step 3: Capture timing data on completion', detail: 'total_tokens + duration_ms come through notification — only chance' },
  { step: 'Step 4: Grade → aggregate → analyst pass → viewer', detail: 'grader.md → benchmark.json → analyzer.md → generate_review.py' },
];

const VIEWER_TABS = [
  { tab: 'Outputs tab', detail: 'One test case at a time: prompt, output, feedback textbox, prev iteration comparison' },
  { tab: 'Benchmark tab', detail: 'Pass rates, timing, token usage per config — mean ± stddev and delta' },
  { tab: 'Feedback → feedback.json', detail: 'Empty feedback = looks fine. Focus improvements on specific complaints' },
  { tab: 'Rule: viewer before self-eval', detail: 'Generate review.py BEFORE reading outputs yourself — get human in loop first' },
];

export const SkillCreatorEvalLoop: React.FC<SkillCreatorEvalLoopProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const evalSprings = EVAL_STEPS.map((_, i) =>
    spring({ frame: frame - 22 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const viewerSprings = VIEWER_TABS.map((_, i) =>
    spring({ frame: frame - 46 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const EVAL_H = (H * 0.64) / 4 - 12;
  const VIEWER_H = (H * 0.58) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        SKILL CREATOR · EVAL LOOP
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Spawn both. Grade both. Show human first.
      </div>

      {/* Left: 4 eval loop steps */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(calloutIn, 0, 1),
        }}>
          EVAL LOOP (4 STEPS):
        </div>
        {EVAL_STEPS.map((item, i) => {
          const op = clamp(evalSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: item.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${item.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${item.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10,
              height: EVAL_H, boxSizing: 'border-box' as const,
              boxShadow: item.accent ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 5 }}>{item.step}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{item.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Right: eval viewer anatomy */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 12,
          opacity: clamp(viewerSprings[0], 0, 1),
        }}>
          EVAL VIEWER (generate_review.py):
        </div>
        {VIEWER_TABS.map((item, i) => {
          const op = clamp(viewerSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: i === 3 ? 'rgba(217,119,87,0.06)' : 'rgba(217,119,87,0.03)',
              border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${i === 3 ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 10,
              height: VIEWER_H, boxSizing: 'border-box' as const,
              boxShadow: i === 3 ? '0 4px 14px rgba(217,119,87,0.12)' : '0 2px 8px rgba(217,119,87,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{item.tab}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{item.detail}</div>
            </div>
          );
        })}
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
