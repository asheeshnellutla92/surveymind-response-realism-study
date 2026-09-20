import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcFanOutFlow — C3 centerpiece for "Fan Out: Parallel Orchestration"
 * Fan-out flow diagram: head agent → dispatch_analysts tool →
 * three parallel analyst sessions (progress bars) → converging results table.
 * Source: research-desk/ — CWC Workshop 2026
 */

export const cwcFanOutFlowSchema = z.object({
  sparkLine: z.string().default('Fan out. Fan in.'),
});
export type CwcFanOutFlowProps = z.infer<typeof cwcFanOutFlowSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const ANALYSTS = [
  { ticker: 'NVDA', score: 9, color: '#4CAF50', label: 'Strong margin durability' },
  { ticker: 'AMD', score: 6, color: '#FF9800', label: 'Moderate risk' },
  { ticker: 'MU', score: 4, color: CLAUDE.SPARK, label: 'Inventory pressure' },
];

export const CwcFanOutFlow: React.FC<CwcFanOutFlowProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const headIn = spring({ frame: frame - 15, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const toolIn = spring({ frame: frame - 45, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } });
  const fanIn = spring({ frame: frame - 75, fps, config: { damping: 24, stiffness: 90, mass: 1.1 } });
  const progressIn = spring({ frame: frame - 100, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const resultsIn = spring({ frame: frame - 170, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const verdictIn = spring({ frame: frame - 210, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 250, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Layout
  const HEAD_X = PAD_X;
  const HEAD_Y = height * 0.35;
  const HEAD_W = width * 0.16;
  const HEAD_H = height * 0.14;

  const TOOL_X = HEAD_X + HEAD_W + width * 0.04;
  const TOOL_Y = HEAD_Y + HEAD_H * 0.15;
  const TOOL_W = width * 0.18;
  const TOOL_H = height * 0.09;

  const ANALYST_W = width * 0.18;
  const ANALYST_H = height * 0.14;
  const ANALYST_X = TOOL_X + TOOL_W + width * 0.06;
  const analystYs = [height * 0.20, height * 0.37, height * 0.54];

  const RESULT_X = ANALYST_X + ANALYST_W + width * 0.05;
  const RESULT_Y = height * 0.28;
  const RESULT_W = width * 0.22;

  // Progress bar animation: fills over frames 100–160
  const progressFraction = (analystIdx: number) => {
    const start = 100 + analystIdx * 15;
    const end = 155 + analystIdx * 10;
    return clamp(interpolate(frame, [start, end], [0, 1]), 0, 1);
  };

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        PARALLEL ORCHESTRATION · FAN-OUT FLOW
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Head dispatches → analysts run in parallel → results converge
      </div>

      {/* HEAD AGENT */}
      <div style={{
        position: 'absolute',
        left: HEAD_X, top: HEAD_Y,
        width: HEAD_W, height: HEAD_H,
        borderRadius: 12,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
        opacity: clamp(headIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(headIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.018, fontWeight: 700, color: CLAUDE.INK }}>
          Head of Research
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT }}>
          main agent
        </div>
        <div style={{
          fontFamily: MONO, fontSize: height * 0.009, color: CLAUDE.GHOST,
          textAlign: 'center', padding: '0 8px',
        }}>
          "Sweep NVDA, AMD, MU"
        </div>
      </div>

      {/* Arrow: head → tool */}
      <svg style={{
        position: 'absolute',
        left: HEAD_X + HEAD_W, top: HEAD_Y,
        width: TOOL_X - (HEAD_X + HEAD_W), height: HEAD_H,
        overflow: 'visible', opacity: clamp(toolIn, 0, 1),
      }}>
        <defs>
          <marker id="fa1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.SPARK} />
          </marker>
        </defs>
        <line x1={0} y1={HEAD_H / 2} x2={TOOL_X - (HEAD_X + HEAD_W) - 4} y2={TOOL_H / 2}
          stroke={CLAUDE.SPARK} strokeWidth={2.5} markerEnd="url(#fa1)" />
      </svg>

      {/* DISPATCH TOOL */}
      <div style={{
        position: 'absolute',
        left: TOOL_X, top: TOOL_Y,
        width: TOOL_W, height: TOOL_H,
        borderRadius: 8,
        background: `${CLAUDE.SPARK}18`,
        border: `2px solid ${CLAUDE.SPARK}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2,
        opacity: clamp(toolIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(toolIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: height * 0.012, fontWeight: 700, color: CLAUDE.SPARK }}>
          dispatch_analysts()
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT }}>
          custom tool · server-side
        </div>
      </div>

      {/* Fan-out arrows: tool → analysts */}
      {analystYs.map((ay, i) => {
        const fromX = TOOL_X + TOOL_W;
        const fromY = TOOL_Y + TOOL_H / 2;
        const toX = ANALYST_X - 4;
        const toY = ay + ANALYST_H / 2;
        const arcFrac = clamp(fanIn, 0, 1);
        const midX = (fromX + toX) / 2;
        return (
          <svg key={i} style={{
            position: 'absolute', left: 0, top: 0,
            width: width, height: height,
            overflow: 'visible', pointerEvents: 'none',
            opacity: arcFrac,
          }}>
            <defs>
              <marker id={`faa${i}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill={CLAUDE.INK_SOFT} />
              </marker>
            </defs>
            <path
              d={`M ${fromX} ${fromY} Q ${midX} ${fromY} ${midX} ${toY} Q ${midX} ${toY} ${toX} ${toY}`}
              stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} strokeDasharray="6 4"
              fill="none" markerEnd={`url(#faa${i})`}
            />
          </svg>
        );
      })}

      {/* ANALYST SESSIONS */}
      {ANALYSTS.map((a, i) => {
        const aIn = spring({ frame: frame - 80 - i * 12, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
        const prog = progressFraction(i);
        return (
          <div key={a.ticker} style={{
            position: 'absolute',
            left: ANALYST_X, top: analystYs[i],
            width: ANALYST_W, height: ANALYST_H,
            borderRadius: 10, background: CLAUDE.CARD,
            border: `1.5px solid ${CLAUDE.BORDER}`,
            display: 'flex', flexDirection: 'column',
            padding: '10px 14px', gap: 6,
            opacity: clamp(aIn, 0, 1),
            transform: `translateX(${(1 - clamp(aIn, 0, 1)) * 14}px)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
                color: CLAUDE.INK_SOFT, letterSpacing: 1, textTransform: 'uppercase' as const,
              }}>
                Analyst Session
              </div>
              <div style={{
                fontFamily: MONO, fontSize: height * 0.013, fontWeight: 700, color: a.color,
              }}>{a.ticker}</div>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: 6, background: CLAUDE.PILL, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${prog * 100}%`, height: '100%',
                background: prog === 1 ? a.color : CLAUDE.GHOST,
                borderRadius: 3,
                transition: 'none',
              }} />
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT,
            }}>
              {prog < 1 ? 'reading 20 pages…' : '✓ score: ' + a.score + ' — ' + a.label}
            </div>
          </div>
        );
      })}

      {/* Fan-in arrows: analysts → results */}
      {analystYs.map((ay, i) => {
        const fromX = ANALYST_X + ANALYST_W + 4;
        const fromY = ay + ANALYST_H / 2;
        const toX = RESULT_X;
        const toY = RESULT_Y + height * 0.12 + i * height * 0.085;
        return (
          <svg key={i} style={{
            position: 'absolute', left: 0, top: 0,
            width: width, height: height,
            overflow: 'visible', pointerEvents: 'none',
            opacity: clamp(resultsIn, 0, 1),
          }}>
            <defs>
              <marker id={`fib${i}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill={CLAUDE.INK_SOFT} />
              </marker>
            </defs>
            <line x1={fromX} y1={fromY} x2={toX - 4} y2={toY}
              stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} strokeDasharray="6 4"
              markerEnd={`url(#fib${i})`} />
          </svg>
        );
      })}

      {/* RESULTS TABLE */}
      <div style={{
        position: 'absolute',
        left: RESULT_X, top: RESULT_Y,
        width: RESULT_W,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10, overflow: 'hidden',
        opacity: clamp(resultsIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(resultsIn, 0, 1)})`,
      }}>
        <div style={{
          background: CLAUDE.PAGE,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          padding: '10px 16px',
          fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
          color: CLAUDE.INK_SOFT, letterSpacing: 1, textTransform: 'uppercase' as const,
        }}>
          Results Table
        </div>
        {ANALYSTS.map((a, i) => (
          <div key={a.ticker} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: i < ANALYSTS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
          }}>
            <span style={{ fontFamily: MONO, fontSize: height * 0.014, fontWeight: 700, color: a.color }}>
              {a.ticker}
            </span>
            <span style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT }}>
              {a.label}
            </span>
            <span style={{
              fontFamily: MONO, fontSize: height * 0.020, fontWeight: 700,
              color: a.color,
            }}>
              {a.score}
            </span>
          </div>
        ))}
      </div>

      {/* Head verdict */}
      <div style={{
        position: 'absolute',
        left: RESULT_X, top: RESULT_Y + height * 0.38,
        width: RESULT_W,
        background: `${CLAUDE.SPARK}12`,
        border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 8, padding: '10px 16px',
        opacity: clamp(verdictIn, 0, 1),
        transform: `translateY(${(1 - clamp(verdictIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.014, fontWeight: 700, color: CLAUDE.SPARK }}>
          Head synthesizes:
        </div>
        <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.INK, marginTop: 4, lineHeight: 1.5 }}>
          "NVDA (9) &gt; AMD (6) &gt; MU (4)<br/>by margin durability."
        </div>
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.12,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Claude Code Workshops (Anthropic) — research-desk
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
