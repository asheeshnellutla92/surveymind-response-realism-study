import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DatadogApiAnatomy — B01 — v1/v2 resource split + regional site + headers + ddog helper.
 */

export const datadogApiAnatomySchema = z.object({
  sparkLine: z.string().default('v1 or v2 by resource, not generation. Regional site first.'),
});
export type DatadogApiAnatomyProps = z.infer<typeof datadogApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const VERSIONS = [
  {
    ver: 'v1',
    covers: 'Metrics queries · monitors · dashboards · SLOs · downtime · classic events',
    highlight: false,
  },
  {
    ver: 'v2',
    covers: 'Logs search/aggregation · events search · spans/traces · incidents · RUM · users',
    highlight: false,
  },
];

const SETUP_ROWS = [
  {
    key: 'DD-API-KEY',
    note: 'Identifies the org. Required on EVERY call.',
    warn: true,
  },
  {
    key: 'DD-APPLICATION-KEY',
    note: 'Tied to user + permissions. Required for most read/management endpoints.',
    warn: false,
  },
  {
    key: 'DD_SITE',
    note: 'Regional site (datadoghq.com · datadoghq.eu · us3 · us5 · ap1 · ap2). Wrong site = 403 with valid creds.',
    warn: true,
  },
  {
    key: 'curl -g (globoff)',
    note: 'Mandatory for page[size], filter[query] params. Without it: "bad range in URL" before sending.',
    warn: true,
  },
];

export const DatadogApiAnatomy: React.FC<DatadogApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const verSprings = VERSIONS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const setupSprings = SETUP_ROWS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.36;
  const RIGHT_W = W * 0.50;
  const VER_H = (H * 0.57) / 2 - 12;
  const SETUP_H = (H * 0.57) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DATADOG API · V1/V2 RESOURCE SPLIT + SETUP
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        v1 or v2 by resource. Regional site first.
      </div>

      {/* Versions column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(verSprings[0], 0, 1),
        }}>
          API VERSIONS (BY RESOURCE)
        </div>
        {VERSIONS.map((ver, i) => {
          const op = clamp(verSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '14px 16px', marginBottom: 14,
              height: VER_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: '#4A7C59', marginBottom: 8 }}>{ver.ver}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>{ver.covers}</div>
            </div>
          );
        })}
      </div>

      {/* Setup rows */}
      <div style={{ position: 'absolute', left: W * 0.46, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(setupSprings[0], 0, 1),
        }}>
          SETUP REQUIREMENTS
        </div>
        {SETUP_ROWS.map((row, i) => {
          const op = clamp(setupSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              height: SETUP_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 3 }}>{row.key}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{row.note}</div>
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
