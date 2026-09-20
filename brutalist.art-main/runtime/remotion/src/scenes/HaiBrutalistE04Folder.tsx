import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE04Folder — folder filling with file cards.
 * Center folder outline; 5 file chips animate in one by one.
 * notes.md | code.py | figure.png | data.csv | draft.md
 * Beat B01 of hai-brutalist-week-folder.
 */

export const haiBrutalistE04FolderSchema = z.object({
  sparkLine: z.string().default('One folder = the raw material.'),
});
export type HaiBrutalistE04FolderProps = z.infer<typeof haiBrutalistE04FolderSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const FILES = [
  { name: 'notes.md', color: CLAUDE.SPARK },
  { name: 'code.py', color: '#4A9E6A' },
  { name: 'figure.png', color: '#5B8ED8' },
  { name: 'data.csv', color: '#A0777A' },
  { name: 'draft.md', color: CLAUDE.SPARK },
];

export const HaiBrutalistE04Folder: React.FC<HaiBrutalistE04FolderProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.10;
  const FOLDER_W = width * 0.58;
  const FOLDER_H = height * 0.54;
  const FOLDER_X = (width - FOLDER_W) / 2;
  const FOLDER_Y = height * 0.25;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const folderIn = spring({ frame: frame - 10, fps, config: { damping: 25, stiffness: 80 } });
  const labelIn = spring({ frame: frame - 20, fps, config: { damping: 25, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 100 } });

  const CHIP_W = 150;
  const CHIP_H = 42;
  const CHIP_GAP = 14;
  const TOTAL_CHIPS_W = FILES.length * CHIP_W + (FILES.length - 1) * CHIP_GAP;
  const CHIPS_START_X = (width - TOTAL_CHIPS_W) / 2;

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
        Your Week in a Folder
      </div>

      {/* Folder label */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: FOLDER_Y - 34,
        textAlign: 'center',
        fontFamily: MONO, fontSize: height * 0.020, fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(labelIn, 0, 1),
      }}>
        your-week/
      </div>

      {/* Folder outline */}
      <div style={{
        position: 'absolute',
        left: FOLDER_X,
        top: FOLDER_Y,
        width: FOLDER_W,
        height: FOLDER_H,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.BORDER}`,
        borderRadius: 18,
        opacity: clamp(folderIn, 0, 1),
        transform: `translateY(${(1 - clamp(folderIn, 0, 1)) * 12}px)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        boxShadow: '0 6px 28px rgba(61,57,41,0.08)',
      }}>
        {/* Folder tab (visual decoration) */}
        <div style={{
          position: 'absolute', top: -18, left: 24,
          width: 80, height: 20,
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.BORDER}`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
        }} />

        {/* File chips inside folder */}
        {FILES.map((file, i) => {
          const delay = 35 + i * 18;
          const chipIn = spring({ frame: frame - delay, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: `${file.color}12`,
              border: `1.5px solid ${file.color}40`,
              borderRadius: 10,
              padding: '8px 18px',
              width: CHIP_W + 20,
              opacity: clamp(chipIn, 0, 1),
              transform: `translateX(${(1 - clamp(chipIn, 0, 1)) * 30}px)`,
            }}>
              {/* Doc glyph */}
              <svg width={16} height={18} viewBox="0 0 16 18" fill="none">
                <rect x={1} y={1} width={14} height={16} rx={2} fill={`${file.color}20`} stroke={file.color} strokeWidth={1.5} />
                <line x1={4} y1={6} x2={12} y2={6} stroke={file.color} strokeWidth={1.5} strokeLinecap="round" />
                <line x1={4} y1={9} x2={12} y2={9} stroke={file.color} strokeWidth={1.5} strokeLinecap="round" />
                <line x1={4} y1={12} x2={9} y2={12} stroke={file.color} strokeWidth={1.5} strokeLinecap="round" />
              </svg>
              <span style={{
                fontFamily: MONO, fontSize: height * 0.018, fontWeight: 600,
                color: CLAUDE.INK,
              }}>
                {file.name}
              </span>
            </div>
          );
        })}
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
