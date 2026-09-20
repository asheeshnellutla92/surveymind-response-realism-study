import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AgentDevTell2 — B05 — teardown for prose-trigger version of agent-development.
 */

export const agentDevTell2Schema = z.object({
  sparkLine: z.string().default('Two-location trigger docs readable. Maintenance coupling: consolidate.'),
});
export type AgentDevTell2Props = z.infer<typeof agentDevTell2Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Two-location trigger approach explicitly motivated: description for harness, body for agent',
  'name field constraints complete: lowercase/hyphens, 3–50 chars, starts/ends alphanumeric, examples',
  'Tools principle correct: minimum permissions — Read/Grep only unless Write is required',
  'System prompt structure template: role + responsibilities + process + output format',
  'Color field documented: 8 options for visual distinction in the Claude interface',
];

const BITES = [
  'Two-location coupling: description and When to invoke must stay synchronized — no enforcement',
  'Prose scenarios less machine-parseable than <example> XML — harness uses description for dispatch',
  'Trigger mechanism unexplained: does harness pattern-match description or use LM judgment?',
  'model: inherit recommended but no guidance on when to override or what to choose',
  'System prompt length: no constraints documented; no guidance on what makes prompts effective',
];

const CALLOUT = 'The two-location approach is clear for humans: description for the harness, When to invoke for the agent. The gap is maintenance: if trigger scenarios evolve, both locations need updating with no enforcement. The claude-code version\'s single-location <example> approach in the description avoids this coupling.';

export const AgentDevTell2: React.FC<AgentDevTell2Props> = ({ sparkLine }) => {
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
        AGENT DEVELOPMENT · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 38, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        When to invoke structure clear. Two-location coupling: pick one.
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
