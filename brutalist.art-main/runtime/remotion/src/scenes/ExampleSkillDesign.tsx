import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ExampleSkillDesign — B02 — description trigger + three activation modes + overlap avoidance.
 */

export const exampleSkillDesignSchema = z.object({
  sparkLine: z.string().default('Description triggers model judgment. Three modes: skill vs command vs agent. Overlap: no detection method.'),
});
export type ExampleSkillDesignProps = z.infer<typeof exampleSkillDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TRIGGER_ROWS = [
  { label: 'Specific phrases', detail: '"when the user asks to \'optimize query\', \'speed up this SQL\', \'fix slow query\'"', warn: false },
  { label: 'Keywords', detail: '"mentions \'index\', \'query plan\', \'execution time\', \'slow join\'"', warn: false },
  { label: 'Topic areas', detail: '"or discusses database performance, query optimization, SQL efficiency"', warn: false },
  { label: 'Avoid topic-only', detail: '"This skill helps with databases" → too broad, matches everything database-related', warn: true },
];

const MODE_ROWS = [
  { mode: 'Skill', how: 'Model-invoked', detail: 'Claude activates autonomously when context matches description. No user action.', warn: false },
  { mode: 'Command', how: 'User-invoked', detail: 'User types /command-name. Uses allowed-tools frontmatter. argument-hint shown.', warn: false },
  { mode: 'Agent', how: 'Claude-spawned', detail: 'Claude creates a sub-agent to handle a delegated subtask. Different lifecycle.', warn: false },
  { mode: 'Overlap risk', how: 'Best practice', detail: 'Two skills with overlapping triggers = inconsistent activation. Read all descriptions before writing a new one.', warn: true },
];

export const ExampleSkillDesign: React.FC<ExampleSkillDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const triggerSprings = TRIGGER_ROWS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const modeSprings = MODE_ROWS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const ROW_H = (H * 0.57) / 4 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        EXAMPLE SKILL · TRIGGER + ACTIVATION MODES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Write the description for the model, not the reader.
      </div>

      {/* Trigger patterns */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(triggerSprings[0], 0, 1),
        }}>
          DESCRIPTION TRIGGER PATTERNS
        </div>
        {TRIGGER_ROWS.map((row, i) => {
          const op = clamp(triggerSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: ROW_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 4 }}>{row.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.45, fontStyle: row.detail.startsWith('"') ? 'italic' : 'normal' }}>{row.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Activation modes */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(modeSprings[0], 0, 1),
        }}>
          THREE ACTIVATION MODES
        </div>
        {MODE_ROWS.map((row, i) => {
          const op = clamp(modeSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: ROW_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : '#4A7C59' }}>{row.mode}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, fontWeight: 600 }}>{row.how}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{row.detail}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
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
