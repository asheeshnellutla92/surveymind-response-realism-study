import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BigQueryApiOps — B02 — eight core operations grid.
 */

export const bigQueryApiOpsSchema = z.object({
  sparkLine: z.string().default('Eight operations. Script drives the hard parts. Preview is free. Direct submit for destination tables.'),
});
export type BigQueryApiOpsProps = z.infer<typeof bigQueryApiOpsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const OPS = [
  { num: '01', label: 'run query', detail: 'bq_query.sh — both modes, dry-run, max-gb, named params', accent: CLAUDE.SPARK },
  { num: '02', label: 'submit directly', detail: 'jobs.insert → jobs.get — destination table, BATCH, load/extract', accent: CLAUDE.SPARK },
  { num: '03', label: 'cancel job', detail: 'POST jobs/{id}/cancel — best-effort, poll to confirm', accent: CLAUDE.INK_SOFT },
  { num: '04', label: 'list recent jobs', detail: 'GET /jobs — stateFilter, projection, bytes scanned', accent: CLAUDE.INK_SOFT },
  { num: '05', label: 'list datasets', detail: 'GET /datasets — all=true for hidden; cross-project with URL swap', accent: '#4A7C59' },
  { num: '06', label: 'list tables', detail: 'GET /datasets/{id}/tables — type: TABLE/VIEW/EXTERNAL/SNAPSHOT', accent: '#4A7C59' },
  { num: '07', label: 'get schema + size', detail: 'GET table resource — numRows, numBytes, partitioning, schema.fields', accent: '#4A7C59' },
  { num: '08', label: 'preview rows (free)', detail: 'GET tabledata/list — reads storage, no query job, no bytes-scanned', accent: '#4A7C59' },
];

export const BigQueryApiOps: React.FC<BigQueryApiOpsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const opSprings = OPS.map((_, i) =>
    spring({ frame: frame - 6 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_COUNT = 2;
  const ROWS = Math.ceil(OPS.length / COL_COUNT);
  const TOP = H * 0.27;
  const ITEM_H = (H * 0.62) / ROWS - 6;
  const COL_W = (W - W * 0.10) / COL_COUNT - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BIGQUERY API · EIGHT CORE OPERATIONS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 36, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Run. Submit. Cancel. Browse. Preview for free.
      </div>

      {OPS.map((op, i) => {
        const col = i % COL_COUNT;
        const row = Math.floor(i / COL_COUNT);
        const op_ = clamp(opSprings[i], 0, 1);
        const isFree = op.num === '08';
        return (
          <div key={i} style={{
            position: 'absolute',
            top: TOP + row * (ITEM_H + 6),
            left: W * 0.05 + col * (COL_W + 20),
            width: COL_W, height: ITEM_H,
            background: isFree ? 'rgba(74,124,89,0.05)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${op.accent}`,
            borderRadius: 8, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op_, transform: `translateY(${(1 - op_) * 8}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 12, color: op.accent, fontWeight: 700, minWidth: 26 }}>{op.num}</span>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK }}>{op.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.2 }}>{op.detail}</span>
            </div>
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
