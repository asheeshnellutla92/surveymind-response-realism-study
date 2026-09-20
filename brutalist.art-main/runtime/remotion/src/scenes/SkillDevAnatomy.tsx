import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SkillDevAnatomy — B01 — three-level progressive disclosure + skill structure.
 */

export const skillDevAnatomySchema = z.object({
  sparkLine: z.string().default('Metadata triggers. Body guides. Resources load as needed. Keep each level lean.'),
});
export type SkillDevAnatomyProps = z.infer<typeof skillDevAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LEVELS = [
  {
    num: '1',
    label: 'METADATA',
    detail: 'name + description — always in context',
    size: '~100 words',
    when: 'Always loaded',
    color: CLAUDE.SPARK,
  },
  {
    num: '2',
    label: 'SKILL.MD BODY',
    detail: 'core procedures, quick reference, resource pointers',
    size: '<5k words',
    when: 'On skill trigger',
    color: '#4A7C59',
  },
  {
    num: '3',
    label: 'BUNDLED RESOURCES',
    detail: 'scripts/, references/, assets/ — loaded as Claude needs them',
    size: 'Unlimited*',
    when: 'As needed',
    color: CLAUDE.INK_SOFT,
  },
];

const RESOURCES = [
  {
    dir: 'scripts/',
    label: 'Executable code',
    detail: 'Python/Bash that would be rewritten repeatedly; execute without reading into context',
    example: 'rotate_pdf.py · validate.sh',
    color: '#4A7C59',
  },
  {
    dir: 'references/',
    label: 'Docs for context',
    detail: 'Schemas, API specs, policies — Claude reads when working; move from SKILL.md to keep it lean',
    example: 'schema.md · api-docs.md',
    color: CLAUDE.INK_SOFT,
  },
  {
    dir: 'assets/',
    label: 'Output files',
    detail: 'Templates, images, boilerplate — not loaded to context, used in the output Claude produces',
    example: 'slides.pptx · hello-world/',
    color: CLAUDE.INK_SOFT,
  },
];

export const SkillDevAnatomy: React.FC<SkillDevAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const levelSprings = LEVELS.map((_, i) =>
    spring({ frame: frame - 16 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const resSprings = RESOURCES.map((_, i) =>
    spring({ frame: frame - 66 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const LEVEL_TOP = H * 0.27;
  const LEVEL_H = (H * 0.26) / 3 - 8;
  const RES_TOP = LEVEL_TOP + H * 0.26 + 24;
  const RES_H = (H * 0.38) / 3 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        SKILL DEVELOPMENT · PROGRESSIVE DISCLOSURE + ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three levels. Each lean. Load when needed.
      </div>

      {/* Level label */}
      <div style={{
        position: 'absolute', top: LEVEL_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(levelSprings[0], 0, 1),
      }}>PROGRESSIVE DISCLOSURE</div>

      {LEVELS.map((level, i) => {
        const op = clamp(levelSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: LEVEL_TOP + i * (LEVEL_H + 8),
            left: W * 0.05, right: W * 0.05,
            height: LEVEL_H,
            background: i === 0 ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
            border: `1px solid ${i === 0 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderLeft: `5px solid ${level.color}`,
            borderRadius: 9,
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: 16,
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: level.color, width: 24, flexShrink: 0 }}>{level.num}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: level.color }}>{level.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{level.detail}</div>
            </div>
            <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: level.color, fontWeight: 700 }}>{level.size}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{level.when}</div>
            </div>
          </div>
        );
      })}

      {/* Resources label */}
      <div style={{
        position: 'absolute', top: RES_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(resSprings[0], 0, 1),
      }}>BUNDLED RESOURCES</div>

      {RESOURCES.map((r, i) => {
        const op = clamp(resSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: RES_TOP + i * (RES_H + 8),
            left: W * 0.05, right: W * 0.05,
            height: RES_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${r.color}`,
            borderRadius: 9, padding: '10px 16px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: r.color, width: 100, flexShrink: 0 }}>{r.dir}</span>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.INK, width: 100, flexShrink: 0 }}>{r.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, flex: 1 }}>{r.detail}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, flexShrink: 0 }}>{r.example}</span>
            </div>
          </div>
        );
      })}

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
