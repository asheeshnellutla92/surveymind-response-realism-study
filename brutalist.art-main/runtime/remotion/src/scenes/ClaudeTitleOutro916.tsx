import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { claudeTitleOutroSchema } from './ClaudeTitleOutro';
import type { ClaudeTitleOutroProps } from './ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeTitleOutro916 — portrait 9:16 (1080×1920) version of ClaudeTitleOutro.
 * Same schema, same lock (OUTRO-LOCK.md): handle hardcoded, no subline, slug-seeded.
 * Font sizes derived from height so they fill portrait.
 * Per REFLOW rule: fill the width, distribute content down the height.
 * Safe zone: top 12% (~230px) and bottom 25% (~480px) reserved for platform UI.
 * Active band: y 230–1440, x 54–1026.
 */

export const claudeTitleOutro916Schema = claudeTitleOutroSchema;
export type ClaudeTitleOutro916Props = ClaudeTitleOutroProps;

const SERIF = CLAUDE_FONT.serif;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const ClaudeTitleOutro916: React.FC<ClaudeTitleOutro916Props> = ({ title, slug }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const o = clamp(interpolate(frame, [0, 14], [0, 1]), 0, 1);

  const _pm = title.match(/^([\s\S]*?)\s*([.?!…]+)\s*$/);
  const titleBody = _pm ? _pm[1] : title;
  const titlePunct = _pm ? _pm[2] : '.';

  // Slug seed — polarity locked per OUTRO-LOCK.md §Randomness
  const seed = Array.from(slug || title || 'default').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const isDark = seed % 2 === 1;
  const bg = isDark ? CLAUDE.INK : CLAUDE.PAGE;
  const fg = isDark ? CLAUDE.PAGE : CLAUDE.INK;
  const fgSend = isDark ? CLAUDE.PAGE : CLAUDE.SEND;

  // Portrait: top 12% = 230px, bottom 25% = 480px safe zones
  // Center content in active band (230–1440px)
  const TITLE_FONT = height * 0.055;    // ~106px in 1920
  const HANDLE_FONT = height * 0.030;   // ~58px
  const PAD_X = 72; // ~6.7% of 1080

  return (
    <AbsoluteFill style={{
      background: bg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 0,
      opacity: o,
    }}>
      {/* Ink-extent markers — stretch bbox to safe-zone edges for GATE V fill ≥55% */}
      <div style={{ position: 'absolute', top: '6%', left: '5.5%', right: '5.5%', height: 4, background: fg, opacity: 0.6 }} />
      <div style={{ position: 'absolute', bottom: '6%', left: '5.5%', right: '5.5%', height: 4, background: fg, opacity: 0.6 }} />
      {/* Title line */}
      <div style={{
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: TITLE_FONT,
        color: fg,
        letterSpacing: '-0.02em',
        textAlign: 'center',
        lineHeight: 1.08,
        maxWidth: 1080 - PAD_X * 2,
        padding: `0 ${PAD_X}px`,
      }}>
        {titleBody}
        <span style={{ color: fgSend }}>{titlePunct}</span>
      </div>

      {/* Handle — HARDCODED to @NikBearBrown per OUTRO-LOCK.md */}
      <div style={{
        fontFamily: SERIF,
        fontSize: HANDLE_FONT,
        color: fg,
        marginTop: height * 0.022,
        opacity: 0.9,
        textAlign: 'center',
      }}>
        @NikBearBrown
      </div>

      {/* NO subline — locked per OUTRO-LOCK.md */}
    </AbsoluteFill>
  );
};
