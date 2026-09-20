import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ExampleSkillAnatomy — B01 — frontmatter schema + file structure.
 */

export const exampleSkillAnatomySchema = z.object({
  sparkLine: z.string().default('Description is the trigger. Required: name + description. Optional: version, license, subdirectories.'),
});
export type ExampleSkillAnatomyProps = z.infer<typeof exampleSkillAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FIELDS = [
  { field: 'name', required: true, purpose: 'Skill identifier. Must match the directory name under skills/.', warn: false },
  { field: 'description', required: true, purpose: 'Activation trigger. Tells Claude when to use this skill. Specific phrases + keywords + topic areas.', warn: false },
  { field: 'version', required: false, purpose: 'Optional semantic version number. Runtime effect unspecified.', warn: true },
  { field: 'license', required: false, purpose: 'Optional license information or reference. Runtime effect unspecified.', warn: true },
];

const STRUCTURE = [
  { path: 'skills/<name>/SKILL.md', note: 'Required. Main skill definition. All you need for a simple skill.', warn: false },
  { path: 'references/', note: 'Optional. Reference materials — patterns, API docs, examples.', warn: false },
  { path: 'examples/', note: 'Optional. Example files — sample inputs, expected outputs.', warn: false },
  { path: 'scripts/', note: 'Optional. Helper scripts — automate steps the skill instructs Claude to run.', warn: false },
];

export const ExampleSkillAnatomy: React.FC<ExampleSkillAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const fieldSprings = FIELDS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const structureSprings = STRUCTURE.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const FIELD_H = (H * 0.57) / 4 - 11;
  const STRUCT_H = (H * 0.57) / 4 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        EXAMPLE SKILL · FRONTMATTER + FILE STRUCTURE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Four fields. Description is the trigger.
      </div>

      {/* Frontmatter fields */}
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
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: FIELD_H, boxSizing: 'border-box' as const,
              boxShadow: f.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: f.warn ? CLAUDE.SPARK : '#4A7C59' }}>{f.field}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: f.required ? '#4A7C59' : CLAUDE.INK_SOFT, fontWeight: 600 }}>{f.required ? 'required' : 'optional'}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{f.purpose}</div>
            </div>
          );
        })}
      </div>

      {/* File structure */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(structureSprings[0], 0, 1),
        }}>
          FILE STRUCTURE
        </div>
        {STRUCTURE.map((s, i) => {
          const op = clamp(structureSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: STRUCT_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#4A7C59', marginBottom: 5 }}>{s.path}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{s.note}</div>
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
