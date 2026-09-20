import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * NikBearBrownOpen — NikBearBrown brand intro beat (B00).
 * Teardown palette: flat white ground, INK text, CRIMSON red accent.
 * Terminal window — prompt `$ nikbearbrown` in red, brand lines reveal staggered.
 * Works at any aspect ratio — all dims are % of viewport.
 */
export const nikBearBrownOpenSchema = z.object({
  topic: z.string().default('NIK BEAR BROWN'),
  lines: z.array(z.string()).default([
    'Nik Bear Brown',
    'Brutalist + Educational AI',
    'Build something. Take it apart.',
    'Explain how it actually works.',
    'Judge the design. Build better.',
  ]),
});
export type NikBearBrownOpenProps = z.infer<typeof nikBearBrownOpenSchema>;

const TERM_BG  = '#111111';
const TERM_BAR = '#1C1C1C';
const TEXT_CLR = '#E8E8EC';
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';

export const NikBearBrownOpen: React.FC<NikBearBrownOpenProps> = ({topic, lines}) => {
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
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, overflow: 'hidden'}}>

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
        color: VOX.SLATE,
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
        borderRadius: 0,
        overflow: 'hidden',
        opacity: termIn,
        transform: `translateY(${(1 - termIn) * 14}px)`,
        border: `2px solid ${VOX.CRIMSON}`,
      }}>

        {/* Window chrome */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${height * 0.010}px ${height * 0.016}px`,
          borderBottom: `1px solid #2A2A2A`,
          backgroundColor: TERM_BAR,
        }}>
          {([VOX.CRIMSON, '#333', '#333'] as string[]).map((c, i) => (
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
            zsh — nikbearbrown
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
            color: VOX.CRIMSON,
            opacity: promptOpacity,
            marginBottom: height * 0.016,
            whiteSpace: 'pre',
          }}>
            $ nikbearbrown
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
                color:      isTitle ? VOX.CRIMSON : TEXT_CLR,
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

      {/* Bottom red rule */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.06,
        width: width * 0.08,
        height: 2,
        backgroundColor: VOX.CRIMSON,
        opacity: topicIn,
      }} />

    </AbsoluteFill>
  );
};
