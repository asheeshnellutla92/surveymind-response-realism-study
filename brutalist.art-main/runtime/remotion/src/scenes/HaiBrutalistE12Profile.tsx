import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE12Profile — profile mode structure.
 * Left: Source Article card (grey, doc icon, title line, author)
 * Center arrow: "EXTRACT" in SPARK
 * Right: structured profile card (name row terracotta, thesis, project chips, links)
 * Below: "Credit card + Handoff" label
 * Beat B01 of hai-brutalist-profile-a-fellow.
 */

export const haiBrutalistE12ProfileSchema = z.object({
  sparkLine: z.string().default('Make invisible work visible.'),
});
export type HaiBrutalistE12ProfileProps = z.infer<typeof haiBrutalistE12ProfileSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const HaiBrutalistE12Profile: React.FC<HaiBrutalistE12ProfileProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const CARD_W = (width - PAD_X * 2 - 100) / 2;
  const CARD_H = height * 0.46;
  const CARD_Y = height * 0.27;
  const LEFT_X = PAD_X;
  const RIGHT_X = PAD_X + CARD_W + 100;
  const ARROW_X = PAD_X + CARD_W + 18;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const leftIn = spring({ frame: frame - 12, fps, config: { damping: 25, stiffness: 80 } });
  const arrowIn = spring({ frame: frame - 40, fps, config: { damping: 25, stiffness: 100 } });
  const rightIn = spring({ frame: frame - 55, fps, config: { damping: 25, stiffness: 80 } });
  const creditIn = spring({ frame: frame - 95, fps, config: { damping: 25, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 115, fps, config: { damping: 28, stiffness: 100 } });

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
        Profile a Fellow
      </div>

      {/* LEFT — Source Article */}
      <div style={{
        position: 'absolute',
        left: LEFT_X, top: CARD_Y,
        width: CARD_W, height: CARD_H,
        background: '#F5F4EF',
        border: `2px solid ${CLAUDE.BORDER}`,
        borderRadius: 14,
        padding: '24px 22px',
        opacity: clamp(leftIn, 0, 1),
        transform: `translateX(${(1 - clamp(leftIn, 0, 1)) * -22}px)`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.GHOST, textTransform: 'uppercase' as const }}>
          Source Article
        </div>
        {/* Doc icon */}
        <svg width={40} height={50} viewBox="0 0 40 50" fill="none">
          <rect x={2} y={2} width={36} height={46} rx={5} fill="#E5E2D9" stroke={CLAUDE.BORDER} strokeWidth={2} />
          <line x1={8} y1={16} x2={32} y2={16} stroke={CLAUDE.GHOST} strokeWidth={2} strokeLinecap="round" />
          <line x1={8} y1={22} x2={32} y2={22} stroke={CLAUDE.GHOST} strokeWidth={2} strokeLinecap="round" />
          <line x1={8} y1={28} x2={26} y2={28} stroke={CLAUDE.GHOST} strokeWidth={2} strokeLinecap="round" />
          <line x1={8} y1={34} x2={24} y2={34} stroke={CLAUDE.GHOST} strokeWidth={2} strokeLinecap="round" />
        </svg>
        {/* Title line */}
        <div style={{ background: CLAUDE.BORDER, borderRadius: 4, height: 12, width: '90%' }} />
        <div style={{ background: CLAUDE.BORDER, borderRadius: 4, height: 10, width: '70%' }} />
        {/* Author line */}
        <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.GHOST }}>
          Author · affiliation · date
        </div>
      </div>

      {/* Center arrow */}
      <div style={{
        position: 'absolute',
        left: ARROW_X, top: CARD_Y + CARD_H / 2 - 34,
        width: 64,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        opacity: clamp(arrowIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700,
          color: CLAUDE.SPARK, letterSpacing: 1, textTransform: 'uppercase' as const,
        }}>
          EXTRACT
        </div>
        <svg width={44} height={36} viewBox="0 0 44 36">
          <path d="M4 18 L36 18 M28 8 L38 18 L28 28"
            stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* RIGHT — Profile card */}
      <div style={{
        position: 'absolute',
        left: RIGHT_X, top: CARD_Y,
        width: CARD_W, height: CARD_H,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 14,
        padding: '20px 22px',
        opacity: clamp(rightIn, 0, 1),
        transform: `translateX(${(1 - clamp(rightIn, 0, 1)) * 22}px)`,
        boxShadow: `0 8px 28px ${CLAUDE.SPARK}22`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* Person name row */}
        <div style={{
          fontFamily: SERIF, fontSize: height * 0.026, fontWeight: 700,
          color: CLAUDE.SPARK,
        }}>
          Fellow Name
        </div>
        {/* Thesis one-liner */}
        <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.5 }}>
          Thesis: a clear one-sentence summary of their research question and finding.
        </div>
        {/* Project chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['ML Health', 'Equity', 'NLP'].map(tag => (
            <div key={tag} style={{
              background: `${CLAUDE.SPARK}14`,
              border: `1px solid ${CLAUDE.SPARK}`,
              borderRadius: 12,
              padding: '4px 12px',
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              color: CLAUDE.SPARK,
            }}>
              {tag}
            </div>
          ))}
        </div>
        {/* Links row */}
        <div style={{ display: 'flex', gap: 12 }}>
          {['GitHub', 'LinkedIn', 'Paper'].map(link => (
            <div key={link} style={{
              background: CLAUDE.FOOTER,
              borderRadius: 8,
              padding: '4px 10px',
              fontFamily: MONO, fontSize: 11,
              color: CLAUDE.INK_SOFT,
            }}>
              {link}
            </div>
          ))}
        </div>
      </div>

      {/* Credit card + Handoff label */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: height * 0.14,
        display: 'flex', justifyContent: 'center',
        opacity: clamp(creditIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.016, fontWeight: 600,
          color: CLAUDE.INK_SOFT, letterSpacing: 0.5,
        }}>
          Credit card + Handoff
        </div>
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
