import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * NikBearBrownTerminalAsk — simulation ASK beat for NikBearBrown audience.
 * Teardown palette: flat white ground, INK text, CRIMSON red accent.
 * Dark terminal window; red prompt; command typewriter; segment label.
 * Duration-agnostic — vox_compile.py conforms to actual audio length.
 */
export const nikBearBrownTerminalAskSchema = z.object({
  command:     z.string().default('claude "write a Manim scene: photoelectric effect"'),
  topic:       z.string().default('CLAUDE CODE · MANIM'),
  segment:     z.string().default('PHOTOELECTRIC EFFECT'),
  runningText: z.string().default('running simulation…'),
  output:      z.array(z.string()).optional(),
});
export type NikBearBrownTerminalAskProps = z.infer<typeof nikBearBrownTerminalAskSchema>;

const TERM_BG  = '#111111';
const TERM_BAR = '#1C1C1C';
const TEXT_CLR = '#E8E8EC';
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';

export const NikBearBrownTerminalAsk: React.FC<NikBearBrownTerminalAskProps> = ({
  command, topic, segment, runningText, output,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const PAD_X   = width  * 0.08;
  const MONO_SZ = height * 0.028;

  const topicIn   = spring({frame,           fps, config: SPRING_SMOOTH});
  const segIn     = spring({frame: frame - 4, fps, config: SPRING_SMOOTH});
  const termIn    = spring({frame: frame - 8, fps, config: SPRING_SMOOTH});

  const TYPE_START = 18;
  const TYPE_DUR   = 45;
  const charsShown = Math.min(
    command.length,
    Math.max(0, Math.floor(((frame - TYPE_START) / TYPE_DUR) * command.length)),
  );
  const isTyping = charsShown < command.length;
  const blinkOn  = Math.floor(frame / 11) % 2 === 0;

  const RUN_START = TYPE_START + TYPE_DUR + 8;
  const runPromptOpacity = interpolate(frame, [RUN_START, RUN_START + 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const runningOpacity = interpolate(frame, [RUN_START + 6, RUN_START + 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, overflow: 'hidden'}}>

      {/* Topic eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.10,
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

      {/* Segment label */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.155,
        fontFamily: FONT.display,
        fontSize: height * 0.034,
        fontWeight: 700,
        color: VOX.INK,
        opacity: segIn,
        transform: `translateY(${(1 - segIn) * 10}px)`,
      }}>
        {segment}
      </div>

      {/* Terminal window */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: height * 0.28,
        bottom: height * 0.12,
        backgroundColor: TERM_BG,
        borderRadius: 0,
        overflow: 'hidden',
        opacity: termIn,
        transform: `translateY(${(1 - termIn) * 18}px)`,
        border: `2px solid ${VOX.CRIMSON}`,
      }}>

        {/* Window chrome */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${height * 0.010}px ${height * 0.016}px`,
          borderBottom: '1px solid #2A2A2A',
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
          padding: `${height * 0.024}px ${height * 0.028}px`,
          fontFamily: MONO,
          fontSize: MONO_SZ,
          lineHeight: 1.75,
        }}>
          {/* Prompt + command */}
          <div style={{whiteSpace: 'pre-wrap', overflowWrap: 'break-word', color: TEXT_CLR}}>
            <span style={{color: VOX.CRIMSON, marginRight: 10}}>$</span>
            {command.slice(0, charsShown)}
            {isTyping && blinkOn && (
              <span style={{background: TEXT_CLR, color: TERM_BG}}>▍</span>
            )}
          </div>

          {/* Running indicator */}
          <div style={{
            whiteSpace: 'pre',
            color: '#5A5A5A',
            opacity: runPromptOpacity,
          }}>
            {''}
          </div>
          <div style={{
            color: VOX.CRIMSON,
            fontSize: MONO_SZ * 0.88,
            opacity: runningOpacity,
          }}>
            {`▶  ${runningText}`}
          </div>

          {/* Optional multi-line output block */}
          {output && output.map((line, i) => {
            const lineStart = RUN_START + 18 + i * 10;
            const lineOpacity = interpolate(frame, [lineStart, lineStart + 6], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <div key={i} style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                paddingLeft: '2ch',
                textIndent: '-2ch',
                color: TEXT_CLR,
                fontSize: MONO_SZ * 0.85,
                opacity: lineOpacity,
              }}>
                {line}
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
