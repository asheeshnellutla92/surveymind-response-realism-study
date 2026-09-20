import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcFanOutSpeedGain — Serial vs parallel timing diagram
 * TOP: serial 50 boxes in a line, label "50 × 30s = 25 minutes"
 * BOTTOM: parallel fan-out, 50 boxes in columns, label "30s total"
 * Source: research-desk/ — CWC Workshop 2026
 */

export const cwcFanOutSpeedGainSchema = z.object({
  sparkLine: z.string().default("Serial is a queue. Parallel is a wave."),
});
export type CwcFanOutSpeedGainProps = z.infer<typeof cwcFanOutSpeedGainSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const N = 30; // boxes to show (representing 50 analysts)
const COLS = 10;
const ROWS = Math.ceil(N / COLS);

export const CwcFanOutSpeedGain: React.FC<CwcFanOutSpeedGainProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const serialLabelIn = spring({ frame: frame - 18, fps, config: { damping: 28, stiffness: 110 } });
  const parallelLabelIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 110 } });
  const sparkIn = spring({ frame: frame - 250, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CONTENT_W = width * 0.88;
  const SERIAL_Y = height * 0.25;
  const PARALLEL_Y = height * 0.54;

  const BOX_W = 18;
  const BOX_H = 20;
  const BOX_GAP = 4;
  const SERIAL_TOTAL_W = (BOX_W + BOX_GAP) * N;
  const SCALE = Math.min(1, CONTENT_W / SERIAL_TOTAL_W);

  // Serial boxes: animate in one by one
  const serialBoxes = Array.from({ length: N }, (_, i) => {
    const boxIn = spring({ frame: frame - 25 - i * 4, fps, config: { damping: 26, stiffness: 120 } });
    return clamp(boxIn, 0, 1);
  });

  // Parallel boxes: all animate together with a slight stagger per row
  const parallelBoxes = Array.from({ length: N }, (_, i) => {
    const row = Math.floor(i / COLS);
    const boxIn = spring({ frame: frame - 145 - row * 10, fps, config: { damping: 26, stiffness: 110 } });
    return clamp(boxIn, 0, 1);
  });

  const P_BOX_W = Math.floor(CONTENT_W / COLS) - 6;
  const P_BOX_H = 24;
  const P_BOX_GAP_X = 6;
  const P_BOX_GAP_Y = 6;

  // Timeline bar for parallel (terracotta)
  const parallelBarIn = spring({ frame: frame - 200, fps, config: { damping: 24, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        SERIAL VS PARALLEL · TIMING DIAGRAM
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        50 analysts: 25 minutes serial vs. 30 seconds parallel
      </div>

      {/* Serial row label */}
      <div style={{
        position: 'absolute', left: PAD_X, top: SERIAL_Y - height * 0.055,
        opacity: clamp(serialLabelIn, 0, 1),
      }}>
        <span style={{ fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700, color: CLAUDE.INK_SOFT, letterSpacing: 1, textTransform: 'uppercase' as const }}>
          Serial
        </span>
        <span style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, marginLeft: 12 }}>
          50 × 30s = 25 minutes
        </span>
      </div>

      {/* Serial boxes — horizontal chain */}
      <div style={{
        position: 'absolute', left: PAD_X, top: SERIAL_Y,
        display: 'flex', flexDirection: 'row', gap: BOX_GAP,
        transform: `scaleX(${SCALE})`, transformOrigin: 'left center',
      }}>
        {serialBoxes.map((op, i) => (
          <div key={i} style={{
            width: BOX_W, height: BOX_H,
            background: CLAUDE.BORDER,
            borderRadius: 3,
            opacity: op,
            transform: `scaleY(${op})`,
            transformOrigin: 'top center',
          }} />
        ))}
      </div>

      {/* Serial timeline bar */}
      <div style={{
        position: 'absolute', left: PAD_X, top: SERIAL_Y + BOX_H + 8,
        width: CONTENT_W,
        height: 4, background: CLAUDE.BORDER, borderRadius: 2,
        opacity: clamp(serialLabelIn, 0, 1),
      }} />

      {/* Parallel section */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PARALLEL_Y - height * 0.055,
        opacity: clamp(parallelLabelIn, 0, 1),
      }}>
        <span style={{ fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 1, textTransform: 'uppercase' as const }}>
          Parallel
        </span>
        <span style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.SPARK, marginLeft: 12 }}>
          30s total
        </span>
      </div>

      {/* Parallel boxes — grid */}
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const idx = row * COLS + col;
          if (idx >= N) return null;
          const op = parallelBoxes[idx];
          return (
            <div key={`${row}-${col}`} style={{
              position: 'absolute',
              left: PAD_X + col * (P_BOX_W + P_BOX_GAP_X),
              top: PARALLEL_Y + row * (P_BOX_H + P_BOX_GAP_Y),
              width: P_BOX_W, height: P_BOX_H,
              background: `${CLAUDE.SPARK}60`,
              borderRadius: 3,
              opacity: op,
              transform: `scale(${0.6 + 0.4 * op})`,
            }} />
          );
        })
      )}

      {/* Parallel timeline bar — terracotta, short */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: PARALLEL_Y + ROWS * (P_BOX_H + P_BOX_GAP_Y) + 8,
        width: CONTENT_W * 0.08 * clamp(parallelBarIn, 0, 1),
        height: 6, background: CLAUDE.SPARK, borderRadius: 3,
        opacity: clamp(parallelBarIn, 0, 1),
      }} />
      <div style={{
        position: 'absolute',
        left: PAD_X + CONTENT_W * 0.08 + 10,
        top: PARALLEL_Y + ROWS * (P_BOX_H + P_BOX_GAP_Y) + 4,
        fontFamily: SERIF, fontSize: height * 0.020, fontWeight: 700,
        color: CLAUDE.SPARK, fontStyle: 'italic',
        opacity: clamp(parallelBarIn, 0, 1),
      }}>
        30 seconds
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
