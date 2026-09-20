import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiExplainerFig2Folder — Step 1 visual: a folder icon filling with labeled cards.
 * Cards drop in one by one. Caption: "one folder = the raw material."
 * Beat B02 of claude-liam-hai-how-to-explainer-videos.
 */

export const haiExplainerFig2FolderSchema = z.object({
  sparkLine: z.string().default('One folder = the raw material.'),
});
export type HaiExplainerFig2FolderProps = z.infer<typeof haiExplainerFig2FolderSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const FILE_CARDS = [
  { name: 'notes.md', icon: '📄', desc: 'observations, thoughts', accent: false },
  { name: 'code.py', icon: '🐍', desc: 'scripts & analysis', accent: false },
  { name: 'figure.png', icon: '📊', desc: 'charts & visualizations', accent: true },
  { name: 'data.csv', icon: '📋', desc: 'raw data', accent: false },
  { name: 'draft.md', icon: '✏️', desc: 'paper draft', accent: false },
  { name: 'screenshots/', icon: '🖼', desc: 'app & UI captures', accent: false },
];

export const HaiExplainerFig2Folder: React.FC<HaiExplainerFig2FolderProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 100 } });

  // Folder appears first, then cards drop in
  const folderIn = spring({ frame: frame - 5, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
  const captionIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 100 } });

  const FOLDER_X = width * 0.18;
  const FOLDER_Y = height * 0.26;
  const FOLDER_W = 220;
  const FOLDER_H = 180;

  const CARDS_START_X = width * 0.42;
  const CARDS_START_Y = height * 0.24;
  const CARD_W = 320;
  const CARD_H = 56;
  const CARD_GAP = 72;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 1 · YOUR WEEK'S FOLDER
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Put Your Week in a Folder
      </div>

      {/* Folder icon (large, simple geometric) */}
      <div style={{
        position: 'absolute',
        left: FOLDER_X - FOLDER_W / 2,
        top: FOLDER_Y,
        width: FOLDER_W,
        opacity: clamp(folderIn, 0, 1),
        transform: `scale(${clamp(folderIn, 0, 1)}) translateY(${(1 - folderIn) * 20}px)`,
      }}>
        <svg width={FOLDER_W} height={FOLDER_H} viewBox="0 0 220 180">
          {/* Folder tab */}
          <rect x={0} y={15} width={80} height={25} rx={8} fill={CLAUDE.SPARK} opacity={0.9} />
          {/* Folder body */}
          <rect x={0} y={38} width={220} height={130} rx={12} fill={CLAUDE.SPARK} opacity={0.15} stroke={CLAUDE.SPARK} strokeWidth={2} />
          {/* Folder body fill */}
          <rect x={0} y={38} width={220} height={130} rx={12} fill="#FFF8F5" stroke={CLAUDE.SPARK} strokeWidth={2} />
          {/* Folder tab text */}
          <text x={40} y={32} fontFamily="system-ui" fontSize={11} fontWeight={700}
            fill={CLAUDE.CARD} textAnchor="middle" letterSpacing={1}>
            research/
          </text>
        </svg>
      </div>

      {/* Arrow from folder to cards */}
      <div style={{
        position: 'absolute',
        left: FOLDER_X + FOLDER_W / 2 - 20,
        top: FOLDER_Y + FOLDER_H / 2,
        width: CARDS_START_X - (FOLDER_X + FOLDER_W / 2) + 20,
        height: 2,
        background: CLAUDE.BORDER,
        opacity: clamp(folderIn, 0, 1),
      }} />

      {/* File cards */}
      {FILE_CARDS.map((file, i) => {
        const cardDelay = 15 + i * 14;
        const cardIn = spring({ frame: frame - cardDelay, fps, config: { damping: 22, stiffness: 120, mass: 0.7 } });
        const isAccent = file.accent;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: CARDS_START_X,
            top: CARDS_START_Y + i * CARD_GAP,
            width: CARD_W,
            height: CARD_H,
            background: isAccent ? '#FFF8F5' : CLAUDE.CARD,
            border: `1.5px solid ${isAccent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderLeft: `4px solid ${isAccent ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
            borderRadius: 10,
            boxShadow: '0 3px 12px rgba(61,57,41,0.08)',
            display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 16,
            opacity: clamp(cardIn, 0, 1),
            transform: `translateX(${(1 - clamp(cardIn, 0, 1)) * 30}px)`,
          }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{file.icon}</span>
            <div>
              <div style={{
                fontFamily: MONO, fontSize: 15, fontWeight: 600,
                color: isAccent ? CLAUDE.SPARK : CLAUDE.INK,
              }}>
                {file.name}
              </div>
              <div style={{
                fontFamily: SANS, fontSize: 12,
                color: CLAUDE.INK_SOFT, marginTop: 2,
              }}>
                {file.desc}
              </div>
            </div>
          </div>
        );
      })}

      {/* Caption */}
      <div style={{
        position: 'absolute',
        left: FOLDER_X - FOLDER_W / 2,
        top: FOLDER_Y + FOLDER_H + 20,
        width: FOLDER_W + 40,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic',
        color: CLAUDE.INK_SOFT, textAlign: 'center',
        opacity: clamp(captionIn, 0, 1),
      }}>
        one folder = the raw material
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
