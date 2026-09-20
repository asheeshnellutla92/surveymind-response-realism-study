import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ExampleCommandAnatomy — B01 — frontmatter schema + skill body structure.
 */

export const exampleCommandAnatomySchema = z.object({
  sparkLine: z.string().default('Five frontmatter fields. $ARGUMENTS injection. Same loading as legacy commands/ format.'),
});
export type ExampleCommandAnatomyProps = z.infer<typeof exampleCommandAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FIELDS = [
  { field: 'name', purpose: 'Skill identifier — must match the directory name. Used by Claude to invoke.', warn: false },
  { field: 'description', purpose: 'Short string shown in /help. Keep it under 60 chars for clean display.', warn: false },
  { field: 'argument-hint', purpose: 'Syntax hint shown to users on invocation. E.g. <required-arg> [optional-arg].', warn: false },
  { field: 'allowed-tools', purpose: 'Pre-approved tools for this skill — reduces permission prompts during invocation.', warn: true },
  { field: 'model', purpose: 'Override model for this command: "haiku", "sonnet", or "opus".', warn: false },
];

const BODY = [
  { label: '$ARGUMENTS', detail: 'User input verbatim. Everything after the slash command name arrives here.', warn: false },
  { label: 'Parse', detail: 'Extract required and optional arguments from $ARGUMENTS.', warn: false },
  { label: 'Perform', detail: 'Execute the action using allowed tools.', warn: false },
  { label: 'Report', detail: 'Return results to the user. Legacy commands/<name>.md: same loading, different path.', warn: false },
];

export const ExampleCommandAnatomy: React.FC<ExampleCommandAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const fieldSprings = FIELDS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bodySprings = BODY.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const FIELD_H = (H * 0.57) / 5 - 10;
  const BODY_H = (H * 0.57) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        EXAMPLE COMMAND · FRONTMATTER SCHEMA
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five fields. One injection point. Parse → perform → report.
      </div>

      {/* Frontmatter fields column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(fieldSprings[0], 0, 1),
        }}>
          FRONTMATTER FIELDS
        </div>
        {FIELDS.map((f, i) => {
          const op = clamp(fieldSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: f.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${f.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${f.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 10,
              height: FIELD_H, boxSizing: 'border-box' as const,
              boxShadow: f.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 6px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: f.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 2 }}>{f.field}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{f.purpose}</div>
            </div>
          );
        })}
      </div>

      {/* Body structure column */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(bodySprings[0], 0, 1),
        }}>
          SKILL BODY PATTERN
        </div>
        {BODY.map((b, i) => {
          const op = clamp(bodySprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 13,
              height: BODY_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#4A7C59', marginBottom: 5 }}>{b.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{b.detail}</div>
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
