import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const pagerdutyApiDesignSchema = z.object({
  sparkLine: z.string().default('Sanity check first. Trace routing before incidents. Log entries for paged-why. From: on every mutation.'),
});
export type PagerdutyApiDesignProps = z.infer<typeof pagerdutyApiDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const WORKFLOW_STEPS = [
  { label: 'Sanity check first', note: 'GET /v1/users/me with Token header · 401 empty body = wrong host or wrong auth scheme', color: '#4A7C59' },
  { label: 'Trace routing before querying', note: 'GET service → escalation policy → oncalls with schedule ID · pd_oncall.sh handles bracket params', color: '#4A7C59' },
  { label: 'Log entries for paged-why', note: 'GET /incidents/{id}/log_entries · channel type + timestamp + user · authoritative on-call record', color: '#4A7C59' },
  { label: 'From: header on all mutations', note: 'POST / PUT / PATCH / DELETE all require From: with real email · omit = 400 validation error', color: '#4A7C59' },
];

const GOTCHAS = [
  { label: 'curl -g for bracket params', note: '?user_ids[]= needs --globoff · URL-encoding brackets silently corrupts filters', color: CLAUDE.SPARK },
  { label: 'Reference objects need type field', note: '{"id": "...", "type": "service_reference"} · id alone = 400 validation error', color: CLAUDE.SPARK },
  { label: 'Events v2 errors are plain text', note: 'not JSON · jq pipe on error output throws parse error and hides message', color: CLAUDE.SPARK },
  { label: 'No rate limit header on Events v2', note: 'REST has ratelimit-remaining/reset · Events v2 has none — track volume yourself', color: CLAUDE.SPARK },
];

export const PagerdutyApiDesign: React.FC<PagerdutyApiDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const leftSprings = WORKFLOW_STEPS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const rightSprings = GOTCHAS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.28;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.41;
  const ITEM_H = (H * 0.62) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PAGERDUTY-API · DESIGN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Workflow patterns + gotchas
      </div>

      {/* Left — WORKFLOW */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(leftSprings[0], 0, 1),
        }}>
          WORKFLOW
        </div>
        {WORKFLOW_STEPS.map((item, i) => {
          const op = clamp(leftSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: item.color, lineHeight: 1.3, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Right — GOTCHAS */}
      <div style={{ position: 'absolute', left: W * 0.53, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          GOTCHAS
        </div>
        {GOTCHAS.map((item, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: CLAUDE.SPARK, lineHeight: 1.3, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK, lineHeight: 1.4 }}>{item.note}</div>
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
