import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileKaustubhaFig3Projects — four projects on one boundary.
 * ChipGrid on the lab↔production gap line.
 * Beat B03 of claude-liam-profile-kaustubha-eluri.
 */

export const profileKaustubhaFig3ProjectsSchema = z.object({
  sparkLine: z.string().default('Different domains. One discipline.'),
});
export type ProfileKaustubhaFig3ProjectsProps = z.infer<typeof profileKaustubhaFig3ProjectsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const PROJECTS = [
  {
    name: 'RapidTriage AI',
    domain: 'Clinical',
    must: 'Latency + accuracy\nunder time pressure',
    accent: false,
  },
  {
    name: 'Echolin.AI',
    domain: 'Detection',
    must: 'Robust AND explainable\n(both required)',
    accent: false,
  },
  {
    name: 'Semantic Diff\nPrompting',
    domain: 'Efficiency',
    must: 'Efficiency IS\nreliability at scale',
    accent: false,
  },
  {
    name: 'NEUQuest',
    domain: 'Mobile',
    must: 'Usability + reliability\nmatter as much as features',
    accent: true,
  },
];

export const ProfileKaustubhaFig3Projects: React.FC<ProfileKaustubhaFig3ProjectsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.10;
  const CHIP_W = (width - PAD * 2 - 40 * 3) / 4;
  const CHIP_H = height * 0.28;
  const chipY = height * 0.36;
  const boundaryY = chipY + CHIP_H + 32;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const lineIn = spring({ frame: frame - Math.round(15 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const labelsIn = spring({ frame: frame - Math.round(40 * S), fps, config: { damping: 28, stiffness: 90 } });
  const sparkIn = spring({ frame: frame - Math.round(160 * S), fps, config: { damping: 28, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(headerIn, 0, 1), transform: `translateY(${(1 - headerIn) * 10}px)`,
      }}>
        The Projects on One Boundary
      </div>

      {/* Project chips — drop in staggered */}
      {PROJECTS.map((proj, i) => {
        const chipX = PAD + i * (CHIP_W + 40);
        const chipDelay = Math.round((50 + i * 22) * S);
        const chipIn = spring({ frame: frame - chipDelay, fps, config: { damping: 24, stiffness: 75, mass: 0.9 } });
        const isFocal = proj.accent;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: chipX,
            top: chipY + (1 - clamp(chipIn, 0, 1)) * -60,
            width: CHIP_W,
            height: CHIP_H,
            background: isFocal ? CLAUDE.SPARK : CLAUDE.CARD,
            border: `2px solid ${isFocal ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderRadius: 14,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '0 12px',
            boxShadow: isFocal
              ? `0 8px 28px ${CLAUDE.SPARK}40`
              : '0 4px 16px rgba(61,57,41,0.10)',
            opacity: clamp(chipIn, 0, 1),
          }}>
            {/* Domain tag */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase' as const,
              color: isFocal ? 'rgba(255,255,255,0.75)' : CLAUDE.INK_SOFT,
            }}>
              {proj.domain}
            </div>
            {/* Project name */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.016, fontWeight: 700,
              color: isFocal ? '#FFFFFF' : CLAUDE.INK,
              textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3,
            }}>
              {proj.name}
            </div>
            {/* Divider */}
            <div style={{
              width: '60%', height: 1,
              background: isFocal ? 'rgba(255,255,255,0.3)' : CLAUDE.BORDER,
            }} />
            {/* "What it must do" */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.012,
              color: isFocal ? 'rgba(255,255,255,0.85)' : CLAUDE.INK_SOFT,
              textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.45,
            }}>
              {proj.must}
            </div>
          </div>
        );
      })}

      {/* Boundary line */}
      <div style={{
        position: 'absolute',
        left: PAD,
        top: boundaryY,
        width: (width - PAD * 2) * clamp(lineIn, 0, 1),
        height: 3,
        background: CLAUDE.INK,
        borderRadius: 2,
        opacity: clamp(lineIn, 0, 1),
      }} />

      {/* Boundary labels */}
      <div style={{
        position: 'absolute', left: PAD, top: boundaryY + 12,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 2, color: CLAUDE.INK_SOFT,
        opacity: clamp(labelsIn, 0, 1),
      }}>
        LAB
      </div>
      <div style={{
        position: 'absolute', right: PAD, top: boundaryY + 12,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 2, color: CLAUDE.INK_SOFT,
        opacity: clamp(labelsIn, 0, 1),
      }}>
        PRODUCTION
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.07,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `scale(${idlePulse})`,
      }}>
        <div style={{ transform: `rotate(${frame * 0.15}deg)` }}>
        </div>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
