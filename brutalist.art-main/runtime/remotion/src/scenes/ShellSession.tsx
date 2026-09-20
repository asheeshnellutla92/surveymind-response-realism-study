import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { SH, SH_FONT } from '../tokens/shell';

export const shellOutputLineSchema = z.object({
  text: z.string().default(''),
  cls:  z.enum(['', 'dim', 'hi']).default(''),
});
export type ShellOutputLine = z.infer<typeof shellOutputLineSchema>;

export const shellSessionSchema = z.object({
  /** Working directory shown in the prompt (e.g. "rough") */
  path:    z.string().default('rough'),
  /** The command that was run */
  command: z.string().default('⚠ SET IN BEAT SHEET'),
  /** Output lines below the prompt */
  out:     z.array(shellOutputLineSchema).default([
    { text: '    1572 total',          cls: 'dim' },
    { text: '     533 src/renderer.ts', cls: 'hi' },
    { text: '     311 src/generator.ts', cls: '' },
    { text: '     153 src/canvas.ts',   cls: '' },
  ]),
  /** Show a blinking caret at a new prompt after output */
  caret:   z.boolean().default(true),
  /** Override the window title bar text (defaults to "user@MacBook-Pro — {path} — zsh") */
  title:   z.string().optional(),
  /** User@host shown in the prompt */
  host:    z.string().default('⚠ SET IN BEAT SHEET'),
});
export type ShellSessionProps = z.infer<typeof shellSessionSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SPRING = { damping: 28, stiffness: 120, mass: 0.9 };

export const ShellSession: React.FC<ShellSessionProps> = ({
  path, command, out, caret, title, host,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowIn  = spring({ frame,            fps, config: SPRING });
  const TYPE_START = Math.round(fps * 0.4);
  const TYPE_DUR   = Math.round(fps * 1.2);
  const charsShown = Math.min(
    command.length,
    Math.max(0, Math.floor(((frame - TYPE_START) / TYPE_DUR) * command.length)),
  );
  const typingDone = charsShown >= command.length;
  const blinkOn = Math.floor(frame / 11) % 2 === 0;

  // Output lines appear after typing completes
  const OUT_START = TYPE_START + TYPE_DUR + Math.round(fps * 0.1);

  const winTitle = title ?? `${host} — ${path} — zsh`;
  const op = (s: number) => clamp(s, 0, 1);

  const lineOutputStyle = (cls: ShellOutputLine['cls']): React.CSSProperties => {
    if (cls === 'dim') return { color: SH.DIM };
    if (cls === 'hi') return {
      background: SH.HI_BG,
      boxShadow: `inset 3px 0 0 ${SH.ACCENT}`,
      padding: '2px 12px', borderRadius: 3, color: '#fff',
    };
    return { color: SH.FG };
  };

  return (
    <AbsoluteFill style={{
      background: SH.STAGE,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Terminal window */}
      <div style={{
        width: 1560,
        background: SH.TERM,
        border: `1px solid ${SH.BORDER}`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 40px 90px rgba(0,0,0,.55)',
        opacity: op(windowIn),
        transform: `translateY(${(1 - op(windowIn)) * 30}px)`,
      }}>
        {/* Title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: SH.BAR, padding: '20px 26px',
          borderBottom: `1px solid ${SH.BORDER}`,
        }}>
          {/* macOS traffic lights */}
          <div style={{ display: 'flex', gap: 11 }}>
            {[SH.DOT_RED, SH.DOT_YEL, SH.DOT_GRN].map((c, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            color: SH.DIM, fontFamily: SH_FONT.mono, fontSize: 24, marginLeft: 8,
          }}>
            {winTitle}
          </div>
        </div>

        {/* Body: prompt + output */}
        <div style={{
          padding: '34px 40px 40px',
          fontFamily: SH_FONT.mono, fontSize: 30, lineHeight: 1.62,
        }}>
          {/* Prompt line with typing command */}
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>
            <span style={{ color: SH.USER }}>{host}</span>
            {' '}
            <span style={{ color: SH.PATH }}>{path}</span>
            {' '}
            <span style={{ color: SH.ACCENT }}>%</span>
            {' '}
            <span style={{ color: SH.CMD }}>{command.slice(0, charsShown)}</span>
            {/* Blinking block caret while typing */}
            {!typingDone && blinkOn && (
              <span style={{
                display: 'inline-block', width: 14, height: 30,
                background: SH.ACCENT, transform: 'translateY(5px)',
                marginLeft: 4, opacity: 0.9,
              }} />
            )}
          </div>

          {/* Output lines — stagger after typing finishes */}
          {out.map((line, i) => {
            const lineOp = clamp(
              interpolate(frame, [OUT_START + i * 6, OUT_START + i * 6 + 10], [0, 1]),
              0, 1,
            );
            return (
              <div key={i} style={{
                whiteSpace: 'pre-wrap',
                opacity: lineOp,
                ...lineOutputStyle(line.cls),
              }}>
                {line.text}
              </div>
            );
          })}

          {/* Optional trailing caret — new prompt after output */}
          {caret && typingDone && (
            <div style={{
              whiteSpace: 'pre-wrap', marginTop: 6,
              opacity: clamp(
                interpolate(frame, [OUT_START + out.length * 6 + 4, OUT_START + out.length * 6 + 10], [0, 1]),
                0, 1,
              ),
            }}>
              <span style={{ color: SH.USER }}>{host}</span>
              {' '}
              <span style={{ color: SH.PATH }}>{path}</span>
              {' '}
              <span style={{ color: SH.ACCENT }}>%</span>
              {blinkOn && (
                <span style={{
                  display: 'inline-block', width: 14, height: 30,
                  background: SH.ACCENT, transform: 'translateY(5px)',
                  marginLeft: 4, opacity: 0.9,
                }} />
              )}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
