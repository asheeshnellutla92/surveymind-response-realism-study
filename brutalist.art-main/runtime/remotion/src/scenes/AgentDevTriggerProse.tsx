import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AgentDevTriggerProse — B02 — two-location trigger approach (prose description + When to invoke body).
 */

export const agentDevTriggerProseSchema = z.object({
  sparkLine: z.string().default('Prose in description. Prose in body. Two locations, two audiences, one maintenance burden.'),
});
export type AgentDevTriggerProseProps = z.infer<typeof agentDevTriggerProseSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const AgentDevTriggerProse: React.FC<AgentDevTriggerProseProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const loc1In = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const loc2In = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const spIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const TOP = H * 0.27;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        AGENT DEVELOPMENT · TWO-LOCATION TRIGGER DESIGN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 40, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Description for the harness. Body for the agent.
      </div>

      {/* Location 1: Description */}
      <div style={{
        position: 'absolute', top: TOP, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '14px 20px',
        boxSizing: 'border-box' as const,
        opacity: clamp(loc1In, 0, 1), transform: `translateY(${(1 - clamp(loc1In, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: CLAUDE.SPARK, marginBottom: 6 }}>
          LOCATION 1 — DESCRIPTION FIELD (for the harness dispatch decision)
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.7, marginBottom: 8 }}>
          <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>Use this agent when</span> [conditions].<br />
          <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>Typical triggers include</span> [scenario 1 in prose], [scenario 2], and [scenario 3].<br />
          <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>See "When to invoke"</span> in the agent body for worked scenarios.
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
          {['2–4 trigger scenarios', 'proactive + reactive', 'different phrasings', 'when NOT to use'].map((tag, i) => (
            <span key={i} style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.SPARK, background: 'rgba(217,119,87,0.10)', padding: '2px 8px', borderRadius: 4 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Location 2: When to invoke body section */}
      <div style={{
        position: 'absolute', top: TOP + H * 0.24, left: W * 0.05, right: W * 0.05,
        background: 'rgba(74,124,89,0.05)', border: `1.5px solid #4A7C59`,
        borderRadius: 12, padding: '14px 20px',
        boxSizing: 'border-box' as const,
        opacity: clamp(loc2In, 0, 1), transform: `translateY(${(1 - clamp(loc2In, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 6 }}>
          LOCATION 2 — BODY: "WHEN TO INVOKE" SECTION (for the agent once dispatched)
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.8 }}>
          <span style={{ color: '#4A7C59', fontWeight: 700 }}>## When to invoke</span><br />
          <span style={{ color: CLAUDE.INK_SOFT }}>- **[Scenario name].** [What the situation looks like and what the agent should do.]</span><br />
          <span style={{ color: CLAUDE.INK_SOFT }}>- **[Scenario name].** [Same — 2 to 4 prose bullets total.]</span>
        </div>
      </div>

      {/* System prompt structure */}
      <div style={{
        position: 'absolute', top: TOP + H * 0.50, left: W * 0.05, right: W * 0.05,
        background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
        borderLeft: `5px solid ${CLAUDE.INK_SOFT}`,
        borderRadius: 10, padding: '12px 16px',
        boxSizing: 'border-box' as const,
        opacity: clamp(spIn, 0, 1), transform: `translateY(${(1 - clamp(spIn, 0, 1)) * 8}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, marginBottom: 6 }}>SYSTEM PROMPT BODY STRUCTURE</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Role statement', 'Numbered responsibilities', 'Step-by-step process', 'Output format'].map((item, i) => (
            <div key={i} style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: '#4A7C59', fontWeight: 700 }}>{i + 1}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

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
