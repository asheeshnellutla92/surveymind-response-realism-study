import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HookifyEventTypes — B02 — 4 event types + conditions system + pitfalls.
 */

export const hookifyEventTypesSchema = z.object({
  sparkLine: z.string().default('bash catches commands. file catches edits. stop catches completion. conditions stack.'),
});
export type HookifyEventTypesProps = z.infer<typeof hookifyEventTypesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const EVENTS = [
  {
    event: 'bash',
    targets: 'Bash tool command strings',
    example: 'rm\\s+-rf · sudo\\s+ · chmod\\s+777',
    color: CLAUDE.SPARK,
  },
  {
    event: 'file',
    targets: 'Edit / Write / MultiEdit — new_text, file_path, old_text, content',
    example: 'console\\.log\\( · \\.env$ · \\.pem$',
    color: '#4A7C59',
  },
  {
    event: 'stop',
    targets: 'When agent wants to stop — use .* for catch-all + checklist body',
    example: 'pattern: .* → completion checklist',
    color: CLAUDE.INK_SOFT,
  },
  {
    event: 'prompt',
    targets: 'User input content (field: user_prompt)',
    example: 'deploy to production → approval checklist',
    color: CLAUDE.INK_SOFT,
  },
];

const PITFALLS = [
  {
    label: 'TOO BROAD',
    bad: 'pattern: log',
    good: 'pattern: console\\.log\\(',
    note: '"log" matches catalog, login, dialog',
  },
  {
    label: 'TOO SPECIFIC',
    bad: 'pattern: rm -rf /tmp',
    good: 'pattern: rm\\s+-rf',
    note: 'Full path misses every other target',
  },
  {
    label: 'YAML ESCAPING',
    bad: '"pattern: \\"\\\\s"',
    good: 'pattern: \\s  (unquoted)',
    note: 'Quoted strings need double backslash',
  },
];

export const HookifyEventTypes: React.FC<HookifyEventTypesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const condIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const eventSprings = EVENTS.map((_, i) =>
    spring({ frame: frame - 10 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const pitfallSprings = PITFALLS.map((_, i) =>
    spring({ frame: frame - 75 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const EVENT_TOP = H * 0.27;
  const EVENT_H = (H * 0.22) / 4 - 6;
  const COND_TOP = EVENT_TOP + H * 0.22 + 16;
  const PITFALL_TOP = COND_TOP + H * 0.09 + 16;
  const PITFALL_H = (H * 0.23) / 3 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        WRITING HOOKIFY RULES · EVENT TYPES + CONDITIONS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Four events. Simple or stacked conditions. Watch the regex.
      </div>

      {/* Event label */}
      <div style={{
        position: 'absolute', top: EVENT_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(eventSprings[0], 0, 1),
      }}>EVENT TYPES</div>

      {EVENTS.map((ev, i) => {
        const op = clamp(eventSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: EVENT_TOP + i * (EVENT_H + 6),
            left: W * 0.05, right: W * 0.05,
            height: EVENT_H,
            background: i < 2 ? (i === 0 ? 'rgba(217,119,87,0.04)' : 'rgba(74,124,89,0.04)') : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${ev.color}`,
            borderRadius: 9,
            display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 14,
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: ev.color, width: 60, flexShrink: 0 }}>{ev.event}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, flex: 1 }}>{ev.targets}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, flexShrink: 0, maxWidth: 280, textAlign: 'right' as const }}>{ev.example}</div>
          </div>
        );
      })}

      {/* Conditions callout */}
      <div style={{
        position: 'absolute', top: COND_TOP, left: W * 0.05, right: W * 0.05,
        height: H * 0.09,
        background: 'rgba(74,124,89,0.05)', border: `1px solid #4A7C59`,
        borderRadius: 10, padding: '10px 16px',
        boxSizing: 'border-box' as const,
        opacity: clamp(condIn, 0, 1), transform: `translateY(${(1 - clamp(condIn, 0, 1)) * 8}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 6 }}>CONDITIONS ARRAY (ADVANCED) — ALL must match</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK }}>
            <span style={{ color: '#4A7C59', fontWeight: 700 }}>field</span>: file_path | new_text | old_text | content | command | user_prompt
          </div>
          <div style={{ width: 1, background: CLAUDE.BORDER, alignSelf: 'stretch' }} />
          <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK }}>
            <span style={{ color: '#4A7C59', fontWeight: 700 }}>operator</span>: regex_match · contains · equals · not_contains · starts_with · ends_with
          </div>
        </div>
      </div>

      {/* Pitfalls label */}
      <div style={{
        position: 'absolute', top: PITFALL_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(pitfallSprings[0], 0, 1),
      }}>COMMON PITFALLS</div>

      {PITFALLS.map((p, i) => {
        const op = clamp(pitfallSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: PITFALL_TOP + i * (PITFALL_H + 8),
            left: W * 0.05, right: W * 0.05,
            height: PITFALL_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${CLAUDE.SPARK}`,
            borderRadius: 9, padding: '8px 14px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: CLAUDE.SPARK, width: 100, flexShrink: 0 }}>{p.label}</span>
              <div style={{ display: 'flex', gap: 14, flex: 1, alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: CLAUDE.SPARK }}>BAD </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT, fontStyle: 'italic' }}>{p.bad}</span>
                </div>
                <span style={{ color: CLAUDE.BORDER }}>→</span>
                <div>
                  <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: '#4A7C59' }}>GOOD </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK }}>{p.good}</span>
                </div>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, flexShrink: 0, maxWidth: 220, textAlign: 'right' as const }}>{p.note}</span>
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
