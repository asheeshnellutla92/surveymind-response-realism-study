import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AutomationRecommenderTypes — B01 — five automation types + invocation control.
 */

export const automationRecommenderTypesSchema = z.object({
  sparkLine: z.string().default('Five types. Hooks automatic. Subagents parallel. Skills deliberate. Plugins bundle. MCP external.'),
});
export type AutomationRecommenderTypesProps = z.infer<typeof automationRecommenderTypesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TYPES = [
  { name: 'Hooks', trigger: 'Automatic / event-driven', use: 'Format on save · lint · block edits · run tests', color: '#4A7C59' },
  { name: 'Subagents', trigger: 'Spawned by Claude', use: 'Parallel review · security audit · test writer', color: CLAUDE.SPARK },
  { name: 'Skills', trigger: 'Claude or /user-invoke', use: 'Packaged workflows · repeatable tasks · templates', color: '#4A7C59' },
  { name: 'Plugins', trigger: 'Installed as bundle', use: 'Collections of related skills installed together', color: CLAUDE.INK_SOFT },
  { name: 'MCP Servers', trigger: 'External tools', use: 'Databases · APIs · browsers · documentation', color: CLAUDE.SPARK },
];

const INVOCATION = [
  { flag: 'disable-model-invocation: true', label: 'User-only', note: 'Side effects: deploy, commit, send' },
  { flag: 'user-invocable: false', label: 'Claude-only', note: 'Background knowledge / automatic context' },
  { flag: '(omit both)', label: 'Both', note: 'Default — Claude and user can invoke' },
];

export const AutomationRecommenderTypes: React.FC<AutomationRecommenderTypesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const typeSprings = TYPES.map((_, i) =>
    spring({ frame: frame - 8 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const invLabelIn = spring({ frame: frame - 72, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const invSprings = INVOCATION.map((_, i) =>
    spring({ frame: frame - 78 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const TYPE_H = (H * 0.38) / 5 - 5;
  const TYPE_TOP = H * 0.22;
  const INV_TOP = H * 0.68;
  const INV_H = (H * 0.22) / 3 - 5;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE AUTOMATION RECOMMENDER · FIVE TYPES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Read-only. Five types. 1–2 per category.
      </div>

      {TYPES.map((t, i) => {
        const op = clamp(typeSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: TYPE_TOP + i * (TYPE_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: TYPE_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${t.color}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 0,
            padding: '0 12px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.color, minWidth: 130 }}>{t.name}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.SPARK, minWidth: 180, fontWeight: 600 }}>{t.trigger}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{t.use}</span>
          </div>
        );
      })}

      <div style={{
        position: 'absolute', top: INV_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(invLabelIn, 0, 1),
      }}>SKILL INVOCATION CONTROL</div>

      {INVOCATION.map((inv, i) => {
        const op = clamp(invSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: INV_TOP + i * (INV_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: INV_H,
            background: i === 2 ? 'rgba(74,124,89,0.04)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${i === 2 ? '#4A7C59' : CLAUDE.SPARK}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 16,
            padding: '0 12px', boxSizing: 'border-box' as const,
            opacity: op, transform: `translateY(${(1 - op) * 6}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK, minWidth: 260 }}>{inv.flag}</span>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK, minWidth: 90 }}>{inv.label}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{inv.note}</span>
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
