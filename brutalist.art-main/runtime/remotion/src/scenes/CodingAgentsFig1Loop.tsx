import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CodingAgentsFig1Loop — "Chatbot vs Coding Agent" concept beat.
 * Source: Anthropic, Coding Agents in the Social Sciences (May 2026)
 *
 * Phase 1 (0–80f): side-by-side loop diagrams
 *   Left  — chatbot turn cycle: human asks → AI suggests → human runs → repeat
 *   Right — agent loop: idea+dataset → write → RUN (terracotta) → read → iterate → result
 *
 * Phase 2 (80–end): stat band rises: 81% tried AI · 20% use agents · Claude Code 86% · Codex 31%
 */

export const codingAgentsFig1LoopSchema = z.object({
  sparkLine: z.string().default('Chatbots suggest. Agents run.'),
});
export type CodingAgentsFig1LoopProps = z.infer<typeof codingAgentsFig1LoopSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const CHATBOT_STEPS = ['Human asks', 'AI suggests code', 'Human runs it', 'Repeat'];
const AGENT_STEPS = ['Idea + dataset', 'Write analysis', 'RUN', 'Read output', 'Iterate', 'Result out'];
const PHASE_SWITCH = 80;

export const CodingAgentsFig1Loop: React.FC<CodingAgentsFig1LoopProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.08;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showP2 = frame >= PHASE_SWITCH;

  const MID = width / 2;
  const BOX_Y = height * 0.26;
  const BOX_H = height * 0.52;
  const BOX_W = width * 0.40;

  // Chatbot loop nodes
  const cbCx = PAD_X + BOX_W / 2;
  const cbNodes = CHATBOT_STEPS.map((_, i) => {
    const angle = (i / CHATBOT_STEPS.length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cbCx + Math.cos(angle) * BOX_W * 0.34,
      y: BOX_Y + BOX_H / 2 + Math.sin(angle) * BOX_H * 0.34,
    };
  });

  // Agent loop nodes
  const agCx = MID + BOX_W * 0.1;
  const agNodes = AGENT_STEPS.map((_, i) => {
    const angle = (i / AGENT_STEPS.length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: agCx + Math.cos(angle) * BOX_W * 0.34,
      y: BOX_Y + BOX_H / 2 + Math.sin(angle) * BOX_H * 0.34,
    };
  });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        SURVEY · N=1,260 QUANTITATIVE SOCIAL SCIENTISTS · FEB–MAR 2026
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showP2 ? '81% tried AI. 20% let it run.' : 'The distinction that carries the report.'}
      </div>

      {/* ── PHASE 1: Loop diagrams ── */}
      {!showP2 && (
        <>
          {/* Divider */}
          <div style={{
            position: 'absolute', left: MID - 1, top: BOX_Y - 20,
            width: 2, height: BOX_H + 40, background: CLAUDE.BORDER,
            opacity: clamp(titleIn, 0, 1),
          }} />

          {/* Panel labels */}
          {[
            { label: 'Chatbot', x: PAD_X + BOX_W / 2 },
            { label: 'Coding Agent', x: agCx },
          ].map((p, pi) => (
            <div key={pi} style={{
              position: 'absolute',
              left: p.x - 80, top: BOX_Y - 34,
              width: 160, fontFamily: SERIF, fontSize: height * 0.020, fontWeight: 600,
              color: pi === 1 ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'center' as const, opacity: clamp(titleIn, 0, 1),
            }}>
              {p.label}
            </div>
          ))}

          {/* SVG arrows + nodes */}
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
            width={width} height={height}>

            {/* Chatbot arrows */}
            {CHATBOT_STEPS.map((_, i) => {
              const a = cbNodes[i];
              const b = cbNodes[(i + 1) % cbNodes.length];
              const anim = spring({ frame: frame - i * 8, fps, config: { damping: 22, stiffness: 80, mass: 1 } });
              return (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={CLAUDE.BORDER} strokeWidth={2}
                  strokeDasharray={`${clamp(anim, 0, 1) * 200} 200`}
                  markerEnd="url(#arr-grey)" />
              );
            })}

            {/* Agent arrows */}
            {AGENT_STEPS.map((_, i) => {
              const a = agNodes[i];
              const b = agNodes[(i + 1) % agNodes.length];
              const isRun = AGENT_STEPS[i] === 'RUN';
              const anim = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 22, stiffness: 80, mass: 1 } });
              return (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={isRun ? CLAUDE.SPARK : CLAUDE.INK_SOFT} strokeWidth={isRun ? 3 : 2}
                  strokeDasharray={`${clamp(anim, 0, 1) * 200} 200`} />
              );
            })}

            <defs>
              <marker id="arr-grey" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={CLAUDE.BORDER} />
              </marker>
            </defs>
          </svg>

          {/* Chatbot node labels */}
          {CHATBOT_STEPS.map((label, i) => {
            const anim = spring({ frame: frame - i * 8, fps, config: { damping: 22, stiffness: 80, mass: 1 } });
            return (
              <div key={label} style={{
                position: 'absolute',
                left: cbNodes[i].x - 70, top: cbNodes[i].y - 14,
                width: 140, textAlign: 'center' as const,
                fontFamily: SANS, fontSize: height * 0.013,
                color: CLAUDE.INK, opacity: clamp(anim, 0, 1),
                background: CLAUDE.CARD, borderRadius: 6,
                border: `1px solid ${CLAUDE.BORDER}`,
                padding: '4px 6px',
              }}>
                {label}
              </div>
            );
          })}

          {/* Agent node labels */}
          {AGENT_STEPS.map((label, i) => {
            const isRun = label === 'RUN';
            const anim = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 22, stiffness: 80, mass: 1 } });
            return (
              <div key={label} style={{
                position: 'absolute',
                left: agNodes[i].x - 64, top: agNodes[i].y - 14,
                width: 128, textAlign: 'center' as const,
                fontFamily: isRun ? SERIF : SANS,
                fontSize: isRun ? height * 0.018 : height * 0.013,
                fontWeight: isRun ? 700 : 400,
                color: isRun ? CLAUDE.SPARK : CLAUDE.INK,
                opacity: clamp(anim, 0, 1),
                background: isRun ? '#FEF5F0' : CLAUDE.CARD,
                borderRadius: 6,
                border: `${isRun ? 2 : 1}px solid ${isRun ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                padding: '4px 6px',
              }}>
                {label}
              </div>
            );
          })}
        </>
      )}

      {/* ── PHASE 2: Stat band ── */}
      {showP2 && (
        <div style={{
          position: 'absolute', left: PAD_X, right: PAD_X,
          top: height * 0.28,
          display: 'flex', flexDirection: 'column' as const, gap: height * 0.055,
          opacity: clamp(phase2In, 0, 1),
        }}>
          {[
            { label: '81%', sub: 'of social scientists have tried AI in their research', hot: false },
            { label: '20%', sub: 'use coding agents — tools that write AND run the analysis', hot: true },
            { label: '86%', sub: 'of agent users use Claude Code  ·  Codex next at 31%', hot: false },
          ].map((s, i) => {
            const anim = spring({ frame: frame - PHASE_SWITCH - i * 12, fps, config: { damping: 24, stiffness: 90, mass: 0.9 } });
            return (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 28,
                opacity: clamp(anim, 0, 1),
                transform: `translateX(${(1 - clamp(anim, 0, 1)) * -20}px)`,
              }}>
                <div style={{
                  fontFamily: SERIF, fontSize: height * 0.070, fontWeight: 700,
                  color: s.hot ? CLAUDE.SPARK : CLAUDE.INK,
                  width: 160, flexShrink: 0, textAlign: 'right' as const,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily: SERIF, fontSize: height * 0.022,
                  color: CLAUDE.INK_SOFT, maxWidth: 700, lineHeight: 1.35,
                }}>
                  {s.sub}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data: Anthropic, Coding Agents in the Social Sciences (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    
      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>
    </AbsoluteFill>

  );
};
