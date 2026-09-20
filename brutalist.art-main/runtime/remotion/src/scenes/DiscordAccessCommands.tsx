import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DiscordAccessCommands — B02 — command dispatch + implementation rules.
 */

export const discordAccessCommandsSchema = z.object({
  sparkLine: z.string().default('Read before write. Never auto-pick pending. approved/ dir is the handshake.'),
});
export type DiscordAccessCommandsProps = z.infer<typeof discordAccessCommandsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const COMMANDS = [
  { cmd: '(no args)', action: 'Status', detail: 'dmPolicy · allowFrom list · pending codes + age · group count', color: CLAUDE.INK_SOFT },
  { cmd: 'pair <code>', action: 'Approve pairing', detail: 'validate code + expiry → add to allowFrom → delete pending → write approved/ dir', color: CLAUDE.SPARK },
  { cmd: 'deny <code>', action: 'Reject pairing', detail: 'delete pending[code] and write back', color: CLAUDE.SPARK },
  { cmd: 'allow <id>', action: 'Add to allowlist', detail: 'add senderId to allowFrom (dedupe)', color: '#4A7C59' },
  { cmd: 'remove <id>', action: 'Remove from allowlist', detail: 'filter allowFrom to exclude senderId', color: '#4A7C59' },
  { cmd: 'policy <mode>', action: 'Set DM policy', detail: 'pairing | allowlist | disabled', color: CLAUDE.INK_SOFT },
  { cmd: 'group add/rm', action: 'Channel overrides', detail: 'set requireMention + per-channel allowFrom', color: CLAUDE.INK_SOFT },
  { cmd: 'set <key> <val>', action: 'Delivery config', detail: 'ackReaction · replyToMode · textChunkLimit · chunkMode · mentionPatterns', color: CLAUDE.INK_SOFT },
];

const RULES = [
  { label: 'READ FIRST', detail: 'Always read access.json before writing — channel server may have added pending entries' },
  { label: 'PRETTY JSON', detail: '2-space indent — file must remain hand-editable' },
  { label: 'NO AUTO-PICK', detail: 'Never auto-pick a single pending entry — one entry is an attacker\'s seed' },
];

export const DiscordAccessCommands: React.FC<DiscordAccessCommandsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const cmdSprings = COMMANDS.map((_, i) =>
    spring({ frame: frame - 10 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const ruleSprings = RULES.map((_, i) =>
    spring({ frame: frame - 80 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CMD_TOP = H * 0.27;
  const CMD_H = (H * 0.40) / 8 - 5;
  const RULE_TOP = CMD_TOP + H * 0.40 + 16;
  const RULE_H = (H * 0.20) / 3 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DISCORD ACCESS · COMMAND DISPATCH
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Eight commands. Three implementation rules.
      </div>

      {/* Commands label */}
      <div style={{
        position: 'absolute', top: CMD_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(cmdSprings[0], 0, 1),
      }}>COMMANDS</div>

      {COMMANDS.map((c, i) => {
        const op = clamp(cmdSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: CMD_TOP + i * (CMD_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: CMD_H,
            background: (i === 1 || i === 2) ? 'rgba(217,119,87,0.04)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${c.color}`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center',
            padding: '0 12px', gap: 10,
            boxSizing: 'border-box' as const,
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: c.color, width: 140, flexShrink: 0 }}>{c.cmd}</div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.INK, width: 130, flexShrink: 0 }}>{c.action}</div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, flex: 1 }}>{c.detail}</div>
          </div>
        );
      })}

      {/* Rules label */}
      <div style={{
        position: 'absolute', top: RULE_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(ruleSprings[0], 0, 1),
      }}>IMPLEMENTATION RULES</div>

      {RULES.map((r, i) => {
        const op = clamp(ruleSprings[i], 0, 1);
        const col = i === 2 ? CLAUDE.SPARK : '#4A7C59';
        return (
          <div key={i} style={{
            position: 'absolute',
            top: RULE_TOP + i * (RULE_H + 8),
            left: W * 0.05, right: W * 0.05,
            height: RULE_H,
            background: i === 2 ? 'rgba(217,119,87,0.04)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${col}`,
            borderRadius: 9,
            display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 12,
            boxSizing: 'border-box' as const,
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: col, width: 100, flexShrink: 0 }}>{r.label}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, flex: 1 }}>{r.detail}</div>
          </div>
        );
      })}

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
