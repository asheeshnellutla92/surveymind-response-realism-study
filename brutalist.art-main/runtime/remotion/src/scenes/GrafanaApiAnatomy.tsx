import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * GrafanaApiAnatomy — B01 — time units + request setup + role model + data frames.
 */

export const grafanaApiAnatomySchema = z.object({
  sparkLine: z.string().default('Three time formats. Same API, different base URL. Datasource error in results.<refId>.error, not status.'),
});
export type GrafanaApiAnatomyProps = z.infer<typeof grafanaApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TIME_ROWS = [
  { endpoint: '/api/ds/query', format: 'Unix milliseconds', example: 'NOW_MS=$(( $(date +%s) * 1000 ))', warn: false },
  { endpoint: '/api/annotations', format: 'Unix milliseconds', example: '"time": $(( $(date +%s) * 1000 ))', warn: false },
  { endpoint: 'State-history', format: 'Unix seconds', example: 'from=<epoch_s>&to=<epoch_s>', warn: true },
  { endpoint: 'Silences', format: 'RFC-3339', example: 'date -u +%Y-%m-%dT%H:%M:%SZ  (GNU; BSD differs)', warn: true },
];

const MODEL_ROWS = [
  { label: 'Role model', detail: 'Viewer < Editor < Admin. 403 = wrong role. Dashboard reads + ds/query need only Viewer.', warn: false },
  { label: 'Data frame response', detail: 'results.<refId>.frames[].data.values — parallel column arrays. error → in results.<refId>.error, HTTP may be 200.', warn: true },
  { label: 'grafana() helper', detail: 'One-liner bearer alias. Session-only — not a persisted script. Referenced throughout operations.', warn: true },
];

export const GrafanaApiAnatomy: React.FC<GrafanaApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const timeSprings = TIME_ROWS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const modelSprings = MODEL_ROWS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.44;
  const TIME_H = (H * 0.57) / 4 - 11;
  const MODEL_H = (H * 0.57) / 3 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        GRAFANA API · TIME FORMATS + REQUEST MODEL
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Wrong time format → empty results, not an error.
      </div>

      {/* Time formats */}
      <div style={{ position: 'absolute', left: W * 0.03, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(timeSprings[0], 0, 1),
        }}>
          TIME FORMATS BY ENDPOINT
        </div>
        {TIME_ROWS.map((t, i) => {
          const op = clamp(timeSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: t.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${t.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${t.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '9px 12px', marginBottom: 11,
              height: TIME_H, boxSizing: 'border-box' as const,
              boxShadow: t.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: t.warn ? CLAUDE.SPARK : '#4A7C59' }}>{t.endpoint}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, fontWeight: 600 }}>{t.format}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{t.example}</div>
            </div>
          );
        })}
      </div>

      {/* Model */}
      <div style={{ position: 'absolute', left: W * 0.51, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(modelSprings[0], 0, 1),
        }}>
          REQUEST MODEL
        </div>
        {MODEL_ROWS.map((m, i) => {
          const op = clamp(modelSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: m.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${m.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${m.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: MODEL_H, boxSizing: 'border-box' as const,
              boxShadow: m.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: m.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{m.detail}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
