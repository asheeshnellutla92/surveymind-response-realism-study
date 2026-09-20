import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DebugPluginsDesign — B02 — failure ladder + session snapshot + stdout gap.
 */

export const debugPluginsDesignSchema = z.object({
  sparkLine: z.string().default('Session snapshot on start. Config changes: fresh thread only. Stdout gap: structured errors invisible.'),
});
export type DebugPluginsDesignProps = z.infer<typeof debugPluginsDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FAILURES = [
  { label: 'Zip absent', fix: 'Plugin not enabled for this scope, OR config changed after session started.', warn: false },
  { label: 'Zip present, no --plugin-dir', fix: 'Launcher bug — user cannot fix. Note it in the report.', warn: true },
  { label: 'Extraction error', fix: 'Zip exceeds size, file-count, or compression-ratio limits. Log names which.', warn: false },
  { label: 'Manifest error', fix: 'plugin.json malformed: missing name, invalid JSON, or name has spaces/uppercase.', warn: false },
  { label: 'SKILL.md absent/malformed', fix: 'Filename must be exactly SKILL.md (case-sensitive). Frontmatter needs name + description.', warn: false },
];

const CONSTRAINTS = [
  { label: 'Session snapshot', detail: 'Sessions capture config at start. Never reload. A config change = fresh Slack thread.', warn: true },
  { label: 'stdout not persisted', detail: 'Structured startup errors (init.plugin_errors) go to stdout. stdout is NOT saved inside container. These errors are invisible.', warn: true },
  { label: 'Zip root packaging', detail: 'plugin.json must sit at archive root — not inside a folder inside the zip. Most common packaging mistake.', warn: false },
];

export const DebugPluginsDesign: React.FC<DebugPluginsDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const failureSprings = FAILURES.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const constraintSprings = CONSTRAINTS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const FAIL_H = (H * 0.57) / 5 - 10;
  const CONST_H = (H * 0.57) / 3 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DEBUG PLUGINS · FAILURE MODES + CONSTRAINTS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five failure causes. Fresh thread. Stdout gone.
      </div>

      {/* Failure ladder column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(failureSprings[0], 0, 1),
        }}>
          FAILURE LADDER
        </div>
        {FAILURES.map((row, i) => {
          const op = clamp(failureSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 10,
              height: FAIL_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 6px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 2 }}>{row.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{row.fix}</div>
            </div>
          );
        })}
      </div>

      {/* Constraints column */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(constraintSprings[0], 0, 1),
        }}>
          KEY CONSTRAINTS
        </div>
        {CONSTRAINTS.map((row, i) => {
          const op = clamp(constraintSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '12px 14px', marginBottom: 14,
              height: CONST_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 6 }}>{row.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>{row.detail}</div>
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
