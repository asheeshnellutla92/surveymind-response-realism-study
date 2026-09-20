import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AiSkillUsageModes — Figure 3 rebuild for "AI Speeds You Up. What Does It Do to Your Skills?"
 * Source: Shen & Tamkin 2026, arXiv:2601.20245
 *
 * Scatter plot:
 *   x = completion time (min), y = skills quiz score (%)
 *
 * HIGH-SKILL modes (y ≥ 65%):
 *   Generation-then-comprehension  n=2  24 min  86%
 *   Hybrid code-explanation        n=3  24 min  68%
 *   Conceptual inquiry             n=7  22 min  65%
 *
 * LOW-SKILL modes (y < 40%):
 *   AI delegation                  n=4  19.5 min  39%
 *   Progressive AI reliance        n=4  22 min    35%
 *   Iterative AI debugging         n=4  31 min    24%
 *
 * prop "phase":
 *   "intro"  — axes + grid only
 *   "low"    — low-skill points land
 *   "high"   — high-skill points land; conceptual inquiry circled in terracotta
 *
 * Per CLAUDE-BRAND.md: terracotta = ONE accent per beat.
 * On "high" phase: conceptual inquiry circle is the accent (fast AND high-scoring).
 */

export const aiSkillUsageModesSchema = z.object({
  phase: z.enum(['intro', 'low', 'high']).default('intro'),
  sparkLine: z.string().default(''),
});
export type AiSkillUsageModesProps = z.infer<typeof aiSkillUsageModesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const LOW_MODES = [
  { label: 'AI delegation', n: 4, time: 19.5, score: 39, accent: false },
  { label: 'Progressive AI reliance', n: 4, time: 22, score: 35, accent: false },
  { label: 'Iterative AI debugging', n: 4, time: 31, score: 24, accent: false },
];

const HIGH_MODES = [
  { label: 'Generation-then-comprehension', n: 2, time: 24, score: 86, accent: false },
  { label: 'Hybrid code-explanation', n: 3, time: 24, score: 68, accent: false },
  { label: 'Conceptual inquiry', n: 7, time: 22, score: 65, accent: true }, // the terracotta circle
];

export const AiSkillUsageModes: React.FC<AiSkillUsageModesProps> = ({ phase, sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axisIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });

  // Low-skill points stagger
  const lowAnims = LOW_MODES.map((_, i) =>
    spring({ frame: frame - (20 + i * 12), fps, config: { damping: 26, stiffness: 110, mass: 0.9 } })
  );
  // High-skill points stagger
  const highAnims = HIGH_MODES.map((_, i) =>
    spring({ frame: frame - (20 + i * 14), fps, config: { damping: 26, stiffness: 110, mass: 0.9 } })
  );
  // Conceptual inquiry circle (accent)
  const circleIn = spring({ frame: frame - 65, fps, config: { damping: 22, stiffness: 80, mass: 1.0 } });

  const sparkIn = spring({
    frame: frame - (phase === 'high' ? 80 : phase === 'low' ? 60 : 30),
    fps,
    config: { damping: 28, stiffness: 100, mass: 0.8 }
  });
  const citeIn = spring({ frame: frame - 70, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.10;
  const PAD_Y = height * 0.08;
  const CHART_L = PAD_X + 60;
  const CHART_R = width - PAD_X - 60;
  const CHART_T = height * 0.22;
  const CHART_B = height * 0.72;
  const CHART_W = CHART_R - CHART_L;
  const CHART_H = CHART_B - CHART_T;

  // Axis ranges
  const X_MIN = 16; const X_MAX = 34;
  const Y_MIN = 15; const Y_MAX = 95;

  const scaleX = (v: number) => CHART_L + ((v - X_MIN) / (X_MAX - X_MIN)) * CHART_W;
  const scaleY = (v: number) => CHART_B - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_H;

  // Dividing line at 50% (roughly separating high from low)
  const divideY = scaleY(52);

  const showLow = phase === 'low' || phase === 'high';
  const showHigh = phase === 'high';

  const DOT_R = 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.015,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        AI USAGE MODES · TREATMENT GROUP
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.06,
        fontFamily: SERIF,
        fontSize: height * 0.036,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Time vs. Mastery, by Interaction Mode
      </div>

      {/* SVG chart area */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width, height }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Chart border */}
        <rect
          x={CHART_L} y={CHART_T} width={CHART_W} height={CHART_H}
          fill="none" stroke={CLAUDE.BORDER} strokeWidth={1}
          opacity={clamp(axisIn, 0, 1)}
        />

        {/* X-axis ticks */}
        {[18, 20, 22, 24, 26, 28, 30, 32].map(v => (
          <g key={v} opacity={clamp(axisIn * 0.6, 0, 1)}>
            <line x1={scaleX(v)} y1={CHART_B} x2={scaleX(v)} y2={CHART_B + 8}
              stroke={CLAUDE.BORDER} strokeWidth={1} />
            <text x={scaleX(v)} y={CHART_B + 22} textAnchor="middle"
              fontFamily={SANS} fontSize={height * 0.012} fill={CLAUDE.INK_SOFT}>{v}</text>
          </g>
        ))}

        {/* Y-axis ticks */}
        {[20, 30, 40, 50, 60, 70, 80, 90].map(v => (
          <g key={v} opacity={clamp(axisIn * 0.6, 0, 1)}>
            <line x1={CHART_L - 8} y1={scaleY(v)} x2={CHART_L} y2={scaleY(v)}
              stroke={CLAUDE.BORDER} strokeWidth={1} />
            <text x={CHART_L - 14} y={scaleY(v) + 4} textAnchor="end"
              fontFamily={SANS} fontSize={height * 0.012} fill={CLAUDE.INK_SOFT}>{v}%</text>
          </g>
        ))}

        {/* Dividing dashed line at ~52% (between low and high groups) */}
        {showHigh && (
          <line
            x1={CHART_L} y1={divideY} x2={CHART_R} y2={divideY}
            stroke={CLAUDE.BORDER} strokeWidth={1} strokeDasharray="6 4"
            opacity={clamp(highAnims[0], 0, 1) * 0.5}
          />
        )}

        {/* LOW SKILL mode points */}
        {showLow && LOW_MODES.map((m, i) => {
          const cx = scaleX(m.time);
          const cy = scaleY(m.score);
          const anim = lowAnims[i];
          return (
            <g key={m.label} opacity={clamp(anim, 0, 1)}>
              <circle cx={cx} cy={cy} r={DOT_R * clamp(anim, 0, 1)}
                fill={CLAUDE.INK_SOFT} />
            </g>
          );
        })}

        {/* HIGH SKILL mode points */}
        {showHigh && HIGH_MODES.map((m, i) => {
          const cx = scaleX(m.time);
          const cy = scaleY(m.score);
          const anim = highAnims[i];
          return (
            <g key={m.label} opacity={clamp(anim, 0, 1)}>
              <circle cx={cx} cy={cy} r={DOT_R * clamp(anim, 0, 1)}
                fill={CLAUDE.INK} />
            </g>
          );
        })}

        {/* Conceptual inquiry accent circle — the ONE terracotta moment */}
        {showHigh && (() => {
          const m = HIGH_MODES[2]; // conceptual inquiry
          const cx = scaleX(m.time);
          const cy = scaleY(m.score);
          const anim = clamp(circleIn, 0, 1);
          return (
            <g>
              <circle
                cx={cx} cy={cy}
                r={28 * anim}
                fill="none"
                stroke={CLAUDE.SPARK}
                strokeWidth={2.5}
                opacity={anim * 0.9}
              />
            </g>
          );
        })()}
      </svg>

      {/* Axis labels */}
      <div style={{
        position: 'absolute',
        left: CHART_L + CHART_W / 2 - 80,
        top: CHART_B + 36,
        fontFamily: SANS,
        fontSize: height * 0.013,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(axisIn * 0.7, 0, 1),
      }}>
        Completion time (minutes)
      </div>
      <div style={{
        position: 'absolute',
        left: PAD_X - 12,
        top: CHART_T + CHART_H / 2 - 60,
        fontFamily: SANS,
        fontSize: height * 0.013,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(axisIn * 0.7, 0, 1),
        transform: 'rotate(-90deg)',
        transformOrigin: 'left center',
        whiteSpace: 'nowrap',
      }}>
        Skills quiz score (%)
      </div>

      {/* Mode labels — right side of chart */}
      {showLow && LOW_MODES.map((m, i) => {
        const cx = scaleX(m.time);
        const cy = scaleY(m.score);
        const anim = lowAnims[i];
        // Offset label to right of point
        const labelX = Math.min(cx + DOT_R + 8, width - PAD_X - 200);
        return (
          <div key={m.label} style={{
            position: 'absolute',
            left: labelX,
            top: cy - 14,
            opacity: clamp(anim, 0, 1),
          }}>
            <div style={{
              fontFamily: SANS,
              fontSize: height * 0.013,
              fontWeight: 500,
              color: CLAUDE.INK_SOFT,
              whiteSpace: 'nowrap',
            }}>{m.label}</div>
            <div style={{
              fontFamily: SANS,
              fontSize: height * 0.011,
              color: CLAUDE.GHOST,
            }}>n={m.n}  {m.score}%</div>
          </div>
        );
      })}

      {showHigh && HIGH_MODES.map((m, i) => {
        const cx = scaleX(m.time);
        const cy = scaleY(m.score);
        const anim = highAnims[i];
        const isAccent = m.accent;
        // Position labels — shift left if near right edge
        const labelX = cx + DOT_R + 8;
        return (
          <div key={m.label} style={{
            position: 'absolute',
            left: Math.min(labelX, width - PAD_X - 240),
            top: cy - 14,
            opacity: clamp(anim, 0, 1),
          }}>
            <div style={{
              fontFamily: SANS,
              fontSize: height * 0.013,
              fontWeight: isAccent ? 700 : 500,
              color: isAccent ? CLAUDE.SPARK : CLAUDE.INK,
              whiteSpace: 'nowrap',
            }}>{m.label}</div>
            <div style={{
              fontFamily: SANS,
              fontSize: height * 0.011,
              color: isAccent ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
            }}>n={m.n}  {m.score}%{isAccent ? ' · fast + high' : ''}</div>
          </div>
        );
      })}

      {/* Group labels */}
      {showLow && (
        <div style={{
          position: 'absolute',
          right: PAD_X,
          top: CHART_B + 10,
          width: 280,
          opacity: clamp(lowAnims[2], 0, 1),
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: height * 0.016,
            fontWeight: 600,
            color: CLAUDE.INK_SOFT,
            textAlign: 'right',
          }}>Low-Skill Modes</div>
          <div style={{
            fontFamily: SANS,
            fontSize: height * 0.013,
            color: CLAUDE.GHOST,
            textAlign: 'right',
          }}>delegating to AI · under 40%</div>
        </div>
      )}

      {showHigh && (
        <div style={{
          position: 'absolute',
          right: PAD_X,
          top: CHART_T + 8,
          width: 280,
          opacity: clamp(highAnims[2], 0, 1),
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: height * 0.016,
            fontWeight: 600,
            color: CLAUDE.INK,
            textAlign: 'right',
          }}>High-Skill Modes</div>
          <div style={{
            fontFamily: SANS,
            fontSize: height * 0.013,
            color: CLAUDE.INK_SOFT,
            textAlign: 'right',
          }}>building understanding · 65%+</div>
        </div>
      )}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Data: Anthropic — Shen &amp; Tamkin 2026, arXiv:2601.20245
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
