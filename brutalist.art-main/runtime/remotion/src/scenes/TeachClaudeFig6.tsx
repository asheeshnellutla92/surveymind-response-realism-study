import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * TeachClaudeFig6 — Diverse Environments (Act 5; line chart, honeypot score over RL steps)
 * Source: Anthropic, "Teaching Claude why", May 2026
 *
 * 5 environment mixes from 100% chat to 100% agentic-augmented.
 * Shape anchors:
 *   All start ~0.44–0.46
 *   Mixes with augmented environments descend to ~0.39–0.41 by step 300
 *   100% plain-chat line stays flattest and highest
 *
 * Animate: five lines race downward from a common band; flat chat-only line
 *   is left visibly behind. Narration: augmentation was just tool defs and
 *   system prompts — tools never even used.
 *
 * Per CLAUDE-BRAND.md: terracotta accent = the 100% augmented line (best performer).
 */

export const teachClaudeFig6Schema = z.object({
  sparkLine: z.string().default('Richer context. Faster alignment.'),
});
export type TeachClaudeFig6Props = z.infer<typeof teachClaudeFig6Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEPS_N = 12;
const STEPS = Array.from({ length: STEPS_N }, (_, i) => i / (STEPS_N - 1)); // 0..1 → step 0..300

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function ease(t: number) { return t * t * (3 - 2 * t); } // smoothstep

// 5 environment mixes: all start ~0.44-0.46, diverge over steps
const MIXES = [
  {
    label: '100% plain chat',
    color: CLAUDE.INK_SOFT,
    dash: '6 4',
    isAccent: false,
    vals: STEPS.map(t => lerp(0.455, 0.435, ease(t))), // flattest, stays high
  },
  {
    label: '75% chat / 25% augmented',
    color: CLAUDE.INK,
    dash: '8 5',
    isAccent: false,
    vals: STEPS.map(t => lerp(0.450, 0.420, ease(t))),
  },
  {
    label: '50% / 50% mix',
    color: CLAUDE.INK,
    dash: '',
    isAccent: false,
    vals: STEPS.map(t => lerp(0.448, 0.410, ease(t))),
  },
  {
    label: '25% chat / 75% augmented',
    color: CLAUDE.INK,
    dash: '3 3',
    isAccent: false,
    vals: STEPS.map(t => lerp(0.445, 0.403, ease(t))),
  },
  {
    label: '100% augmented',
    color: CLAUDE.SPARK,
    dash: '',
    isAccent: true,
    vals: STEPS.map(t => lerp(0.443, 0.394, ease(t))), // best performer
  },
];

export const TeachClaudeFig6: React.FC<TeachClaudeFig6Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.10;
  const PAD_Y = height * 0.08;
  const CHART_TOP = height * 0.30;
  const CHART_BOTTOM = height * 0.80;
  const CHART_H = CHART_BOTTOM - CHART_TOP;
  const CHART_LEFT = PAD_X + 70;
  const CHART_RIGHT = width - PAD_X;
  const CHART_W = CHART_RIGHT - CHART_LEFT;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkInAnim = spring({ frame: frame - 75, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // All lines race: staggered start
  const lineProgress = clamp(interpolate(frame, [18, 70], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }), 0, 1);

  const Y_MIN = 0.38;
  const Y_MAX = 0.48;

  const scoreToY = (s: number) => CHART_TOP + (1 - (s - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_H;
  const stepToX = (i: number) => CHART_LEFT + (i / (STEPS_N - 1)) * CHART_W;

  const makePath = (vals: number[]) => {
    const maxPts = Math.max(2, Math.floor(lineProgress * (STEPS_N - 1)) + 1);
    return vals.slice(0, maxPts).map((v, i) => {
      const x = stepToX(i);
      const y = scoreToY(v);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const Y_TICKS = [0.39, 0.41, 0.43, 0.45, 0.47];
  const X_LABELS = ['0', '75', '150', '225', '300'];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        DIVERSE ENVIRONMENTS · HONEYPOT SCORE OVER RL STEPS · LOWER IS BETTER
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
        maxWidth: width * 0.75,
      }}>
        The tools were never even used.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.14,
        display: 'flex', flexWrap: 'wrap' as const, gap: '4px 20px',
        opacity: clamp(titleIn, 0, 1),
        maxWidth: width * 0.85,
      }}>
        {MIXES.map(m => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={24} height={10}>
              <line x1={0} y1={5} x2={24} y2={5}
                stroke={m.color} strokeWidth={m.isAccent ? 3 : 2}
                strokeDasharray={m.dash || 'none'} />
            </svg>
            <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart SVG */}
      <svg style={{
        position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible',
      }}>

        {/* Y axis gridlines */}
        {Y_TICKS.map(v => {
          const y = scoreToY(v);
          return (
            <g key={v}>
              <line x1={CHART_LEFT} y1={y} x2={CHART_RIGHT} y2={y}
                stroke={CLAUDE.BORDER} strokeWidth={1} opacity={0.5} />
              <text x={CHART_LEFT - 8} y={y + 4}
                fontFamily={SANS} fontSize={height * 0.012}
                fill={CLAUDE.GHOST} textAnchor="end">
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        {X_LABELS.map((label, i) => {
          const x = CHART_LEFT + (i / (X_LABELS.length - 1)) * CHART_W;
          return (
            <text key={label} x={x} y={CHART_BOTTOM + 20}
              fontFamily={SANS} fontSize={height * 0.012}
              fill={CLAUDE.GHOST} textAnchor="middle">
              {label}
            </text>
          );
        })}

        {/* Lines — draw in staggered order; terracotta last (foreground) */}
        {MIXES.map((mix, mi) => (
          <path key={mix.label} d={makePath(mix.vals)}
            fill="none" stroke={mix.color}
            strokeWidth={mix.isAccent ? 3 : 2}
            strokeDasharray={mix.dash || 'none'}
            strokeLinecap="round" strokeLinejoin="round"
          />
        ))}

        {/* End labels for terminal values */}
        {lineProgress > 0.85 && MIXES.map((mix, mi) => {
          const lastVal = mix.vals[STEPS_N - 1];
          const x = CHART_RIGHT + 8;
          const y = scoreToY(lastVal);
          return (
            <text key={mix.label} x={x} y={y + 4}
              fontFamily={SANS} fontSize={height * 0.012}
              fill={mix.isAccent ? CLAUDE.SPARK : CLAUDE.INK_SOFT}
              fontWeight={mix.isAccent ? '700' : '400'}>
              {lastVal.toFixed(2)}
            </text>
          );
        })}

        {/* Baseline axis */}
        <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={CHART_RIGHT} y2={CHART_BOTTOM}
          stroke={CLAUDE.INK} strokeWidth={2} opacity={0.2} />
        <line x1={CHART_LEFT} y1={CHART_TOP} x2={CHART_LEFT} y2={CHART_BOTTOM}
          stroke={CLAUDE.INK} strokeWidth={1} opacity={0.2} />

      </svg>

      {/* "Left behind" annotation */}
      {lineProgress > 0.7 && (
        <div style={{
          position: 'absolute',
          left: CHART_RIGHT - 260,
          top: scoreToY(MIXES[0].vals[STEPS_N - 1]) - 32,
          fontFamily: SERIF, fontSize: height * 0.016, fontStyle: 'italic',
          color: CLAUDE.INK_SOFT,
          opacity: (lineProgress - 0.7) / 0.3,
        }}>
          plain chat — left behind
        </div>
      )}

      {/* X axis label */}
      <div style={{
        position: 'absolute',
        left: CHART_LEFT, right: PAD_X,
        top: CHART_BOTTOM + 38,
        textAlign: 'center' as const,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
      }}>
        RL training steps
      </div>

      {/* Y axis label */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: CHART_TOP + CHART_H / 2 - 40,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        lineHeight: 1.4,
      }}>
        Honeypot
        score
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Redrawn (simplified) from Anthropic, "Teaching Claude why", 2026
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkInAnim, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
