import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BigQueryApiTell — B05 — teardown for bigquery-api skill.
 */

export const bigQueryApiTellSchema = z.object({
  sparkLine: z.string().default('DONE ≠ success and location-always are the two rules. Pagination field split: document it.'),
});
export type BigQueryApiTellProps = z.infer<typeof bigQueryApiTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Job model clear: billing project concept, two modes with when to use each, full async flow',
  'bq_query.sh is reference-quality: both modes, location threading, polling, f/v decoding, dry-run, max-gb',
  'Critical invariant explicit: DONE ≠ success — check status.errorResult before fetching results',
  'location requirement documented: pass on jobs.get + getQueryResults or 404 for non-US datasets',
  'tabledata.list preview identified as no-cost alternative — no query job, no bytes-scanned charge',
];

const BITES = [
  'Pagination field split easy to miss: pageToken (query results) vs nextPageToken (lists) — wrong one yields null silently',
  'Auth placeholder same fiction: "any value works" for BQ_TOKEN confusing outside the runtime',
  'Nested/repeated f/v cell encoding undocumented: scalar decoded, structured left as raw JSON with no examples',
  'totalRows is full count not stop condition — counterintuitive, not highlighted, easy to misuse',
  'Write-heavy ops (destination table, load, extract, copy) deferred to references/api.md without inline preview',
];

const CALLOUT = 'The job model and two critical invariants (DONE ≠ success, location always) are the core of this skill and are documented clearly. The gap is the pagination field name inconsistency — pageToken vs nextPageToken differs silently by endpoint, and reading the wrong one stops pagination after one page with no error.';

export const BigQueryApiTell: React.FC<BigQueryApiTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const COL_TOP = H * 0.40;
  const ITEM_H = (H * 0.51) / 5 - 10;
  const COL_W = (W - W * 0.10) / 2 - 12;

  const getRightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 14 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bitesSprings = BITES.map((_, i) =>
    spring({ frame: frame - 14 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BIGQUERY API · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 36, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Job model solid. Pagination field split: make it visible.
      </div>

      <div style={{
        position: 'absolute', top: COL_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: '#4A7C59', textTransform: 'uppercase' as const,
        opacity: clamp(getRightSprings[0], 0, 1),
      }}>GETS RIGHT</div>
      <div style={{
        position: 'absolute', top: COL_TOP - 22, left: W * 0.05 + COL_W + 24,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.SPARK, textTransform: 'uppercase' as const,
        opacity: clamp(bitesSprings[0], 0, 1),
      }}>BITES</div>

      {GETS_RIGHT.map((text, i) => {
        const op = clamp(getRightSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP + i * (ITEM_H + 10),
            left: W * 0.05, width: COL_W, height: ITEM_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid #4A7C59`, borderRadius: 9,
            display: 'flex', alignItems: 'center', padding: '0 12px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.3 }}>{text}</div>
          </div>
        );
      })}

      {BITES.map((text, i) => {
        const op = clamp(bitesSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP + i * (ITEM_H + 10),
            left: W * 0.05 + COL_W + 24, width: COL_W, height: ITEM_H,
            background: 'rgba(217,119,87,0.04)', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 9,
            display: 'flex', alignItems: 'center', padding: '0 12px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -14}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.3 }}>{text}</div>
          </div>
        );
      })}

      <div style={{
        position: 'absolute', bottom: H * 0.16, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '10px 16px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        boxSizing: 'border-box' as const,
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 10}px)`,
      }}>
        <svg width={18} height={18} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L11 22l8.91-10.96A1 1 0 0019 9.5H13.5L13 2z" fill={CLAUDE.SPARK} />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.5 }}>{CALLOUT}</div>
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
