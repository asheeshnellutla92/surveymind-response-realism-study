import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const a8DeliverableMapSchema = z.object({
  sparkLine: z.string().default('One brand. Six surfaces.'),
});
export type A8DeliverableMapProps = z.infer<typeof a8DeliverableMapSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const GREEN_BG = '#F0FAF4';
const GREEN_BD = '#52C47C';


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const DELIVERABLES = [
  { label: 'Website', pts: '35 pts', icon: '🌐', part: 'Part 1' },
  { label: 'Accessibility Check', pts: '5 pts', icon: '✓', part: 'Part 1' },
  { label: 'LinkedIn Header', pts: '15 pts', icon: '▭', part: 'Part 2' },
  { label: '3 AI Images', pts: '15 pts', icon: '✦', part: 'Part 2' },
  { label: 'ATS Resume', pts: '15 pts', icon: '≡', part: 'Part 3' },
  { label: 'Visual Resume', pts: '15 pts', icon: '◈', part: 'Part 3' },
];

export const A8DeliverableMap: React.FC<A8DeliverableMapProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sourceIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const arrowIn  = spring({ frame: frame - 18, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const cardIns = DELIVERABLES.map((_, i) =>
    spring({ frame: frame - (24 + i * 9), fps, config: { damping: 28, stiffness: 120, mass: 0.9 } })
  );

  const sparkIn = spring({ frame: frame - 84, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.07,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        INFO 7375 · ASSIGNMENT 8 · THE ASSET SYSTEM
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.125,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 40,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        Six Deliverables. One Brand Source.
      </div>

      {/* Brand source pill */}
      <div style={{
        position: 'absolute',
        top: height * 0.245,
        left: '50%',
        transform: `translateX(-50%) translateY(${(1 - clamp(sourceIn, 0, 1)) * 12}px)`,
        background: CLAUDE.SPARK,
        borderRadius: 32,
        padding: '10px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: clamp(sourceIn, 0, 1),
        whiteSpace: 'nowrap' as const,
      }}>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 2, textTransform: 'uppercase' as const }}>
          A6 / A7 Brand Sheet
        </span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
          palette · fonts · logo · voice
        </span>
      </div>

      {/* Arrow down from source */}
      <div style={{
        position: 'absolute',
        top: height * 0.34,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: clamp(arrowIn, 0, 1),
      }}>
        <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
          <line x1={14} y1={2} x2={14} y2={20} stroke={CLAUDE.SPARK} strokeWidth={2.5} strokeLinecap="round" />
          <polyline points="7,14 14,22 21,14" stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Six deliverable cards in 3×2 grid */}
      <div style={{
        position: 'absolute',
        top: height * 0.415,
        left: width * 0.06,
        right: width * 0.06,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 16,
      }}>
        {DELIVERABLES.map((d, i) => (
          <div key={i} style={{
            background: CLAUDE.CARD,
            border: `2px solid ${CLAUDE.BORDER}`,
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: clamp(cardIns[i], 0, 1),
            transform: `translateY(${(1 - clamp(cardIns[i], 0, 1)) * 16}px)`,
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: CLAUDE.PILL,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontFamily: SANS,
              fontSize: 20,
              color: CLAUDE.SPARK,
            }}>
              {d.icon}
            </div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.2 }}>
                {d.label}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.SPARK, fontWeight: 700 }}>
                  {d.pts}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.GHOST }}>
                  {d.part}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.07,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
