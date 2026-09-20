import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcSkillCallMechanism — How a skill call works at runtime
 * Agent calls run_skill("forecasting", context) → skill loads sub-prompt + tools → returns result
 * Source: agent-decomposition/ — CWC Workshop 2026
 */

export const cwcSkillCallMechanismSchema = z.object({
  sparkLine: z.string().default("Skills keep their complexity to themselves."),
});
export type CwcSkillCallMechanismProps = z.infer<typeof cwcSkillCallMechanismSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const CwcSkillCallMechanism: React.FC<CwcSkillCallMechanismProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const agentIn = spring({ frame: frame - 15, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const callArrowIn = spring({ frame: frame - 55, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } });
  const skillIn = spring({ frame: frame - 85, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const resultArrowIn = spring({ frame: frame - 140, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } });
  const calloutIn = spring({ frame: frame - 180, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 240, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const AGENT_W = width * 0.22;
  const AGENT_H = height * 0.28;
  const AGENT_X = PAD_X;
  const AGENT_Y = height * 0.30;

  const SKILL_W = width * 0.28;
  const SKILL_H = height * 0.30;
  const SKILL_X = width * 0.38;
  const SKILL_Y = height * 0.28;

  const ARROW_Y = AGENT_Y + AGENT_H * 0.35;
  const RESULT_ARROW_Y = AGENT_Y + AGENT_H * 0.65;

  const callArrowLen = (SKILL_X - (AGENT_X + AGENT_W)) * clamp(callArrowIn, 0, 1);
  const resultArrowLen = (SKILL_X - (AGENT_X + AGENT_W)) * clamp(resultArrowIn, 0, 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        SKILL CALL MECHANISM · RUNTIME BOUNDARY
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        How a skill call works: call, execute, return
      </div>

      {/* Core Agent box */}
      <div style={{
        position: 'absolute',
        left: AGENT_X, top: AGENT_Y,
        width: AGENT_W, height: AGENT_H,
        borderRadius: 10,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: clamp(agentIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(agentIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
          Core Agent
        </div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.013, color: CLAUDE.INK, textAlign: 'center' as const, lineHeight: 1.5, padding: '0 12px' }}>
          {'run_skill('}
          <br />
          {'  "forecasting",'}
          <br />
          {'  context'}
          <br />
          {')'}
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT, marginTop: 4 }}>15 lines</div>
      </div>

      {/* Call arrow: agent → skill */}
      <svg style={{
        position: 'absolute',
        left: AGENT_X + AGENT_W,
        top: ARROW_Y - 14,
        width: SKILL_X - (AGENT_X + AGENT_W),
        height: 28,
        overflow: 'visible',
        opacity: clamp(callArrowIn, 0, 1),
      }}>
        <defs>
          <marker id="arr1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.SPARK} />
          </marker>
        </defs>
        <line x1={0} y1={14} x2={callArrowLen - 4} y2={14}
          stroke={CLAUDE.SPARK} strokeWidth={2.5} markerEnd="url(#arr1)" />
        <text x={callArrowLen / 2} y={8} textAnchor="middle"
          fontFamily={SANS} fontSize={height * 0.010} fill={CLAUDE.SPARK} fontWeight={700} letterSpacing={1}>
          CALL
        </text>
      </svg>

      {/* Skill Module box */}
      <div style={{
        position: 'absolute',
        left: SKILL_X, top: SKILL_Y,
        width: SKILL_W, height: SKILL_H,
        borderRadius: 10,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'center', gap: 6,
        padding: '14px 18px',
        opacity: clamp(skillIn, 0, 1),
        transform: `translateX(${(1 - clamp(skillIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
          Skill Module
        </div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.SPARK, fontWeight: 700 }}>forecasting</div>
        <div style={{ width: '100%', height: 1, background: CLAUDE.BORDER, margin: '4px 0' }} />
        {['loads 200-line sub-prompt', 'activates 3 forecast tools', 'runs independently', 'returns structured result'].map((line, i) => {
          const lineIn = spring({ frame: frame - 95 - i * 18, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={i} style={{
              fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK,
              opacity: clamp(lineIn, 0, 1),
              transform: `translateX(${(1 - clamp(lineIn, 0, 1)) * 10}px)`,
            }}>
              · {line}
            </div>
          );
        })}
      </div>

      {/* Result arrow: skill → agent */}
      <svg style={{
        position: 'absolute',
        left: AGENT_X + AGENT_W,
        top: RESULT_ARROW_Y - 14,
        width: SKILL_X - (AGENT_X + AGENT_W),
        height: 28,
        overflow: 'visible',
        opacity: clamp(resultArrowIn, 0, 1),
      }}>
        <defs>
          <marker id="arr2" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <polygon points="8 0, 0 3, 8 6" fill={CLAUDE.INK_SOFT} />
          </marker>
        </defs>
        <line x1={resultArrowLen} y1={14} x2={4} y2={14}
          stroke={CLAUDE.INK_SOFT} strokeWidth={2} strokeDasharray="6 3" markerEnd="url(#arr2)" />
        <text x={resultArrowLen / 2} y={27} textAnchor="middle"
          fontFamily={SANS} fontSize={height * 0.010} fill={CLAUDE.INK_SOFT} fontWeight={600} letterSpacing={1}>
          RESULT
        </text>
      </svg>

      {/* Result snippet */}
      <div style={{
        position: 'absolute',
        left: AGENT_X + AGENT_W + (SKILL_X - AGENT_X - AGENT_W) * 0.3,
        top: RESULT_ARROW_Y + 22,
        background: `${CLAUDE.INK_SOFT}12`,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 6, padding: '6px 10px',
        opacity: clamp(resultArrowIn, 0, 1),
      }}>
        <div style={{ fontFamily: MONO, fontSize: height * 0.010, color: CLAUDE.INK }}>
          {"{ demand: 'high', reorder: 240 }"}
        </div>
      </div>

      {/* Callout box */}
      <div style={{
        position: 'absolute',
        left: SKILL_X + SKILL_W + width * 0.03,
        top: SKILL_Y,
        width: width * 0.22,
        background: `${CLAUDE.SPARK}10`,
        border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '14px 16px',
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateX(${(1 - clamp(calloutIn, 0, 1)) * 16}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>
          The boundary
        </div>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.014, color: CLAUDE.INK, lineHeight: 1.6, fontStyle: 'italic' }}>
          "The core never loads the skill's 400 lines — only its output crosses the boundary."
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
