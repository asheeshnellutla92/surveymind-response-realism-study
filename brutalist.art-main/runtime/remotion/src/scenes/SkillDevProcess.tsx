import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SkillDevProcess — B02 — 6-step creation process + 4 writing rules.
 */

export const skillDevProcessSchema = z.object({
  sparkLine: z.string().default('Third-person triggers. Imperative body. Lean SKILL.md. Reference everything.'),
});
export type SkillDevProcessProps = z.infer<typeof skillDevProcessSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const STEPS = [
  { num: '1', label: 'UNDERSTAND', detail: 'Concrete examples of how it will be used; what a user would say to trigger it' },
  { num: '2', label: 'PLAN RESOURCES', detail: 'For each example: what would be rewritten every time vs stored as script/reference/asset' },
  { num: '3', label: 'CREATE STRUCTURE', detail: 'skill/ directory under skills/ with SKILL.md and resource subdirectories' },
  { num: '4', label: 'EDIT', detail: 'Resources first, then SKILL.md last — lean body that references the resources' },
  { num: '5', label: 'VALIDATE', detail: 'Structure, description quality, writing style, progressive disclosure' },
  { num: '6', label: 'ITERATE', detail: 'Use on real tasks; notice inefficiencies; update and test' },
];

const RULES = [
  {
    label: 'DESCRIPTION',
    bad: 'Use this skill when the user needs PDF help.',
    good: 'This skill should be used when the user asks to rotate a PDF, convert pages to images…',
    color: CLAUDE.SPARK,
  },
  {
    label: 'BODY FORM',
    bad: 'You should start by reading the config file.',
    good: 'Start by reading the configuration file.',
    color: '#4A7C59',
  },
  {
    label: 'SKILL.MD SIZE',
    bad: 'Paste the full schema JSON directly into SKILL.md.',
    good: 'Move detailed content to references/schema.md; keep SKILL.md under 2,000 words.',
    color: CLAUDE.INK_SOFT,
  },
  {
    label: 'REFERENCE ALL',
    bad: 'Create references/patterns.md without mentioning it in SKILL.md.',
    good: 'Explicitly reference every script/reference/asset file in SKILL.md.',
    color: CLAUDE.INK_SOFT,
  },
];

export const SkillDevProcess: React.FC<SkillDevProcessProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stepSprings = STEPS.map((_, i) =>
    spring({ frame: frame - 10 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const ruleSprings = RULES.map((_, i) =>
    spring({ frame: frame - 60 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const STEP_TOP = H * 0.27;
  const STEP_H = (H * 0.25) / 6 - 5;
  const RULE_TOP = STEP_TOP + H * 0.25 + 20;
  const RULE_H = (H * 0.38) / 4 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        SKILL DEVELOPMENT · CREATION PROCESS + WRITING RULES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Six steps. Four rules. One lean SKILL.md.
      </div>

      {/* Steps label */}
      <div style={{
        position: 'absolute', top: STEP_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(stepSprings[0], 0, 1),
      }}>6-STEP CREATION PROCESS</div>

      {STEPS.map((step, i) => {
        const op = clamp(stepSprings[i], 0, 1);
        const accent = i < 3 ? CLAUDE.SPARK : '#4A7C59';
        return (
          <div key={i} style={{
            position: 'absolute',
            top: STEP_TOP + i * (STEP_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: STEP_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${accent}`,
            borderRadius: 9, display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 12,
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: accent, width: 18, flexShrink: 0 }}>{step.num}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: accent, width: 120, flexShrink: 0 }}>{step.label}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, flex: 1 }}>{step.detail}</div>
          </div>
        );
      })}

      {/* Rules label */}
      <div style={{
        position: 'absolute', top: RULE_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(ruleSprings[0], 0, 1),
      }}>WRITING RULES</div>

      {RULES.map((rule, i) => {
        const op = clamp(ruleSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: RULE_TOP + i * (RULE_H + 8),
            left: W * 0.05, right: W * 0.05,
            height: RULE_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${rule.color}`,
            borderRadius: 9, padding: '8px 14px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: rule.color, width: 100, flexShrink: 0, paddingTop: 2 }}>{rule.label}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: CLAUDE.SPARK, width: 28, flexShrink: 0, paddingTop: 1 }}>BAD</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, flex: 1, fontStyle: 'italic' }}>{rule.bad}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#4A7C59', width: 28, flexShrink: 0, paddingTop: 1 }}>GOOD</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, flex: 1 }}>{rule.good}</span>
                </div>
              </div>
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
