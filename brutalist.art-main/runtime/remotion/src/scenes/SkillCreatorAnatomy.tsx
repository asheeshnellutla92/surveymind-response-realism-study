import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SkillCreatorAnatomy — B01 — 5-stage build loop + description optimization.
 */

export const skillCreatorAnatomySchema = z.object({
  sparkLine: z.string().default('Draft. Test. Eval. Improve. Repeat.'),
});
export type SkillCreatorAnatomyProps = z.infer<typeof skillCreatorAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STAGES = [
  { num: '01', label: 'Capture Intent', detail: 'What does the skill do? When trigger? Output format? Test cases needed?' },
  { num: '02', label: 'Interview & Research', detail: 'Probe edge cases, check MCPs, wait for details before writing' },
  { num: '03', label: 'Write SKILL.md', detail: 'Description is the trigger — make it pushy (Claude undertriggers)' },
  { num: '04', label: 'Test & Grade', detail: 'Spawn with-skill + baseline in same turn → grade → eval viewer' },
  { num: '05', label: 'Improve & Repeat', detail: 'Until user is satisfied or progress stalls' },
];

const DESC_OPT = [
  { step: 'Generate 20 trigger evals', detail: '10 should-trigger (varied phrasings), 10 near-miss should-not-trigger' },
  { step: 'Review with user', detail: 'Edit queries, toggle flags, export eval_set.json from browser viewer' },
  { step: 'Run optimization loop', detail: 'run_loop.py → 60/40 train/test split, up to 5 iterations' },
  { step: 'Apply best_description', detail: 'Update SKILL.md frontmatter with test-score winner' },
];

export const SkillCreatorAnatomy: React.FC<SkillCreatorAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const labelIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stageSprings = STAGES.map((_, i) =>
    spring({ frame: frame - 20 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const descSprings = DESC_OPT.map((_, i) =>
    spring({ frame: frame - 45 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const STAGE_H = (H * 0.66) / 5 - 11;
  const DESC_H = (H * 0.58) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        SKILL CREATOR · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five stages. Then optimize.
      </div>

      {/* Left: 5 stages */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(labelIn, 0, 1),
        }}>
          BUILD LOOP:
        </div>
        {STAGES.map((stage, i) => {
          const op = clamp(stageSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `5px solid ${CLAUDE.INK}`,
              borderRadius: 12, padding: '10px 14px', marginBottom: 10,
              height: STAGE_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: CLAUDE.SPARK, flexShrink: 0, paddingTop: 1 }}>{stage.num}</div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{stage.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{stage.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: description optimization */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 12,
          opacity: clamp(descSprings[0], 0, 1),
        }}>
          DESCRIPTION OPTIMIZATION:
        </div>
        {DESC_OPT.map((item, i) => {
          const op = clamp(descSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: i === 2 ? 'rgba(217,119,87,0.06)' : 'rgba(217,119,87,0.03)',
              border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 10,
              height: DESC_H, boxSizing: 'border-box' as const,
              boxShadow: i === 2 ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(217,119,87,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{item.step}</div>
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
