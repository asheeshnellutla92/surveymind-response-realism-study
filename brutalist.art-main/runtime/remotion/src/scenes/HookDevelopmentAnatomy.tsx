import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const hookDevelopmentAnatomySchema = z.object({
  sparkLine: z.string().default('Prompt-Based for judgment. Command for determinism. CLAUDE_PLUGIN_ROOT for portability.'),
});
export type HookDevelopmentAnatomyProps = z.infer<typeof hookDevelopmentAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const HOOK_TYPES = [
  { label: 'Prompt-Based', note: 'LLM-driven · matcher + prompt field · 30s timeout', color: '#4A7C59' },
  { label: 'Command', note: 'bash · exit 0 success · exit 2 blocking · 60s timeout', color: '#4A7C59' },
];

const CONFIG_FORMATS = [
  { label: 'plugin hooks.json', note: '{"description":…,"hooks":{event:[…]}}', color: '#4A7C59' },
  { label: 'settings direct', note: '{event:[…]} — no wrapper', color: '#4A7C59' },
  { label: 'CLAUDE_PLUGIN_ROOT', note: 'required in all command paths for portability', color: CLAUDE.SPARK },
];

export const HookDevelopmentAnatomy: React.FC<HookDevelopmentAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const typeSprings = HOOK_TYPES.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const fmtSprings = CONFIG_FORMATS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.30;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.42;
  const ITEM_H = 78;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        HOOK DEVELOPMENT · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Hook types + config formats
      </div>

      {/* Hook types — left */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(typeSprings[0], 0, 1),
        }}>
          HOOK TYPES
        </div>
        {HOOK_TYPES.map((item, i) => {
          const op = clamp(typeSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '10px 14px', marginBottom: 10,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}

        {/* Exit code legend */}
        <div style={{
          marginTop: 6,
          background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 8, padding: '8px 14px',
          opacity: clamp(typeSprings[1], 0, 1),
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, marginBottom: 4, textTransform: 'uppercase' as const }}>EXIT CODES</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.6 }}>
            0 → success, stdout → transcript<br />
            2 → blocking, stderr → Claude<br />
            other → non-blocking error
          </div>
        </div>
      </div>

      {/* Config formats — right */}
      <div style={{ position: 'absolute', left: W * 0.54, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(fmtSprings[0], 0, 1),
        }}>
          CONFIG FORMATS
        </div>
        {CONFIG_FORMATS.map((item, i) => {
          const op = clamp(fmtSprings[i], 0, 1);
          const isWarn = item.color === CLAUDE.SPARK;
          return (
            <div key={i} style={{
              background: isWarn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${isWarn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '10px 14px', marginBottom: 10,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isWarn ? '0 1px 6px rgba(217,119,87,0.07)' : '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: isWarn ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
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
