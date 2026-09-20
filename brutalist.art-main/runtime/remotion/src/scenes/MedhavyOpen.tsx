import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {MEDHAVY} from '../tokens/medhavy';
import {FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * MedhavyOpen — Medhavy brand intro beat (B00).
 * Terminal window on CREAM ground. Prompt flashes, then brand lines reveal
 * staggered. Title line "Medhavy AI" in TEAL at larger weight; body in light
 * terminal text. Works at any aspect ratio — all dims are % of viewport.
 * Permanent rule: narration_text feeds ElevenLabs "med havy"; on-screen text
 * shows "Medhavy". Never swap.
 */
export const medhavyOpenSchema = z.object({
  topic: z.string().default('MEDHAVY AI'),
  lines: z.array(z.string()).default([
    'Medhavy AI',
    'Also known as Medhavi',
    'मेधावी (Medhavy): From Sanskrit, meaning',
    '"intelligent" or "intellectually brilliant"',
    '— the perfect name for our AI-powered',
    '  intelligent learning systems.',
  ]),
});
export type MedhavyOpenProps = z.infer<typeof medhavyOpenSchema>;

const TERM_BG  = '#1A1A1A';
const TERM_BAR = '#242424';
const TEXT_CLR = '#E8E8EC';
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';

export const MedhavyOpen: React.FC<MedhavyOpenProps> = ({topic, lines}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const PAD_X   = width  * 0.08;
  const MONO_SZ = height * 0.028;

  const topicIn = spring({frame,           fps, config: SPRING_SMOOTH});
  const termIn  = spring({frame: frame - 6, fps, config: SPRING_SMOOTH});

  const promptOpacity = interpolate(frame, [8, 16], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const REVEAL_START = 22;
  const LINE_STRIDE  = 8;

  return (
    <AbsoluteFill style={{backgroundColor: MEDHAVY.CREAM, overflow: 'hidden'}}>

      {/* Topic eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.08,
        fontFamily: FONT.display,
        fontSize: height * 0.016,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: MEDHAVY.SLATE,
        opacity: topicIn * 0.65,
        transform: `translateY(${(1 - topicIn) * 8}px)`,
      }}>
        {topic}
      </div>

      {/* Terminal window */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: height * 0.18,
        bottom: height * 0.10,
        backgroundColor: TERM_BG,
        borderRadius: 8,
        overflow: 'hidden',
        opacity: termIn,
        transform: `translateY(${(1 - termIn) * 14}px)`,
        border: `1px solid #2E2E2E`,
      }}>

        {/* Window chrome */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${height * 0.010}px ${height * 0.016}px`,
          borderBottom: '1px solid #1A1A1A',
          backgroundColor: TERM_BAR,
        }}>
          {([MEDHAVY.TEAL, '#444', '#444'] as string[]).map((c, i) => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%', backgroundColor: c,
            }} />
          ))}
          <span style={{
            marginLeft: 10,
            fontFamily: MONO,
            fontSize: MONO_SZ * 0.72,
            color: '#666',
            letterSpacing: '0.04em',
          }}>
            zsh — medhavy
          </span>
        </div>

        {/* Terminal body */}
        <div style={{
          padding: `${height * 0.026}px ${height * 0.030}px`,
          fontFamily: MONO,
          fontSize: MONO_SZ,
          lineHeight: 1.75,
        }}>

          {/* Prompt flash */}
          <div style={{
            color: MEDHAVY.TEAL,
            opacity: promptOpacity,
            marginBottom: height * 0.016,
            whiteSpace: 'pre',
          }}>
            $ medhavy
          </div>

          {/* Brand lines */}
          {lines.map((line, i) => {
            const start   = REVEAL_START + i * LINE_STRIDE;
            const opacity = interpolate(frame, [start, start + 6], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const yShift  = interpolate(frame, [start, start + 8], [6, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const isTitle = i === 0;
            return (
              <div key={i} style={{
                opacity,
                transform: `translateY(${yShift}px)`,
                whiteSpace: 'pre',
                color:      isTitle ? MEDHAVY.TEAL : TEXT_CLR,
                fontSize:   isTitle ? MONO_SZ * 1.30 : MONO_SZ,
                fontWeight: isTitle ? 700 : 400,
                marginBottom: isTitle ? height * 0.010 : 0,
              }}>
                {line}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom TEAL rule */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.06,
        width: width * 0.08,
        height: 2,
        backgroundColor: MEDHAVY.TEAL,
        opacity: topicIn,
      }} />

    </AbsoluteFill>
  );
};
