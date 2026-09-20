import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BuildMcpbTell — B05 — teardown: gets right / bites + callout.
 */

export const buildMcpbTellSchema = z.object({
  sparkLine: z.string().default('MCPB gate and no-sandbox warning solid. Env var no-prefix trap: surface it at the manifest.'),
});
export type BuildMcpbTellProps = z.infer<typeof buildMcpbTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'MCPB-vs-remote gate upfront: cloud-only APIs → use remote HTTP, not MCPB',
  'Manifest anatomy complete with working JSON covering all four key sections',
  '${__dirname} and ${user_config.*} tokens documented with concrete examples',
  'No-sandbox warning is prominent and explicit ("mandatory reading, not optional")',
  'Testing pipeline complete: init → inspector → validate → pack → sign → install',
];

const BITES = [
  'No-auto-prefix rule buried in code comment — wrong env var name = silent nil at runtime',
  'type:"directory" renders native folder picker — documented only in passing, easy to miss',
  'Native extension builds must target each platform — "avoid if you can" buries a blocker',
  'roots/list check framed passively ("before hardcoding") not as a decision point',
  'Test-without-toolchain is the last line of testing, not a gate at the top',
];

export const BuildMcpbTell: React.FC<BuildMcpbTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const col1LabelIn = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const col2LabelIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const rightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 18 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const biteSprings = BITES.map((_, i) =>
    spring({ frame: frame - 22 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const calloutIn = spring({ frame: frame - 105, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const COL_TOP = H * 0.40;
  const ITEM_H = (H * 0.51) / 5 - 10;
  const COL_W = (W - W * 0.10 - 16) / 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BUILD MCPB · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        MCPB gate and no-sandbox warning solid.<br />Env var no-prefix trap: surface it at the manifest.
      </div>

      {/* Gets right label */}
      <div style={{
        position: 'absolute', top: COL_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: '#4A7C59', textTransform: 'uppercase' as const,
        opacity: clamp(col1LabelIn, 0, 1),
      }}>GETS RIGHT</div>

      {/* Bites label */}
      <div style={{
        position: 'absolute', top: COL_TOP - 22, left: W * 0.05 + COL_W + 16,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.SPARK, textTransform: 'uppercase' as const,
        opacity: clamp(col2LabelIn, 0, 1),
      }}>WHERE IT BITES</div>

      {GETS_RIGHT.map((text, i) => {
        const op = clamp(rightSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP + i * (ITEM_H + 10),
            left: W * 0.05, width: COL_W, height: ITEM_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: '4px solid #4A7C59',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.45 }}>{text}</span>
          </div>
        );
      })}

      {BITES.map((text, i) => {
        const op = clamp(biteSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP + i * (ITEM_H + 10),
            left: W * 0.05 + COL_W + 16, width: COL_W, height: ITEM_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${CLAUDE.SPARK}`,
            borderRadius: 8, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.45 }}>{text}</span>
          </div>
        );
      })}

      {/* Callout */}
      <div style={{
        position: 'absolute', bottom: H * 0.16, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '8px 14px', boxSizing: 'border-box' as const,
        display: 'flex', gap: 10, alignItems: 'center',
        opacity: clamp(calloutIn, 0, 1), transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 8}px)`,
      }}>
        <svg width={16} height={16} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L11 22l8.91-10.96A1 1 0 0019 9.5H13.5L13 2z" fill={CLAUDE.SPARK} />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK }}>
          <span style={{ fontWeight: 700 }}>No auto-prefix, no sandbox — both silent at runtime.</span>
          {' Wrong env var name produces a nil value with no error. Full user privileges means no platform-level protection.'}
        </div>
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
