import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * GrafanaApiDesign — B02 — two alert surfaces + dashboard update + query batching.
 */

export const grafanaApiDesignSchema = z.object({
  sparkLine: z.string().default('Two alert surfaces: live state vs definitions. Dashboard update = full replace. Batch queries[], not loops.'),
});
export type GrafanaApiDesignProps = z.infer<typeof grafanaApiDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const ALERT_ROWS = [
  { surface: 'Prometheus API', how: 'Live state — read-only', detail: '/api/prometheus/grafana/api/v1/rules → firing / pending / inactive. "grafana" is literal, not a placeholder.', warn: false },
  { surface: 'Provisioning API', how: 'Definitions — full CRUD', detail: '/api/v1/provisioning/alert-rules → query, condition, labels, for-duration. Resources UI-locked unless X-Disable-Provenance: true.', warn: true },
];

const GOTCHAS = [
  { label: 'Dashboard update = full replace', detail: 'No partial PATCH. GET → modify full JSON → POST back. Include version or set overwrite:true. 412 = version conflict.', warn: true },
  { label: 'Batch ds/query calls', detail: 'Each call fans out to the database. Put multiple queries[] in one request instead of looping separate POSTs.', warn: false },
  { label: 'provisioning lock', detail: 'Resources created via provisioning API are read-only in the UI. Send X-Disable-Provenance: true to unlock.', warn: true },
  { label: 'annotations: no page param', detail: '/api/annotations has limit but no page. For large time windows, narrow from/to instead of paginating.', warn: true },
];

export const GrafanaApiDesign: React.FC<GrafanaApiDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const alertSprings = ALERT_ROWS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const gotchaSprings = GOTCHAS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.44;
  const ALERT_H = (H * 0.57) / 2 - 13;
  const GOTCHA_H = (H * 0.57) / 4 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        GRAFANA API · ALERT SURFACES + DESIGN PATTERNS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 40, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Live state and definitions are different endpoints.
      </div>

      {/* Alert surfaces (left) */}
      <div style={{ position: 'absolute', left: W * 0.03, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(alertSprings[0], 0, 1),
        }}>
          TWO ALERT RULE SURFACES
        </div>
        {ALERT_ROWS.map((a, i) => {
          const op = clamp(alertSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: a.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${a.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${a.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '12px 14px', marginBottom: 14,
              height: ALERT_H, boxSizing: 'border-box' as const,
              boxShadow: a.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: a.warn ? CLAUDE.SPARK : '#4A7C59' }}>{a.surface}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, fontWeight: 600 }}>{a.how}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>{a.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Gotchas (right) */}
      <div style={{ position: 'absolute', left: W * 0.51, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(gotchaSprings[0], 0, 1),
        }}>
          DESIGN GOTCHAS
        </div>
        {GOTCHAS.map((g, i) => {
          const op = clamp(gotchaSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: g.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${g.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${g.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '9px 12px', marginBottom: 11,
              height: GOTCHA_H, boxSizing: 'border-box' as const,
              boxShadow: g.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: g.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 4 }}>{g.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{g.detail}</div>
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
