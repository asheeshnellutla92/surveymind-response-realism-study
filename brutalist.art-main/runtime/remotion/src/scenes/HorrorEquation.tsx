import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HorrorEquation — B04 for "The Math of Being Afraid Together"
 * Source: Zebonastic essay by Seth Brown & Humanitarians AI, May 17 2026.
 *
 * Phase 1 — Term-by-term reveal of the TPI equation.
 * Phase 2 — Demo: two player dots slide apart / wall drops → δ shrinks → TPI rises.
 * Terracotta: the wall drop + TPI spike moment.
 * Craft quote overlays at landing.
 * Proof-spine Step 3 card pins.
 *
 * One terracotta moment per beat (CLAUDE-BRAND.md).
 */

export const horrorEquationSchema = z.object({
  sparkLine: z.string().default('Design the safety net. Then take it away.'),
});
export type HorrorEquationProps = z.infer<typeof horrorEquationSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Phase timing (at 30fps, ~15 second composition for this long beat)
const PHASE_TITLE_IN = 0;
const PHASE_TPI_IN = 20;
const PHASE_PSI_IN = 40;
const PHASE_HC_IN = 65;
const PHASE_BETA_IN = 90;
const PHASE_DEMO_IN = 160;
const PHASE_WALL_IN = 210;
const PHASE_GAUGE_SPIKE = 230;
const PHASE_QUOTE_IN = 280;
const PHASE_SPINE_IN = 310;
const PHASE_SPARK_IN = 360;

export const HorrorEquation: React.FC<HorrorEquationProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const tpiIn = spring({ frame: frame - PHASE_TPI_IN, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
  const psiIn = spring({ frame: frame - PHASE_PSI_IN, fps, config: { damping: 24, stiffness: 120, mass: 0.8 } });
  const hcIn = spring({ frame: frame - PHASE_HC_IN, fps, config: { damping: 24, stiffness: 120, mass: 0.8 } });
  const betaIn = spring({ frame: frame - PHASE_BETA_IN, fps, config: { damping: 24, stiffness: 120, mass: 0.8 } });
  const demoIn = spring({ frame: frame - PHASE_DEMO_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const wallIn = spring({ frame: frame - PHASE_WALL_IN, fps, config: { damping: 18, stiffness: 160, mass: 0.7 } });
  const gaugeSpike = spring({ frame: frame - PHASE_GAUGE_SPIKE, fps, config: { damping: 16, stiffness: 180, mass: 0.6 } });
  const quoteIn = spring({ frame: frame - PHASE_QUOTE_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const spineIn = spring({ frame: frame - PHASE_SPINE_IN, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  // Demo positions: two player dots
  const wallProgress = clamp(wallIn, 0, 1);
  const dot1X = width * 0.32 - wallProgress * 60;   // left player moves left
  const dot2X = width * 0.48 + wallProgress * 60;   // right player moves right
  const demoY = height * 0.62;
  const dotR = 14;

  // TPI gauge: rises after wall drop (terracotta spike)
  const tpiLevel = interpolate(clamp(gaugeSpike, 0, 1), [0, 1], [0.22, 0.82]);
  const gaugeColor = `rgb(${Math.round(61 + (217 - 61) * clamp(gaugeSpike, 0, 1))}, ${Math.round(57 + (119 - 57) * clamp(gaugeSpike, 0, 1))}, ${Math.round(41 + (87 - 41) * clamp(gaugeSpike, 0, 1))})`;

  // δ indicator shrinks with wall
  const deltaLevel = interpolate(wallProgress, [0, 1], [0.9, 0.2]);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 3 · THE MODEL (TEACHING SCAFFOLD)
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Not established physics. A teaching scaffold.
      </div>

      {/* ─── EQUATION DISPLAY ─── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.27,
        right: PAD_X + width * 0.25,
        opacity: clamp(tpiIn, 0, 1),
      }}>
        {/* TPI = */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, lineHeight: 1 }}>
          <span style={{
            fontFamily: SERIF, fontSize: height * 0.04, fontWeight: 700,
            color: CLAUDE.INK, marginRight: 8,
          }}>TPI =</span>

          {/* Ψ */}
          <span style={{
            fontFamily: SERIF, fontSize: height * 0.048, fontWeight: 700,
            color: CLAUDE.INK, opacity: clamp(psiIn, 0, 1),
            transform: `translateY(${(1 - clamp(psiIn, 0, 1)) * 12}px)`,
            display: 'inline-block',
          }}>Ψ</span>
          <span style={{ fontFamily: SERIF, fontSize: height * 0.04, color: CLAUDE.INK, margin: '0 6px', opacity: clamp(hcIn, 0, 1) }}>·</span>

          {/* Hc/N fraction */}
          <span style={{ opacity: clamp(hcIn, 0, 1), display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 6px' }}>
            <span style={{ fontFamily: SERIF, fontSize: height * 0.032, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1 }}>H<sub>c</sub></span>
            <div style={{ width: '100%', height: 2, background: CLAUDE.INK, margin: '2px 0' }} />
            <span style={{ fontFamily: SERIF, fontSize: height * 0.032, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1 }}>N</span>
          </span>

          {/* · (1 + β · Σ δij · e^(-λ·dij)) */}
          <span style={{ opacity: clamp(betaIn, 0, 1), display: 'inline-block', transform: `translateY(${(1 - clamp(betaIn, 0, 1)) * 12}px)` }}>
            <span style={{ fontFamily: SERIF, fontSize: height * 0.036, color: CLAUDE.INK, margin: '0 6px' }}>·</span>
            <span style={{ fontFamily: SERIF, fontSize: height * 0.028, color: CLAUDE.INK }}>
              (1 + β · Σ δ<sub>ij</sub> · e<sup>−λ·d<sub>ij</sub></sup>)
            </span>
          </span>
        </div>

        {/* Gloss chips */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18,
          opacity: clamp(betaIn, 0, 1),
        }}>
          {[
            { sym: 'Ψ', desc: 'environment stress' },
            { sym: 'Hc', desc: 'information deficit' },
            { sym: 'N', desc: 'living players nearby' },
            { sym: 'β', desc: 'social buffering' },
            { sym: 'δij', desc: 'comms fidelity' },
            { sym: 'dij', desc: 'distance' },
          ].map(({ sym, desc }) => (
            <div key={sym} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: CLAUDE.PILL, border: `1.5px solid ${CLAUDE.BORDER}`,
              borderRadius: 8, padding: '4px 12px',
            }}>
              <span style={{ fontFamily: SERIF, fontSize: height * 0.015, fontWeight: 700, color: CLAUDE.INK }}>{sym}</span>
              <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>=</span>
              <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── DEMO: player dots + wall ─── */}
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={width} height={height}>
        {/* Demo area background */}
        <rect x={width * 0.18} y={height * 0.55} width={width * 0.44} height={height * 0.22}
          fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} rx={10}
          opacity={clamp(demoIn, 0, 1)}
        />
        {/* Map label */}
        <text x={width * 0.40} y={height * 0.57} textAnchor="middle"
          fontFamily={SANS} fontSize={11} fill={CLAUDE.INK_SOFT}
          opacity={clamp(demoIn, 0, 1)}>
          MAP DEMO
        </text>
        {/* Player dots */}
        <circle cx={dot1X} cy={demoY} r={dotR} fill={CLAUDE.INK} opacity={clamp(demoIn, 0, 1)} />
        <circle cx={dot2X} cy={demoY} r={dotR} fill={CLAUDE.INK_SOFT} opacity={clamp(demoIn, 0, 1)} />
        {/* Player labels */}
        <text x={dot1X} y={demoY + 4} textAnchor="middle" fontFamily={SANS} fontSize={9} fill="#FFF" opacity={clamp(demoIn, 0, 1)}>P1</text>
        <text x={dot2X} y={demoY + 4} textAnchor="middle" fontFamily={SANS} fontSize={9} fill="#FFF" opacity={clamp(demoIn, 0, 1)}>P2</text>
        {/* Wall — terracotta, drops in */}
        {wallProgress > 0.05 && (
          <rect
            x={width * 0.395}
            y={height * 0.58 - wallProgress * height * 0.16}
            width={8}
            height={wallProgress * height * 0.16}
            fill={CLAUDE.SPARK}
            rx={3}
            opacity={wallProgress}
          />
        )}
        {/* Wall label */}
        {wallProgress > 0.3 && (
          <text x={width * 0.399} y={height * 0.62} fontFamily={SANS} fontSize={10} fill={CLAUDE.SPARK} fontWeight="700" opacity={wallProgress}>
            WALL
          </text>
        )}
      </svg>

      {/* δ indicator */}
      <div style={{
        position: 'absolute',
        left: width * 0.20,
        top: height * 0.78,
        display: 'flex', alignItems: 'center', gap: 10,
        opacity: clamp(demoIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.016, color: CLAUDE.INK }}>δ (comms)</span>
        <div style={{
          width: 80, height: 10,
          background: CLAUDE.PILL, borderRadius: 5,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${deltaLevel * 100}%`,
            background: CLAUDE.INK_SOFT, borderRadius: 5,
          }} />
        </div>
        {wallProgress > 0.5 && (
          <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.SPARK, fontWeight: 700 }}>↓ degraded</span>
        )}
      </div>

      {/* TPI gauge — spikes terracotta */}
      <div style={{
        position: 'absolute',
        left: width * 0.52,
        top: height * 0.55,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        opacity: clamp(demoIn, 0, 1),
      }}>
        <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>TPI</span>
        <div style={{
          width: 22, height: height * 0.20,
          background: CLAUDE.PILL, border: `1.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 6, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          <div style={{
            width: '100%', height: `${tpiLevel * 100}%`,
            background: gaugeColor,
            borderRadius: 4,
          }} />
        </div>
        {gaugeSpike > 0.5 && (
          <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.SPARK, fontWeight: 700 }}>↑ SPIKE</span>
        )}
      </div>

      {/* Craft quote */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.16,
        right: PAD_X + width * 0.24,
        fontFamily: SERIF,
        fontSize: height * 0.020,
        fontStyle: 'italic',
        color: CLAUDE.INK,
        lineHeight: 1.5,
        opacity: clamp(quoteIn, 0, 1),
        transform: `translateY(${(1 - clamp(quoteIn, 0, 1)) * 10}px)`,
      }}>
        "You don't design fear into a co-op horror game. You design the safety net, then spend the rest of development taking it away."
      </div>

      {/* Proof spine card — Step 3 */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        top: height * 0.28,
        width: width * 0.22,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '14px 18px',
        opacity: clamp(spineIn, 0, 1),
        transform: `translateX(${(1 - clamp(spineIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
          color: CLAUDE.SPARK, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 6,
        }}>Step 3</div>
        <div style={{
          fontFamily: SERIF, fontSize: height * 0.013, color: CLAUDE.INK, lineHeight: 1.45,
        }}>
          TPI = Ψ · (Hc/N) · (1 + β · Σ δij · e<sup>−λ·dij</sup>)
        </div>
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
