import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const linearApiTellSchema = z.object({
  sparkLine: z.string().default('No-REST note and HTTP-200-on-error correct. Rate limit HTTP 400 easy to miss in retry logic.'),
});
export type LinearApiTellProps = z.infer<typeof linearApiTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Single GraphQL endpoint documented up front — explicit note that REST paths do not exist',
  'Two ID systems precisely separated: UUID for API ops, identifier for human reads, both work for reads',
  'HTTP 200 on errors documented at the top and built into the linear_gql helper: check .errors first',
  'Markdown for description and comment body — consistent, simpler than ADF, and explicitly flagged',
  'Authorization without Bearer prefix explicitly called out — the most common mistake from other APIs',
];

const BITES = [
  'Rate limit is HTTP 400 not 429 — appears late in the rate-limits section, easy to miss in retry loop design',
  'Connections have no totalCount except search — no detection guide for which connection type you have',
  'Reset headers are epoch milliseconds — the divide-by-1000 calculation is present but easy to overlook on first read',
  'UUID required for mutations — INVALID_INPUT failure mode is opaque, does not say "use UUID instead"',
  'Three-layer success check (HTTP + .errors + success boolean) is spread across sections, never stated as a checklist',
];

const CALLOUT = "Linear's rate limit response is HTTP 400, not 429. A standard retry-on-429 loop will miss rate limiting entirely. Check errors[].extensions.code === 'RATELIMITED' and then sleep until X-RateLimit-Requests-Reset — which is UTC epoch milliseconds, not seconds.";

export const LinearApiTell: React.FC<LinearApiTellProps> = ({ sparkLine }) => {
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
        LINEAR API · TEARDOWN
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
