import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AutomationRecommenderTell — B05 — teardown: 5 gets-right / 5 bites + callout.
 */

export const automationRecommenderTellSchema = z.object({
  sparkLine: z.string().default('Five-type taxonomy and 1-2 discipline solid. Reference-file escape and monorepo gap: surface them.'),
});
export type AutomationRecommenderTellProps = z.infer<typeof automationRecommenderTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Read-only framing is clear and explicit up front',
  'Five-type taxonomy covers full extensibility surface',
  '1-2 per category — most valuable first, not a dump',
  'Signal-to-recommendation tables give concrete indicators',
  'Invocation control: user-only / Claude-only / both',
];

const BITES = [
  '"Go beyond reference files" has no enforcement mechanism',
  'Phase 1 bash assumes standard locations — no monorepo guidance',
  'Subagent creation not inline — deferred to references/subagent-templates.md',
  'Plugin recommendations missing install commands — separate lookup required',
  'Decision framework: when to recommend, not when NOT to recommend',
];

const CALLOUT = 'The 1-2 per category cap only works if the analysis is real: recommendations without Phase 1 analysis are just the reference tables with project names swapped in.';

export const AutomationRecommenderTell: React.FC<AutomationRecommenderTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const colHeaderIn = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const itemSprings = Array.from({ length: 5 }, (_, i) =>
    spring({ frame: frame - 12 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const calloutIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const COL_TOP = H * 0.40;
  const ITEM_H = (H * 0.51) / 5 - 10;
  const COL_W = (W - W * 0.10) / 2 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE AUTOMATION RECOMMENDER · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five right. Five gaps.
      </div>

      {/* Column headers */}
      {[
        { label: 'GETS RIGHT', color: '#4A7C59', left: W * 0.05 },
        { label: 'WHERE IT BITES', color: CLAUDE.SPARK, left: W * 0.05 + COL_W + 16 },
      ].map((col, ci) => (
        <div key={ci} style={{
          position: 'absolute', top: COL_TOP - 26, left: col.left,
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: col.color, textTransform: 'uppercase' as const,
          opacity: clamp(colHeaderIn, 0, 1),
        }}>{col.label}</div>
      ))}

      {/* Gets right */}
      {GETS_RIGHT.map((text, i) => {
        const op = clamp(itemSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP + i * (ITEM_H + 10),
            left: W * 0.05, width: COL_W,
            height: ITEM_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: '4px solid #4A7C59',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 3px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -8}px)`,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.35 }}>{text}</span>
          </div>
        );
      })}

      {/* Bites */}
      {BITES.map((text, i) => {
        const op = clamp(itemSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP + i * (ITEM_H + 10),
            left: W * 0.05 + COL_W + 16, width: COL_W,
            height: ITEM_H,
            background: i === 4 ? 'rgba(217,119,87,0.04)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${CLAUDE.SPARK}`,
            borderRadius: 8, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 3px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 8}px)`,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.35 }}>{text}</span>
          </div>
        );
      })}

      {/* Callout */}
      <div style={{
        position: 'absolute', bottom: H * 0.16, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.06)', border: `1px solid ${CLAUDE.SPARK}`,
        borderRadius: 8, padding: '8px 14px', boxSizing: 'border-box' as const,
        display: 'flex', alignItems: 'center', gap: 10,
        opacity: clamp(calloutIn, 0, 1), transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 8}px)`,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
          <path d="M7 1L13 12H1L7 1Z" fill="none" stroke={CLAUDE.SPARK} strokeWidth="1.5" />
          <path d="M7 5.5V8" stroke={CLAUDE.SPARK} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="10" r="0.75" fill={CLAUDE.SPARK} />
        </svg>
        <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.4 }}>{CALLOUT}</span>
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
