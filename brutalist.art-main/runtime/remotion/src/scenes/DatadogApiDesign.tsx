import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DatadogApiDesign — B02 — 3 pagination schemes + JSON:API envelope asymmetry + dashboard PUT trap.
 */

export const datadogApiDesignSchema = z.object({
  sparkLine: z.string().default('Three pagination schemes. Spans vs logs: different JSON:API depth.'),
});
export type DatadogApiDesignProps = z.infer<typeof datadogApiDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PAGING = [
  {
    label: 'Cursor (v2 search)',
    detail: 'Logs · events · spans · RUM. Response carries meta.page.after; pass as page.cursor in next request body.',
    warn: false,
  },
  {
    label: 'Page number (v1 monitors)',
    detail: 'Query params: page + per_page (zero-indexed). v1 monitors only.',
    warn: false,
  },
  {
    label: 'Offset / bracketed (v2 collections)',
    detail: 'page[offset] + page[size] for incidents, users. Requires curl -g (globoff) — brackets kill curl without it.',
    warn: true,
  },
];

const GOTCHAS = [
  {
    label: 'Spans endpoint (JSON:API)',
    detail: 'Request needs data.attributes wrapper. Response: data[].attributes.field. Logs do not — same v2, different shape.',
    warn: true,
  },
  {
    label: 'Events double .attributes',
    detail: 'Event title sits at data[].attributes.attributes.title — one level deeper than the JSON:API envelope. Silent 400.',
    warn: true,
  },
  {
    label: 'Dashboard PUT replaces all',
    detail: 'PUT replaces the entire document. Any widget omitted is silently deleted. Always GET → mutate → PUT the whole doc.',
    warn: true,
  },
];

export const DatadogApiDesign: React.FC<DatadogApiDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const pageSprings = PAGING.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const gotchaSprings = GOTCHAS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const PAGE_H = (H * 0.57) / 3 - 12;
  const GOTCHA_H = (H * 0.57) / 3 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DATADOG API · PAGINATION + JSON:API TRAPS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three pagination schemes. One API, two envelope shapes.
      </div>

      {/* Pagination column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(pageSprings[0], 0, 1),
        }}>
          PAGINATION SCHEMES
        </div>
        {PAGING.map((row, i) => {
          const op = clamp(pageSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '12px 14px', marginBottom: 14,
              height: PAGE_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 6 }}>{row.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>{row.detail}</div>
            </div>
          );
        })}
      </div>

      {/* JSON:API gotchas column */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(gotchaSprings[0], 0, 1),
        }}>
          JSON:API ENVELOPE GOTCHAS
        </div>
        {GOTCHAS.map((row, i) => {
          const op = clamp(gotchaSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)',
              border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '12px 14px', marginBottom: 14,
              height: GOTCHA_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 10px rgba(217,119,87,0.08)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 6 }}>{row.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>{row.detail}</div>
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
