import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {MEDHAVY} from '../tokens/medhavy';
import {FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * MedhavyTerminalAsk — simulation ASK beat for MEDHAVY audience.
 * Medhavy / Okabe-Ito palette on warm-eggshell ground (#F0EAD6).
 * Dark terminal window; TEAL prompt; command typewriter; segment label.
 * Duration-agnostic — vox_compile.py conforms to actual audio length.
 */
export const medhavyTerminalAskSchema = z.object({
  command:     z.string().default('claude "write a Manim scene: photoelectric effect"'),
  topic:       z.string().default('CLAUDE CODE · MANIM'),
  segment:     z.string().default('PHOTOELECTRIC EFFECT'),
  runningText: z.string().default('running simulation…'),
});
export type MedhavyTerminalAskProps = z.infer<typeof medhavyTerminalAskSchema>;

const TERM_BG  = '#1A1A1A';
const TERM_BAR = '#242424';
const TEXT_CLR = '#E8E8EC';
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';

export const MedhavyTerminalAsk: React.FC<MedhavyTerminalAskProps> = ({
  command, topic, segment, runningText,
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
    <AbsoluteFill style={{backgroundColor: MEDHAVY.CREAM, overflow: 'hidden'}}>

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
        top: height * 0.155,
        fontFamily: FONT.display,
        fontSize: height * 0.034,
        fontWeight: 700,
        color: MEDHAVY.INK,
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
        borderRadius: 8,
        overflow: 'hidden',
        opacity: termIn,
        transform: `translateY(${(1 - termIn) * 18}px)`,
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
            zsh — medhavy-sim
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
          <div style={{whiteSpace: 'pre', color: TEXT_CLR}}>
            <span style={{color: MEDHAVY.TEAL, marginRight: 10}}>$</span>
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
            color: MEDHAVY.TEAL,
            fontSize: MONO_SZ * 0.88,
            opacity: runningOpacity,
          }}>
            {`▶  ${runningText}`}
          </div>
        </div>
      </div>

      {/* Bottom TEAL rule */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.07,
        width: width * 0.08,
        height: 2,
        backgroundColor: MEDHAVY.TEAL,
        opacity: topicIn,
      }} />

    </AbsoluteFill>
  );
};
