import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ContactSheet — fashionista modifier's BLUF beat: all five looks as a contact sheet (16:9).
 *
 * Layout: single row of 5 portraits, each at 2:3 aspect, centered vertically in the
 * safe area. Eyebrow + title above; lens badge and GENERATED disclaimer below.
 *
 * ASPECT LAW: images are displayed with objectFit:"contain" so the full 2:3 frame
 * is always visible. The surrounding cream ground is the album page, not dead space.
 *
 * Schema is exported so ContactSheet916 can share it.
 */

export const contactSheetSchema = z.object({
  dateFolder: z.string().default('2026-08-02'),
  lens:       z.string().default('tailoring'),
  looks: z.array(z.object({
    name:      z.string(),
    imagePath: z.string(),  // path under runtime/remotion/public/
  })).min(1).max(5).default([
    { name: 'Look 1', imagePath: 'fashionista/2026-08-02/B03.png' },
    { name: 'Look 2', imagePath: 'fashionista/2026-08-02/B04.png' },
    { name: 'Look 3', imagePath: 'fashionista/2026-08-02/B05.png' },
    { name: 'Look 4', imagePath: 'fashionista/2026-08-02/B06.png' },
    { name: 'Look 5', imagePath: 'fashionista/2026-08-02/B07.png' },
  ]),
  sparkLine: z.string().default('Five looks. One lens.'),
});
export type ContactSheetProps = z.infer<typeof contactSheetSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const ContactSheet: React.FC<ContactSheetProps> = ({
  dateFolder, lens, looks, sparkLine,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();  // 1920×1080

  // SAFE inset — 5% each side
  const PAD_X = width * 0.05;   // 96px
  const PAD_Y = height * 0.05;  // 54px

  // Title area
  const TITLE_H = height * 0.14;  // 151px — eyebrow + title

  // Image grid — full remaining height minus title and footer
  const FOOTER_H = height * 0.12; // 130px
  const GRID_H   = height - PAD_Y - TITLE_H - FOOTER_H - PAD_Y; // ~690px
  const GRID_W   = width - PAD_X * 2;  // 1728px

  // Each image: 5 across, 4 gaps of 12px
  const GAP = 12;
  const IMG_W = Math.floor((GRID_W - GAP * (looks.length - 1)) / looks.length);
  // 2:3 ratio: height/width = 3/2 = 1.5
  const IMG_H = Math.min(GRID_H, Math.floor(IMG_W * 1.5));
  const ACTUAL_IMG_W = Math.floor(IMG_H / 1.5);

  const titleIn  = spring({ frame,             fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const gridIn   = spring({ frame: frame - 8,  fps, config: { damping: 24, stiffness: 90,  mass: 0.9 } });

  const GRID_TOP = PAD_Y + TITLE_H;
  // Center grid vertically in remaining area
  const GRID_CENTER_Y = GRID_TOP + (height - GRID_TOP - FOOTER_H - PAD_Y) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* ── TITLE AREA ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        width: width - PAD_X * 2,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 8}px)`,
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: CLAUDE_FONT.ui,
          fontSize: height * 0.013,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT,
          marginBottom: 10,
        }}>
          fashionista · {dateFolder} · lens: {lens}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: CLAUDE_FONT.serif,
          fontSize: height * 0.044,
          fontWeight: 600,
          color: CLAUDE.INK,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
        }}>
          Five looks. One lens.
        </div>
      </div>

      {/* ── IMAGE GRID — single row, 2:3 portraits ─────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: GRID_CENTER_Y - IMG_H / 2,
        display: 'flex',
        flexDirection: 'row',
        gap: GAP,
        opacity: clamp(gridIn, 0, 1),
        transform: `translateY(${(1 - clamp(gridIn, 0, 1)) * 14}px)`,
      }}>
        {looks.map((look, i) => {
          const imgIn = spring({
            frame: frame - 10 - i * 6,
            fps,
            config: { damping: 24, stiffness: 90, mass: 0.9 },
          });
          return (
            <div key={i} style={{
              width: ACTUAL_IMG_W,
              height: IMG_H,
              position: 'relative',
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 4,
              overflow: 'hidden',
              opacity: clamp(imgIn, 0, 1),
              transform: `scale(${0.94 + clamp(imgIn, 0, 1) * 0.06})`,
            }}>
              <Img
                src={staticFile(look.imagePath)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center top',
                  backgroundColor: CLAUDE.FOOTER,
                  display: 'block',
                }}
              />
              {/* Look name caption */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '4px 7px',
                background: 'rgba(250,249,245,0.92)',
                fontFamily: CLAUDE_FONT.ui,
                fontSize: Math.min(13, ACTUAL_IMG_W * 0.038),
                fontWeight: 600,
                color: CLAUDE.INK,
                letterSpacing: 0.5,
                textAlign: 'center' as const,
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {look.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: PAD_Y,
        right: PAD_X,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: clamp(gridIn, 0, 1),
      }}>
        {/* Spark line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: CLAUDE_FONT.serif,
            fontSize: height * 0.019,
            fontStyle: 'italic',
            color: CLAUDE.INK,
          }}>
            {sparkLine}
          </span>
        </div>
        {/* GENERATED disclaimer */}
        <div style={{
          fontFamily: CLAUDE_FONT.ui,
          fontSize: height * 0.012,
          color: CLAUDE.GHOST,
          fontStyle: 'italic',
          textAlign: 'right' as const,
        }}>
          All looks generated · {dateFolder} · not Bear's body
        </div>
      </div>

    </AbsoluteFill>
  );
};
