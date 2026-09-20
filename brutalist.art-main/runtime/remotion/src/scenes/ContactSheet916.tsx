import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { contactSheetSchema } from './ContactSheet';
import type { ContactSheetProps } from './ContactSheet';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ContactSheet916 — portrait 9:16 (1080×1920) version of ContactSheet.
 * Same schema. Layout: title at top, 3+2 grid, footer.
 *
 * Safe zone: top 12% (~230px) and bottom 25% (~480px).
 * Active content band: y 230–1440 (1210px usable).
 *
 * Grid: Row 1 = 3 images centered; Row 2 = 2 images centered.
 * Each image at 2:3 ratio. objectFit:contain — full garment always visible.
 */

export const contactSheet916Schema = contactSheetSchema;
export type ContactSheet916Props = ContactSheetProps;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const ContactSheet916: React.FC<ContactSheet916Props> = ({
  dateFolder, lens, looks, sparkLine,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();  // 1080×1920

  // Safe zones
  const SAFE_TOP    = height * 0.14;   // ~269px — a little more breathing room
  const SAFE_BOTTOM = height * 0.75;   // ~1440px floor
  const PAD_X       = width * 0.05;   // 54px

  // Compute layout inside active band
  const ACTIVE_H   = SAFE_BOTTOM - SAFE_TOP;  // ~1171px
  const TITLE_H    = ACTIVE_H * 0.14;         // ~164px
  const FOOTER_H   = ACTIVE_H * 0.10;         // ~117px
  const GRID_H     = ACTIVE_H - TITLE_H - FOOTER_H; // ~890px
  const GRID_W     = width - PAD_X * 2;       // 972px
  const GAP        = 10;

  // Row 1: 3 images side-by-side
  const R1_IMG_W = Math.floor((GRID_W - GAP * 2) / 3);  // ~317px
  const R1_IMG_H = Math.floor(R1_IMG_W * 1.5);           // ~476px

  // Row 2: 2 images, centered
  const R2_IMG_W = Math.floor((GRID_W - GAP) / 2);       // ~481px
  const R2_IMG_H = Math.floor(R2_IMG_W * 1.5);           // ~722px — will be capped

  // Cap row 2 height so both rows fit in GRID_H
  const ROW_GAP = 10;
  const R1_H_USED = R1_IMG_H + ROW_GAP;
  const R2_MAX_H  = GRID_H - R1_H_USED;
  const R2_ACT_H  = Math.min(R2_IMG_H, R2_MAX_H);
  const R2_ACT_W  = Math.floor(R2_ACT_H / 1.5);

  const titleIn = spring({ frame,            fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const gridIn  = spring({ frame: frame - 8, fps, config: { damping: 24, stiffness: 90,  mass: 0.9 } });

  const TITLE_TOP = SAFE_TOP;
  const GRID_TOP  = SAFE_TOP + TITLE_H;

  const row1 = looks.slice(0, 3);
  const row2 = looks.slice(3, 5);

  const renderThumb = (look: ContactSheetProps['looks'][number], idx: number, w: number, h: number) => {
    const imgIn = spring({
      frame: frame - 8 - idx * 5,
      fps,
      config: { damping: 24, stiffness: 90, mass: 0.9 },
    });
    return (
      <div key={idx} style={{
        width: w,
        height: h,
        position: 'relative',
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 3,
        overflow: 'hidden',
        opacity: clamp(imgIn, 0, 1),
        transform: `scale(${0.94 + clamp(imgIn, 0, 1) * 0.06})`,
        flexShrink: 0,
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
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '3px 5px',
          background: 'rgba(250,249,245,0.90)',
          fontFamily: CLAUDE_FONT.ui,
          fontSize: Math.min(11, w * 0.033),
          fontWeight: 600,
          color: CLAUDE.INK,
          textAlign: 'center' as const,
          whiteSpace: 'nowrap' as const,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {look.name}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* ── TITLE ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: TITLE_TOP,
        width: GRID_W,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 8}px)`,
      }}>
        <div style={{
          fontFamily: CLAUDE_FONT.ui,
          fontSize: height * 0.013,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT,
          marginBottom: 8,
        }}>
          fashionista · {dateFolder}
        </div>
        <div style={{
          fontFamily: CLAUDE_FONT.serif,
          fontSize: height * 0.030,
          fontWeight: 600,
          color: CLAUDE.INK,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
        }}>
          Five looks — lens: {lens}
        </div>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: GRID_TOP,
        width: GRID_W,
        opacity: clamp(gridIn, 0, 1),
        transform: `translateY(${(1 - clamp(gridIn, 0, 1)) * 12}px)`,
      }}>
        {/* Row 1 — 3 images */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: GAP,
          justifyContent: 'center',
          marginBottom: ROW_GAP,
        }}>
          {row1.map((look, i) => renderThumb(look, i, R1_IMG_W, R1_IMG_H))}
        </div>

        {/* Row 2 — 2 images (centered) */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: GAP,
          justifyContent: 'center',
        }}>
          {row2.map((look, i) => renderThumb(look, i + 3, R2_ACT_W, R2_ACT_H))}
        </div>
      </div>

      {/* ── FOOTER — inside safe band ───────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height - SAFE_BOTTOM + 12,
        right: PAD_X,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: clamp(gridIn, 0, 1),
      }}>
        <span style={{
          fontFamily: CLAUDE_FONT.serif,
          fontSize: height * 0.018,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
