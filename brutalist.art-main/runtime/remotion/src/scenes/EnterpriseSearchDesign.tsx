import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * EnterpriseSearchDesign — B02 — index-first rule + pagination + empty-results logic.
 */

export const enterpriseSearchDesignSchema = z.object({
  sparkLine: z.string().default('Cursor pagination. Broaden before giving up. Feedback trains the ranker — both labels.'),
});
export type EnterpriseSearchDesignProps = z.infer<typeof enterpriseSearchDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LEFT_ROWS = [
  { label: 'Index first (always)', detail: 'Search enterprise index before per-source APIs. Cross-source ranking, dedup, and access control already done. Fallback to per-source only for uncovered content — say so when you do.', warn: false },
  { label: 'Cursor pagination', detail: 'Pass cursor from response back verbatim. Never construct one. Stop when hasMoreResults is false or cursor absent. Facet values within one entry: OR. Between entries: AND.', warn: false },
  { label: 'Empty-results logic', detail: 'Broaden before concluding not indexed: drop filters → shorten to rarest terms. After 2 reformulations: fall back + say so. Empty can also mean permissions gap — API doesn\'t distinguish.', warn: true },
];

const RIGHT_ROWS = [
  { label: 'Base URL -be suffix', detail: 'https://{instance}-be.glean.com (backend, not web UI). HTML body on any status = wrong host. 401/403 = credential not configured — report, don\'t debug.', warn: true },
  { label: 'Rate limits', detail: '429: back off, wait a few seconds, retry once. Searches cheap; reading very large documents is the expensive call.', warn: false },
  { label: 'Feedback timing', detail: 'Submit before finishing any task where you used search results. UPVOTE what you used. DOWNVOTE what you opened and rejected. Both labels train the ranker.', warn: false },
  { label: 'Permissions gap', detail: 'Results filtered to what authenticated identity can see. Empty results may mean permissions gap, not missing content — API doesn\'t distinguish.', warn: true },
];

export const EnterpriseSearchDesign: React.FC<EnterpriseSearchDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const leftSprings = LEFT_ROWS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const rightSprings = RIGHT_ROWS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const LEFT_H = (H * 0.57) / 3 - 12;
  const RIGHT_H = (H * 0.57) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        ENTERPRISE SEARCH · DESIGN RULES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Index first. Cursor forward. Broaden before giving up.
      </div>

      {/* Left: core rules */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(leftSprings[0], 0, 1),
        }}>
          CORE RULES
        </div>
        {LEFT_ROWS.map((row, i) => {
          const op = clamp(leftSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 13,
              height: LEFT_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 5 }}>{row.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{row.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Right: gotchas */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          GOTCHAS + LIMITS
        </div>
        {RIGHT_ROWS.map((row, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: row.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 8, padding: '9px 12px', marginBottom: 10,
              height: RIGHT_H, boxSizing: 'border-box' as const,
              boxShadow: row.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: row.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 3 }}>{row.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{row.detail}</div>
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
