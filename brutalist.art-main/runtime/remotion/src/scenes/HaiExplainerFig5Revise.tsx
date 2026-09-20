import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiExplainerFig5Revise — Step 5: watch and revise.
 * A player card with a plain-language note arcing back into the pipeline.
 * The card updates, showing iteration. Caption: "plain language in, better video out."
 * Beat B05 of claude-liam-hai-how-to-explainer-videos.
 */

export const haiExplainerFig5ReviseSchema = z.object({
  sparkLine: z.string().default('Plain language in, better video out.'),
});
export type HaiExplainerFig5ReviseProps = z.infer<typeof haiExplainerFig5ReviseSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const NOTES = [
  { text: '"this number\'s wrong"', x: 0.22, y: 0.58 },
  { text: '"slow this part down"', x: 0.62, y: 0.65 },
  { text: '"different chart here"', x: 0.42, y: 0.72 },
];

export const HaiExplainerFig5Revise: React.FC<HaiExplainerFig5ReviseProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const playerIn = spring({ frame: frame - 10, fps, config: { damping: 22, stiffness: 80, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 95, fps, config: { damping: 28, stiffness: 100 } });

  const PLAYER_W = width * 0.54;
  const PLAYER_H = height * 0.42;
  const PLAYER_X = width / 2 - PLAYER_W / 2;
  const PLAYER_Y = height * 0.27;

  // Loop animation: arcs cycling over time
  const loopFrame = frame % 90;
  const arcP = clamp(interpolate(loopFrame, [0, 45], [0, 1]), 0, 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 5 · WATCH & REVISE
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Watch. Note. Revise.
      </div>

      {/* Player card */}
      <div style={{
        position: 'absolute',
        left: PLAYER_X,
        top: PLAYER_Y,
        width: PLAYER_W,
        height: PLAYER_H,
        background: '#1A1814',
        borderRadius: 18,
        boxShadow: '0 12px 48px rgba(61,57,41,0.25)',
        overflow: 'hidden',
        opacity: clamp(playerIn, 0, 1),
        transform: `scale(${clamp(playerIn, 0, 1)})`,
      }}>
        {/* Video placeholder with "playing" state */}
        <div style={{
          position: 'absolute', inset: 0, background: '#1A1814',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          {/* Simulated video frame with brand look */}
          <div style={{
            width: '88%', height: '65%',
            background: CLAUDE.PAGE,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {/* Simplified "video" content */}
            <div style={{
              fontFamily: SERIF, fontSize: 22, color: CLAUDE.INK,
              textAlign: 'center', opacity: 0.7, padding: 20,
            }}>
              Your Research Video
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            width: '88%', height: 4, background: '#333',
            borderRadius: 2, marginTop: 16,
          }}>
            <div style={{
              height: '100%',
              width: `${35 + (arcP * 15)}%`,
              background: CLAUDE.SPARK,
              borderRadius: 2,
            }} />
          </div>

          {/* Player controls row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20, marginTop: 10,
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <polygon points="5,3 19,12 5,21" fill={CLAUDE.CARD} />
            </svg>
            <div style={{ fontFamily: SANS, fontSize: 12, color: '#999' }}>
              {Math.floor(35 + arcP * 15)}%
            </div>
          </div>
        </div>
      </div>

      {/* Revise notes — floating chips that appear and arc back */}
      {NOTES.map((note, i) => {
        const noteDelay = 35 + i * 22;
        const noteIn = spring({ frame: frame - noteDelay, fps, config: { damping: 25, stiffness: 100 } });
        return (
          <div key={i} style={{
            position: 'absolute',
            left: width * note.x,
            top: height * note.y,
            background: CLAUDE.CARD,
            border: `1.5px solid ${CLAUDE.BORDER}`,
            borderRadius: 999,
            padding: '8px 16px',
            fontFamily: SANS, fontSize: 14,
            color: CLAUDE.INK,
            boxShadow: '0 4px 16px rgba(61,57,41,0.12)',
            opacity: clamp(noteIn, 0, 1) * (1 - clamp(interpolate(frame - noteDelay, [45, 75], [0, 1]), 0, 1) * 0.3),
            transform: `translateY(${(1 - clamp(noteIn, 0, 1)) * 15}px)`,
            whiteSpace: 'nowrap',
          }}>
            {note.text}
          </div>
        );
      })}

      {/* Return arc SVG */}
      <svg style={{
        position: 'absolute',
        left: 0, top: 0, width, height,
        pointerEvents: 'none',
        opacity: clamp(spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 100 } }), 0, 1) * 0.4,
      }}>
        <path
          d={`M ${PLAYER_X + PLAYER_W * 0.3} ${PLAYER_Y + PLAYER_H + 20}
              C ${PLAYER_X} ${height * 0.85} ${PLAYER_X - 60} ${PLAYER_Y + PLAYER_H / 2}
              ${PLAYER_X + 20} ${PLAYER_Y + 30}`}
          stroke={CLAUDE.SPARK} strokeWidth={2} fill="none" strokeDasharray="8 5"
        />
        {/* Arrowhead */}
        <circle cx={PLAYER_X + 20} cy={PLAYER_Y + 30} r={4} fill={CLAUDE.SPARK} />
      </svg>

      {/* Caption */}
      <div style={{
        position: 'absolute',
        left: PLAYER_X,
        top: PLAYER_Y + PLAYER_H + 12,
        width: PLAYER_W,
        fontFamily: SERIF, fontSize: 20, fontStyle: 'italic',
        color: CLAUDE.INK_SOFT, textAlign: 'center',
        opacity: clamp(spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 100 } }), 0, 1),
      }}>
        plain language in, better video out
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
