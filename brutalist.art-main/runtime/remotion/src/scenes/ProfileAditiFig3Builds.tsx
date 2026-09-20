import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileAditiFig3Builds — Gap → Build → Serves pattern.
 * A repeating three-node motif applied to four chips.
 * Each shows: gap named → build → who it reaches.
 * Beat B03 of claude-liam-profile-aditi-deodhar.
 */

export const profileAditiFig3BuildsSchema = z.object({
  sparkLine: z.string().default('Gap named. Build. Serves who it missed.'),
});
export type ProfileAditiFig3BuildsProps = z.infer<typeof profileAditiFig3BuildsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const BUILDS = [
  {
    name: 'MediPedia',
    gap: 'No affordable local medical-info tool',
    build: 'Zero-budget RAG chatbot (Ollama / FAISS)',
    serves: 'Anyone who can\'t afford proprietary AI',
    award: '',
  },
  {
    name: 'SecureStream AI',
    gap: 'Real-time privacy risk invisible in streams',
    build: 'Confluent Cloud + Kafka + Flink + MongoDB',
    serves: 'Teams handling sensitive data at scale',
    award: '2nd · Confluent AI Day 2025',
  },
  {
    name: 'MIT Women\'s Health Agent',
    gap: 'Documented gaps in women\'s health research data',
    build: 'Conversational AI agent (MIT hackathon)',
    serves: 'Researchers + clinicians addressing bias in data',
    award: '',
  },
  {
    name: 'FinFluent',
    gap: 'Women navigating opaque healthcare finance',
    build: 'NL assistant (HSAs / deductibles / maternity leave)',
    serves: 'Women making healthcare financial decisions',
    award: 'DreamAI 2025 finalist',
  },
];

export const ProfileAditiFig3Builds: React.FC<ProfileAditiFig3BuildsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.07;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const eyebrowIn = spring({ frame, fps, config: { damping: 30, stiffness: 100 } });
  const titleIn   = spring({ frame: frame - Math.round(8 * S),   fps, config: { damping: 28, stiffness: 90 } });
  const headerIn  = spring({ frame: frame - Math.round(20 * S),  fps, config: { damping: 26, stiffness: 80 } });
  const sparkIn   = spring({ frame: frame - Math.round(200 * S), fps, config: { damping: 28, stiffness: 100 } });

  const colW = (width - PAD * 2 - 48) / 4;
  const cardY = height * 0.26;
  const cardH = height * 0.54;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.06,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(eyebrowIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.10,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Gap Named → Build → Serves
      </div>

      {/* Column headers */}
      {(['Gap Named', 'Build', 'Who It Reaches'] as const).map((h, hi) => {
        const positions = [
          { label: 'Gap Named', x: PAD + colW * 0.15 },
          { label: 'Build', x: PAD + colW * 0.55 },
          { label: 'Who It Reaches', x: PAD + colW * 0.90 },
        ];
        return null; // rendered inside cards
      })}

      {/* Four build cards */}
      {BUILDS.map((b, i) => {
        const cardIn = spring({ frame: frame - Math.round((30 + i * 22) * S), fps, config: { damping: 26, stiffness: 75 } });
        const cx = PAD + i * (colW + 16);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: cx, top: cardY,
            width: colW,
            height: cardH,
            background: CLAUDE.CARD,
            border: `2px solid ${CLAUDE.BORDER}`,
            borderTop: `5px solid ${i === 3 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderRadius: 14,
            padding: '16px 14px',
            boxShadow: '0 4px 18px rgba(61,57,41,0.07)',
            display: 'flex', flexDirection: 'column', gap: 10,
            opacity: clamp(cardIn, 0, 1),
            transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 24}px)`,
          }}>
            {/* Build name */}
            <div style={{
              fontFamily: SERIF, fontSize: height * 0.018, fontWeight: 700,
              color: i === 3 ? CLAUDE.SPARK : CLAUDE.INK,
              borderBottom: `1px solid ${CLAUDE.BORDER}`,
              paddingBottom: 8, marginBottom: 2,
            }}>
              {b.name}
            </div>

            {/* Gap */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.010, fontWeight: 800,
                letterSpacing: 2, textTransform: 'uppercase' as const,
                color: CLAUDE.INK_SOFT,
              }}>Gap Named</div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.013,
                color: CLAUDE.INK, lineHeight: 1.4,
              }}>{b.gap}</div>
            </div>

            {/* Divider arrow */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.018, color: CLAUDE.SPARK,
              textAlign: 'center' as const, fontWeight: 700,
            }}>↓</div>

            {/* Build */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.010, fontWeight: 800,
                letterSpacing: 2, textTransform: 'uppercase' as const,
                color: CLAUDE.INK_SOFT,
              }}>Build</div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.013,
                color: CLAUDE.INK, lineHeight: 1.4,
              }}>{b.build}</div>
            </div>

            {/* Divider arrow */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.018, color: CLAUDE.SPARK,
              textAlign: 'center' as const, fontWeight: 700,
            }}>↓</div>

            {/* Serves */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.010, fontWeight: 800,
                letterSpacing: 2, textTransform: 'uppercase' as const,
                color: CLAUDE.INK_SOFT,
              }}>Who It Reaches</div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.013,
                color: CLAUDE.INK, lineHeight: 1.4,
              }}>{b.serves}</div>
            </div>

            {/* Award badge */}
            {b.award ? (
              <div style={{
                background: `${CLAUDE.SPARK}12`, border: `1px solid ${CLAUDE.SPARK}40`,
                borderRadius: 6, padding: '4px 10px',
                fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
                color: CLAUDE.SPARK, letterSpacing: 0.5,
              }}>
                {b.award}
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
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
