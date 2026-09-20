import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const jiraApiDesignSchema = z.object({
  sparkLine: z.string().default('Sanity check. createmeta before create. Bounded JQL. accountId not email.'),
});
export type JiraApiDesignProps = z.infer<typeof jiraApiDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const WORKFLOW_STEPS = [
  { label: 'Sanity check first', note: 'GET /rest/api/3/myself · 200+accountId = wired up', color: '#4A7C59' },
  { label: 'createmeta before create', note: 'issue types + required fields vary per project', color: '#4A7C59' },
  { label: 'Bounded JQL only', note: '≥1 filter clause required · bare ORDER BY → 400', color: '#4A7C59' },
  { label: 'accountId not email', note: '/rest/api/3/user/search to look up · GDPR change', color: '#4A7C59' },
];

const STATUS_CODES = [
  { label: '204 = success', note: 'expected for PUT / transition / assign / watcher — empty is not error', color: '#4A7C59' },
  { label: '404 masks access', note: 'unbrowsable issues return 404, not 403 — can\'t distinguish', color: CLAUDE.SPARK },
  { label: '410 = endpoint retired', note: 'body names successor — don\'t retry, switch endpoint', color: CLAUDE.SPARK },
  { label: 'Watcher: bare string', note: 'body is \'"accountId"\' not {accountId:…} — easy to send wrong', color: CLAUDE.SPARK },
];

export const JiraApiDesign: React.FC<JiraApiDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stepSprings = WORKFLOW_STEPS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const codeSprings = STATUS_CODES.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
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
        JIRA API · DESIGN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Operations workflow + status codes
      </div>

      {/* Workflow steps — left */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(stepSprings[0], 0, 1),
        }}>
          WORKFLOW
        </div>
        {WORKFLOW_STEPS.map((item, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.INK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Status codes — right */}
      <div style={{ position: 'absolute', left: W * 0.54, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(codeSprings[0], 0, 1),
        }}>
          STATUS CODES
        </div>
        {STATUS_CODES.map((item, i) => {
          const op = clamp(codeSprings[i], 0, 1);
          const isGreen = item.color === '#4A7C59';
          return (
            <div key={i} style={{
              background: isGreen ? '#FFFFFF' : 'rgba(217,119,87,0.05)',
              border: `1px solid ${isGreen ? CLAUDE.BORDER : CLAUDE.SPARK}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isGreen ? '0 1px 5px rgba(61,57,41,0.05)' : '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isGreen ? CLAUDE.INK : CLAUDE.SPARK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
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
