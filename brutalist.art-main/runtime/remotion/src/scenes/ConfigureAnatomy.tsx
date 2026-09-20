import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ConfigureAnatomy — B01 — 3-mode dispatch + 2 state files + 3 next-step states.
 */

export const configureAnatomySchema = z.object({
  sparkLine: z.string().default('Three modes. Two files. Different restart rules for each.'),
});
export type ConfigureAnatomyProps = z.infer<typeof configureAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const MODES = [
  {
    trigger: '(no args)',
    action: 'Status',
    detail: 'Read both state files · show token, policy, senders, pairings · concrete next step',
    highlight: false,
  },
  {
    trigger: '<token>',
    action: 'Save',
    detail: 'mkdir -p · preserve other keys · write DISCORD_BOT_TOKEN · chmod 600',
    highlight: true,
  },
  {
    trigger: 'clear',
    action: 'Remove',
    detail: 'Delete DISCORD_BOT_TOKEN line — or file if it\'s the only line',
    highlight: false,
  },
];

const FILES = [
  {
    name: '.env',
    path: '~/.claude/channels/discord/.env',
    detail: 'Bot token credential · read once at boot · change needs session restart',
    warn: true,
  },
  {
    name: 'access.json',
    path: '~/.claude/channels/discord/access.json',
    detail: 'Access policy + allowlist · re-read on every inbound message · immediate effect',
    warn: false,
  },
];

const STATES = [
  { label: 'No token set', next: 'Run /discord:configure <token> — get from Developer Portal → Bot → Reset Token' },
  { label: 'Token + pairing, nobody allowed', next: 'DM the bot to get a pair code, then /discord:access pair <code>' },
  { label: 'Token + someone in allowlist', next: 'Ready — DM the bot to reach the assistant' },
];

export const ConfigureAnatomy: React.FC<ConfigureAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const modeSprings = MODES.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const fileSprings = FILES.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const stateSprings = STATES.map((_, i) =>
    spring({ frame: frame - 80 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.38;
  const RIGHT_W = W * 0.44;
  const MODE_H = (H * 0.36) / 3 - 10;
  const FILE_H = (H * 0.18) / 2 - 8;
  const STATE_H = (H * 0.18) / 3 - 7;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CONFIGURE · THREE MODES + TWO STATE FILES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three modes. Two files. Push toward lockdown.
      </div>

      {/* Modes column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(modeSprings[0], 0, 1),
        }}>
          ARGUMENT DISPATCH
        </div>
        {MODES.map((mode, i) => {
          const op = clamp(modeSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: mode.highlight ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${mode.highlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${mode.highlight ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              height: MODE_H, boxSizing: 'border-box' as const,
              boxShadow: mode.highlight ? '0 2px 10px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK }}>{mode.trigger}</span>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK }}>→ {mode.action}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{mode.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Right column: state files + next steps */}
      <div style={{ position: 'absolute', left: W * 0.48, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(fileSprings[0], 0, 1),
        }}>
          STATE FILES
        </div>
        {FILES.map((file, i) => {
          const op = clamp(fileSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${file.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '9px 14px', marginBottom: 9,
              height: FILE_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 2 }}>{file.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, marginBottom: 3 }}>{file.path}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{file.detail}</div>
            </div>
          );
        })}

        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 8, marginTop: 12,
          opacity: clamp(stateSprings[0], 0, 1),
        }}>
          NEXT STEP BY STATE
        </div>
        {STATES.map((state, i) => {
          const op = clamp(stateSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 7,
              height: STATE_H, boxSizing: 'border-box' as const,
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 2 }}>{state.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{state.next}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
