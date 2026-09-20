import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CommandDevAnatomy — B01 — three locations, five frontmatter fields, dynamic args.
 */

export const commandDevAnatomySchema = z.object({
  sparkLine: z.string().default('Location sets scope. allowed-tools sets blast radius.'),
});
export type CommandDevAnatomyProps = z.infer<typeof commandDevAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LOCATIONS = [
  { label: '.claude/commands/', scope: 'Project scope', helpLabel: '(project)', detail: 'Team workflows — shared with repo' },
  { label: '~/.claude/commands/', scope: 'User scope', helpLabel: '(user)', detail: 'Personal utilities — all projects' },
  { label: 'plugin-name/commands/', scope: 'Plugin scope', helpLabel: '(plugin-name)', detail: 'Bundled with plugin — auto-discovered' },
];

const FIELDS = [
  { name: 'description', detail: 'String shown in /help — default: first line', highlight: false },
  { name: 'allowed-tools', detail: 'Bash(git:*) not Bash(*) — least privilege', highlight: true },
  { name: 'model', detail: 'haiku · sonnet · opus — default: conversation', highlight: false },
  { name: 'argument-hint', detail: '[pr-number] — autocomplete + /help hint', highlight: false },
  { name: 'disable-model-invocation', detail: 'true = manual-only, blocks SlashCommand tool', highlight: false },
];

const ARGS = [
  { label: '$ARGUMENTS', detail: 'All input as one string' },
  { label: '$1 / $2 / $3', detail: 'Positional arguments' },
  { label: '@file', detail: 'Include file contents inline' },
  { label: '!`bash`', detail: 'Inject shell output as context' },
];

export const CommandDevAnatomy: React.FC<CommandDevAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const locSprings = LOCATIONS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const fieldSprings = FIELDS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const argSprings = ARGS.map((_, i) =>
    spring({ frame: frame - 90 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.28;
  const LOC_COL_W = W * 0.38;
  const FIELD_COL_W = W * 0.42;
  const LOC_H = (H * 0.46) / 3 - 10;
  const FIELD_H = (H * 0.46) / 5 - 9;
  const ARG_H = (H * 0.15) / 4 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        COMMAND DEVELOPMENT · LOCATIONS + FRONTMATTER
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three locations. Five fields. One format.
      </div>

      {/* Locations column */}
      <div style={{ position: 'absolute', left: W * 0.05, top: COL_TOP, width: LOC_COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(locSprings[0], 0, 1),
        }}>
          LOCATIONS
        </div>
        {LOCATIONS.map((loc, i) => {
          const op = clamp(locSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 10,
              height: LOC_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 3 }}>{loc.label}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK }}>{loc.scope}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, background: 'rgba(61,57,41,0.06)', padding: '1px 6px', borderRadius: 4 }}>{loc.helpLabel}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{loc.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Frontmatter fields column */}
      <div style={{ position: 'absolute', left: W * 0.47, top: COL_TOP, width: FIELD_COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(fieldSprings[0], 0, 1),
        }}>
          FRONTMATTER FIELDS
        </div>
        {FIELDS.map((field, i) => {
          const op = clamp(fieldSprings[i], 0, 1);
          const isHighlight = field.highlight;
          return (
            <div key={i} style={{
              background: isHighlight ? 'rgba(217,119,87,0.07)' : '#FFFFFF',
              border: `1px solid ${isHighlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${isHighlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 9,
              height: FIELD_H, boxSizing: 'border-box' as const,
              boxShadow: isHighlight ? '0 2px 10px rgba(217,119,87,0.10)' : '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isHighlight ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 3 }}>{field.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{field.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Dynamic args row */}
      <div style={{
        position: 'absolute',
        top: COL_TOP + (H * 0.46) + 14,
        left: W * 0.05, right: W * 0.05,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(argSprings[0], 0, 1),
        }}>
          DYNAMIC ARGUMENTS
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {ARGS.map((arg, i) => {
            const op = clamp(argSprings[i], 0, 1);
            return (
              <div key={i} style={{
                flex: 1, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
                borderTop: `3px solid ${CLAUDE.SPARK}`,
                borderRadius: 8, padding: '10px 12px',
                height: ARG_H, boxSizing: 'border-box' as const,
                boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
                opacity: op, transform: `translateY(${(1 - op) * 10}px)`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 3 }}>{arg.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{arg.detail}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 26, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
