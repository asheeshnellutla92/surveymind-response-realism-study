import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BigQueryApiAnatomy — B01 — job model + two execution modes.
 */

export const bigQueryApiAnatomySchema = z.object({
  sparkLine: z.string().default('Job owns the query. Billing project pays. Location pins the job. DONE ≠ success.'),
});
export type BigQueryApiAnatomyProps = z.infer<typeof bigQueryApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const INVARIANTS = [
  { label: 'location always', body: 'Pass on jobs.get + getQueryResults — omit it and non-US jobs 404', color: CLAUDE.SPARK },
  { label: 'DONE ≠ success', body: 'Check status.errorResult before fetching results — job can be DONE and failed', color: CLAUDE.SPARK },
  { label: 'billing ≠ data project', body: 'Billing project pays; data can live in a different project entirely', color: '#4A7C59' },
];

export const BigQueryApiAnatomy: React.FC<BigQueryApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const syncIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const asyncIn = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const invSprings = INVARIANTS.map((_, i) =>
    spring({ frame: frame - 80 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const TOP = H * 0.27;
  const BLOCK_W = (W - W * 0.10) / 2 - 12;
  const BLOCK_H = H * 0.28;
  const INV_TOP = H * 0.66;
  const INV_H = (H * 0.24) / 3 - 6;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BIGQUERY API · JOB MODEL
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 36, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Every query is a job. Billing project pays. Location pins it.
      </div>

      {/* Sync mode */}
      <div style={{
        position: 'absolute', top: TOP, left: W * 0.05, width: BLOCK_W, height: BLOCK_H,
        background: 'rgba(74,124,89,0.05)', border: `1.5px solid #4A7C59`,
        borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' as const,
        opacity: clamp(syncIn, 0, 1), transform: `translateX(${(1 - clamp(syncIn, 0, 1)) * -12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 8 }}>SYNCHRONOUS — jobs.query</div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
          {[
            'POST jobs.query — blocks up to timeout',
            'Returns rows inline if finishes in time',
            'Simple: one call, immediate result',
            'Use for: interactive queries, quick lookups',
          ].map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: '#4A7C59', fontWeight: 700, minWidth: 16 }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Async mode */}
      <div style={{
        position: 'absolute', top: TOP, left: W * 0.05 + BLOCK_W + 24, width: BLOCK_W, height: BLOCK_H,
        background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' as const,
        opacity: clamp(asyncIn, 0, 1), transform: `translateX(${(1 - clamp(asyncIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: CLAUDE.SPARK, marginBottom: 8 }}>ASYNCHRONOUS — jobs.insert → poll → page</div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
          {[
            'POST jobs.insert — returns jobReference immediately',
            'Poll jobs.get until status.state = DONE',
            'DONE ≠ success — check status.errorResult',
            'Page results via getQueryResults + pageToken',
          ].map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700, minWidth: 16 }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invariants */}
      <div style={{
        position: 'absolute', top: INV_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(invSprings[0], 0, 1),
      }}>CRITICAL INVARIANTS</div>
      {INVARIANTS.map((inv, i) => {
        const op = clamp(invSprings[i], 0, 1);
        const W3 = (W - W * 0.10) / 3 - 8;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: INV_TOP,
            left: W * 0.05 + i * (W3 + 12), width: W3, height: INV_H * 2 + 6,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${inv.color}`, borderRadius: 9,
            display: 'flex', flexDirection: 'column' as const,
            justifyContent: 'center', padding: '0 12px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateY(${(1 - op) * 10}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: inv.color, marginBottom: 4 }}>{inv.label}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{inv.body}</div>
          </div>
        );
      })}

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
