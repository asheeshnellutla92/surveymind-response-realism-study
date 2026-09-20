import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * BrutalistTerminalOpen — the Brutalist-standard intro beat (B00).
 * Dark terminal window on the teardown flat-white ground. The command types
 * itself out with the red prompt, then 8 checklist items tick in staggered.
 * Teardown palette: #FFFFFF / #2A1A0E / #C8102E (one red).
 * Duration-agnostic — vox_compile.py conforms to actual audio length.
 */
export const brutalistTerminalOpenSchema = z.object({
  command:   z.string().default('brutalist explainer-video "title"'),
  checklist: z.array(z.string()).default([
    '✓ palette   teardown  #FFFFFF/#2A1A0E/#C8102E',
    '✓ voice     NikBearBrown',
    '✓ gate      PASS',
  ]),
  topic: z.string().default('TOPIC'),
});
export type BrutalistTerminalOpenProps = z.infer<typeof brutalistTerminalOpenSchema>;

const TERM_BG  = '#0C0C0C';
const TERM_BAR = '#141414';
const TEXT_CLR = '#E8E8EC';
const CHECK_CLR = '#4EC9B0'; // teal tick — only non-teardown accent, earned
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';

export const BrutalistTerminalOpen: React.FC<BrutalistTerminalOpenProps> = ({
  command, checklist, topic,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const PAD_X = width  * 0.08;
  const PAD_Y = height * 0.12;
  const MONO_SZ = height * 0.026;

  // Compute safe command length for this viewport (ellipsize, never clip)
  const bodyW      = width - 2 * PAD_X - 2 * (height * 0.032);
  const charW      = MONO_SZ * 0.605;   // monospace em ≈ 0.605× font-size
  const promptW    = MONO_SZ + 10;      // "$ " span + marginRight
  const maxCmdChars = Math.max(8, Math.floor((bodyW - promptW) / charW));
  const dispCmd = command.length > maxCmdChars
    ? command.slice(0, maxCmdChars - 1) + '…'
    : command;

  // Staggered entrance
  const topicIn  = spring({frame,          fps, config: SPRING_SMOOTH});
  const termIn   = spring({frame: frame - 8,  fps, config: SPRING_SMOOTH});

  // Typewriter — starts at frame 14, spreads over 40 frames
  const TYPE_START = 14;
  const TYPE_DUR   = 40;
  const charsShown = Math.min(
    dispCmd.length,
    Math.max(0, Math.floor(
      ((frame - TYPE_START) / TYPE_DUR) * dispCmd.length,
    )),
  );
  const isTyping = charsShown < dispCmd.length;
  const blinkOn  = Math.floor(frame / 12) % 2 === 0;

  // Checklist items appear staggered after typing finishes
  const LIST_START  = TYPE_START + TYPE_DUR + 6;
  const ITEM_STRIDE = 6;

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
            zsh — brutalist
          </span>
        </div>

        {/* Terminal body */}
        <div style={{
          padding: `${height * 0.028}px ${height * 0.032}px`,
          fontFamily: MONO,
          fontSize: MONO_SZ,
          lineHeight: 1.7,
        }}>

          {/* Prompt + command (dispCmd is pre-ellipsized to safe width) */}
          <div style={{whiteSpace: 'pre', color: TEXT_CLR}}>
            <span style={{color: VOX.CRIMSON, marginRight: 10}}>$</span>
            {dispCmd.slice(0, charsShown)}
            {isTyping && blinkOn && (
              <span style={{background: TEXT_CLR, color: TERM_BG}}>▍</span>
            )}
          </div>

          {/* Checklist */}
          {checklist.map((item, i) => {
            const start = LIST_START + i * ITEM_STRIDE;
            const opacity = interpolate(frame, [start, start + 4], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <div key={i} style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                paddingLeft: '2ch',
                textIndent: '-2ch',
                color: item.startsWith('✓') ? CHECK_CLR : '#6B6B6B',
                opacity,
              }}>
                {item}
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
