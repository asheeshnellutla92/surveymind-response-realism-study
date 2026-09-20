import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * GrafanaApiTell — B05 — standard 5+5 teardown.
 */

export const grafanaApiTellSchema = z.object({
  sparkLine: z.string().default('Time units and alert surfaces separated cleanly. grafana() helper session-only; GNU/BSD date gap.'),
});
export type GrafanaApiTellProps = z.infer<typeof grafanaApiTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Time unit inconsistency documented at top before operations — the silent-empty-result failure mode, not a 4xx',
  'Two alert surfaces clearly separated: Prometheus API (live state) vs provisioning API (definitions) — different endpoints, different verbs',
  'Datasource error-in-200-response named: check results.<refId>.error — HTTP status unreliable on ds/query',
  'Dashboard update requires GET-then-full-replace with 412 version conflict documented with two fix options',
  'ds/query batching: multiple queries[] in one request instead of looping — stated explicitly for the expensive endpoint',
];

const BITES = [
  'grafana() helper is session-only — defined once in a code block, gone after terminal closes; referenced everywhere',
  'GNU vs BSD date for silence creation: one-line comment for macOS alternative — silent wrong timestamp if unhandled',
  'Provisioning lock caveat (X-Disable-Provenance) appears after read examples, easy to miss before writing resources',
  '"grafana" literal in Alertmanager URL path looks like a placeholder — no callout that it is literal text',
  '/api/annotations has no page param — time-window narrowing is right but constraint not surfaced before recipes',
];

const CALLOUT = 'The same Grafana instance uses three different time formats: Unix milliseconds for ds/query and annotations, Unix seconds for state-history, RFC-3339 for silences. Wrong format returns empty results — not a 4xx error — making it the hardest failure mode to diagnose. The skill flags this at the top, which is exactly right.';

export const GrafanaApiTell: React.FC<GrafanaApiTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const biteSprings = BITES.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.40;
  const ITEM_H = (H * 0.51) / 5 - 10;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.40;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        GRAFANA API · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        What it gets right / where it bites
      </div>

      {/* Callout */}
      <div style={{
        position: 'absolute', left: W * 0.04, top: H * 0.255, right: W * 0.04,
        background: 'rgba(217,119,87,0.07)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '10px 16px',
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 8}px)`,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="9" cy="9" r="8" fill="none" stroke={CLAUDE.SPARK} strokeWidth="1.5" />
          <text x="9" y="13.5" textAnchor="middle" fontFamily="serif" fontSize="11" fontWeight="700" fill={CLAUDE.SPARK}>!</text>
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 11.5, color: CLAUDE.INK, lineHeight: 1.55 }}>{CALLOUT}</div>
      </div>

      {/* Gets right column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          GETS RIGHT
        </div>
        {GETS_RIGHT.map((txt, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', alignItems: 'center',
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{txt}</div>
            </div>
          );
        })}
      </div>

      {/* Bites column */}
      <div style={{ position: 'absolute', left: W * 0.52, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(biteSprings[0], 0, 1),
        }}>
          WHERE IT BITES
        </div>
        {BITES.map((txt, i) => {
          const op = clamp(biteSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', alignItems: 'center',
              boxShadow: '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{txt}</div>
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
