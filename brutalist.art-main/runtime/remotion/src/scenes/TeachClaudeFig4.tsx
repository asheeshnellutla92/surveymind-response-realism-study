import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * TeachClaudeFig4 — Rate of Alignment Failures Over RL Steps (Act 1/2 bridge)
 * Source: Anthropic, "Teaching Claude why", May 2026
 *
 * 3 small-multiple line panels: Blackmail | Financial crimes | Cancer research
 * 4 series: Baseline | SDF+generic chat | SDF+values SL | SDF+harmlessness SL
 * Lower = better.
 *
 * Shape anchors:
 *   Blackmail: Baseline + generic-chat start ~0.17, plateau — RL alone barely fixes it.
 *              SL lines start ~0.05-0.10 and stay low.
 *   Financial crimes + Cancer research: all lines decline, SL lines lowest.
 *
 * Animate: panels build left-to-right; lines draw on within each panel.
 * Blackmail plateau is the story — narration: "training more didn't help; starting aligned did."
 *
 * Per CLAUDE-BRAND.md: terracotta accent = the plateau lines in Blackmail panel.
 */

export const teachClaudeFig4Schema = z.object({
  sparkLine: z.string().default('Not the reward. The pre-training.'),
});
export type TeachClaudeFig4Props = z.infer<typeof teachClaudeFig4Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// RL steps: 0..300 (10 points for smooth illustration)
const STEPS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
const N = STEPS.length;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Illustrative series shapes — smooth curves through the shape anchors
const SERIES_DEFS = [
  {
    id: 'baseline', label: 'Baseline', color: '#73705F', dash: '5 4',
    blackmail:   STEPS.map((_, i) => lerp(0.17, 0.165, i / (N - 1))), // plateau
    financial:   STEPS.map((_, i) => lerp(0.15, 0.08, i / (N - 1))),
    cancer:      STEPS.map((_, i) => lerp(0.18, 0.09, i / (N - 1))),
  },
  {
    id: 'generic', label: 'SDF + generic chat', color: CLAUDE.INK_SOFT, dash: '8 4',
    blackmail:   STEPS.map((_, i) => lerp(0.17, 0.160, i / (N - 1))), // also plateaus
    financial:   STEPS.map((_, i) => lerp(0.14, 0.06, i / (N - 1))),
    cancer:      STEPS.map((_, i) => lerp(0.17, 0.07, i / (N - 1))),
  },
  {
    id: 'values', label: 'SDF + values SL', color: CLAUDE.INK, dash: '',
    blackmail:   STEPS.map((_, i) => lerp(0.08, 0.04, i / (N - 1))),
    financial:   STEPS.map((_, i) => lerp(0.10, 0.03, i / (N - 1))),
    cancer:      STEPS.map((_, i) => lerp(0.09, 0.02, i / (N - 1))),
  },
  {
    id: 'harmless', label: 'SDF + harmlessness SL', color: CLAUDE.SPARK, dash: '',
    blackmail:   STEPS.map((_, i) => lerp(0.07, 0.035, i / (N - 1))),
    financial:   STEPS.map((_, i) => lerp(0.09, 0.025, i / (N - 1))),
    cancer:      STEPS.map((_, i) => lerp(0.08, 0.015, i / (N - 1))),
  },
];

const PANELS = [
  { label: 'Blackmail', key: 'blackmail' as const },
  { label: 'Financial crimes', key: 'financial' as const },
  { label: 'Cancer research', key: 'cancer' as const },
];

const MAX_Y = 0.20;

export const TeachClaudeFig4: React.FC<TeachClaudeFig4Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const CHART_TOP = height * 0.32;
  const CHART_BOTTOM = height * 0.82;
  const CHART_H = CHART_BOTTOM - CHART_TOP;
  const CHART_TOTAL_W = width - PAD_X * 2 - 60;
  const PANEL_W = CHART_TOTAL_W / 3;
  const PANEL_PAD = PANEL_W * 0.08;
  const INNER_W = PANEL_W - PANEL_PAD * 2;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 75, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Each panel animates in with stagger
  const panelAnims = PANELS.map((_, pi) =>
    spring({ frame: frame - pi * 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } })
  );

  // Line draw progress within each panel
  const lineAnims = PANELS.map((_, pi) =>
    clamp(interpolate(frame, [15 + pi * 20, 55 + pi * 20], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    }), 0, 1)
  );

  const scoreToY = (s: number) => CHART_H * (1 - s / MAX_Y);

  const panelPath = (vals: number[], progress: number, panelLeft: number) => {
    const pts = vals.slice(0, Math.max(2, Math.floor(progress * (N - 1)) + 1));
    return pts.map((v, i) => {
      const x = panelLeft + (i / (N - 1)) * INNER_W;
      const y = CHART_TOP + scoreToY(v);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        ALIGNMENT FAILURES OVER RL TRAINING STEPS · LOWER IS BETTER
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.035, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Training more didn&rsquo;t help. Starting aligned did.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.14,
        display: 'flex', flexWrap: 'wrap' as const, gap: '6px 24px',
        opacity: clamp(titleIn, 0, 1),
      }}>
        {SERIES_DEFS.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={28} height={10}>
              <line x1={0} y1={5} x2={28} y2={5}
                stroke={s.color} strokeWidth={2.5}
                strokeDasharray={s.dash || 'none'} />
            </svg>
            <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* SVG overlay for all lines */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}>

        {PANELS.map((panel, pi) => {
          const panelLeft = PAD_X + 60 + pi * PANEL_W + PANEL_PAD;
          const pAnim = panelAnims[pi];
          const lAnim = lineAnims[pi];

          return (
            <g key={panel.key} opacity={clamp(pAnim, 0, 1)}>
              {/* Panel background border */}
              <rect x={panelLeft - PANEL_PAD * 0.5} y={CHART_TOP}
                width={PANEL_W - PANEL_PAD} height={CHART_H}
                fill="none" stroke={CLAUDE.BORDER} strokeWidth={1} />

              {/* Gridlines at 0.05 and 0.10 */}
              {[0.05, 0.10, 0.15].map(v => (
                <line key={v}
                  x1={panelLeft} y1={CHART_TOP + scoreToY(v)}
                  x2={panelLeft + INNER_W} y2={CHART_TOP + scoreToY(v)}
                  stroke={CLAUDE.BORDER} strokeWidth={1} opacity={0.6}
                />
              ))}

              {/* Series lines */}
              {SERIES_DEFS.map(s => {
                const vals = s[panel.key];
                const d = panelPath(vals, lAnim, panelLeft);
                return (
                  <path key={s.id} d={d}
                    fill="none" stroke={s.color} strokeWidth={2.5}
                    strokeDasharray={s.dash || 'none'}
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                );
              })}

              {/* "Plateau" annotation for blackmail panel */}
              {pi === 0 && lAnim > 0.7 && (
                <text x={panelLeft + INNER_W * 0.65}
                  y={CHART_TOP + scoreToY(0.165) - 10}
                  fontFamily={SERIF} fontSize={height * 0.014}
                  fill={CLAUDE.INK_SOFT} fontStyle="italic">
                  plateau
                </text>
              )}
            </g>
          );
        })}

        {/* Y axis labels (left of first panel) */}
        {[0, 0.05, 0.10, 0.15].map(v => (
          <text key={v}
            x={PAD_X + 52} y={CHART_TOP + scoreToY(v) + 4}
            fontFamily={SANS} fontSize={height * 0.012}
            fill={CLAUDE.GHOST} textAnchor="end">
            {v.toFixed(2)}
          </text>
        ))}

      </svg>

      {/* Panel labels */}
      {PANELS.map((panel, pi) => {
        const panelLeft = PAD_X + 60 + pi * PANEL_W + PANEL_PAD;
        return (
          <div key={panel.key} style={{
            position: 'absolute',
            left: panelLeft,
            top: CHART_BOTTOM + 10,
            width: INNER_W,
            textAlign: 'center' as const,
            fontFamily: SERIF, fontSize: height * 0.016,
            color: pi === 0 ? CLAUDE.SPARK : CLAUDE.INK,
            fontWeight: pi === 0 ? 600 : 400,
            opacity: clamp(panelAnims[pi], 0, 1),
          }}>
            {panel.label}
          </div>
        );
      })}

      {/* X axis label */}
      <div style={{
        position: 'absolute',
        left: PAD_X + 60, right: PAD_X,
        top: CHART_BOTTOM + 32,
        textAlign: 'center' as const,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
      }}>
        RL training steps
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
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
