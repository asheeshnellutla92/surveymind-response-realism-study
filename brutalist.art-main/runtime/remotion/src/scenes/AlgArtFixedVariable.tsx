import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AlgArtFixedVariable — the artifact viewer as a Remotion mock.
 * Canvas left, sidebar right: Seed (prev/next/random/jump) → Parameters
 * (sliders) → Colors → Actions (regenerate/reset/download).
 * Ink-line the FIXED chrome; VARIABLE interior hot-swaps between
 * two different movement systems at frame 90 and 180.
 * Per ILLUSTRATE LAW: the interface IS the subject here — this is
 * the one beat where the viewer chrome earns its appearance.
 */

export const algArtFixedVariableSchema = z.object({
  sparkLine: z.string().default('Fixed outside. Free inside.'),
});
export type AlgArtFixedVariableProps = z.infer<typeof algArtFixedVariableSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function mulberry32(s: number) {
  return function() {
    s = (s | 0) + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function vNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const h = (px: number, py: number) => {
    const n = Math.sin(px * 127.1 + py * 311.7 + seed * 7.31) * 43758.5453;
    return n - Math.floor(n);
  };
  const a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

// Generative canvas content: two different systems
function SystemA({ W, H, frame, seed }: { W: number; H: number; frame: number; seed: number }) {
  // Flow field system
  const N = 60, TRAIL = 15;
  const trails: { x: number; y: number }[][] = [];
  for (let i = 0; i < N; i++) {
    const rng = mulberry32(seed * 100 + i);
    let x = rng() * W, y = rng() * H;
    const spd = 1.0 + rng() * 1.8;
    const fastEnd = Math.max(0, frame - TRAIL);
    for (let t = 0; t < fastEnd; t += 3) {
      const a = (vNoise(x * 0.005 + t * 0.04, y * 0.005, seed) * 1.6 +
        vNoise(x * 0.005, y * 0.005 + t * 0.03, seed + 99) * 0.7) * Math.PI * 3;
      x = ((x + Math.cos(a) * spd * 3) % W + W) % W;
      y = ((y + Math.sin(a) * spd * 3) % H + H) % H;
    }
    const trail: { x: number; y: number }[] = [];
    for (let t = fastEnd; t <= frame; t++) {
      trail.push({ x, y });
      const a = (vNoise(x * 0.005 + t * 0.04, y * 0.005, seed) * 1.6 +
        vNoise(x * 0.005, y * 0.005 + t * 0.03, seed + 99) * 0.7) * Math.PI * 3;
      x = ((x + Math.cos(a) * spd) % W + W) % W;
      y = ((y + Math.sin(a) * spd) % H + H) % H;
    }
    trails.push(trail);
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {trails.map((tr, pi) => {
        if (tr.length < 2) return null;
        const rng2 = mulberry32(seed * 100 + pi + 99999);
        const isHot = rng2() > 0.65;
        const d = tr.map((pt, j, arr) => {
          if (j === 0) return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          const prev = arr[j - 1];
          if (Math.abs(pt.x - prev.x) > W / 2 || Math.abs(pt.y - prev.y) > H / 2) {
            return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }
          return `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        }).join(' ');
        return <path key={pi} d={d} fill="none"
          stroke={isHot ? CLAUDE.SPARK : CLAUDE.INK}
          strokeWidth={isHot ? 1.1 : 0.7}
          strokeLinecap="round"
          opacity={isHot ? 0.55 : 0.22} />;
      })}
    </svg>
  );
}

function SystemB({ W, H, frame, seed }: { W: number; H: number; frame: number; seed: number }) {
  // Dot grid system (Quantum Harmonics style)
  const ROWS = 10, COLS = 14;
  const cellW = W / COLS, cellH = H / ROWS;
  const t = frame * 0.03;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const phase = vNoise(c * 0.4, r * 0.4, seed) * Math.PI * 2;
          const amp = 0.3 + vNoise(c * 0.3 + 1, r * 0.3 + 1, seed + 5) * 0.7;
          const val = Math.sin(t * 2 + phase) * amp;
          const brightness = (val + 1) / 2;
          const isHot = brightness > 0.7;
          const color = isHot ? CLAUDE.SPARK : CLAUDE.INK;
          const radius = 2.5 + brightness * 5;
          return (
            <circle
              key={`${r}-${c}`}
              cx={c * cellW + cellW / 2} cy={r * cellH + cellH / 2}
              r={radius} fill={color} opacity={0.15 + brightness * 0.65}
            />
          );
        })
      )}
    </svg>
  );
}

// Slider control mock
const SliderMock: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
      <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK }}>{value}</span>
    </div>
    <div style={{ height: 4, background: CLAUDE.PILL, borderRadius: 2, position: 'relative' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: `${value}%`, height: '100%',
        background: CLAUDE.SPARK, borderRadius: 2,
      }} />
    </div>
  </div>
);

// Button mock
const BtnMock: React.FC<{ label: string; primary?: boolean }> = ({ label, primary }) => (
  <div style={{
    padding: '6px 12px',
    borderRadius: 6,
    border: `1px solid ${primary ? CLAUDE.SPARK : CLAUDE.BORDER}`,
    background: primary ? CLAUDE.SPARK : 'transparent',
    fontFamily: SANS,
    fontSize: 11,
    color: primary ? '#FFFFFF' : CLAUDE.INK_SOFT,
    cursor: 'default',
    display: 'inline-block',
    marginRight: 6,
    marginBottom: 6,
  }}>
    {label}
  </div>
);

export const AlgArtFixedVariable: React.FC<AlgArtFixedVariableProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const labelsIn = spring({ frame: frame - 15, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });

  // Hot-swap between system A and B
  const SWAP_1 = 90, SWAP_2 = 180;
  const swap1progress = clamp(interpolate(frame, [SWAP_1, SWAP_1 + 15], [0, 1]), 0, 1);
  const swap2progress = clamp(interpolate(frame, [SWAP_2, SWAP_2 + 15], [0, 1]), 0, 1);

  const systemIdx = frame < SWAP_1 ? 0 : frame < SWAP_2 ? 1 : 0;
  const seed = systemIdx === 0 ? 42 : 7;

  const SIDEBAR_W = 220;
  const CANVAS_W = W * 0.78 - 80;
  const CANVAS_H = H * 0.74;
  const VIEWER_H = H * 0.82;

  const swapOpacity = systemIdx === 0 ? 1 - (swap1progress * (1 - swap2progress)) : swap1progress * (1 - swap2progress);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: H * 0.06,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(cardIn, 0, 1),
      }}>
        THE ARTIFACT VIEWER · FIXED CHROME · VARIABLE ALGORITHM
      </div>

      {/* Main viewer card */}
      <div style={{
        position: 'absolute',
        left: W * 0.04,
        right: W * 0.04,
        top: H * 0.13,
        height: VIEWER_H,
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(61,57,41,0.12)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        opacity: clamp(cardIn, 0, 1),
        transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 20}px)`,
      }}>
        {/* Title bar */}
        <div style={{
          padding: '10px 18px',
          background: CLAUDE.PAGE,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          {[CLAUDE.SPARK, CLAUDE.BORDER, CLAUDE.BORDER].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT, marginLeft: 8 }}>
            algorithmic-art — Organic Turbulence
          </span>
          <span style={{
            marginLeft: 'auto',
            fontFamily: SANS, fontSize: 10,
            color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase' as const,
          }}>
            p5.js
          </span>
        </div>

        {/* Body: canvas + sidebar */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Canvas area */}
          <div style={{
            flex: 1,
            background: CLAUDE.PAGE,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* System A */}
            <div style={{ position: 'absolute', inset: 0, opacity: systemIdx === 0 ? 1 : 1 - swap1progress + swap2progress }}>
              <SystemA W={CANVAS_W} H={CANVAS_H} frame={frame} seed={42} />
            </div>
            {/* System B */}
            <div style={{ position: 'absolute', inset: 0, opacity: systemIdx === 1 ? swap1progress * (1 - swap2progress) : 0 }}>
              <SystemB W={CANVAS_W} H={CANVAS_H} frame={frame} seed={7} />
            </div>

            {/* VARIABLE label */}
            <div style={{
              position: 'absolute',
              top: 10, left: 10,
              background: CLAUDE.INK,
              color: '#FFFFFF',
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: 'uppercase' as const,
              padding: '3px 8px',
              borderRadius: 4,
              opacity: clamp(labelsIn, 0, 1),
            }}>
              VARIABLE
            </div>
          </div>

          {/* Sidebar (FIXED chrome) */}
          <div style={{
            width: SIDEBAR_W,
            background: CLAUDE.FOOTER,
            borderLeft: `1px solid ${CLAUDE.BORDER}`,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            flexShrink: 0,
            overflowY: 'hidden' as const,
          }}>
            {/* FIXED label */}
            <div style={{
              position: 'relative',
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: 'uppercase' as const,
              color: CLAUDE.SPARK,
              opacity: clamp(labelsIn, 0, 1),
            }}>
              FIXED
            </div>

            {/* Seed section */}
            <div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK, marginBottom: 8 }}>
                Seed
              </div>
              <div style={{
                background: CLAUDE.CARD,
                border: `1px solid ${CLAUDE.BORDER}`,
                borderRadius: 8,
                padding: '8px 12px',
                fontFamily: MONO,
                fontSize: 14,
                color: CLAUDE.INK,
                textAlign: 'center' as const,
                marginBottom: 6,
              }}>
                {seed}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['←', '→', '?', '⊞'].map(btn => (
                  <div key={btn} style={{
                    flex: 1,
                    padding: '4px',
                    border: `1px solid ${CLAUDE.BORDER}`,
                    borderRadius: 5,
                    fontFamily: SANS,
                    fontSize: 12,
                    color: CLAUDE.INK_SOFT,
                    textAlign: 'center' as const,
                    background: CLAUDE.CARD,
                  }}>{btn}</div>
                ))}
              </div>
            </div>

            {/* Parameters section */}
            <div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK, marginBottom: 8 }}>
                Parameters
              </div>
              <SliderMock label="Particle count" value={68} />
              <SliderMock label="Trail length" value={45} />
              <SliderMock label="Speed scale" value={72} />
              <SliderMock label="Noise frequency" value={38} />
            </div>

            {/* Actions section */}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK, marginBottom: 8 }}>
                Actions
              </div>
              <BtnMock label="Regenerate" primary />
              <BtnMock label="Reset" />
              <BtnMock label="Download" />
            </div>
          </div>
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: W * 0.04,
        bottom: H * 0.04,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
