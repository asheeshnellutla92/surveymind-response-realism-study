import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HookifyRuleAnatomy — B01 — rule file format + frontmatter fields.
 */

export const hookifyRuleAnatomySchema = z.object({
  sparkLine: z.string().default('Name it. Event it. Pattern it. Message it. One markdown file, immediate effect.'),
});
export type HookifyRuleAnatomyProps = z.infer<typeof hookifyRuleAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FIELDS = [
  { field: 'name', req: 'required', detail: 'kebab-case, verb-first — warn-dangerous-rm, block-console-log', color: CLAUDE.SPARK },
  { field: 'enabled', req: 'required', detail: 'true (active) or false (disabled) — toggle without deleting the file', color: CLAUDE.SPARK },
  { field: 'event', req: 'required', detail: 'bash · file · stop · prompt · all', color: CLAUDE.SPARK },
  { field: 'pattern', req: 'required*', detail: 'Python regex: rm\\s+-rf · console\\.log\\( · \\.env$ (*or use conditions)', color: CLAUDE.SPARK },
  { field: 'action', req: 'optional', detail: 'warn (default — shows message, allows op) · block (prevents op / stops session)', color: '#4A7C59' },
];

export const HookifyRuleAnatomy: React.FC<HookifyRuleAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const fileIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const bodyIn = spring({ frame: frame - 40, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const fieldSprings = FIELDS.map((_, i) =>
    spring({ frame: frame - 60 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const TOP = H * 0.27;
  const FIELD_TOP = TOP + H * 0.19;
  const FIELD_H = (H * 0.36) / 5 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        WRITING HOOKIFY RULES · RULE ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        One markdown file. YAML header. Message body.
      </div>

      {/* File location + naming */}
      <div style={{
        position: 'absolute', top: TOP, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '14px 20px',
        boxSizing: 'border-box' as const,
        opacity: clamp(fileIn, 0, 1), transform: `translateY(${(1 - clamp(fileIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 3, marginBottom: 4 }}>FILE LOCATION</div>
            <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK, fontWeight: 700 }}>.claude/hookify.<span style={{ color: CLAUDE.SPARK }}>{'{'}<span style={{ color: '#4A7C59' }}>name</span>{'}'}</span>.local.md</div>
          </div>
          <div style={{ width: 1, background: CLAUDE.BORDER, alignSelf: 'stretch' }} />
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.INK_SOFT, letterSpacing: 3, marginBottom: 4 }}>GOOD NAMES</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT }}>hookify.dangerous-rm.local.md</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT }}>hookify.console-log.local.md</div>
          </div>
          <div style={{ width: 1, background: CLAUDE.BORDER, alignSelf: 'stretch' }} />
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 3, marginBottom: 4 }}>DYNAMIC</div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT }}>Read on every tool use</div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT }}>No reload required</div>
          </div>
        </div>
      </div>

      {/* Body structure inline note */}
      <div style={{
        position: 'absolute', top: TOP + H * 0.115, left: W * 0.05,
        fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(bodyIn, 0, 1),
      }}>
        BODY (after frontmatter) — explain what · why · what to do instead · markdown formatting supported
      </div>

      {/* Fields label */}
      <div style={{
        position: 'absolute', top: FIELD_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(fieldSprings[0], 0, 1),
      }}>FRONTMATTER FIELDS</div>

      {FIELDS.map((f, i) => {
        const op = clamp(fieldSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: FIELD_TOP + i * (FIELD_H + 8),
            left: W * 0.05, right: W * 0.05,
            height: FIELD_H,
            background: i < 4 ? 'rgba(217,119,87,0.04)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${f.color}`,
            borderRadius: 9,
            display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 12,
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: f.color, width: 72, flexShrink: 0 }}>{f.field}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: f.color, width: 72, flexShrink: 0 }}>{f.req}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, flex: 1 }}>{f.detail}</div>
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
