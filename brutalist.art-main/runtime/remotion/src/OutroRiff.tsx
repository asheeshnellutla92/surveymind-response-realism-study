/**
 * OutroRiff.tsx — reel-local Remotion components for claude-liam-riff-the-outros.
 *
 * Two scenes only. Everything else in that reel is a REAL outro render — the
 * riff format's whole point is that the thing being judged is on screen, not
 * described. Palette: Claude fidelity (cream, warm ink, ONE terracotta).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';

const BG = '#F2F0E9', INK = '#3D3929', ACC = '#D97757';
const SOFT = '#73705F', GHOST = '#B0AD9A', CARD = '#FFFFFF', BORDER = '#DDD9CC';
const SERIF = '"EB Garamond", Georgia, serif';
const SANS = '-apple-system, "SF Pro Text", "Segoe UI", sans-serif';
const SAFE = 96, CW = 1920;
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const SPR = { damping: 30, stiffness: 120, mass: 0.9 };

// ===========================================================================
// RiffSplit — the two outro SYSTEMS, side by side. One takes no assets at all.
// ===========================================================================
export const riffSplitSchema = z.object({
  title: z.string().default('Two outro systems'),
  left: z.object({
    label: z.string(), sub: z.string(), assets: z.string(), channels: z.string(),
  }),
  right: z.object({
    label: z.string(), sub: z.string(), assets: z.string(), channels: z.string(),
  }),
  note: z.string().default(''),
});
export type RiffSplitProps = z.infer<typeof riffSplitSchema>;

export const RiffSplit: React.FC<RiffSplitProps> = ({ title, left, right, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const tIn = cl(spring({ frame, fps, config: SPR }));
  const nIn = cl(interpolate(t, [0.74, 0.88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const colW = (CW - SAFE * 2 - 56) / 2;

  const Col: React.FC<{ d: typeof left; i: number; accent: boolean }> = ({ d, i, accent }) => {
    const inn = cl(spring({ frame: frame - 12 - i * 14, fps, config: SPR }));
    return (
      <div style={{
        position: 'absolute', left: SAFE + i * (colW + 56), top: 300,
        width: colW, height: 560, background: CARD,
        border: `1px solid ${BORDER}`, borderTop: `6px solid ${accent ? ACC : GHOST}`,
        borderRadius: 4, padding: '44px 38px', boxSizing: 'border-box',
        opacity: inn, transform: `translateY(${(1 - inn) * 30}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 60, color: INK, lineHeight: 1.1 }}>{d.label}</div>
        <div style={{ fontFamily: SERIF, fontSize: 34, color: SOFT, marginTop: 22, lineHeight: 1.35 }}>{d.sub}</div>
        <div style={{ height: 1, background: BORDER, margin: '34px 0 26px' }} />
        <div style={{ fontFamily: SANS, fontSize: 32, letterSpacing: '0.12em', color: GHOST, textTransform: 'uppercase' }}>ASSETS</div>
        <div style={{ fontFamily: SERIF, fontSize: 54, color: accent ? ACC : INK, marginTop: 14 }}>{d.assets}</div>
        <div style={{ fontFamily: SANS, fontSize: 32, letterSpacing: '0.12em', color: GHOST, textTransform: 'uppercase', marginTop: 30 }}>CHANNELS</div>
        <div style={{ fontFamily: SERIF, fontSize: 38, color: INK, marginTop: 12, lineHeight: 1.3 }}>{d.channels}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{
        position: 'absolute', left: SAFE, top: 150, width: CW - SAFE * 2,
        fontFamily: SERIF, fontSize: 80, color: INK, opacity: tIn,
      }}>{title}</div>
      <Col d={left} i={0} accent />
      <Col d={right} i={1} accent={false} />
      {note ? (
        <div style={{
          position: 'absolute', left: SAFE, bottom: SAFE - 30, width: CW - SAFE * 2,
          fontFamily: SERIF, fontSize: 38, color: SOFT, fontStyle: 'italic', opacity: nIn,
        }}>{note}</div>
      ) : null}
    </AbsoluteFill>
  );
};

// ===========================================================================
// RiffLottery — the technique pool. Chips land, then ONE locks terracotta.
// ===========================================================================
export const riffLotterySchema = z.object({
  title: z.string().default('Eight techniques. One draw.'),
  chips: z.array(z.string()).min(2).max(12),
  lockedIndex: z.number().int().nonnegative().default(0),
  note: z.string().default(''),
});
export type RiffLotteryProps = z.infer<typeof riffLotterySchema>;

export const RiffLottery: React.FC<RiffLotteryProps> = ({ title, chips, lockedIndex, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const tIn = cl(spring({ frame, fps, config: SPR }));
  const lock = cl(interpolate(t, [0.55, 0.70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const nIn = cl(interpolate(t, [0.78, 0.9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const perRow = 4;
  const gap = 34;
  const INSET = 24;   // rounding headroom — 4 chips landed exactly ON the safe edge
  const chipW = (CW - SAFE * 2 - INSET * 2 - gap * (perRow - 1)) / perRow;
  const chipH = 150;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{
        position: 'absolute', left: SAFE, top: 150, width: CW - SAFE * 2,
        fontFamily: SERIF, fontSize: 80, color: INK, opacity: tIn,
      }}>{title}</div>

      {chips.map((c, i) => {
        const inn = cl(spring({ frame: frame - 10 - i * 6, fps, config: SPR }));
        const isLocked = i === lockedIndex;
        const row = Math.floor(i / perRow), col = i % perRow;
        // the un-drawn chips recede once the draw lands — never below 40% opacity
        const dim = isLocked ? 1 : 1 - lock * 0.55;
        return (
          <div key={c} style={{
            position: 'absolute', left: SAFE + INSET + col * (chipW + gap), top: 330 + row * (chipH + gap),
            width: chipW, height: chipH, borderRadius: 4,
            background: isLocked ? ACC : CARD,
            border: `1px solid ${isLocked ? ACC : BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: SERIF, fontSize: 36,
            color: isLocked ? CARD : INK,
            opacity: inn * dim,
            transform: `translateY(${(1 - inn) * 24}px) scale(${1 + (isLocked ? lock * 0.06 : 0)})`,
          }}>{c}</div>
        );
      })}

      {note ? (
        <div style={{
          position: 'absolute', left: SAFE, bottom: SAFE - 34, width: CW - SAFE * 2,
          fontFamily: SERIF, fontSize: 38, color: SOFT, fontStyle: 'italic', opacity: nIn,
        }}>{note}</div>
      ) : null}
    </AbsoluteFill>
  );
};
