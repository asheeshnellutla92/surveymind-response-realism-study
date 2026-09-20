import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InternalComms3P — B02 — 3P format deep-dive verbatim from examples/3p-updates.md.
 * Left: 3P format template with constraints. Right: 4-step workflow + scale note.
 */

export const internalComms3PSchema = z.object({
  sparkLine: z.string().default('30 to 60 seconds. No more.'),
});
export type InternalComms3PProps = z.infer<typeof internalComms3PSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const SECTIONS = [
  {
    label: 'Progress',
    detail: 'What the team has accomplished over the time period — things shipped, milestones, tasks done',
    constraint: 'Focus on shipped output, not effort',
    accent: false,
  },
  {
    label: 'Plans',
    detail: 'What the team plans to do over the next period — top-of-mind, high-priority items',
    constraint: 'Not a full backlog — just the highest priority',
    accent: false,
  },
  {
    label: 'Problems',
    detail: 'Anything slowing the team down — too few people, bugs, blockers, deals that fell through',
    constraint: 'Be specific about the blocker and its impact',
    accent: true,
  },
];

const WORKFLOW_STEPS = [
  { label: 'Clarify scope', detail: 'Confirm team name + time period (usually past week)' },
  { label: 'Gather context', detail: 'Pull from Slack posts, Drive docs, email, calendar events' },
  { label: 'Draft update', detail: 'Follow strict format — no deviations' },
  { label: 'Review', detail: 'Concise (30-60s read) and data-driven — metrics where possible' },
];

export const InternalComms3P: React.FC<InternalComms3PProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const templateIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const sectionSprings = SECTIONS.map((_, i) =>
    spring({ frame: frame - 22 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const workflowSprings = WORKFLOW_STEPS.map((_, i) =>
    spring({ frame: frame - 55 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const SECTION_H = (H * 0.52) / 3 - 10;
  const STEP_H = (H * 0.46) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        INTERNAL COMMS · 3P UPDATE FORMAT
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Progress. Plans. Problems.
      </div>

      {/* Left: format template + 3 sections */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          opacity: clamp(templateIn, 0, 1),
          transform: `translateY(${(1 - clamp(templateIn, 0, 1)) * 10}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 6 }}>
            ALWAYS THIS FORMAT — NO VARIATIONS:
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.7 }}>
            {'[emoji] [Team Name] (dates covered)'}<br />
            {'Progress: [1-3 sentences]'}<br />
            {'Plans: [1-3 sentences]'}<br />
            {'Problems: [1-3 sentences]'}
          </div>
        </div>

        {SECTIONS.map((section, i) => {
          const op = clamp(sectionSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: section.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${section.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${section.accent ? CLAUDE.SPARK : CLAUDE.INK}`,
              borderRadius: 12, padding: '14px 18px', marginBottom: 10,
              height: SECTION_H, boxSizing: 'border-box' as const,
              boxShadow: section.accent ? '0 6px 18px rgba(217,119,87,0.12)' : '0 4px 12px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: section.accent ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 5 }}>
                {section.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4, marginBottom: 4 }}>
                {section.detail}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT }}>
                → {section.constraint}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: 4-step workflow + scale note */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 14,
          opacity: clamp(workflowSprings[0], 0, 1),
        }}>
          WORKFLOW:
        </div>
        {WORKFLOW_STEPS.map((step, i) => {
          const op = clamp(workflowSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.INK}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>
                {i + 1}. {step.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>
                {step.detail}
              </div>
            </div>
          );
        })}

        <div style={{
          background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 10, padding: '12px 16px', marginTop: 4,
          opacity: clamp(workflowSprings[3], 0, 1),
        }}>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.45 }}>
            <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>Scale note:</span>{' '}
            Bigger teams = bigger 3Ps. Company level covers hiring and deals, not individual tasks.
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
