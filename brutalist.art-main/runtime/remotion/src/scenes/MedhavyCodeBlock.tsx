import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {MEDHAVY} from '../tokens/medhavy';
import {FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * MedhavyCodeBlock — simulation CODE beat for MEDHAVY audience.
 * Medhavy / Okabe-Ito palette on warm-eggshell ground (#F0EAD6).
 * Light code-block; TEAL accent in file tab; lines reveal staggered.
 * Duration-agnostic — vox_compile.py conforms to actual audio length.
 */
export const medhavyCodeBlockSchema = z.object({
  filename: z.string().default('sim.py'),
  segment:  z.string().default('SIMULATION'),
  topic:    z.string().default('QUANTUM MECHANICS'),
  code:     z.string().default('# code'),
});
export type MedhavyCodeBlockProps = z.infer<typeof medhavyCodeBlockSchema>;

const MONO = '"PT Mono", "SF Mono", Menlo, monospace';
const CODE_BG     = '#F4F0E8';
const COMMENT_CLR = '#6B7280';
const OUTPUT_CLR  = '#4D4D4D';

export const MedhavyCodeBlock: React.FC<MedhavyCodeBlockProps> = ({
  filename, segment, topic, code,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const PAD_X   = width  * 0.08;
  const MONO_SZ = height * 0.026;

  const topicIn  = spring({frame,           fps, config: SPRING_SMOOTH});
  const segIn    = spring({frame: frame - 4, fps, config: SPRING_SMOOTH});
  const blockIn  = spring({frame: frame - 8, fps, config: SPRING_SMOOTH});

  const lines = code.split('\n');
  const REVEAL_START = 14;
  const LINE_STRIDE  = 4;

  return (
    <AbsoluteFill style={{backgroundColor: MEDHAVY.CREAM, overflow: 'hidden'}}>

      {/* Topic eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.06,
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

      {/* Segment label */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.11,
        fontFamily: FONT.display,
        fontSize: height * 0.028,
        fontWeight: 700,
        color: MEDHAVY.INK,
        opacity: segIn,
        transform: `translateY(${(1 - segIn) * 10}px)`,
      }}>
        {segment}
      </div>

      {/* Code block */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: height * 0.22,
        bottom: height * 0.08,
        backgroundColor: CODE_BG,
        border: `1px solid #D8D4CC`,
        borderRadius: 6,
        overflow: 'hidden',
        opacity: blockIn,
        transform: `translateY(${(1 - blockIn) * 14}px)`,
      }}>

        {/* File tab */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${height * 0.010}px ${height * 0.016}px`,
          borderBottom: `1px solid #D8D4CC`,
          backgroundColor: '#EAE6DE',
        }}>
          {([MEDHAVY.TEAL, '#AAA', '#AAA'] as string[]).map((c, i) => (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: '50%', backgroundColor: c,
            }} />
          ))}
          <span style={{
            marginLeft: 10,
            fontFamily: MONO,
            fontSize: MONO_SZ * 0.72,
            color: '#666',
            letterSpacing: '0.04em',
          }}>
            {filename}
          </span>
          <span style={{
            marginLeft: 'auto',
            fontFamily: FONT.display,
            fontSize: MONO_SZ * 0.65,
            fontWeight: 700,
            color: MEDHAVY.TEAL,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            python
          </span>
        </div>

        {/* Code lines */}
        <pre style={{
          margin: 0,
          padding: `${height * 0.022}px ${height * 0.026}px`,
          fontFamily: MONO,
          fontSize: MONO_SZ,
          lineHeight: 1.75,
          textAlign: 'left',
          overflow: 'hidden',
        }}>
          {lines.map((line, i) => {
            const start = REVEAL_START + i * LINE_STRIDE;
            const opacity = interpolate(frame, [start, start + 4], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const yShift = interpolate(frame, [start, start + 6], [5, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const isComment = line.trimStart().startsWith('#');
            const isOutput  = line.trimStart().startsWith('# ') &&
                              (line.includes('nm') || line.includes('eV') ||
                               line.includes('pm') || line.includes('RJ') ||
                               line.includes('P=') || line.includes('x='));
            const color = isOutput
              ? OUTPUT_CLR
              : isComment
              ? COMMENT_CLR
              : MEDHAVY.INK;
            return (
              <div key={i} style={{
                opacity,
                transform: `translateY(${yShift}px)`,
                whiteSpace: 'pre',
                color,
              }}>
                {line || '​'}
              </div>
            );
          })}
        </pre>
      </div>

      {/* Bottom TEAL rule */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.03,
        width: width * 0.08,
        height: 2,
        backgroundColor: MEDHAVY.TEAL,
        opacity: topicIn,
      }} />

    </AbsoluteFill>
  );
};
