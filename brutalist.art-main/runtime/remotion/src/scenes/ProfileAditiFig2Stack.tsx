import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileAditiFig2Stack — MediPedia zero-budget stack.
 * Assembly diagram: "$0 budget / no cloud / no paid APIs" constraint chip on the left;
 * the stack self-assembles from open parts on the right — all inside "her own machine."
 * Beat B02 of claude-liam-profile-aditi-deodhar.
 */

export const profileAditiFig2StackSchema = z.object({
  sparkLine: z.string().default('Constraint as a design problem.'),
});
export type ProfileAditiFig2StackProps = z.infer<typeof profileAditiFig2StackSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const STACK_ITEMS = [
  { name: 'Ollama', role: 'Local LLM inference', icon: '⚙' },
  { name: 'Hugging Face', role: 'Embeddings', icon: '🤗' },
  { name: 'FAISS', role: 'Vector database', icon: '⬡' },
  { name: 'Python + Streamlit', role: 'App layer', icon: '🐍' },
];

export const ProfileAditiFig2Stack: React.FC<ProfileAditiFig2StackProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.09;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const eyebrowIn  = spring({ frame, fps, config: { damping: 30, stiffness: 100 } });
  const titleIn    = spring({ frame: frame - Math.round(8 * S),   fps, config: { damping: 28, stiffness: 90 } });
  const constraintIn = spring({ frame: frame - Math.round(18 * S), fps, config: { damping: 26, stiffness: 70 } });
  const arrowIn    = spring({ frame: frame - Math.round(45 * S),  fps, config: { damping: 26, stiffness: 70 } });
  const borderIn   = spring({ frame: frame - Math.round(55 * S),  fps, config: { damping: 26, stiffness: 70 } });
  const sparkIn    = spring({ frame: frame - Math.round(160 * S), fps, config: { damping: 28, stiffness: 100 } });

  const constraintX = PAD;
  const constraintW = width * 0.22;
  const stackX = width * 0.42;
  const stackW = width * 0.50;
  const boxY = height * 0.24;
  const boxH = height * 0.52;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(eyebrowIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        MediPedia
      </div>

      {/* CONSTRAINT CHIP — left side */}
      <div style={{
        position: 'absolute',
        left: constraintX, top: boxY,
        width: constraintW,
        background: `${CLAUDE.SPARK}12`,
        border: `2px solid ${CLAUDE.SPARK}50`,
        borderRadius: 16,
        padding: '24px 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
        opacity: clamp(constraintIn, 0, 1),
        transform: `translateX(${(1 - clamp(constraintIn, 0, 1)) * -24}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 800,
          letterSpacing: 2.5, textTransform: 'uppercase' as const,
          color: CLAUDE.SPARK,
        }}>
          Constraint
        </div>
        {['$0 budget', 'No cloud', 'No paid APIs', 'Her own machine only'].map((c, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: CLAUDE.SPARK, flexShrink: 0,
            }} />
            <div style={{
              fontFamily: SANS, fontSize: height * 0.014, fontWeight: 600,
              color: CLAUDE.INK,
            }}>{c}</div>
          </div>
        ))}
        <div style={{
          marginTop: 8,
          fontFamily: SERIF, fontSize: height * 0.014, fontStyle: 'italic',
          color: CLAUDE.INK_SOFT,
        }}>
          "constraint as a design problem"
        </div>
      </div>

      {/* Arrow */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}>
        <line
          x1={constraintX + constraintW + 16}
          y1={boxY + boxH / 2}
          x2={stackX - 20}
          y2={boxY + boxH / 2}
          stroke={CLAUDE.SPARK} strokeWidth={3} strokeLinecap="round"
          opacity={clamp(arrowIn, 0, 1)}
        />
        <polygon
          points={`${stackX - 20},${boxY + boxH / 2 - 8} ${stackX - 4},${boxY + boxH / 2} ${stackX - 20},${boxY + boxH / 2 + 8}`}
          fill={CLAUDE.SPARK}
          opacity={clamp(arrowIn, 0, 1)}
        />
      </svg>

      {/* STACK BOX — "her own machine" boundary */}
      <div style={{
        position: 'absolute',
        left: stackX, top: boxY,
        width: stackW,
        height: boxH,
        border: `2.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 20,
        background: CLAUDE.CARD,
        boxShadow: `0 6px 32px ${CLAUDE.SPARK}18`,
        opacity: clamp(borderIn, 0, 1),
        overflow: 'hidden',
      }}>
        {/* Machine label */}
        <div style={{
          position: 'absolute', top: -1, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          paddingTop: 12,
        }}>
          <div style={{
            background: CLAUDE.SPARK,
            borderRadius: '0 0 8px 8px',
            padding: '4px 20px',
            fontFamily: SANS, fontSize: height * 0.011, fontWeight: 800,
            color: '#fff', letterSpacing: 2, textTransform: 'uppercase' as const,
          }}>
            Her Own Machine
          </div>
        </div>

        {/* Stack items */}
        <div style={{
          position: 'absolute', top: height * 0.06, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'stretch', justifyContent: 'center',
          padding: '0 28px',
          gap: 10,
        }}>
          {STACK_ITEMS.map((item, i) => {
            const itemIn = spring({ frame: frame - (borderIn > 0.5 ? Math.round((55 + i * 18) * S) : 9999), fps, config: { damping: 28, stiffness: 90 } });
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: CLAUDE.PAGE,
                border: `1.5px solid ${CLAUDE.BORDER}`,
                borderRadius: 10,
                padding: '10px 16px',
                opacity: clamp(itemIn, 0, 1),
                transform: `translateX(${(1 - clamp(itemIn, 0, 1)) * 20}px)`,
              }}>
                <div style={{ fontSize: height * 0.022, lineHeight: 1 }}>{item.icon}</div>
                <div>
                  <div style={{
                    fontFamily: SANS, fontSize: height * 0.016, fontWeight: 700,
                    color: CLAUDE.INK,
                  }}>{item.name}</div>
                  <div style={{
                    fontFamily: SANS, fontSize: height * 0.013,
                    color: CLAUDE.INK_SOFT,
                  }}>{item.role}</div>
                </div>
              </div>
            );
          })}

          {/* Output chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: `${CLAUDE.SPARK}12`, border: `1.5px solid ${CLAUDE.SPARK}50`,
            borderRadius: 10, padding: '10px 16px', marginTop: 4,
            opacity: clamp(spring({ frame: frame - Math.round(130 * S), fps, config: { damping: 28, stiffness: 80 } }), 0, 1),
          }}>
            <div style={{ fontSize: height * 0.018, lineHeight: 1 }}>📋</div>
            <div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.016, fontWeight: 700,
                color: CLAUDE.SPARK,
              }}>MediPedia</div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT,
              }}>Medical-FAQ chatbot → Jutly Inc. hired her</div>
            </div>
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
