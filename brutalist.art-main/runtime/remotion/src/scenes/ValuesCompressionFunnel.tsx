import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ValuesCompressionFunnel — Figure 1 for "Claude's Values Across Models and Languages"
 * Source: Anthropic (Jul 13, 2026)
 *
 * Animation:
 * 1. Cloud of ~30 value-word chips swirl in (random offset positions)
 * 2. Chips compress/collapse toward center → labeled "339 clusters"
 * 3. Four horizontal axis lines SNAP in — terracotta flash then settle to INK
 * 4. Counters tick up sequentially: 700,000 → 3,307 → 339 → 4
 * 5. Small variance chip appears: "captures 15% of variance"
 *
 * One terracotta moment: the snap into 4 axis lines (SPARK flash).
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const valuesCompressionFunnelSchema = z.object({
  sparkLine: z.string().default('Compression, not the whole picture.'),
});
export type ValuesCompressionFunnelProps = z.infer<typeof valuesCompressionFunnelSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const VALUE_WORDS = [
  'honesty', 'encouragement', 'accuracy', 'nuance', 'harm reduction',
  'playfulness', 'transparency', 'brevity', 'clarity', 'fairness',
  'caution', 'empathy', 'depth', 'rigor', 'candor',
  'warmth', 'deference', 'execution', 'creativity', 'safety',
  'respect', 'helpfulness', 'precision', 'openness', 'care',
  'wisdom', 'directness', 'kindness', 'objectivity', 'tact',
];

// Seeded pseudo-random positions for chips (deterministic layout)
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Phase timing (in frames at 30fps)
const PHASE_SWIRL_START = 0;      // chips swirl in
const PHASE_COMPRESS_START = 60;  // chips compress to center
const PHASE_SNAP_START = 110;     // axis lines snap in (terracotta flash)
const PHASE_COUNTER_START = 140;  // counters tick
const PHASE_VARIANCE_START = 200; // variance chip appears
const PHASE_SPARK_IN = 230;       // spark line

export const ValuesCompressionFunnel: React.FC<ValuesCompressionFunnelProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const CX = width * 0.5;
  const CY = height * 0.52;

  // Phase springs
  const swirlIn = spring({ frame: frame - PHASE_SWIRL_START, fps, config: { damping: 26, stiffness: 80, mass: 1.0 } });
  const compressAnim = spring({ frame: frame - PHASE_COMPRESS_START, fps, config: { damping: 24, stiffness: 70, mass: 1.1 } });
  const snapAnim = spring({ frame: frame - PHASE_SNAP_START, fps, config: { damping: 18, stiffness: 150, mass: 0.7 } });
  const varianceIn = spring({ frame: frame - PHASE_VARIANCE_START, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const citeIn = spring({ frame: frame - PHASE_SNAP_START, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Terracotta flash: bright at snap, quickly settles to INK
  const flashT = clamp(snapAnim, 0, 1);
  const axisColor = flashT > 0.05
    ? `rgb(${Math.round(interpolate(flashT, [0, 0.5, 1], [61, 217, 61]))}, ${Math.round(interpolate(flashT, [0, 0.5, 1], [57, 119, 57]))}, ${Math.round(interpolate(flashT, [0, 0.5, 1], [41, 87, 41]))})`
    : CLAUDE.INK;
  // simpler: lerp from SPARK to INK over snap progress
  const snapProgress = clamp(snapAnim, 0, 1);
  // SPARK = #D97757 = rgb(217,119,87); INK = #3D3929 = rgb(61,57,41)
  const axisR = Math.round(217 + (61 - 217) * snapProgress);
  const axisG = Math.round(119 + (57 - 119) * snapProgress);
  const axisB = Math.round(87 + (41 - 87) * snapProgress);
  const axisColorFinal = `rgb(${axisR},${axisG},${axisB})`;

  // Counter values (tick up sequentially)
  const counters = [
    { label: '700,000', subLabel: 'conversations', startFrame: PHASE_COUNTER_START },
    { label: '3,307', subLabel: 'values', startFrame: PHASE_COUNTER_START + 15 },
    { label: '339', subLabel: 'clusters', startFrame: PHASE_COUNTER_START + 30 },
    { label: '4', subLabel: 'axes', startFrame: PHASE_COUNTER_START + 45 },
  ];

  // Chip layout: compressed vs swirled
  const CHIP_RADIUS_X = width * 0.28;
  const CHIP_RADIUS_Y = height * 0.20;
  const CLUSTER_CX = CX;
  const CLUSTER_CY = CY + height * 0.04;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        COMPRESSION · 3,307 VALUES → 4 AXES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        How 3,307 values become 4 measurable axes
      </div>

      {/* Value word chips — swirl in, then compress */}
      {VALUE_WORDS.map((word, i) => {
        const angle = (i / VALUE_WORDS.length) * Math.PI * 2 + pseudoRandom(i * 3) * 0.8;
        const rX = CHIP_RADIUS_X * (0.6 + pseudoRandom(i * 7) * 0.4);
        const rY = CHIP_RADIUS_Y * (0.6 + pseudoRandom(i * 11) * 0.4);

        // Swirled position (start)
        const startX = CX + Math.cos(angle) * rX;
        const startY = CLUSTER_CY + Math.sin(angle) * rY;

        // Compressed position (cluster near center)
        const clusterAngle = (i / VALUE_WORDS.length) * Math.PI * 2;
        const clusterR = 28 + pseudoRandom(i * 5) * 20;
        const endX = CLUSTER_CX + Math.cos(clusterAngle) * clusterR;
        const endY = CLUSTER_CY + Math.sin(clusterAngle) * clusterR;

        const compress = clamp(compressAnim, 0, 1);
        const cx = startX + (endX - startX) * compress;
        const cy = startY + (endY - startY) * compress;
        const scale = 1 - compress * 0.5;
        const opacity = clamp(swirlIn, 0, 1) * (1 - clamp(snapAnim, 0, 1) * 0.9);
        const chipDelay = i * 2;
        const chipIn = spring({ frame: frame - PHASE_SWIRL_START - chipDelay, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } });

        const isInk = i % 3 !== 0;
        return (
          <div key={word} style={{
            position: 'absolute',
            left: cx,
            top: cy,
            transform: `translate(-50%, -50%) scale(${scale})`,
            background: isInk ? CLAUDE.PILL : CLAUDE.BORDER,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 20,
            padding: '3px 10px',
            fontFamily: SANS,
            fontSize: height * 0.013,
            fontWeight: 500,
            color: CLAUDE.INK_SOFT,
            opacity: opacity * clamp(chipIn, 0, 1),
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            {word}
          </div>
        );
      })}

      {/* "339 clusters" label — appears when compressed */}
      {clamp(compressAnim, 0, 1) > 0.5 && (
        <div style={{
          position: 'absolute',
          left: CLUSTER_CX,
          top: CLUSTER_CY + 68,
          transform: 'translateX(-50%)',
          fontFamily: SERIF,
          fontSize: height * 0.020,
          fontWeight: 600,
          color: CLAUDE.INK,
          opacity: clamp(compressAnim, 0, 1) * (1 - clamp(snapAnim, 0, 1)),
          textAlign: 'center',
        }}>
          339 clusters
        </div>
      )}

      {/* Four axis lines — snap in with terracotta flash */}
      {clamp(snapAnim, 0, 1) > 0.05 && (
        <div style={{
          position: 'absolute',
          left: PAD_X,
          right: PAD_X,
          top: height * 0.30,
          display: 'flex',
          flexDirection: 'column',
          gap: height * 0.08,
          opacity: clamp(snapAnim, 0, 1),
        }}>
          {['Deference ↔ Caution', 'Warmth ↔ Rigor', 'Depth ↔ Brevity', 'Candor ↔ Execution'].map((label, i) => {
            const lineIn = spring({
              frame: frame - PHASE_SNAP_START - i * 8,
              fps,
              config: { damping: 18, stiffness: 160, mass: 0.6 },
            });
            return (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  fontFamily: SANS, fontSize: height * 0.013, fontWeight: 600,
                  color: axisColorFinal, letterSpacing: 1.5, textTransform: 'uppercase' as const,
                  opacity: clamp(lineIn, 0, 1),
                }}>
                  Axis {i + 1}
                </div>
                <div style={{
                  height: 2,
                  background: axisColorFinal,
                  width: `${clamp(lineIn, 0, 1) * 100}%`,
                  borderRadius: 2,
                  transformOrigin: 'left center',
                }} />
                <div style={{
                  fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 500,
                  color: CLAUDE.INK, opacity: clamp(lineIn, 0, 1),
                }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Counters row */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: height * 0.78,
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        {counters.map(({ label, subLabel, startFrame }) => {
          const counterIn = spring({ frame: frame - startFrame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });
          return (
            <div key={label} style={{
              textAlign: 'center',
              opacity: clamp(counterIn, 0, 1),
              transform: `translateY(${(1 - clamp(counterIn, 0, 1)) * 12}px)`,
            }}>
              <div style={{
                fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 700,
                color: CLAUDE.INK, letterSpacing: '-0.02em',
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT,
                textTransform: 'uppercase' as const, letterSpacing: 1.5, marginTop: 4,
              }}>
                {subLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Variance chip */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        bottom: height * 0.14,
        background: CLAUDE.PILL,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 20,
        padding: '6px 16px',
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 500,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(varianceIn, 0, 1),
      }}>
        captures 15% of variance
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.10,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
        fontStyle: 'italic',
      }}>
        Redrawn from Anthropic, Claude's Values Across Models and Languages (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.04,
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
