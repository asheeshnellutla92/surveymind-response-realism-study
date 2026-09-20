import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CodingAgentsFig2Gradient — "The Discipline Gradient" (dumbbell chart; †exact).
 * Source: Anthropic, Coding Agents in the Social Sciences (May 2026)
 *
 * Each row: open circle = AI use %, filled terracotta circle = agent use %
 * Reference rules at 19% (overall agent) and 81% (overall AI use)
 * Rows animate top-down (Economics first, Education last).
 *
 * Terracotta ring highlight: Communication (86% AI / 6% agent) — trying AI is universal,
 * letting it run the analysis is not.
 */

export const codingAgentsFig2GradientSchema = z.object({
  sparkLine: z.string().default('Everyone uses AI. Not everyone lets it run.'),
});
export type CodingAgentsFig2GradientProps = z.infer<typeof codingAgentsFig2GradientSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const DISCIPLINES = [
  { name: 'Economics',          agent: 38, ai: 91, n: 209,  hot: false },
  { name: 'Political Science',  agent: 25, ai: 85, n: 216,  hot: false },
  { name: 'Management Sciences',agent: 18, ai: 82, n: 202,  hot: false },
  { name: 'Psychology',         agent: 12, ai: 81, n: 172,  hot: false },
  { name: 'Sociology',          agent: 11, ai: 78, n: 262,  hot: false },
  { name: 'Public Health',      agent:  6, ai: 63, n:  84,  hot: false },
  { name: 'Communication',      agent:  6, ai: 86, n:  36,  hot: true  },
  { name: 'Education',          agent:  4, ai: 67, n:  45,  hot: false },
];

const REF_AGENT = 19;
const REF_AI = 81;

export const CodingAgentsFig2Gradient: React.FC<CodingAgentsFig2GradientProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const LABEL_W = 200;
  const CHART_LEFT = PAD_X + LABEL_W + 16;
  const CHART_RIGHT = width - PAD_X;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const CHART_TOP = height * 0.26;
  const ROW_H = (height * 0.56) / DISCIPLINES.length;
  const DOT_R = 9;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const xOf = (pct: number) => CHART_LEFT + (pct / 100) * CHART_W;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        AGENT ADOPTION vs AI USE · BY DISCIPLINE
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Adoption is a gradient, and it's steep.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y + height * 0.04,
        display: 'flex', gap: 20, opacity: clamp(titleIn, 0, 1),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width={18} height={18}><circle cx={9} cy={9} r={7} fill={CLAUDE.SPARK} /></svg>
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>Coding agent use</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width={18} height={18}><circle cx={9} cy={9} r={7} fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2} /></svg>
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>AI use</span>
        </div>
      </div>

      {/* SVG chart */}
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={width} height={height}>

        {/* Reference rules */}
        {[{ pct: REF_AGENT, label: '19% overall agent' }, { pct: REF_AI, label: '81% overall AI' }].map(r => (
          <React.Fragment key={r.pct}>
            <line
              x1={xOf(r.pct)} y1={CHART_TOP - 8}
              x2={xOf(r.pct)} y2={CHART_TOP + DISCIPLINES.length * ROW_H + 8}
              stroke={CLAUDE.BORDER} strokeWidth={1.5} strokeDasharray="4 4"
              opacity={clamp(titleIn, 0, 1)}
            />
            <text x={xOf(r.pct)} y={CHART_TOP - 14}
              textAnchor="middle" fontFamily={SANS} fontSize={height * 0.011}
              fill={CLAUDE.GHOST} opacity={clamp(titleIn, 0, 1)}>
              {r.label}
            </text>
          </React.Fragment>
        ))}

        {/* X-axis ticks */}
        {[0, 20, 40, 60, 80, 100].map(v => (
          <React.Fragment key={v}>
            <text x={xOf(v)} y={CHART_TOP + DISCIPLINES.length * ROW_H + 20}
              textAnchor="middle" fontFamily={SANS} fontSize={height * 0.011}
              fill={CLAUDE.GHOST} opacity={clamp(titleIn, 0, 1)}>
              {v}%
            </text>
          </React.Fragment>
        ))}

        {DISCIPLINES.map((d, i) => {
          const bAnim = spring({ frame: frame - 10 - i * 12, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
          const cy = CHART_TOP + i * ROW_H + ROW_H / 2;
          const xAgent = xOf(d.agent);
          const xAI = xOf(d.ai);
          const progress = clamp(bAnim, 0, 1);

          // dumbbell line
          const xLeft = xAgent + (xAI - xAgent) * (1 - progress);

          return (
            <React.Fragment key={d.name}>
              {/* connector line */}
              <line x1={xLeft} y1={cy} x2={xOf(d.ai)} y2={cy}
                stroke={d.hot ? CLAUDE.SPARK : CLAUDE.BORDER} strokeWidth={1.5}
                opacity={progress}
              />
              {/* AI dot (open circle) */}
              <circle cx={xOf(d.ai)} cy={cy} r={DOT_R}
                fill="none" stroke={d.hot ? CLAUDE.SPARK : CLAUDE.INK_SOFT} strokeWidth={2}
                opacity={progress}
              />
              {/* Agent dot (filled, terracotta) */}
              <circle cx={xLeft} cy={cy} r={DOT_R + (d.hot ? 2 : 0)}
                fill={CLAUDE.SPARK} opacity={progress}
              />
              {/* Hot ring for Communication */}
              {d.hot && (
                <circle cx={xLeft} cy={cy} r={DOT_R + 7}
                  fill="none" stroke={CLAUDE.SPARK} strokeWidth={2}
                  strokeDasharray="3 3" opacity={progress * 0.7}
                />
              )}
              {/* AI pct label */}
              {progress > 0.7 && (
                <text x={xOf(d.ai) + 14} y={cy + 4}
                  fontFamily={SANS} fontSize={height * 0.012}
                  fill={d.hot ? CLAUDE.SPARK : CLAUDE.GHOST}>
                  {d.ai}%
                </text>
              )}
              {/* Agent pct label */}
              {progress > 0.7 && (
                <text x={xLeft - 14} y={cy + 4}
                  textAnchor="end" fontFamily={SANS} fontSize={height * 0.012}
                  fill={CLAUDE.SPARK} fontWeight={d.hot ? 'bold' : 'normal'}>
                  {d.agent}%
                </text>
              )}
            </React.Fragment>
          );
        })}
      </svg>

      {/* Row labels */}
      {DISCIPLINES.map((d, i) => {
        const bAnim = spring({ frame: frame - 10 - i * 12, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
        const cy = CHART_TOP + i * ROW_H + ROW_H / 2;
        return (
          <React.Fragment key={d.name}>
            <div style={{
              position: 'absolute',
              right: width - CHART_LEFT + 12, top: cy - 10,
              fontFamily: SERIF, fontSize: height * 0.0145,
              color: d.hot ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'right' as const,
              whiteSpace: 'nowrap' as const,
              opacity: clamp(bAnim, 0, 1),
            }}>
              {d.name}
            </div>
            <div style={{
              position: 'absolute',
              right: width - CHART_LEFT + 12, top: cy + 6,
              fontFamily: SANS, fontSize: height * 0.010,
              color: CLAUDE.GHOST, textAlign: 'right' as const,
              opacity: clamp(bAnim, 0, 1) * 0.8,
            }}>
              n={d.n}
            </div>
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data (†exact): Anthropic, Coding Agents in the Social Sciences (2026)
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
