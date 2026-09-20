import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HookDevAnatomy — B01 — nine hook events + two hook types.
 */

export const hookDevAnatomySchema = z.object({
  sparkLine: z.string().default('Nine events. Two types. Prompt for judgment, command for speed.'),
});
export type HookDevAnatomyProps = z.infer<typeof hookDevAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const EVENTS = [
  { name: 'PreToolUse', when: 'Before tool runs', use: 'Approve · deny · modify tool calls', highlight: true },
  { name: 'PostToolUse', when: 'After tool completes', use: 'React · feedback · log', highlight: false },
  { name: 'UserPromptSubmit', when: 'User submits prompt', use: 'Add context · validate · block', highlight: false },
  { name: 'Stop', when: 'Agent considers stopping', use: 'Validate completeness · approve/block', highlight: true },
  { name: 'SubagentStop', when: 'Subagent considers stopping', use: 'Task validation for subagents', highlight: false },
  { name: 'SessionStart', when: 'Session begins', use: 'Load context · persist env via $CLAUDE_ENV_FILE', highlight: false },
  { name: 'SessionEnd', when: 'Session ends', use: 'Cleanup · logging · state preservation', highlight: false },
  { name: 'PreCompact', when: 'Before context compaction', use: 'Preserve critical information', highlight: false },
  { name: 'Notification', when: 'Claude sends notification', use: 'Logging · reactions', highlight: false },
];

const TYPES = [
  {
    label: 'PROMPT-BASED',
    subtitle: 'LLM reasoning — recommended',
    events: 'Stop · SubagentStop · UserPromptSubmit · PreToolUse',
    pros: ['Context-aware decisions', 'Natural language logic', 'Better edge case handling'],
    color: '#4A7C59',
  },
  {
    label: 'COMMAND',
    subtitle: 'Deterministic bash — all events',
    events: 'All 9 events supported',
    pros: ['Fast deterministic checks', 'File system operations', 'Performance-critical paths'],
    color: CLAUDE.SPARK,
  },
];

export const HookDevAnatomy: React.FC<HookDevAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rowSprings = EVENTS.map((_, i) =>
    spring({ frame: frame - 16 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const typeSprings = TYPES.map((_, i) =>
    spring({ frame: frame - 88 - i * 10, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } })
  );

  const TABLE_TOP = H * 0.27;
  const ROW_H = (H * 0.48) / 9 - 4;
  const TYPE_TOP = TABLE_TOP + (H * 0.48) + 14;
  const TYPE_H = (H * 0.17) / 1 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        HOOK DEVELOPMENT · EVENTS + TYPES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Nine events. Two types.
      </div>

      {/* Event table header */}
      <div style={{
        position: 'absolute', top: TABLE_TOP - 20, left: W * 0.05, right: W * 0.05,
        display: 'flex', gap: 0,
        opacity: clamp(rowSprings[0], 0, 1),
      }}>
        <div style={{ width: '22%', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>EVENT</div>
        <div style={{ width: '28%', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>WHEN</div>
        <div style={{ width: '50%', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>USE FOR</div>
      </div>

      {/* Event rows */}
      {EVENTS.map((ev, i) => {
        const op = clamp(rowSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: TABLE_TOP + i * (ROW_H + 4),
            left: W * 0.05, right: W * 0.05,
            height: ROW_H,
            background: ev.highlight ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
            border: `1px solid ${ev.highlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderLeft: `4px solid ${ev.highlight ? CLAUDE.SPARK : '#4A7C59'}`,
            borderRadius: 7,
            display: 'flex', alignItems: 'center', gap: 0,
            padding: '0 14px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ width: '22%', fontFamily: MONO, fontSize: 11, fontWeight: 700, color: ev.highlight ? CLAUDE.SPARK : '#4A7C59' }}>{ev.name}</div>
            <div style={{ width: '28%', fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{ev.when}</div>
            <div style={{ width: '50%', fontFamily: SANS, fontSize: 11, color: CLAUDE.INK }}>{ev.use}</div>
          </div>
        );
      })}

      {/* Type cards */}
      <div style={{
        position: 'absolute', top: TYPE_TOP, left: W * 0.05, right: W * 0.05,
        display: 'flex', gap: 14,
      }}>
        {TYPES.map((t, i) => {
          const op = clamp(typeSprings[i], 0, 1);
          return (
            <div key={i} style={{
              flex: 1,
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderTop: `3px solid ${t.color}`,
              borderRadius: 10, padding: '12px 16px',
              height: TYPE_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateY(${(1 - op) * 10}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</span>
                <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{t.subtitle}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, marginBottom: 5, background: 'rgba(61,57,41,0.04)', borderRadius: 4, padding: '2px 6px', display: 'inline-block' }}>{t.events}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {t.pros.map((p, j) => (
                  <div key={j} style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.3 }}>• {p}</div>
                ))}
              </div>
            </div>
          );
        })}
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
