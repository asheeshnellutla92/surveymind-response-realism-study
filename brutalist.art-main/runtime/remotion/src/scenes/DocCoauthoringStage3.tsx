import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DocCoauthoringStage3 — B04 — Stage 3: Reader Testing.
 * Central callout: "Test with a fresh Claude — no context bleed."
 * Left: sub-agent path (automatic). Right: manual path. Bottom: exit condition.
 */

export const docCoauthoringStage3Schema = z.object({
  sparkLine: z.string().default('A fresh Claude finds your blind spots.'),
});
export type DocCoauthoringStage3Props = z.infer<typeof docCoauthoringStage3Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const AGENT_STEPS = [
  'Predict 5–10 questions readers would ask',
  'Invoke sub-agent with doc + each question',
  'Summarize what Reader Claude got right/wrong',
  'Run ambiguity + contradiction checks',
  'Fix gaps → loop back to refinement',
];

const MANUAL_STEPS = [
  'Generate 5–10 realistic reader questions',
  'Open a fresh Claude conversation',
  'Paste doc; ask Reader Claude the questions',
  'Also ask: what\'s ambiguous? what\'s assumed?',
  'Iterate on gaps found',
];

export const DocCoauthoringStage3: React.FC<DocCoauthoringStage3Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const exitIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const agentSprings = AGENT_STEPS.map((_, i) =>
    spring({ frame: frame - 26 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const manualSprings = MANUAL_STEPS.map((_, i) =>
    spring({ frame: frame - 26 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.38;
  const COL_W = W * 0.40;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DOC CO-AUTHORING · STAGE 3 · READER TESTING
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Test before others read it.
      </div>

      {/* Central callout */}
      <div style={{
        position: 'absolute', top: H * 0.24, left: W * 0.08, right: W * 0.08,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 16, padding: '16px 28px',
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 17, color: CLAUDE.INK, lineHeight: 1.55, textAlign: 'center' }}>
          Use a <span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>fresh Claude</span> with no context from this conversation — to verify the document works for readers who weren't in the room.
        </div>
      </div>

      {/* Two-column: auto (sub-agent) vs manual */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 14,
          opacity: clamp(agentSprings[0], 0, 1),
        }}>
          ⚡ AUTOMATIC (Claude Code / sub-agents)
        </div>
        {AGENT_STEPS.map((step, i) => {
          const op = clamp(agentSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 13,
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: CLAUDE.SPARK, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#FFF', marginTop: 1,
              }}>
                {i + 1}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.4 }}>
                {step}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.53, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 14,
          opacity: clamp(manualSprings[0], 0, 1),
        }}>
          ✋ MANUAL (claude.ai web)
        </div>
        {MANUAL_STEPS.map((step, i) => {
          const op = clamp(manualSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 13,
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: CLAUDE.INK, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#FFF', marginTop: 1,
              }}>
                {i + 1}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.4 }}>
                {step}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exit condition */}
      <div style={{
        position: 'absolute', bottom: H * 0.10, left: W * 0.05, right: W * 0.05,
        background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12, padding: '14px 22px',
        display: 'flex', alignItems: 'center', gap: 16,
        opacity: clamp(exitIn, 0, 1), boxShadow: '0 4px 14px rgba(61,57,41,0.07)',
      }}>
        <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.SPARK, fontWeight: 700, flexShrink: 0 }}>
          EXIT:
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 17, color: CLAUDE.INK, fontStyle: 'italic', flex: 1 }}>
          "Reader Claude consistently answers questions correctly and doesn't surface new gaps or ambiguities."
        </div>
      </div>

      {/* Spark line */}
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
