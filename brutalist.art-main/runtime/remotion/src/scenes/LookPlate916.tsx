import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { lookPlateSchema } from './LookPlate';
import type { LookPlateProps } from './LookPlate';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';
import { EvidenceChip } from './EvidenceChip';

/**
 * LookPlate916 — portrait 9:16 (1080×1920) version of LookPlate.
 * Same schema. Layout: full-bleed 2:3 look + lower-third evidence panel.
 *
 * ASPECT LAW (9:16 side):
 *   Crop WIDTH only from the 2:3 master — full height preserved.
 *   At 1080×1920 display, objectFit:"cover" fills the frame by scaling the
 *   2:3 image to 1920px height (→ 1280px wide), then center-cropping to 1080px.
 *   The look occupies the full frame; no garment is lost — only 100px of
 *   side background each side.
 *
 * Safe zone: top 12% (~230px) and bottom 25% (~480px) reserved for platform UI.
 * All evidence text lives inside y 230–1440 (active band).
 *
 * NOTE on pantry: write the 2:3 master to pantry/<BID>-916.png BEFORE running
 * shorts.py. That file wins over the auto center-cut path so the ONDA CHECK
 * re-renders this portrait composition instead of cropping the 16:9 plate.
 */

export const lookPlate916Schema = lookPlateSchema;
export type LookPlate916Props = LookPlateProps;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const LookPlate916: React.FC<LookPlate916Props> = ({
  mediaType, imagePath, videoPath, videoStartS, videoEndS,
  lookName, lookNumber, dateFolder, generatedModel,
  lens, rendered, reference, call, notDeterminable, sparkLine, isSoulId,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();  // 1080×1920

  const startFrame = Math.round(videoStartS * fps);
  const endAtFrame = Math.round(videoEndS * fps);

  const photoIn  = spring({ frame,             fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const panelIn  = spring({ frame: frame - 10, fps, config: { damping: 24, stiffness: 80,  mass: 0.9 } });

  // Safe zone constants — platform UI reserves top 12% and bottom 25%
  const SAFE_TOP    = height * 0.12;   // ~230px
  const SAFE_BOTTOM = height * 0.75;   // ~1440px
  const PAD_X       = width * 0.05;   // ~54px

  // Lower-third panel starts at ~68% of height, well inside the safe band
  const PANEL_TOP   = height * 0.62;  // ~1190px — above the 1440px floor
  const FONT_LABEL  = height * 0.013; // ~25px
  const FONT_NAME   = height * 0.024; // ~46px
  const FONT_BODY   = height * 0.015; // ~29px

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>

      {/* ── FULL-BLEED LOOK — fill frame, crop sides only ──────────────────── */}
      {/* objectFit:cover scales to fill 1080×1920; a 2:3 still at full height
          = 1920px → native width = 1280 > 1080, center-crops ~100px each side.
          Portrait video (684×1028) at same ratio: cover fills 1080 wide, crops
          minimally. Full garment height preserved in both cases. */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: clamp(photoIn, 0, 1),
      }}>
        {mediaType === 'video' && videoPath ? (
          <OffthreadVideo
            src={staticFile(videoPath)}
            startFrom={startFrame}
            endAt={endAtFrame}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }}
          />
        ) : (
          <Img
            src={staticFile(imagePath)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }}
          />
        )}
      </div>

      {/* Gradient veil over the lower third so text is always readable */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: PANEL_TOP - height * 0.08,
        bottom: 0,
        background: 'linear-gradient(to bottom, transparent, rgba(20,18,12,0.88) 22%, rgba(20,18,12,0.96) 100%)',
        opacity: clamp(panelIn, 0, 1),
      }} />

      {/* GENERATED corner stamp — honesty law, top-left, inside SAFE_TOP */}
      <div style={{
        position: 'absolute',
        top: SAFE_TOP + 10,
        left: PAD_X,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.010,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.80)',
        background: 'rgba(0,0,0,0.40)',
        padding: '3px 8px',
        borderRadius: 4,
        opacity: clamp(photoIn, 0, 1),
      }}>
        {isSoulId ? `Soul ID · generated · ${dateFolder}` : `generated · ${dateFolder}`}
      </div>

      {/* Look badge — top-right, inside SAFE_TOP */}
      <div style={{
        position: 'absolute',
        top: SAFE_TOP + 10,
        right: PAD_X,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.011,
        fontWeight: 700,
        letterSpacing: 1,
        color: '#FFFFFF',
        background: CLAUDE.SPARK,
        padding: '4px 10px',
        borderRadius: 4,
        opacity: clamp(photoIn, 0, 1),
      }}>
        view {lookNumber}
      </div>

      {/* Motion badge — only on video beats; sits below the generated stamp (~34px gap) */}
      {mediaType === 'video' && (
        <div style={{
          position: 'absolute',
          top: SAFE_TOP + 44,
          left: PAD_X,
          fontFamily: CLAUDE_FONT.ui,
          fontSize: height * 0.010,
          fontWeight: 700,
          letterSpacing: 1,
          color: '#FFFFFF',
          background: 'rgba(0,0,0,0.50)',
          border: '1px solid rgba(255,255,255,0.30)',
          padding: '3px 8px',
          borderRadius: 4,
          opacity: clamp(photoIn, 0, 1),
        }}>
          ▶ motion
        </div>
      )}

      {/* ── LOWER-THIRD EVIDENCE PANEL ── inside y 230-1440 safe band ─────── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: PANEL_TOP,
        bottom: height - SAFE_BOTTOM,
        opacity: clamp(panelIn, 0, 1),
        transform: `translateY(${(1 - clamp(panelIn, 0, 1)) * 12}px)`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {/* Lens eyebrow */}
        <div style={{
          fontFamily: CLAUDE_FONT.ui,
          fontSize: FONT_LABEL * 0.8,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.60)',
          marginBottom: 2,
        }}>
          lens · {lens}
        </div>

        {/* Look name */}
        <div style={{
          fontFamily: CLAUDE_FONT.serif,
          fontSize: FONT_NAME,
          fontWeight: 600,
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          marginBottom: 6,
        }}>
          {lookName}
        </div>

        {/* Rendered chips — one line each in white */}
        {rendered.slice(0, 2).map((text, i) => (
          <div key={`r${i}`} style={{
            display: 'flex', alignItems: 'flex-start', gap: 6,
          }}>
            <span style={{
              fontFamily: CLAUDE_FONT.ui, fontSize: FONT_BODY * 0.72,
              fontWeight: 700, letterSpacing: 1.5,
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.70)', whiteSpace: 'nowrap' as const,
              minWidth: 90, flexShrink: 0, paddingTop: 2, lineHeight: 1.5,
            }}>RENDERED</span>
            <span style={{
              fontFamily: CLAUDE_FONT.serif, fontSize: FONT_BODY,
              color: '#FFFFFF', lineHeight: 1.4,
            }}>{text}</span>
          </div>
        ))}

        {/* Reference chips */}
        {reference.slice(0, 1).map((text, i) => (
          <div key={`ref${i}`} style={{
            display: 'flex', alignItems: 'flex-start', gap: 6,
          }}>
            <span style={{
              fontFamily: CLAUDE_FONT.ui, fontSize: FONT_BODY * 0.72,
              fontWeight: 700, letterSpacing: 1.5,
              textTransform: 'uppercase' as const,
              color: '#6EC6F8', whiteSpace: 'nowrap' as const,
              minWidth: 90, flexShrink: 0, paddingTop: 2, lineHeight: 1.5,
            }}>REFERENCE</span>
            <span style={{
              fontFamily: CLAUDE_FONT.serif, fontSize: FONT_BODY,
              color: '#FFFFFF', lineHeight: 1.4,
            }}>{text}</span>
          </div>
        ))}

        {/* Call chip */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span style={{
            fontFamily: CLAUDE_FONT.ui, fontSize: FONT_BODY * 0.72,
            fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase' as const,
            color: '#F5A97A', whiteSpace: 'nowrap' as const,
            minWidth: 90, flexShrink: 0, paddingTop: 2, lineHeight: 1.5,
          }}>CALL</span>
          <span style={{
            fontFamily: CLAUDE_FONT.serif, fontSize: FONT_BODY, fontStyle: 'italic',
            color: '#FFFFFF', lineHeight: 1.4, flex: 1,
          }}>{call}</span>
        </div>

        {/* Spark line */}
        {sparkLine ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{
              fontFamily: CLAUDE_FONT.serif, fontSize: FONT_BODY, fontStyle: 'italic',
              color: '#FFFFFF',
            }}>{sparkLine}</span>
          </div>
        ) : (
          <div style={{ width: 36, height: 2, backgroundColor: CLAUDE.SPARK, marginTop: 4 }} />
        )}
      </div>

    </AbsoluteFill>
  );
};
