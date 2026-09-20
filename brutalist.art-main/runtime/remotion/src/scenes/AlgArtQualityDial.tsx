import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AlgArtQualityDial — typographic beat stacking the craftsmanship phrases
 * from the algorithmic-art SKILL.md. Each phrase stamped like a spec.
 * Terracotta counter ticks how many times the skill repeats the instruction.
 * Narration makes the Teardown point: repetition steers the quality register.
 * Source: Anthropic, algorithmic-art SKILL.md.
 */

export const algArtQualityDialSchema = z.object({
  sparkLine: z.string().default('Framing the register.'),
});
export type AlgArtQualityDialProps = z.infer<typeof algArtQualityDialSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PHRASES = [
  { text: 'meticulously crafted algorithm', count: 6 },
  { text: 'the product of deep computational expertise', count: 4 },
  { text: 'painstaking optimization', count: 3 },
  { text: 'master-level implementation', count: 5 },
];

const PHRASE_STRIDE = 50; // frames per phrase

interface PhraseProps {
  text: string;
  count: number;
  opacity: number;
  translateY: number;
  delay: number;
  frame: number;
}

const Phrase: React.FC<PhraseProps> = ({ text, count, opacity, translateY, delay, frame }) => {
  // Tick counter from 0 to count over PHRASE_STRIDE frames after delay
  const tickProgress = clamp(interpolate(frame, [delay + 8, delay + PHRASE_STRIDE], [0, count]), 0, count);
  const currentTick = Math.floor(tickProgress);

  return (
    <div style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      marginBottom: 4,
    }}>
      {/* Phrase */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 32,
        fontStyle: 'italic',
        color: CLAUDE.INK,
        flex: 1,
        lineHeight: 1.35,
      }}>
        "{text}"
      </div>

      {/* Terracotta counter */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        width: 72,
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 38,
          fontWeight: 700,
          color: CLAUDE.SPARK,
          lineHeight: 1,
        }}>
          ×{currentTick}
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 9,
          color: CLAUDE.GHOST,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
          marginTop: 2,
        }}>
          in SKILL.md
        </div>
      </div>

      {/* Spec stamp */}
      <div style={{
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 6,
        padding: '4px 10px',
        fontFamily: SANS,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        flexShrink: 0,
      }}>
        SPEC
      </div>
    </div>
  );
};

export const AlgArtQualityDial: React.FC<AlgArtQualityDialProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const eyebrowIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const headIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({
    frame: frame - (PHRASES.length * PHRASE_STRIDE + 30),
    fps, config: { damping: 28, stiffness: 110, mass: 1.0 },
  });

  // Caveat appears after all phrases
  const caveatsIn = clamp(
    interpolate(frame, [PHRASES.length * PHRASE_STRIDE + 15, PHRASES.length * PHRASE_STRIDE + 35], [0, 1]),
    0, 1
  );

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: H * 0.07,
        left: W * 0.07,
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(eyebrowIn, 0, 1),
      }}>
        THE TEARDOWN MOMENT · QUALITY REGISTER
      </div>

      {/* Section heading */}
      <div style={{
        position: 'absolute',
        top: H * 0.13,
        left: W * 0.07,
        fontFamily: SERIF,
        fontSize: 40,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headIn, 0, 1),
        transform: `translateY(${(1 - clamp(headIn, 0, 1)) * 10}px)`,
      }}>
        How a Skill Sets Its Own Standards
      </div>

      {/* Phrases stack */}
      <div style={{
        position: 'absolute',
        top: H * 0.26,
        left: W * 0.07,
        right: W * 0.07,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}>
        {PHRASES.map((phrase, i) => {
          const delay = i * PHRASE_STRIDE;
          const phraseIn = spring({
            frame: frame - delay,
            fps, config: { damping: 28, stiffness: 120, mass: 0.9 },
          });
          const op = clamp(phraseIn, 0, 1);
          const ty = (1 - op) * 14;
          return (
            <Phrase
              key={i}
              text={phrase.text}
              count={phrase.count}
              opacity={op}
              translateY={ty}
              delay={delay}
              frame={frame}
            />
          );
        })}
      </div>

      {/* Honest caveat */}
      <div style={{
        position: 'absolute',
        bottom: H * 0.18,
        left: W * 0.07,
        right: W * 0.07,
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK_SOFT,
        lineHeight: 1.5,
        opacity: caveatsIn,
        transform: `translateY(${(1 - caveatsIn) * 8}px)`,
      }}>
        Honest caveat: framing isn't competence. The skill also bans random RGB,
        demands color harmony, composition, balance, and reproducibility.
        The algorithm still has to earn it.
      </div>

      {/* Source citation */}
      <div style={{
        position: 'absolute',
        right: W * 0.07,
        bottom: H * 0.11,
        fontFamily: SANS,
        fontSize: 10,
        color: CLAUDE.GHOST,
        opacity: caveatsIn,
      }}>
        Source: Anthropic, algorithmic-art SKILL.md
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: W * 0.07,
        bottom: H * 0.06,
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
