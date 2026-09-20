import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const pagerdutyApiAnatomySchema = z.object({
  sparkLine: z.string().default('Two hosts, two auth models. Alert → service → policy → schedule → incident. Log entries = paged-why.'),
});
export type PagerdutyApiAnatomyProps = z.infer<typeof pagerdutyApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TWO_APIS = [
  { label: 'REST — api.pagerduty.com', note: 'read + manage everything · Authorization: Token token=<key> · NOT Bearer', color: '#4A7C59' },
  { label: 'Events v2 — events.pagerduty.com', note: 'trigger / ack / resolve · routing_key in request body · no Authorization header', color: CLAUDE.SPARK },
  { label: '401 = empty body', note: 'curl default shows nothing · print HTTP status with -w "%{http_code}" always', color: CLAUDE.SPARK },
  { label: 'Rate limits: 960 REST / ~120 Events', note: 'REST: ratelimit-remaining + ratelimit-reset headers · Events v2: no per-request header', color: '#4A7C59' },
];

const DATA_MODEL = [
  { label: 'Alert fires on service', note: 'service has escalation_policy + integrations · alert_key deduplicates', color: '#4A7C59' },
  { label: 'Escalation policy → schedules + users', note: 'policy targets on-call schedules and direct user targets in timed layers', color: '#4A7C59' },
  { label: 'Incident opened + log entries written', note: 'log entries record who was notified · when · which channel (phone/SMS/email/push)', color: CLAUDE.SPARK },
];

export const PagerdutyApiAnatomy: React.FC<PagerdutyApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const leftSprings = TWO_APIS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const rightSprings = DATA_MODEL.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.43;
  const RIGHT_W = W * 0.42;
  const LEFT_ITEM_H = (H * 0.64) / 4 - 10;
  const RIGHT_ITEM_H = (H * 0.45) / 3 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PAGERDUTY-API · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Content model + two-API split
      </div>

      {/* Left — Two APIs */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(leftSprings[0], 0, 1),
        }}>
          TWO APIS
        </div>
        {TWO_APIS.map((item, i) => {
          const op = clamp(leftSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: LEFT_ITEM_H, boxSizing: 'border-box' as const,
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

      {/* Right — Data Model */}
      <div style={{ position: 'absolute', left: W * 0.53, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          DATA MODEL
        </div>
        {DATA_MODEL.map((item, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: RIGHT_ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: item.color, lineHeight: 1.3, marginBottom: 3 }}>{item.label}</div>
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
