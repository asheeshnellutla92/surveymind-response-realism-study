import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { formACardSchema } from './FormACard';
import type { FormACardProps } from './FormACard';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * FormACard916 — portrait 9:16 (1080×1920) version of FormACard.
 * Same schema, same karaoke reveal logic.
 * Font sizes derived from height; safe zones: top 12% / bottom 25%.
 */

export const formACard916Schema = formACardSchema;
export type FormACard916Props = FormACardProps;

const SERIF = CLAUDE_FONT.serif;
const DARK_BG = '#2A2720';
const APPEAR_START = 8;
const LINE_STRIDE  = 20;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const FormACard916: React.FC<FormACard916Props> = ({ lines, dark }) => {
  const frame                  = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();

  const bg = dark ? DARK_BG   : CLAUDE.PAGE;
  const fg = dark ? CLAUDE.PAGE : CLAUDE.INK;

  // ── Auto-fit & code-penalty (same logic as FormACard 16:9) ───────────────
  // Portrait card has 8 % padding each side → usable width = 84 % of frame width.
  const CHAR_ADV   = 0.62;
  const FONT_FLOOR = Math.round(height * 0.032);
  const availW     = width * 0.84;

  const titleLen   = lines[0]?.length || 1;
  const bodyMaxLen = Math.max(...lines.slice(1).map(l => l.length), 1);
  const isCodeLike = titleLen > 55
    || bodyMaxLen > 55
    || lines.some(l => l.length > 20 && /[`{}()\[\];=]/.test(l));
  const penalty    = isCodeLike ? 0.80 : 1.0;

  const titleSz = Math.max(
    FONT_FLOOR,
    Math.min(Math.round(height * 0.052) * penalty, Math.floor(availW / (titleLen   * CHAR_ADV))),
  );
  const bodySz  = Math.max(
    FONT_FLOOR,
    Math.min(Math.round(height * 0.040) * penalty, Math.floor(availW / (bodyMaxLen * CHAR_ADV))),
  );

  return (
    <AbsoluteFill style={{ background: bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 8%',
        gap: Math.round(height * 0.020),
      }}>
        {lines.map((line, i) => {
          const appearAt = APPEAR_START + i * LINE_STRIDE;
          const sp = spring({
            frame: frame - appearAt,
            fps,
            config: { damping: 30, stiffness: 170, mass: 0.7 },
          });
          const visible = frame >= appearAt;
          return (
            <div
              key={i}
              style={{
                fontFamily:    SERIF,
                fontSize:      i === 0 ? titleSz : bodySz,
                fontWeight:    i === 0 ? 700 : 400,
                fontStyle:     'normal',
                color:         fg,
                letterSpacing: '-0.02em',
                lineHeight:    1.12,
                opacity:       visible ? clamp(sp, 0, 1) : 0,
                transform:     `translateY(${(1 - (visible ? clamp(sp, 0, 1) : 0)) * 12}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
