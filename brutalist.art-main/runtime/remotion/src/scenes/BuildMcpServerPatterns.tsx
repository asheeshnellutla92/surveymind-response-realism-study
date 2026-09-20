import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BuildMcpServerPatterns — B02 — tool design patterns A/B + four primitives.
 */

export const buildMcpServerPatternsSchema = z.object({
  sparkLine: z.string().default('Under 15 tools: one per action. Large surface: search+execute. Most servers only need tools.'),
});
export type BuildMcpServerPatternsProps = z.infer<typeof buildMcpServerPatternsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PRIMITIVES = [
  { name: 'Resources', trigger: 'Host app', use: 'Browsable docs/files/data as context' },
  { name: 'Prompts', trigger: 'User', use: 'Canned workflows ("/summarize-thread")' },
  { name: 'Elicitation', trigger: 'Server (mid-tool)', use: 'Spec-native user input — no UI build needed' },
  { name: 'Sampling', trigger: 'Server (mid-tool)', use: 'LLM inference inside your tool logic' },
];

export const BuildMcpServerPatterns: React.FC<BuildMcpServerPatternsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const patAIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const patBIn = spring({ frame: frame - 16, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const primLabelIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const primSprings = PRIMITIVES.map((_, i) =>
    spring({ frame: frame - 88 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_W = (W - W * 0.10 - 16) / 2;
  const PAT_TOP = H * 0.22;
  const PAT_H = H * 0.30;
  const PRIM_TOP = H * 0.60;
  const PRIM_H = (H * 0.29) / 4 - 5;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BUILD MCP SERVER · TOOL PATTERNS + PRIMITIVES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        How you carve tools matters more than most expect.
      </div>

      {/* Pattern A */}
      <div style={{
        position: 'absolute', top: PAT_TOP, left: W * 0.05, width: COL_W, height: PAT_H,
        background: 'rgba(74,124,89,0.05)', border: `1.5px solid #4A7C59`,
        borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' as const,
        opacity: clamp(patAIn, 0, 1), transform: `translateX(${(1 - clamp(patAIn, 0, 1)) * -14}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 6 }}>PATTERN A — ONE PER ACTION</div>
        <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, marginBottom: 10 }}>Use when action space is &lt; ~15 operations</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.9 }}>
          <span style={{ color: '#4A7C59' }}>create_issue</span>{'    — Create a new issue'}<br />
          <span style={{ color: '#4A7C59' }}>update_issue</span>{'    — Update an existing issue'}<br />
          <span style={{ color: '#4A7C59' }}>search_issues</span>{'   — Search by query string'}<br />
          <span style={{ color: '#4A7C59' }}>add_comment</span>{'     — Add comment to an issue'}
        </div>
        <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
          Claude reads the list once, knows exactly what's possible. No discovery round-trips.
        </div>
      </div>

      {/* Pattern B */}
      <div style={{
        position: 'absolute', top: PAT_TOP, left: W * 0.05 + COL_W + 16, width: COL_W, height: PAT_H,
        background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' as const,
        opacity: clamp(patBIn, 0, 1), transform: `translateX(${(1 - clamp(patBIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: CLAUDE.SPARK, marginBottom: 6 }}>PATTERN B — SEARCH + EXECUTE</div>
        <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, marginBottom: 10 }}>Use when surface has dozens–hundreds of operations</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.9 }}>
          <span style={{ color: CLAUDE.SPARK }}>search_actions</span>{'  — Natural-language intent'}<br />
          {'                 → matching action IDs + schemas'}<br />
          <span style={{ color: CLAUDE.SPARK }}>execute_action</span>{'  — Run action by ID'}<br />
          {'                 with a params object'}
        </div>
        <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
          Server holds full catalog. Claude searches, picks, executes. Context stays lean.
        </div>
      </div>

      {/* Primitives */}
      <div style={{
        position: 'absolute', top: PRIM_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(primLabelIn, 0, 1),
      }}>BEYOND TOOLS — THE OTHER PRIMITIVES</div>

      {PRIMITIVES.map((p, i) => {
        const op = clamp(primSprings[i], 0, 1);
        const isElicitation = p.name === 'Elicitation';
        return (
          <div key={i} style={{
            position: 'absolute',
            top: PRIM_TOP + i * (PRIM_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: PRIM_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${isElicitation ? '#4A7C59' : CLAUDE.BORDER}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 0,
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateY(${(1 - op) * 6}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: CLAUDE.INK, minWidth: 130 }}>{p.name}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.SPARK, minWidth: 140, fontWeight: 600 }}>{p.trigger}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{p.use}</span>
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
