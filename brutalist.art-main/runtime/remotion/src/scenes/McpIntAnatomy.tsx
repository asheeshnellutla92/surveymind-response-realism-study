import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * McpIntAnatomy — B01 — two config methods + four server types.
 */

export const mcpIntAnatomySchema = z.object({
  sparkLine: z.string().default('stdio spawns. SSE authenticates. HTTP calls. ws streams.'),
});
export type McpIntAnatomyProps = z.infer<typeof mcpIntAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const CONFIG_METHODS = [
  {
    label: '.mcp.json',
    sub: 'Recommended',
    detail: 'Plugin root file · clear separation · best for multiple servers',
    color: '#4A7C59',
  },
  {
    label: 'mcpServers in plugin.json',
    sub: 'Single-server',
    detail: 'Inline field · one config file · good for simple plugins',
    color: CLAUDE.INK_SOFT,
  },
];

const SERVER_TYPES = [
  {
    type: 'stdio',
    transport: 'Child process',
    auth: 'Env vars',
    bestFor: 'Local tools · custom servers · NPM MCP packages',
    color: '#4A7C59',
    highlight: false,
  },
  {
    type: 'SSE',
    transport: 'HTTP stream',
    auth: 'OAuth (auto)',
    bestFor: 'Hosted services · Asana · GitHub · cloud APIs',
    color: CLAUDE.SPARK,
    highlight: true,
  },
  {
    type: 'HTTP',
    transport: 'REST API',
    auth: 'Token (headers)',
    bestFor: 'REST backends · stateless interactions',
    color: CLAUDE.INK_SOFT,
    highlight: false,
  },
  {
    type: 'ws',
    transport: 'WebSocket',
    auth: 'Token (headers)',
    bestFor: 'Real-time streaming · push notifications · low latency',
    color: CLAUDE.INK_SOFT,
    highlight: false,
  },
];

export const McpIntAnatomy: React.FC<McpIntAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const configSprings = CONFIG_METHODS.map((_, i) =>
    spring({ frame: frame - 16 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const typeSprings = SERVER_TYPES.map((_, i) =>
    spring({ frame: frame - 52 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONFIG_TOP = H * 0.27;
  const CONFIG_H = (H * 0.18) / 2 - 9;
  const TYPE_TOP = CONFIG_TOP + H * 0.18 + 20;
  const TYPE_H = (H * 0.47) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        MCP INTEGRATION · CONFIG METHODS + SERVER TYPES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Two methods. Four transports.
      </div>

      {/* Config method label */}
      <div style={{
        position: 'absolute', top: CONFIG_TOP - 20, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(configSprings[0], 0, 1),
      }}>
        CONFIGURATION METHODS
      </div>

      {/* Config method cards */}
      <div style={{ position: 'absolute', top: CONFIG_TOP, left: W * 0.05, right: W * 0.05, display: 'flex', gap: 14 }}>
        {CONFIG_METHODS.map((m, i) => {
          const op = clamp(configSprings[i], 0, 1);
          return (
            <div key={i} style={{
              flex: 1, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `5px solid ${m.color}`,
              borderRadius: 10, padding: '12px 16px',
              height: CONFIG_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * (i === 0 ? -10 : 10)}px)`,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: m.color }}>{m.label}</span>
                <span style={{ fontFamily: SANS, fontSize: 10, color: '#FFFFFF', background: m.color, padding: '1px 6px', borderRadius: 4 }}>{m.sub}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT }}>{m.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Server types label */}
      <div style={{
        position: 'absolute', top: TYPE_TOP - 20, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(typeSprings[0], 0, 1),
      }}>
        SERVER TYPES
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute', top: TYPE_TOP - 18, left: W * 0.05, right: W * 0.05,
        display: 'flex', opacity: clamp(typeSprings[0], 0, 1),
      }}>
        {['TYPE', 'TRANSPORT', 'AUTH', 'BEST FOR'].map((h, i) => (
          <div key={i} style={{
            width: i === 0 ? '12%' : i === 1 ? '16%' : i === 2 ? '18%' : '54%',
            fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2,
            color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
          }}>{h}</div>
        ))}
      </div>

      {/* Server type rows */}
      {SERVER_TYPES.map((t, i) => {
        const op = clamp(typeSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: TYPE_TOP + i * (TYPE_H + 10),
            left: W * 0.05, right: W * 0.05,
            height: TYPE_H,
            background: t.highlight ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
            border: `1px solid ${t.highlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderLeft: `4px solid ${t.color}`,
            borderRadius: 9,
            display: 'flex', alignItems: 'center',
            padding: '0 16px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ width: '12%', fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.color }}>{t.type}</div>
            <div style={{ width: '16%', fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{t.transport}</div>
            <div style={{ width: '18%', fontFamily: SANS, fontSize: 11, color: CLAUDE.INK }}>{t.auth}</div>
            <div style={{ width: '54%', fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{t.bestFor}</div>
          </div>
        );
      })}

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
