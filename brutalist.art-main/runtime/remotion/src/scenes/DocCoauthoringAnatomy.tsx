import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DocCoauthoringAnatomy — B01 — TRIGGER + three-stage overview + doc types.
 * Left: trigger conditions + doc types. Right: three stage cards stacked.
 */

export const docCoauthoringAnatomySchema = z.object({
  sparkLine: z.string().default('Context first. Readers second.'),
});
export type DocCoauthoringAnatomyProps = z.infer<typeof docCoauthoringAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const DOC_TYPES = ['PRD', 'Design Doc', 'Decision Doc', 'RFC', 'Technical Spec', 'Proposal'];
const STAGES = [
  { num: 1, label: 'Context Gathering', sub: 'Close the gap between what the user knows and what Claude knows.', delay: 20 },
  { num: 2, label: 'Refinement & Structure', sub: 'Build each section through brainstorming, curation, and iterative drafting.', delay: 36 },
  { num: 3, label: 'Reader Testing', sub: 'Test with a fresh Claude — no context bleed — to catch blind spots before others read it.', delay: 52 },
];

export const DocCoauthoringAnatomy: React.FC<DocCoauthoringAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const stageSprings = STAGES.map(s =>
    spring({ frame: frame - s.delay, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const chipSprings = DOC_TYPES.map((_, i) =>
    spring({ frame: frame - 30 - i * 8, fps, config: { damping: 30, stiffness: 140, mass: 0.8 } })
  );

  const CONTENT_TOP = H * 0.20;
  const LEFT_W = W * 0.43;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.44;
  const STAGE_H = (H * 0.62) / 3 - 14;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DOC CO-AUTHORING · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three stages. One document that works.
      </div>

      {/* Left: TRIGGER + doc types */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 14, padding: '16px 20px',
          marginBottom: 22, opacity: clamp(triggerIn, 0, 1),
          transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8 }}>
            TRIGGER
          </div>
          <div style={{ fontFamily: MONO, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.55 }}>
            User mentions <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>writing docs</span>, creating proposals, drafting specs, or starting a substantial writing task.
          </div>
        </div>

        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
          marginBottom: 16, opacity: clamp(triggerIn, 0, 1),
        }}>
          DOC TYPES COVERED:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10, marginBottom: 22 }}>
          {DOC_TYPES.map((t, i) => {
            const op = clamp(chipSprings[i], 0, 1);
            return (
              <div key={i} style={{
                background: i < 2 ? 'rgba(217,119,87,0.09)' : '#FFFFFF',
                border: `1px solid ${i < 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderRadius: 8, padding: '6px 16px',
                fontFamily: MONO, fontSize: 15,
                color: i < 2 ? CLAUDE.SPARK : CLAUDE.INK,
                opacity: op, transform: `translateY(${(1 - op) * 8}px)`,
              }}>
                {t}
              </div>
            );
          })}
        </div>

        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, padding: '14px 18px',
          opacity: clamp(triggerIn * 0.8, 0, 1),
          boxShadow: '0 4px 14px rgba(61,57,41,0.06)',
        }}>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 2, marginBottom: 6 }}>
            ALSO WORKS WITH:
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            Integrations — Slack · Teams · Google Drive · SharePoint · MCP servers
          </div>
        </div>
      </div>

      {/* Right: Three stage cards */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        {STAGES.map((stage, i) => {
          const op = clamp(stageSprings[i], 0, 1);
          return (
            <div key={i}>
              <div style={{
                background: i === 2 ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
                border: `1px solid ${i === 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderLeft: `5px solid ${i === 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderRadius: 14, padding: '16px 20px',
                height: STAGE_H, boxSizing: 'border-box' as const,
                boxShadow: i === 2 ? '0 6px 22px rgba(217,119,87,0.14)' : '0 4px 14px rgba(61,57,41,0.06)',
                opacity: op, transform: `translateX(${(1 - op) * 18}px)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: i === 2 ? CLAUDE.SPARK : CLAUDE.INK,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#FFF',
                  }}>
                    {stage.num}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: CLAUDE.INK }}>
                    {stage.label}
                  </div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>
                  {stage.sub}
                </div>
              </div>
              {i < 2 && (
                <div style={{
                  textAlign: 'center', fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT,
                  height: 20, lineHeight: '20px', marginTop: 4, marginBottom: 4,
                  opacity: clamp(stageSprings[i + 1], 0, 1),
                }}>
                  ↓ then
                </div>
              )}
            </div>
          );
        })}
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
