import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * BrutalistCommentCTA — the Brutalist-standard closing CTA beat (B99).
 * Light code-block on the flat-white teardown ground. Comment lines reveal
 * staggered. Variant A/B/C/D shown in the file tab. One red accent (#C8102E).
 * Teardown palette: #FFFFFF / #2A1A0E / #C8102E.
 * Duration-agnostic — vox_compile.py conforms to actual audio length.
 */
export const brutalistCommentCTASchema = z.object({
  filename: z.string().default('onda.ts'),
  code:     z.string().default('// follow for more\n// @nikbearbrown'),
  variant:  z.enum(['A', 'B', 'C', 'D']).default('A'),
  topic:    z.string().default('TOPIC'),
});
export type BrutalistCommentCTAProps = z.infer<typeof brutalistCommentCTASchema>;

const MONO = '"PT Mono", "SF Mono", Menlo, monospace';
const CODE_BG   = '#F7F7F7';
const COMMENT_C = '#6B7280';

export const BrutalistCommentCTA: React.FC<BrutalistCommentCTAProps> = ({
  filename, code, variant, topic,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const PAD_X   = width  * 0.10;
  const MONO_SZ = height * 0.028;

  const headerIn = spring({frame,          fps, config: SPRING_SMOOTH});
  const blockIn  = spring({frame: frame - 6, fps, config: SPRING_SMOOTH});

  const lines = code.split('\n');
  const REVEAL_START = 12;
  const LINE_STRIDE  = 5;

  return (
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, overflow: 'hidden'}}>

      {/* Topic eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.12,
        fontFamily: FONT.display,
        fontSize: height * 0.018,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: VOX.SLATE,
        opacity: headerIn * 0.65,
        transform: `translateY(${(1 - headerIn) * 8}px)`,
      }}>
        {topic}
      </div>

      {/* Code block */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: height * 0.25,
        backgroundColor: CODE_BG,
        border: `1px solid ${VOX.HAIRLINE}`,
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
          borderBottom: `1px solid ${VOX.HAIRLINE}`,
          backgroundColor: '#EDEDED',
        }}>
          {([VOX.CRIMSON, '#999', '#999'] as string[]).map((c, i) => (
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
            color: VOX.CRIMSON,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            {variant}
          </span>
        </div>

        {/* Code lines */}
        <pre style={{
          margin: 0,
          padding: `${height * 0.024}px ${height * 0.028}px`,
          fontFamily: MONO,
          fontSize: MONO_SZ,
          lineHeight: 1.8,
          textAlign: 'left',
        }}>
          {lines.map((line, i) => {
            const start = REVEAL_START + i * LINE_STRIDE;
            const opacity = interpolate(frame, [start, start + 4], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const yShift = interpolate(frame, [start, start + 6], [5, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const isComment = line.trimStart().startsWith('//');
            return (
              <div key={i} style={{
                opacity,
                transform: `translateY(${yShift}px)`,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                paddingLeft: '2ch',
                textIndent: '-2ch',
                color: isComment ? COMMENT_C : VOX.INK,
              }}>
                {line || '​'}
              </div>
            );
          })}
        </pre>
      </div>

      {/* Bottom CRIMSON rule */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.08,
        width: width * 0.06,
        height: 2,
        backgroundColor: VOX.CRIMSON,
        opacity: headerIn,
      }} />

    </AbsoluteFill>
  );
};
