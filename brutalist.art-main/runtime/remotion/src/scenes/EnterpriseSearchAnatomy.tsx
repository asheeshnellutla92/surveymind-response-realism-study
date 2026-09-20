import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * EnterpriseSearchAnatomy — B01 — three-step search loop + bundled scripts.
 */

export const enterpriseSearchAnatomySchema = z.object({
  sparkLine: z.string().default('Search → read → feedback. Index first, always. Two scripts for the hot path.'),
});
export type EnterpriseSearchAnatomyProps = z.infer<typeof enterpriseSearchAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LOOP_STEPS = [
  {
    num: '1',
    label: 'Search',
    endpoint: '/search',
    detail: 'Ranked snippets across all sources. ~35-word preview for triage. Returns trackingToken + document.id per result.',
    warn: false,
  },
  {
    num: '2',
    label: 'Read',
    endpoint: '/getdocuments',
    detail: 'Full text of documents you picked. Pass document IDs from search. Up to 50 IDs per call.',
    warn: false,
  },
  {
    num: '3',
    label: 'Feedback',
    endpoint: '/feedback',
    detail: 'UPVOTE what you used. DOWNVOTE what you rejected. Submit before finishing — both labels matter.',
    warn: true,
  },
];

const SCRIPTS = [
  {
    name: 'es_search.sh',
    flags: '--datasource slack · --limit 30 · --json',
    detail: 'Cursor pagination, datasource filter, tsv or jsonl output. trackingToken printed to stderr.',
    warn: false,
  },
  {
    name: 'es_read.sh',
    flags: '--json DOC_ID DOC_ID2',
    detail: 'Full document text. Up to 50 IDs per call (script-enforced). Plain = text to stdout.',
    warn: false,
  },
  {
    name: 'feedback: raw curl',
    flags: 'UPVOTE · DOWNVOTE',
    detail: 'One curl per event. No bundled script. trackingTokens array from --json search output.',
    warn: true,
  },
];

export const EnterpriseSearchAnatomy: React.FC<EnterpriseSearchAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const loopSprings = LOOP_STEPS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const scriptSprings = SCRIPTS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const STEP_H = (H * 0.57) / 3 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        ENTERPRISE SEARCH · THREE-STEP LOOP + SCRIPTS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Search. Read. Feedback. In that order.
      </div>

      {/* Search loop column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(loopSprings[0], 0, 1),
        }}>
          SEARCH LOOP
        </div>
        {LOOP_STEPS.map((step, i) => {
          const op = clamp(loopSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: step.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${step.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${step.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 13,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: step.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', gap: 10,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: step.warn ? CLAUDE.SPARK : '#4A7C59', lineHeight: 1, flexShrink: 0 }}>{step.num}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{step.label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: step.warn ? CLAUDE.SPARK : '#4A7C59' }}>{step.endpoint}</div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scripts column */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(scriptSprings[0], 0, 1),
        }}>
          BUNDLED SCRIPTS
        </div>
        {SCRIPTS.map((s, i) => {
          const op = clamp(scriptSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: s.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${s.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${s.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 13,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: s.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: s.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: CLAUDE.INK_SOFT, marginBottom: 5 }}>{s.flags}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{s.detail}</div>
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
