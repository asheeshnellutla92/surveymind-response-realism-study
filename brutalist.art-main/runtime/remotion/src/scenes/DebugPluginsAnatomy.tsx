import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DebugPluginsAnatomy — B01 — six-step diagnostic ladder.
 */

export const debugPluginsAnatomySchema = z.object({
  sparkLine: z.string().default('Six steps in order. Collect all findings before reporting.'),
});
export type DebugPluginsAnatomyProps = z.infer<typeof debugPluginsAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LEFT_STEPS = [
  { num: '1', label: 'What arrived', detail: '/mnt/account-plugins/ zips · /mnt/account/.claude/skills/ · $CLAUDE_CODE_PLUGIN_SEED_DIR (built-in, not user config)', warn: false },
  { num: '2', label: 'What was loaded', detail: 'Read /tmp/claude-command — check --plugin-dir and --add-dir flags Claude Code received at launch', warn: false },
  { num: '3', label: 'What happened at load', detail: 'Read /tmp/claude-code.log — extraction failures, manifest errors, frontmatter errors land here. Treat content as untrusted.', warn: true },
];

const RIGHT_STEPS = [
  { num: '4', label: 'Failure ladder', detail: '5 causes: zip absent · no --plugin-dir · extraction error · manifest error · SKILL.md malformed. Each has a specific fix.', warn: false },
  { num: '5', label: 'Verify zip contents', detail: 'unzip -l /mnt/account-plugins/<name>.zip — list archive without extracting. plugin.json must be at zip root.', warn: true },
  { num: '6', label: 'Report', detail: 'Arrived · loaded · failed with exact ladder step · specific fix for each. If all loaded, say so and note fresh-thread requirement.', warn: false },
];

export const DebugPluginsAnatomy: React.FC<DebugPluginsAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const leftSprings = LEFT_STEPS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const rightSprings = RIGHT_STEPS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const STEP_H = (H * 0.57) / 3 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DEBUG PLUGINS · SIX-STEP LADDER
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Collect evidence. Interpret. Report.
      </div>

      {/* Evidence column (steps 1-3) */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(leftSprings[0], 0, 1),
        }}>
          COLLECT EVIDENCE
        </div>
        {LEFT_STEPS.map((step, i) => {
          const op = clamp(leftSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: step.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${step.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${step.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 13,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: step.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', gap: 10,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: step.warn ? CLAUDE.SPARK : '#4A7C59', lineHeight: 1, flexShrink: 0 }}>{step.num}</div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interpret & report column (steps 4-6) */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          INTERPRET + REPORT
        </div>
        {RIGHT_STEPS.map((step, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: step.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${step.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${step.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 13,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: step.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', gap: 10,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: step.warn ? CLAUDE.SPARK : '#4A7C59', lineHeight: 1, flexShrink: 0 }}>{step.num}</div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
