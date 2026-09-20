import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE07BeatSheet — beat sheet visualization.
 * Shows beat_sheet.json with 5 beat rows B00-B04.
 * Each row: beat_id chip | narration snippet | duration bar | mp3 icon
 * Duration bars are different widths; B02 is "active" with terracotta cursor.
 * Bottom annotation: "audio first → timing conforms"
 * Beat B01 of hai-brutalist-beat-sheet.
 */

export const haiBrutalistE07BeatSheetSchema = z.object({
  sparkLine: z.string().default('Narration is the master clock.'),
});
export type HaiBrutalistE07BeatSheetProps = z.infer<typeof haiBrutalistE07BeatSheetSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const BEATS = [
  { id: 'B00', snippet: 'cold open — hook line…', durationPct: 0.42, active: false },
  { id: 'B01', snippet: 'centerpiece visual…', durationPct: 0.55, active: false },
  { id: 'B02', snippet: 'teaching beat…', durationPct: 0.68, active: true },
  { id: 'B03', snippet: 'second angle…', durationPct: 0.50, active: false },
  { id: 'B04', snippet: 'verdict restate thesis…', durationPct: 0.38, active: false },
];

export const HaiBrutalistE07BeatSheet: React.FC<HaiBrutalistE07BeatSheetProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.08;
  const CARD_W = width - PAD_X * 2;
  const CARD_X = PAD_X;
  const CARD_Y = height * 0.25;
  const CARD_H = height * 0.53;
  const ROW_H = CARD_H / (BEATS.length + 1);

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const cardIn = spring({ frame: frame - 10, fps, config: { damping: 25, stiffness: 80 } });
  const annoIn = spring({ frame: frame - 100, fps, config: { damping: 25, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100 } });

  const blinkOn = Math.floor(frame / 15) % 2 === 0;
  const BAR_MAX_W = CARD_W * 0.28;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        HUMANITARIANS AI · BRUTALIST SERIES
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        beat_sheet.json
      </div>

      {/* Card container */}
      <div style={{
        position: 'absolute',
        left: CARD_X, top: CARD_Y,
        width: CARD_W, height: CARD_H,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 16,
        overflow: 'hidden',
        opacity: clamp(cardIn, 0, 1),
        transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 14}px)`,
        boxShadow: '0 6px 28px rgba(61,57,41,0.08)',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: `10px 24px`,
          borderBottom: `1.5px solid ${CLAUDE.BORDER}`,
          background: CLAUDE.FOOTER,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, width: 60 }}>BEAT</span>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, flex: 1 }}>NARRATION</span>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, width: BAR_MAX_W + 10 }}>DURATION</span>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, width: 40, textAlign: 'right' }}>MP3</span>
        </div>

        {/* Beat rows */}
        {BEATS.map((beat, i) => {
          const delay = 22 + i * 16;
          const rowIn = spring({ frame: frame - delay, fps, config: { damping: 25, stiffness: 90 } });

          return (
            <div key={beat.id} style={{
              display: 'flex', alignItems: 'center',
              padding: `0 24px`,
              height: ROW_H,
              borderBottom: i < BEATS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              background: beat.active ? `${CLAUDE.SPARK}08` : 'transparent',
              opacity: clamp(rowIn, 0, 1),
              transform: `translateX(${(1 - clamp(rowIn, 0, 1)) * -14}px)`,
            }}>
              {/* Beat ID chip */}
              <div style={{
                width: 50, marginRight: 10,
                background: beat.active ? CLAUDE.SPARK : CLAUDE.FOOTER,
                border: `1.5px solid ${beat.active ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderRadius: 8,
                padding: '4px 8px',
                fontFamily: MONO, fontSize: 13, fontWeight: 700,
                color: beat.active ? '#FFFFFF' : CLAUDE.INK_SOFT,
                textAlign: 'center',
              }}>
                {beat.id}
              </div>

              {/* Narration snippet */}
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {beat.snippet}
              </span>

              {/* Duration bar */}
              <div style={{ width: BAR_MAX_W, marginRight: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: beat.durationPct * BAR_MAX_W,
                  height: 8,
                  background: beat.active ? CLAUDE.SPARK : CLAUDE.BORDER,
                  borderRadius: 4,
                }} />
                {/* Blinking cursor for active beat */}
                {beat.active && (
                  <div style={{
                    width: 2, height: 14,
                    background: CLAUDE.SPARK,
                    borderRadius: 2,
                    opacity: blinkOn ? 1 : 0,
                  }} />
                )}
              </div>

              {/* MP3 icon */}
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <rect x={2} y={4} width={20} height={16} rx={3} stroke={beat.active ? CLAUDE.SPARK : CLAUDE.GHOST} strokeWidth={1.8} />
                <path d="M8 10 C8 10 10 8 12 10 S16 12 16 10" stroke={beat.active ? CLAUDE.SPARK : CLAUDE.GHOST} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                <path d="M8 14 C8 14 10 12 12 14 S16 16 16 14" stroke={beat.active ? CLAUDE.SPARK : CLAUDE.GHOST} strokeWidth={1.6} fill="none" strokeLinecap="round" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Bottom annotation */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: height * 0.13,
        display: 'flex', justifyContent: 'center',
        opacity: clamp(annoIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.018,
          color: CLAUDE.SPARK, fontWeight: 600, letterSpacing: 0.5,
        }}>
          audio first → timing conforms
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.07,
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
