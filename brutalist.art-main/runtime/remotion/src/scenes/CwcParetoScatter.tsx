import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcParetoScatter — C5 centerpiece for "The Pareto Frontier"
 * 2D scatter: cost (x) vs accuracy (y), Opus/Sonnet/Haiku dots,
 * the frontier curve drawn in, and Sonnet highlighted as the optimum.
 * Source: rightmodel/ — CWC Workshop 2026
 */

export const cwcParetoScatterSchema = z.object({
  sparkLine: z.string().default('Sonnet: $0.04, 90%. On the frontier.'),
});
export type CwcParetoScatterProps = z.infer<typeof cwcParetoScatterSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Models: [name, cost_cents, accuracy_pct, color, onFrontier, highlight]
// Based on card data: Opus 98%/$0.08, Sonnet 90%/$0.04, Haiku 82%/$0.01
// Cost in cents (1–10 range mapped to plot)
const MODELS = [
  { name: 'Haiku', cost: 1, accuracy: 82, color: '#73705F', onFrontier: true, highlight: false },
  { name: 'Sonnet', cost: 4, accuracy: 90, color: CLAUDE.SPARK, onFrontier: true, highlight: true },
  { name: 'Opus', cost: 8, accuracy: 98, color: '#3D3929', onFrontier: false, highlight: false },
];

export const CwcParetoScatter: React.FC<CwcParetoScatterProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.08;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axesIn = spring({ frame: frame - 15, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const haiku_in = spring({ frame: frame - 40, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const sonnet_in = spring({ frame: frame - 65, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const opus_in = spring({ frame: frame - 90, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const frontierIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const highlightIn = spring({ frame: frame - 155, fps, config: { damping: 24, stiffness: 80, mass: 1.2 } });
  const savingsIn = spring({ frame: frame - 190, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 240, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Plot area
  const PLOT_LEFT = PAD_X + width * 0.08;
  const PLOT_TOP = PAD_Y + height * 0.12;
  const PLOT_W = width * 0.62;
  const PLOT_H = height * 0.55;

  // Data → pixel coordinates
  // Cost: 0.5–9 cents → PLOT_LEFT to PLOT_LEFT+PLOT_W
  // Accuracy: 75–100% → PLOT_TOP+PLOT_H to PLOT_TOP
  const costToX = (cost: number) => PLOT_LEFT + ((cost - 0.5) / 8.5) * PLOT_W;
  const accToY = (acc: number) => PLOT_TOP + PLOT_H - ((acc - 75) / 25) * PLOT_H;

  const modelIns = [haiku_in, sonnet_in, opus_in];

  // Frontier curve points (Haiku and Sonnet are on frontier, Opus is not)
  // Frontier passes through Haiku(1,82) and Sonnet(4,90)
  const fp1x = costToX(1), fp1y = accToY(82);
  const fp2x = costToX(4), fp2y = accToY(90);
  // Extend the frontier line a bit beyond
  const fExtX = costToX(5), fExtY = accToY(91.5);
  const fStartX = costToX(0.5), fStartY = accToY(79);

  // Frontier draw-on: animate path length
  const frontierLen = Math.sqrt((fExtX - fStartX) ** 2 + (fExtY - fStartY) ** 2);
  const dashOffset = frontierLen * (1 - clamp(frontierIn, 0, 1));

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        MODEL SELECTION · PARETO FRONTIER
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Cost vs accuracy — customer-support classification
      </div>

      {/* AXES */}
      <svg style={{
        position: 'absolute', left: 0, top: 0,
        width: width, height: height,
        overflow: 'visible', pointerEvents: 'none',
        opacity: clamp(axesIn, 0, 1),
      }}>
        {/* Y axis */}
        <line x1={PLOT_LEFT} y1={PLOT_TOP} x2={PLOT_LEFT} y2={PLOT_TOP + PLOT_H}
          stroke={CLAUDE.BORDER} strokeWidth={1.5} />
        {/* X axis */}
        <line x1={PLOT_LEFT} y1={PLOT_TOP + PLOT_H} x2={PLOT_LEFT + PLOT_W} y2={PLOT_TOP + PLOT_H}
          stroke={CLAUDE.BORDER} strokeWidth={1.5} />

        {/* Y grid lines + labels */}
        {[80, 85, 90, 95, 100].map(acc => {
          const y = accToY(acc);
          return (
            <g key={acc}>
              <line x1={PLOT_LEFT} y1={y} x2={PLOT_LEFT + PLOT_W} y2={y}
                stroke={CLAUDE.BORDER} strokeWidth={1} strokeDasharray="4 6" opacity={0.5} />
              <text x={PLOT_LEFT - 8} y={y + 5}
                textAnchor="end" fontFamily={SANS} fontSize={height * 0.011} fill={CLAUDE.INK_SOFT}>
                {acc}%
              </text>
            </g>
          );
        })}

        {/* X grid lines + labels */}
        {[1, 2, 4, 6, 8].map(cost => {
          const x = costToX(cost);
          return (
            <g key={cost}>
              <line x1={x} y1={PLOT_TOP} x2={x} y2={PLOT_TOP + PLOT_H}
                stroke={CLAUDE.BORDER} strokeWidth={1} strokeDasharray="4 6" opacity={0.5} />
              <text x={x} y={PLOT_TOP + PLOT_H + 20}
                textAnchor="middle" fontFamily={MONO} fontSize={height * 0.011} fill={CLAUDE.INK_SOFT}>
                ${(cost / 100).toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={PLOT_LEFT + PLOT_W / 2} y={PLOT_TOP + PLOT_H + 46}
          textAnchor="middle" fontFamily={SERIF} fontSize={height * 0.015} fill={CLAUDE.INK} fontStyle="italic">
          cost per call ($)
        </text>
        <text
          transform={`rotate(-90, ${PLOT_LEFT - 52}, ${PLOT_TOP + PLOT_H / 2})`}
          x={PLOT_LEFT - 52} y={PLOT_TOP + PLOT_H / 2}
          textAnchor="middle" fontFamily={SERIF} fontSize={height * 0.015} fill={CLAUDE.INK} fontStyle="italic">
          accuracy (%)
        </text>

        {/* FRONTIER CURVE — draw-on animation */}
        <line
          x1={fStartX} y1={fStartY} x2={fExtX} y2={fExtY}
          stroke={CLAUDE.SPARK} strokeWidth={2.5}
          strokeDasharray={frontierLen}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
        {/* Frontier label */}
        <text
          x={fExtX + 10} y={fExtY - 8}
          fontFamily={SERIF} fontSize={height * 0.013} fill={CLAUDE.SPARK} fontStyle="italic"
          opacity={clamp(frontierIn, 0, 1)}>
          pareto frontier
        </text>

        {/* Sonnet highlight ring */}
        <circle
          cx={costToX(4)} cy={accToY(90)}
          r={32 * clamp(highlightIn, 0, 1)}
          fill="none" stroke={CLAUDE.SPARK} strokeWidth={2.5}
          opacity={clamp(highlightIn, 0, 1) * 0.6}
        />
        <circle
          cx={costToX(4)} cy={accToY(90)}
          r={50 * clamp(highlightIn, 0, 1)}
          fill="none" stroke={CLAUDE.SPARK} strokeWidth={1}
          opacity={clamp(highlightIn, 0, 1) * 0.3}
        />

        {/* MODEL DOTS */}
        {MODELS.map((m, i) => {
          const mIn = modelIns[i];
          const mx = costToX(m.cost);
          const my = accToY(m.accuracy);
          const r = m.highlight ? 14 : 10;
          return (
            <g key={m.name}>
              <circle cx={mx} cy={my} r={r * clamp(mIn, 0, 1)}
                fill={m.color} opacity={clamp(mIn, 0, 1)} />
              <text x={mx + (m.name === 'Haiku' ? -r - 8 : r + 8)} y={my - r - 6}
                textAnchor={m.name === 'Haiku' ? 'end' : 'start'}
                fontFamily={SERIF} fontSize={height * 0.016} fill={m.color} fontWeight="700"
                opacity={clamp(mIn, 0, 1)}>
                {m.name}
              </text>
              <text x={mx + (m.name === 'Haiku' ? -r - 8 : r + 8)} y={my + r + 14}
                textAnchor={m.name === 'Haiku' ? 'end' : 'start'}
                fontFamily={MONO} fontSize={height * 0.011} fill={CLAUDE.INK_SOFT}
                opacity={clamp(mIn, 0, 1)}>
                {m.accuracy}% / ${(m.cost / 100).toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Savings callout */}
      <div style={{
        position: 'absolute',
        right: PAD_X, top: PLOT_TOP + height * 0.05,
        width: width * 0.22,
        background: `${CLAUDE.SPARK}12`, border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '14px 16px',
        opacity: clamp(savingsIn, 0, 1),
        transform: `translateX(${(1 - clamp(savingsIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 700, color: CLAUDE.SPARK }}>
          Sonnet: the rational choice
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK, marginTop: 8, lineHeight: 1.6 }}>
          90% accuracy — good enough for this task
        </div>
        <div style={{
          fontFamily: MONO, fontSize: height * 0.014, fontWeight: 700,
          color: '#4CAF50', marginTop: 8,
        }}>
          $0.04/call saved vs Opus
        </div>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, marginTop: 4,
        }}>
          ×100,000 calls = $4,000 back
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        right: PAD_X, bottom: height * 0.20,
        width: width * 0.22,
        display: 'flex', flexDirection: 'column', gap: 8,
        opacity: clamp(savingsIn, 0, 1),
      }}>
        {MODELS.map(m => (
          <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>
              {m.name} — {m.onFrontier ? 'on frontier' : 'off frontier'}
            </span>
          </div>
        ))}
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.12,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Claude Code Workshops (Anthropic) — rightmodel
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
