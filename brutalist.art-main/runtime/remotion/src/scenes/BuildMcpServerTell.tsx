import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BuildMcpServerTell — B05 — teardown: gets right / bites + callout.
 */

export const buildMcpServerTellSchema = z.object({
  sparkLine: z.string().default('Discovery-before-code and remote-HTTP default solid. Elicitation check and FastMCP split: surface them.'),
});
export type BuildMcpServerTellProps = z.infer<typeof buildMcpServerTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Discovery-before-code: 5 questions first, no scaffolding until answered',
  'Remote HTTP default with clear "unless" rule — opinionated and actionable',
  'Search+execute pattern documented with concrete two-tool interface',
  'Elicitation framed as spec-native, zero UI, caveat about host support stated',
  'Seven-scenario decision matrix — complete picture for any plausible combination',
];

const BITES = [
  'Elicitation capability check buried mid-paragraph — miss it and SDK throws',
  'FastMCP 3.x (jlowin PyPI) vs frozen 1.0 in official mcp SDK — one sentence, easy to skip',
  'Tool description quality deferred to references/tool-design.md, not inline',
  'CIMD vs DCR OAuth distinction mentioned but fully deferred to references/auth.md',
  '"Load Claude docs first" invariant unenforced — Phase 1 questions follow immediately',
];

export const BuildMcpServerTell: React.FC<BuildMcpServerTellProps> = ({ sparkLine }) => {
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
        BUILD MCP SERVER · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Discovery-before-code solid. Elicitation check<br />and FastMCP split: surface them earlier.
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
          <span style={{ fontWeight: 700 }}>Elicitation capability check is mandatory:</span>
          {' check clientCapabilities.elicitation before calling — the SDK throws if the client doesn\'t advertise the capability.'}
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
