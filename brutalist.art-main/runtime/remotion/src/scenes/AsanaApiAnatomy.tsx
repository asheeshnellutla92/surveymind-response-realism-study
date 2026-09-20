import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AsanaApiAnatomy — B01 — resource hierarchy + three universal rules.
 */

export const asanaApiAnatomySchema = z.object({
  sparkLine: z.string().default('gid is the key. data is the envelope. opt_fields is the escape hatch.'),
});
export type AsanaApiAnatomyProps = z.infer<typeof asanaApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const HIERARCHY = [
  { label: 'workspace', sub: 'holds projects + users', depth: 0 },
  { label: 'project', sub: 'holds sections + tasks', depth: 1 },
  { label: 'section', sub: 'organizes tasks', depth: 2 },
  { label: 'task', sub: 'carries stories, subtasks, tags, attachments', depth: 3 },
  { label: 'story', sub: 'comments + system activity', depth: 4 },
];

const RULES = [
  {
    num: '01',
    title: 'gid, not name',
    body: 'Every object identified by string gid — resolve names to gids first',
    color: CLAUDE.SPARK,
  },
  {
    num: '02',
    title: 'data envelope',
    body: 'Reads return {"data": …}; writes send {"data": {…}}; errors replace data with errors',
    color: '#4A7C59',
  },
  {
    num: '03',
    title: 'opt_fields',
    body: 'Compact records carry only gid/name/resource_type — expand with opt_fields, dot-notation for relations',
    color: CLAUDE.INK_SOFT,
  },
];

export const AsanaApiAnatomy: React.FC<AsanaApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const hierSprings = HIERARCHY.map((_, i) =>
    spring({ frame: frame - 8 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const ruleSprings = RULES.map((_, i) =>
    spring({ frame: frame - 60 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const HIER_TOP = H * 0.28;
  const HIER_H = 52;
  const HIER_LEFT = W * 0.05;
  const HIER_W = W * 0.40;

  const RULE_TOP = H * 0.28;
  const RULE_H = (H * 0.55) / 3 - 10;
  const RULE_LEFT = W * 0.50;
  const RULE_W = W * 0.45;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        ASANA API · RESOURCE HIERARCHY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 38, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Workspace to story. gid all the way down.
      </div>

      {/* Column labels */}
      <div style={{
        position: 'absolute', top: HIER_TOP - 22, left: HIER_LEFT,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(hierSprings[0], 0, 1),
      }}>HIERARCHY</div>
      <div style={{
        position: 'absolute', top: RULE_TOP - 22, left: RULE_LEFT,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(ruleSprings[0], 0, 1),
      }}>THREE UNIVERSAL RULES</div>

      {/* Hierarchy items */}
      {HIERARCHY.map((item, i) => {
        const op = clamp(hierSprings[i], 0, 1);
        const indent = item.depth * 16;
        const isTask = item.label === 'task';
        return (
          <div key={i} style={{
            position: 'absolute',
            top: HIER_TOP + i * (HIER_H + 8),
            left: HIER_LEFT + indent, width: HIER_W - indent, height: HIER_H,
            background: isTask ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${isTask ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
            borderRadius: 8, display: 'flex', flexDirection: 'column' as const,
            justifyContent: 'center', padding: '0 12px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: isTask ? CLAUDE.SPARK : CLAUDE.INK }}>{item.label}</div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.3 }}>{item.sub}</div>
          </div>
        );
      })}

      {/* Three rules */}
      {RULES.map((rule, i) => {
        const op = clamp(ruleSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: RULE_TOP + i * (RULE_H + 10),
            left: RULE_LEFT, width: RULE_W, height: RULE_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${rule.color}`, borderRadius: 9,
            display: 'flex', flexDirection: 'column' as const,
            justifyContent: 'center', padding: '0 14px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -14}px)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: rule.color, fontWeight: 700 }}>{rule.num}</span>
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{rule.title}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{rule.body}</div>
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
