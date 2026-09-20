import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * MusiniqueHearingLimit — B04 of "Claude, In Your Corner"
 * Left: animated waveform. Right: text description. Center: hard gap.
 * The gap is the point — Claude sees the right side only. Duration-agnostic.
 */

export const musiniqueHearingLimitSchema = z.object({
  sparkLine: z.string().default('It cannot hear you.'),
});
export type MusiniqueHearingLimitProps = z.infer<typeof musiniqueHearingLimitSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const W = 1280, H = 720;
const MID = W / 2;
const PANEL_TOP = 150, PANEL_H = 380;

const Spark: React.FC = () => null;

// Generates SVG wave path points for a sine-like waveform
function wavePoints(cx: number, cy: number, w: number, h: number, phase: number, bars = 8): string {
  const pts: string[] = [];
  const step = w / (bars * 2);
  pts.push(`M ${cx} ${cy}`);
  for (let i = 0; i <= bars * 2; i++) {
    const x = cx + i * step;
    const amp = Math.sin(i * 0.7 + phase) * (h / 2) * (0.5 + 0.5 * Math.sin(i * 1.3 + phase * 0.4));
    pts.push(i === 0 ? `M ${x} ${cy + amp}` : `L ${x} ${cy + amp}`);
  }
  return pts.join(' ');
}

export const MusiniqueHearingLimit: React.FC<MusiniqueHearingLimitProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);
  const wPhase = frame * 0.12;   // waveform animates continuously

  const sparkO = remap(p, 0, 0.06, 0, 1);
  const leftOp = ease(remap(p, 0.06, 0.22, 0, 1));
  const wallOp = ease(remap(p, 0.18, 0.34, 0, 1));
  const rightOp = ease(remap(p, 0.26, 0.42, 0, 1));
  const labelOp = remap(p, 0.50, 0.62, 0, 1);

  const waveCX = 200, waveW = 340, waveCY = PANEL_TOP + PANEL_H / 2;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      {/* SparkLine */}
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* Left panel: waveform */}
        <g opacity={leftOp}>
          <rect x={60} y={PANEL_TOP} width={480} height={PANEL_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
          <text x={300} y={PANEL_TOP + 40} textAnchor="middle"
            fontFamily={SANS} fontSize={15} fontWeight={700} fill={CLAUDE.INK_SOFT} letterSpacing="0.1em">
            AUDIO SIGNAL
          </text>
          {/* Animated waveform */}
          <path d={wavePoints(80, waveCY, waveW, 120, wPhase)}
            stroke={CLAUDE.INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={wavePoints(80, waveCY, waveW, 80, wPhase + 1.5)}
            stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.5} />
          {/* Frequency label */}
          <text x={300} y={PANEL_TOP + PANEL_H - 30} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>
            your mix · your frequency · your tone
          </text>
        </g>

        {/* Wall / hard gap — terracotta */}
        <g opacity={wallOp}>
          <line x1={MID} y1={PANEL_TOP - 10} x2={MID} y2={PANEL_TOP + PANEL_H + 10}
            stroke={CLAUDE.SPARK} strokeWidth={5} strokeLinecap="round" />
          {/* NO symbol */}
          <circle cx={MID} cy={PANEL_TOP + PANEL_H / 2} r={32}
            fill="#F2F0E9" stroke={CLAUDE.SPARK} strokeWidth={3.5} />
          <line x1={MID - 21} y1={PANEL_TOP + PANEL_H / 2 - 21}
            x2={MID + 21} y2={PANEL_TOP + PANEL_H / 2 + 21}
            stroke={CLAUDE.SPARK} strokeWidth={3.5} strokeLinecap="round" />
          <text x={MID} y={PANEL_TOP + PANEL_H + 46} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fill={CLAUDE.SPARK} fontWeight={700} letterSpacing="0.06em">
            CANNOT CROSS
          </text>
        </g>

        {/* Right panel: text description */}
        <g opacity={rightOp}>
          <rect x={MID + 60} y={PANEL_TOP} width={480} height={PANEL_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
          <text x={MID + 300} y={PANEL_TOP + 40} textAnchor="middle"
            fontFamily={SANS} fontSize={15} fontWeight={700} fill={CLAUDE.INK_SOFT} letterSpacing="0.1em">
            WHAT CLAUDE SEES
          </text>
          {[
            '"the kick feels muddy around 200 Hz"',
            '"reverb tail about 2.5 seconds"',
            '"vocals sit behind the mix"',
            '"sibilance on the S sounds"',
          ].map((line, i) => (
            <text key={i} x={MID + 300} y={PANEL_TOP + 110 + i * 56}
              textAnchor="middle" fontFamily={SANS} fontSize={16} fill={CLAUDE.INK}
              opacity={remap(p, 0.30 + i * 0.04, 0.40 + i * 0.04, 0, 1)}>
              {line}
            </text>
          ))}
        </g>

        {/* Bottom verdict */}
        <text x={MID} y={H - 42} textAnchor="middle"
          fontFamily={SERIF} fontSize={22} fill={CLAUDE.INK_SOFT} opacity={labelOp}>
          'analyze my mix' = reason about your description of your mix
        </text>
      </svg>
    </AbsoluteFill>
  );
};
