import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BuildMcpAppDecision — B02 — elicitation vs widget routing + 5 design rules.
 */

export const buildMcpAppDecisionSchema = z.object({
  sparkLine: z.string().default('Elicitation first. Widget for searchable lists, visuals, live progress. Text if none apply.'),
});
export type BuildMcpAppDecisionProps = z.infer<typeof buildMcpAppDecisionSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const ROUTE_COLS = [
  {
    label: 'ELICITATION',
    color: '#4A7C59',
    bg: 'rgba(74,124,89,0.06)',
    when: 'Yes/no confirm · short enum · flat form',
    why: 'Spec-native · zero UI code · any compliant host',
  },
  {
    label: 'WIDGET',
    color: CLAUDE.SPARK,
    bg: 'rgba(217,119,87,0.06)',
    when: 'Searchable list · visual preview · chart / map · live progress',
    why: 'Needs iframe surface — two-part reg + bundle required',
  },
  {
    label: 'TEXT ONLY',
    color: CLAUDE.INK_SOFT,
    bg: 'rgba(61,57,41,0.04)',
    when: 'Everything else',
    why: 'Faster to build · faster for the user · works everywhere',
  },
];

const RULES = [
  { num: '1', text: 'One widget per tool — a picker picks, a chart displays, don\'t sub-app an iframe.' },
  { num: '2', text: 'Tool description must mention the widget — Claude only sees the description when choosing what to call.' },
  { num: '3', text: 'Graceful degradation is automatic — hosts without the apps surface render the tool\'s text content.' },
  { num: '4', text: 'Don\'t block on results for display-only tools — return a text summary so Claude reasons without waiting.' },
  { num: '5', text: 'Follow host theme — getHostContext returns theme after connect; toggle dark class, use CSS custom props.' },
];

export const BuildMcpAppDecision: React.FC<BuildMcpAppDecisionProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const colSprings = ROUTE_COLS.map((_, i) =>
    spring({ frame: frame - 8 - i * 14, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const ruleSprings = RULES.map((_, i) =>
    spring({ frame: frame - 70 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_W = (W - W * 0.10 - 20) / 3;
  const COL_H = H * 0.24;
  const COL_TOP = H * 0.22;
  const RULE_TOP = H * 0.55;
  const RULE_H = (H * 0.34) / 5 - 6;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BUILD MCP APP · ROUTING + DESIGN RULES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Elicitation first. Widget only when elicitation falls short.
      </div>

      {ROUTE_COLS.map((col, i) => {
        const op = clamp(colSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP,
            left: W * 0.05 + i * (COL_W + 10),
            width: COL_W, height: COL_H,
            background: col.bg,
            border: `1.5px solid ${col.color}`,
            borderTop: `4px solid ${col.color}`,
            borderRadius: 12, padding: '14px 16px',
            boxSizing: 'border-box' as const,
            opacity: op, transform: `translateY(${(1 - op) * -10}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: col.color, marginBottom: 10 }}>
              {col.label}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}>
              {col.when}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
              {col.why}
            </div>
          </div>
        );
      })}

      <div style={{
        position: 'absolute', top: RULE_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(ruleSprings[0], 0, 1),
      }}>5 DESIGN RULES</div>

      {RULES.map((rule, i) => {
        const op = clamp(ruleSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: RULE_TOP + i * (RULE_H + 6),
            left: W * 0.05, right: W * 0.05,
            height: RULE_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${CLAUDE.SPARK}`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 12px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <span style={{
              fontFamily: MONO, fontSize: 13, fontWeight: 700,
              color: CLAUDE.SPARK, minWidth: 20, flexShrink: 0,
            }}>{rule.num}</span>
            <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.5 }}>{rule.text}</span>
          </div>
        );
      })}

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
