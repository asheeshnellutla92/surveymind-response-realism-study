import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const hookDevelopmentDesignSchema = z.object({
  sparkLine: z.string().default('9 events. 4 support prompt hooks. All hooks run in parallel — no ordering.'),
});
export type HookDevelopmentDesignProps = z.infer<typeof hookDevelopmentDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const EVENTS = [
  { name: 'PreToolUse', type: 'prompt+command', note: 'validate or reconsider before tool runs', color: '#4A7C59' },
  { name: 'Stop / SubagentStop', type: 'prompt+command', note: 'final check or summary before session ends', color: '#4A7C59' },
  { name: 'UserPromptSubmit', type: 'prompt+command', note: 'pre-process user input', color: '#4A7C59' },
  { name: 'PostToolUse / SessionStart / SessionEnd / PreCompact / Notification', type: 'command only', note: 'command hooks only — prompt hooks silently ignored', color: CLAUDE.SPARK },
];

const EXEC_RULES = [
  { label: 'Parallel execution', note: 'all matching hooks run at once — no ordering guarantee, no shared output', color: CLAUDE.SPARK },
  { label: 'No hot-swap', note: 'hooks load at session start — restart claude after any hooks.json change', color: CLAUDE.SPARK },
  { label: 'Case-sensitive matchers', note: '"Write" ≠ "write" — wrong case means hook never fires', color: CLAUDE.SPARK },
  { label: 'Security defaults', note: 'quote bash vars · validate inputs · deny path traversal · block .env reads', color: '#4A7C59' },
];

export const HookDevelopmentDesign: React.FC<HookDevelopmentDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const evtSprings = EVENTS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const ruleSprings = EXEC_RULES.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.30;
  const LEFT_W = W * 0.43;
  const RIGHT_W = W * 0.40;
  const ITEM_H = (H * 0.60) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        HOOK DEVELOPMENT · DESIGN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Events + execution model
      </div>

      {/* Events — left */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(evtSprings[0], 0, 1),
        }}>
          LIFECYCLE EVENTS
        </div>
        {EVENTS.map((item, i) => {
          const op = clamp(evtSprings[i], 0, 1);
          const isWarn = item.color === CLAUDE.SPARK;
          return (
            <div key={i} style={{
              background: isWarn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${isWarn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isWarn ? '0 1px 6px rgba(217,119,87,0.07)' : '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: isWarn ? CLAUDE.SPARK : CLAUDE.INK }}>{item.name}</div>
                <div style={{
                  fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 1,
                  color: isWarn ? CLAUDE.SPARK : '#4A7C59',
                  background: isWarn ? 'rgba(217,119,87,0.10)' : 'rgba(74,124,89,0.10)',
                  borderRadius: 4, padding: '1px 5px',
                }}>{item.type}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Execution rules — right */}
      <div style={{ position: 'absolute', left: W * 0.55, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(ruleSprings[0], 0, 1),
        }}>
          EXECUTION RULES
        </div>
        {EXEC_RULES.map((item, i) => {
          const op = clamp(ruleSprings[i], 0, 1);
          const isGreen = item.color === '#4A7C59';
          return (
            <div key={i} style={{
              background: isGreen ? '#FFFFFF' : 'rgba(217,119,87,0.05)',
              border: `1px solid ${isGreen ? CLAUDE.BORDER : CLAUDE.SPARK}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isGreen ? '0 1px 5px rgba(61,57,41,0.05)' : '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: isGreen ? CLAUDE.INK : CLAUDE.SPARK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
          <polygon points="8,1 10,6 15,6 11,10 13,15 8,12 3,15 5,10 1,6 6,6" fill={CLAUDE.SPARK} />
        </svg>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
