import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const mcpIntegrationAnatomySchema = z.object({
  sparkLine: z.string().default('stdio local process. SSE OAuth cloud. HTTP token REST. WebSocket real-time. Lazy load. Restart on config change.'),
});
export type McpIntegrationAnatomyProps = z.infer<typeof mcpIntegrationAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const SERVER_TYPES = [
  { label: 'stdio — local process', note: 'Claude Code spawns + manages · stdin/stdout · custom servers + NPM packages', color: '#4A7C59' },
  { label: 'SSE — hosted OAuth', note: 'OAuth automatic · user authenticates once · Asana, GitHub, Linear', color: '#4A7C59' },
  { label: 'HTTP — token REST', note: 'Bearer token in headers · stateless · token from env var', color: CLAUDE.SPARK },
  { label: 'WebSocket — real-time', note: 'persistent bidirectional · push notifications · low-latency', color: CLAUDE.SPARK },
];

const LIFECYCLE = [
  { label: 'Load → parse → connect', note: 'plugin loads · config parsed · server starts or connection established', color: '#4A7C59' },
  { label: 'Tools discovered + registered', note: 'mcp__plugin_<name>_<server>__<tool> · appear in /mcp output', color: '#4A7C59' },
  { label: 'Lazy load · restart on change', note: 'first tool use triggers connect · config changes need Claude Code restart', color: CLAUDE.SPARK },
];

export const McpIntegrationAnatomy: React.FC<McpIntegrationAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 125, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const typeSprings = SERVER_TYPES.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const lifeSprings = LIFECYCLE.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.43;
  const RIGHT_W = W * 0.42;
  const ITEM_H = (H * 0.64) / 4 - 10;
  const RIGHT_ITEM_H = (H * 0.45) / 3 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        MCP-INTEGRATION · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        MCP transport types + lifecycle
      </div>

      {/* Server types — left */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(typeSprings[0], 0, 1),
        }}>
          SERVER TYPES
        </div>
        {SERVER_TYPES.map((item, i) => {
          const op = clamp(typeSprings[i], 0, 1);
          const isWarn = item.color === CLAUDE.SPARK;
          return (
            <div key={i} style={{
              background: isWarn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${isWarn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isWarn ? '0 1px 6px rgba(217,119,87,0.07)' : '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isWarn ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Lifecycle — right */}
      <div style={{ position: 'absolute', left: W * 0.54, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(lifeSprings[0], 0, 1),
        }}>
          LIFECYCLE
        </div>
        {LIFECYCLE.map((item, i) => {
          const op = clamp(lifeSprings[i], 0, 1);
          const isWarn = item.color === CLAUDE.SPARK;
          return (
            <div key={i} style={{
              background: isWarn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${isWarn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 10,
              height: RIGHT_ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isWarn ? '0 1px 6px rgba(217,119,87,0.07)' : '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isWarn ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: CLAUDE.INK,
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
