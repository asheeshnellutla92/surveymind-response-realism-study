import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * BrutalistAdaptCLI — the Brutalist-standard second opening beat (B00B).
 * Dark terminal showing "the labels are how you adapt it": a comment line
 * marking tagged beats, then two $ claude "..." adaptation commands.
 * Lines fit safe width in both 16:9 and 9:16 via runtime ellipsis — never clips.
 * Teardown palette: #FFFFFF / #2A1A0E / #C8102E.
 * Duration-agnostic — vox_compile.py conforms to actual audio length.
 */
export const brutalistAdaptCLISchema = z.object({
  lines: z.array(z.string()).default([
    '# every beat is tagged →  B00  B04  B12 …',
    '$ claude "swap B04 for a 9:16 diagram"',
    '$ claude "rewrite B07 for high-schoolers"',
  ]),
  topic: z.string().default('TOPIC'),
});
export type BrutalistAdaptCLIProps = z.infer<typeof brutalistAdaptCLISchema>;

const TERM_BG  = '#0C0C0C';
const TERM_BAR = '#141414';
const TEXT_CLR = '#E8E8EC';
const COMMENT_CLR = '#6B9FCC';  // blue-ish comment colour, distinct from prompt
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';

export const BrutalistAdaptCLI: React.FC<BrutalistAdaptCLIProps> = ({
  lines, topic,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const PAD_X   = width  * 0.08;
  const PAD_Y   = height * 0.12;
  const MONO_SZ = height * 0.026;
  const BODY_PAD_H = height * 0.032;

  // Compute safe width per line (ellipsize, never clip)
  const bodyW      = width - 2 * PAD_X - 2 * BODY_PAD_H;
  const charW      = MONO_SZ * 0.605;           // monospace em ≈ 0.605× font-size
  const promptW    = MONO_SZ + 10;              // "$ " span + marginRight
  const maxFull    = Math.max(8,  Math.floor(bodyW / charW));          // no prefix
  const maxAfterPs = Math.max(4,  Math.floor((bodyW - promptW) / charW)); // after "$"

  function safeDisplay(raw: string): { prefix: string; body: string; isComment: boolean } {
    const isComment = raw.trimStart().startsWith('#');
    const isCmd     = raw.startsWith('$ ');
    if (isCmd) {
      const content = raw.slice(2);
      const safe = content.length > maxAfterPs
        ? content.slice(0, maxAfterPs - 1) + '…'
        : content;
      return { prefix: '$ ', body: safe, isComment: false };
    }
    const safe = raw.length > maxFull
      ? raw.slice(0, maxFull - 1) + '…'
      : raw;
    return { prefix: '', body: safe, isComment };
  }

  const dispLines = lines.map(safeDisplay);

  // Staggered entrance
  const topicIn = spring({frame,           fps, config: SPRING_SMOOTH});
  const termIn  = spring({frame: frame - 8,  fps, config: SPRING_SMOOTH});

  // Lines appear staggered — faster than a typewriter (this is a quick scan)
  const LINE_START  = 16;
  const LINE_STRIDE = 10;

  return (
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, overflow: 'hidden'}}>

      {/* Topic eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: FONT.display,
        fontSize: height * 0.018,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: VOX.SLATE,
        opacity: topicIn * 0.7,
        transform: `translateY(${(1 - topicIn) * 8}px)`,
      }}>
        {topic}
      </div>

      {/* Terminal window */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: height * 0.22,
        bottom: height * 0.12,
        backgroundColor: TERM_BG,
        borderRadius: 8,
        overflow: 'hidden',
        opacity: termIn,
        transform: `translateY(${(1 - termIn) * 16}px)`,
        border: '1px solid #2A2A2A',
      }}>

        {/* Window chrome */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${height * 0.012}px ${height * 0.018}px`,
          borderBottom: '1px solid #1E1E1E',
          backgroundColor: TERM_BAR,
        }}>
          {([VOX.CRIMSON, '#555', '#555'] as string[]).map((c, i) => (
            <div key={i} style={{
              width: 13, height: 13, borderRadius: '50%', backgroundColor: c,
            }} />
          ))}
          <span style={{
            marginLeft: 10,
            fontFamily: MONO,
            fontSize: MONO_SZ * 0.82,
            color: '#555',
            letterSpacing: '0.04em',
          }}>
            zsh — adapt this template
          </span>
        </div>

        {/* Terminal body */}
        <div style={{
          padding: `${height * 0.028}px ${BODY_PAD_H}px`,
          fontFamily: MONO,
          fontSize: MONO_SZ,
          lineHeight: 1.9,
        }}>
          {dispLines.map(({prefix, body, isComment}, i) => {
            const start = LINE_START + i * LINE_STRIDE;
            const opacity = interpolate(frame, [start, start + 6], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const yShift = interpolate(frame, [start, start + 8], [6, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <div key={i} style={{
                whiteSpace: 'pre',
                color: isComment ? COMMENT_CLR : TEXT_CLR,
                opacity,
                transform: `translateY(${yShift}px)`,
              }}>
                {prefix
                  ? <><span style={{color: VOX.CRIMSON, marginRight: 10}}>$</span>{body}</>
                  : body
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CRIMSON rule */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.07,
        width: width * 0.08,
        height: 2,
        backgroundColor: VOX.CRIMSON,
        opacity: topicIn,
      }} />

    </AbsoluteFill>
  );
};
