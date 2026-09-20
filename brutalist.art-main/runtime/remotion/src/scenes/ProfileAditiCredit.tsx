import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileAditiCredit — person credit card.
 * Aditi Deodhar: Northeastern University, recognitions, public labels (no URLs), article credit.
 * Required near the outro per SKILL.md profile mode.
 * Beat B07 of claude-liam-profile-aditi-deodhar.
 *
 * HONESTY: Public-presence labels are label-only (Google Scholar / Medium / GitHub).
 * The article names these but provides no handle URLs — no URLs are shown.
 * Only statistic: GPA 3.717.
 */

export const profileAditiCreditSchema = z.object({
  sparkLine: z.string().default('Building what matters, not just what works.'),
});
export type ProfileAditiCreditProps = z.infer<typeof profileAditiCreditSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const RECOGNITIONS = [
  'DreamAI 2025 finalist — FinFluent · pitch lead',
  '2nd · Confluent AI Day 2025 — SecureStream AI',
  'GHC 2024 Advancing Inclusion Scholarship · AnitaB.org',
  'Northeastern College of Engineering spotlight · Oct 2025',
];

const PUBLIC_PRESENCE = [
  'Google Scholar profile',
  'Medium technical blog',
  'Active public GitHub',
];

export const ProfileAditiCredit: React.FC<ProfileAditiCreditProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.09;
  const cardW = width - PAD * 2;
  const cardX = PAD;
  const cardY = height * 0.18;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const cardIn   = spring({ frame, fps, config: { damping: 26, stiffness: 75, mass: 0.9 } });
  const nameIn   = spring({ frame: frame - Math.round(15 * S),  fps, config: { damping: 28, stiffness: 90 } });
  const uniIn    = spring({ frame: frame - Math.round(30 * S),  fps, config: { damping: 28, stiffness: 90 } });
  const divIn    = spring({ frame: frame - Math.round(45 * S),  fps, config: { damping: 30, stiffness: 100 } });
  const recogIn  = spring({ frame: frame - Math.round(65 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const presIn   = spring({ frame: frame - Math.round(120 * S), fps, config: { damping: 28, stiffness: 80 } });
  const articleIn = spring({ frame: frame - Math.round(165 * S), fps, config: { damping: 28, stiffness: 80 } });
  const sparkIn  = spring({ frame: frame - Math.round(190 * S), fps, config: { damping: 28, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(cardIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Card */}
      <div style={{
        position: 'absolute',
        left: cardX, top: cardY,
        width: cardW,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.BORDER}`,
        borderLeft: `6px solid ${CLAUDE.SPARK}`,
        borderRadius: 18,
        padding: '32px 44px',
        boxShadow: '0 8px 36px rgba(61,57,41,0.12)',
        opacity: clamp(cardIn, 0, 1),
        transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 24}px)`,
        display: 'flex', flexDirection: 'row', gap: 48,
      }}>

        {/* Left column — name, uni, recognitions */}
        <div style={{ flex: 1 }}>
          {/* Name */}
          <div style={{
            fontFamily: SERIF, fontSize: height * 0.048, fontWeight: 600,
            color: CLAUDE.INK, letterSpacing: '-0.01em',
            opacity: clamp(nameIn, 0, 1),
            transform: `translateY(${(1 - clamp(nameIn, 0, 1)) * 8}px)`,
            marginBottom: 4,
          }}>
            Aditi Deodhar
          </div>

          {/* Institution + degree */}
          <div style={{
            fontFamily: SANS, fontSize: height * 0.016, fontWeight: 600,
            color: CLAUDE.SPARK,
            opacity: clamp(uniIn, 0, 1), marginBottom: 4,
          }}>
            Northeastern University College of Engineering
          </div>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.014,
            color: CLAUDE.INK_SOFT,
            opacity: clamp(uniIn, 0, 1), marginBottom: 18,
          }}>
            MS Information Systems · Dec 2025 · AI Engineer
          </div>

          {/* Divider */}
          <div style={{
            width: 80, height: 2, background: CLAUDE.BORDER,
            marginBottom: 16, opacity: clamp(divIn, 0, 1),
          }} />

          {/* Recognitions */}
          <div style={{ opacity: clamp(recogIn, 0, 1) }}>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.011, fontWeight: 800,
              letterSpacing: 2.5, textTransform: 'uppercase' as const,
              color: CLAUDE.INK_SOFT, marginBottom: 10,
            }}>Selected Recognitions</div>
            {RECOGNITIONS.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: CLAUDE.SPARK, flexShrink: 0, marginTop: 5,
                }} />
                <div style={{
                  fontFamily: SANS, fontSize: height * 0.013,
                  color: CLAUDE.INK_SOFT, lineHeight: 1.4,
                }}>{r}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — public presence (labels only) */}
        <div style={{ width: width * 0.22, opacity: clamp(presIn, 0, 1) }}>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.011, fontWeight: 800,
            letterSpacing: 2.5, textTransform: 'uppercase' as const,
            color: CLAUDE.INK_SOFT, marginBottom: 12,
          }}>Public Presence</div>
          {PUBLIC_PRESENCE.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
              background: CLAUDE.PAGE, border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 8, padding: '8px 14px',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: CLAUDE.INK_SOFT, flexShrink: 0,
              }} />
              <div style={{
                fontFamily: SANS, fontSize: height * 0.013,
                color: CLAUDE.INK_SOFT,
              }}>{p}</div>
            </div>
          ))}
          <div style={{
            fontFamily: SANS, fontSize: height * 0.011, fontStyle: 'italic',
            color: CLAUDE.GHOST, marginTop: 8, lineHeight: 1.4,
          }}>
            Labels only — article names these but provides no handle URLs.
          </div>

          {/* Article credit */}
          <div style={{
            marginTop: 24,
            fontFamily: SANS, fontSize: height * 0.012,
            color: CLAUDE.GHOST,
            opacity: clamp(articleIn, 0, 1),
          }}>
            Article: NortheasternISE · Feb 27, 2026<br />
            northeasternise.substack.com
          </div>
        </div>
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
