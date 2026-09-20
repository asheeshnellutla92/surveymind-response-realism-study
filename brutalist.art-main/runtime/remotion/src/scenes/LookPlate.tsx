import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo,
  staticFile, useCurrentFrame, useVideoConfig, spring,
} from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';
import { EvidenceChip } from './EvidenceChip';

/**
 * LookPlate — fashionista modifier's per-look evidence plate (16:9, 1920×1080).
 *
 * ASPECT LAW (this component implements the plate side):
 *   The 2:3 master (still: 2822×4234; video: 684×1028) plates at full 1080px
 *   height. Math: 684*(1080/1028) ≈ 719px wide. Remaining ~1201px = cream
 *   evidence column. NOTHING is discarded. objectFit:"contain" enforces this.
 *   The -16x9 still crop and the 16:9 video are NEVER used here.
 *
 * GATE PLATE: both still and video are displayed with objectFit:"contain" at
 *   explicit dimensions (PLATE_W × PLATE_H) so the full source frame is always
 *   visible — the plated region equals the full source frame.
 *
 * TREATMENT LAW: compile.py:195 vf_treatment desaturates sources with
 *   source:"ai". Colour IS the fashion critique. Beat sheets MUST carry
 *   shot.treatment = "none" on every look beat, or compile.py will desaturate
 *   the look. This component cannot control post-processing; the gate enforces it.
 *
 * mediaType:"video" uses OffthreadVideo (rendering-safe). Frames are taken from
 *   videoStartS–videoEndS to stay in the EARLY range where the garment is visible
 *   (the portrait video tightens to head-only by ~18s).
 *
 * Schema exported so LookPlate916 shares it (same contract, different layout).
 */

export const lookPlateSchema = z.object({
  /** "still" | "video". Drives Img vs OffthreadVideo. */
  mediaType:       z.enum(['still', 'video']).default('still'),
  /** Path under runtime/remotion/public/, e.g. "fashionista/2026-08-02/B04.png" */
  imagePath:       z.string().default(''),
  /** Path under runtime/remotion/public/, e.g. "fashionista/2026-08-02/B03-video.mp4" */
  videoPath:       z.string().default(''),
  /** Trim start for video — stay in the garment-visible range (default 0). */
  videoStartS:     z.number().default(0),
  /** Trim end for video — default 12s keeps the garment, avoids the 18s head-only closeup. */
  videoEndS:       z.number().default(12),
  lookName:        z.string().default('Look 1'),
  lookNumber:      z.number().min(1).max(6).default(1),
  dateFolder:      z.string().default('2026-08-02'),
  generatedModel:  z.string().default('Higgsfield'),
  /** Per-beat section theme label: "tradition", "structure", "craft", "occasion". */
  lens:            z.string().default('tradition'),
  /** false (default) = generated figure, no Soul ID. true = Bear's clone; controls corner stamp. */
  isSoulId:        z.boolean().default(false),
  /** Cap media display height in px (0 = full 1080). Use when native resolution < 2x fill. */
  plateDisplayH:   z.number().default(0),
  rendered:        z.array(z.string()).default(['Lapel roll consistent with soft-shoulder construction']),
  reference:       z.array(z.string()).default(['English drape silhouette, Savile Row tradition, 1930s–1950s']),
  call:            z.string().default('The proportions earn the shoulder — this works on the rendering.'),
  notDeterminable: z.array(z.string()).default(['fibre content', 'construction quality', 'drape on Bear\'s body']),
  sparkLine:       z.string().default(''),
});
export type LookPlateProps = z.infer<typeof lookPlateSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// PLATE dimensions — derived from ASPECT LAW.
// Portrait video at 1080px height: 684 * (1080/1028) ≈ 718.7 → 719px.
// Still (2:3) at 1080px height: 1080 * (2/3) = 720px.
// Use 720px — covers both, objectFit:contain handles the ~1px difference.
const PLATE_W = 720;
const PLATE_H = 1080;


export const LookPlate: React.FC<LookPlateProps> = ({
  mediaType, imagePath, videoPath, videoStartS, videoEndS,
  lookName, lookNumber, dateFolder, generatedModel,
  lens, rendered, reference, call, notDeterminable, sparkLine, isSoulId, plateDisplayH,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const photoIn  = spring({ frame,             fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const colIn    = spring({ frame: frame - 8,  fps, config: { damping: 26, stiffness: 90,  mass: 0.9 } });
  const chipsIn  = spring({ frame: frame - 18, fps, config: { damping: 24, stiffness: 80,  mass: 0.9 } });

  const EVID_W = 1920 - PLATE_W;  // 1200px
  const PAD = 48;
  const FONT_BODY = 20;
  // plateDisplayH > 0 caps the media height; objectFit:contain scales down within that box
  const effectH = plateDisplayH > 0 ? Math.min(plateDisplayH, PLATE_H) : PLATE_H;

  const startFrame  = Math.round(videoStartS * fps);
  const endAtFrame  = Math.round(videoEndS * fps);

  // ── media slot: still or video ─────────────────────────────────────────────
  const mediaSlot =
    mediaType === 'video' && videoPath ? (
      <OffthreadVideo
        src={staticFile(videoPath)}
        startFrom={startFrame}
        endAt={endAtFrame}
        style={{
          width: PLATE_W,
          height: effectH,
          objectFit: 'contain',
          objectPosition: 'center top',
          display: 'block',
          backgroundColor: CLAUDE.FOOTER,
        }}
      />
    ) : (
      <Img
        src={staticFile(imagePath)}
        style={{
          width: PLATE_W,
          height: effectH,
          objectFit: 'contain',
          objectPosition: 'center top',
          display: 'block',
          backgroundColor: CLAUDE.FOOTER,
        }}
      />
    );

  return (
    <AbsoluteFill style={{ backgroundColor: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* ── LEFT: 2:3 plate — full height, never cropped ─────────────────── */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: PLATE_W,
        height: PLATE_H,
        overflow: 'hidden',
        opacity: clamp(photoIn, 0, 1),
        transform: `translateX(${(1 - clamp(photoIn, 0, 1)) * -16}px)`,
      }}>
        {mediaSlot}

        {/* GENERATED corner stamp — honesty law */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 10,
          fontFamily: CLAUDE_FONT.ui,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.82)',
          background: 'rgba(0,0,0,0.44)',
          padding: '3px 7px',
          borderRadius: 4,
          lineHeight: 1.3,
        }}>
          {isSoulId ? `Soul ID · generated · ${dateFolder}` : `generated · ${dateFolder}`}
        </div>

        {/* Look number badge */}
        <div style={{
          position: 'absolute',
          top: 14,
          right: 10,
          fontFamily: CLAUDE_FONT.ui,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          color: '#FFFFFF',
          background: CLAUDE.SPARK,
          padding: '4px 10px',
          borderRadius: 4,
        }}>
          view {lookNumber}
        </div>

        {/* Motion badge — only on video beats */}
        {mediaType === 'video' && (
          <div style={{
            position: 'absolute',
            top: 14,
            left: 10,
            fontFamily: CLAUDE_FONT.ui,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            color: '#FFFFFF',
            background: 'rgba(0,0,0,0.50)',
            border: `1px solid rgba(255,255,255,0.30)`,
            padding: '3px 8px',
            borderRadius: 4,
          }}>
            ▶ motion
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute',
        left: PLATE_W,
        top: 0,
        width: 1,
        height: 1080,
        backgroundColor: CLAUDE.BORDER,
        opacity: clamp(colIn, 0, 1),
      }} />

      {/* ── RIGHT: evidence column ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: PLATE_W + 1,
        top: 0,
        width: EVID_W - 1,
        height: PLATE_H,
        padding: `${PAD}px ${PAD}px ${PAD}px ${PAD + 8}px`,
        display: 'flex',
        flexDirection: 'column',
        opacity: clamp(colIn, 0, 1),
        transform: `translateX(${(1 - clamp(colIn, 0, 1)) * 14}px)`,
        overflow: 'hidden',
      }}>
        {/* Eyebrow — lens label */}
        <div style={{
          fontFamily: CLAUDE_FONT.ui,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT,
          marginBottom: 8,
        }}>
          lens · {lens}
        </div>

        {/* Look name */}
        <div style={{
          fontFamily: CLAUDE_FONT.serif,
          fontSize: 34,
          fontWeight: 600,
          color: CLAUDE.INK,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          marginBottom: 28,
        }}>
          {lookName}
        </div>

        {/* Evidence chips */}
        <div style={{
          opacity: clamp(chipsIn, 0, 1),
          transform: `translateY(${(1 - clamp(chipsIn, 0, 1)) * 10}px)`,
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {rendered.map((text, i) => (
            <EvidenceChip key={`r${i}`} tier="RENDERED" text={text} fontSize={FONT_BODY} />
          ))}

          <div style={{ height: 1, backgroundColor: CLAUDE.BORDER, margin: '10px 0' }} />

          {reference.map((text, i) => (
            <EvidenceChip key={`ref${i}`} tier="REFERENCE" text={text} fontSize={FONT_BODY} />
          ))}

          <div style={{ height: 1, backgroundColor: CLAUDE.BORDER, margin: '10px 0' }} />

          <EvidenceChip tier="CALL" text={call} fontSize={FONT_BODY} />

          {notDeterminable.length > 0 && (
            <>
              <div style={{ height: 1, backgroundColor: CLAUDE.BORDER, margin: '10px 0' }} />
              <EvidenceChip tier="NOT_DETERMINABLE" text={notDeterminable.join(' · ')} fontSize={FONT_BODY - 2} />
            </>
          )}
        </div>

        {/* Spark line or terracotta rule */}
        {sparkLine ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 'auto',
            paddingTop: 16,
          }}>
            <span style={{
              fontFamily: CLAUDE_FONT.serif,
              fontSize: 18,
              fontStyle: 'italic',
              color: CLAUDE.INK,
            }}>
              {sparkLine}
            </span>
          </div>
        ) : (
          <div style={{
            marginTop: 'auto',
            paddingTop: 16,
            width: 48,
            height: 2,
            backgroundColor: CLAUDE.SPARK,
          }} />
        )}
      </div>

    </AbsoluteFill>
  );
};
