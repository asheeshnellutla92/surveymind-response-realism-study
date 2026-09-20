import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileKaustubhaCredit — person credit card.
 * Kaustubha Venkata Eluri: Northeastern University, roles, links, article credit.
 * Required near the outro per SKILL.md profile mode.
 * Beat B06 of claude-liam-profile-kaustubha-eluri.
 */

export const profileKaustubhaCreditSchema = z.object({
  sparkLine: z.string().default('Building systems that keep working.'),
});
export type ProfileKaustubhaCreditProps = z.infer<typeof profileKaustubhaCreditSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const ROLES = [
  'Teaching Assistant — Mobile App Development',
  'Academic Peer Mentor',
  'Student Ambassador',
];

const LINKS = [
  { icon: '↗', label: 'GitHub', value: 'github.com/Kaustubha-09' },
  { icon: '↗', label: 'LinkedIn', value: 'linkedin.com/in/kaustubha-ve' },
];

export const ProfileKaustubhaCredit: React.FC<ProfileKaustubhaCreditProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.10;
  const cardW = width - PAD * 2;
  const cardX = PAD;
  const cardY = height * 0.20;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const cardIn = spring({ frame, fps, config: { damping: 26, stiffness: 75, mass: 0.9 } });
  const nameIn = spring({ frame: frame - Math.round(15 * S),  fps, config: { damping: 28, stiffness: 90 } });
  const uniIn = spring({ frame: frame - Math.round(30 * S),   fps, config: { damping: 28, stiffness: 90 } });
  const divIn = spring({ frame: frame - Math.round(45 * S),   fps, config: { damping: 30, stiffness: 100 } });
  const rolesIn = spring({ frame: frame - Math.round(60 * S), fps, config: { damping: 28, stiffness: 80 } });
  const linksIn = spring({ frame: frame - Math.round(100 * S), fps, config: { damping: 28, stiffness: 80 } });
  const ctaIn = spring({ frame: frame - Math.round(140 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const articleIn = spring({ frame: frame - Math.round(165 * S), fps, config: { damping: 28, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - Math.round(190 * S), fps, config: { damping: 28, stiffness: 100 } });

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
        padding: '36px 48px',
        boxShadow: '0 8px 36px rgba(61,57,41,0.12)',
        opacity: clamp(cardIn, 0, 1),
        transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 24}px)`,
      }}>
        {/* Name */}
        <div style={{
          fontFamily: SERIF, fontSize: height * 0.052, fontWeight: 600,
          color: CLAUDE.INK, letterSpacing: '-0.01em',
          opacity: clamp(nameIn, 0, 1),
          transform: `translateY(${(1 - clamp(nameIn, 0, 1)) * 8}px)`,
          marginBottom: 6,
        }}>
          Kaustubha Venkata Eluri
        </div>

        {/* Institution */}
        <div style={{
          fontFamily: SANS, fontSize: height * 0.018, fontWeight: 600,
          color: CLAUDE.SPARK, letterSpacing: 0.5,
          opacity: clamp(uniIn, 0, 1),
          marginBottom: 20,
        }}>
          Northeastern University
        </div>

        {/* Divider */}
        <div style={{
          width: 80, height: 2,
          background: CLAUDE.BORDER,
          marginBottom: 20,
          opacity: clamp(divIn, 0, 1),
        }} />

        {/* Roles */}
        <div style={{ opacity: clamp(rolesIn, 0, 1), marginBottom: 24 }}>
          {ROLES.map((role, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 10,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: CLAUDE.INK_SOFT, flexShrink: 0,
              }} />
              <div style={{
                fontFamily: SANS, fontSize: height * 0.016,
                color: CLAUDE.INK_SOFT,
              }}>
                {role}
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: 32,
          marginBottom: 24,
          opacity: clamp(linksIn, 0, 1),
        }}>
          {LINKS.map((link, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
                color: CLAUDE.INK_SOFT, letterSpacing: 1,
              }}>
                {link.label}
              </div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.015,
                color: CLAUDE.INK,
              }}>
                {link.value}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: `${CLAUDE.SPARK}10`,
          border: `1px solid ${CLAUDE.SPARK}40`,
          borderRadius: 10,
          padding: '14px 20px',
          fontFamily: SANS, fontSize: height * 0.015,
          color: CLAUDE.INK,
          lineHeight: 1.5,
          opacity: clamp(ctaIn, 0, 1),
          marginBottom: 16,
        }}>
          Building production ML systems and need someone who makes systems reliable —
          not just accurate? <span style={{ color: CLAUDE.SPARK, fontWeight: 600 }}>Reach out.</span>
        </div>

        {/* Article credit */}
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013,
          color: CLAUDE.GHOST,
          opacity: clamp(articleIn, 0, 1),
        }}>
          Article: Aditi Shinde · NortheasternISE · Mar 31, 2026 ·
          northeasternise.substack.com
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
