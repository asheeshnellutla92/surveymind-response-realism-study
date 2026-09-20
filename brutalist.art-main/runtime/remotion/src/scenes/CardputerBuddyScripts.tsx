import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CardputerBuddyScripts — B02 — four dev-loop scripts + when to use each.
 */

export const cardputerBuddyScriptsSchema = z.object({
  sparkLine: z.string().default('install_apps for full sync. push for one file. tail to watch. repl for one-shot probes.'),
});
export type CardputerBuddyScriptsProps = z.infer<typeof cardputerBuddyScriptsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const SCRIPTS = [
  {
    name: 'install_apps.py',
    when: 'Full sync — added or renamed files',
    cmd: 'python3 onboard/scripts/install_apps.py --port <PORT> --src buddy',
    color: CLAUDE.SPARK,
    highlight: true,
  },
  {
    name: 'push.py',
    when: 'Single changed file — faster loop',
    cmd: 'python3 buddy/scripts/push.py --port <PORT> --files apps/timer.py',
    color: '#4A7C59',
    highlight: true,
  },
  {
    name: 'tail_serial.py',
    when: 'Stream device logs while testing',
    cmd: 'python3 buddy/scripts/tail_serial.py --port <PORT>',
    color: CLAUDE.INK_SOFT,
    highlight: false,
  },
  {
    name: 'repl_run.py',
    when: 'One-shot REPL expression or diagnostic',
    cmd: 'python3 buddy/scripts/repl_run.py --port <PORT> --script "import os; print(os.listdir(\'/flash\'))"',
    color: CLAUDE.INK_SOFT,
    highlight: false,
  },
];

export const CardputerBuddyScripts: React.FC<CardputerBuddyScriptsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const scriptSprings = SCRIPTS.map((_, i) =>
    spring({ frame: frame - 8 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const portIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const confuseIn = spring({ frame: frame - 96, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const SCRIPT_H = H * 0.135;
  const SCRIPTS_TOP = H * 0.22;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CARDPUTER BUDDY · DEV-LOOP SCRIPTS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Four scripts. Know which push to reach for.
      </div>

      {SCRIPTS.map((s, i) => {
        const op = clamp(scriptSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: SCRIPTS_TOP + i * (SCRIPT_H + 8),
            left: W * 0.05, right: W * 0.05,
            height: SCRIPT_H,
            background: s.highlight ? (i === 0 ? 'rgba(217,119,87,0.05)' : 'rgba(74,124,89,0.05)') : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${s.color}`,
            borderRadius: 8,
            padding: '10px 14px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: s.color }}>{s.name}</span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK }}>{s.when}</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: CLAUDE.INK_SOFT, overflow: 'hidden', whiteSpace: 'nowrap' as const, textOverflow: 'ellipsis' }}>{s.cmd}</div>
          </div>
        );
      })}

      {/* PORT note */}
      <div style={{
        position: 'absolute', bottom: H * 0.23, left: W * 0.05, right: W * 0.05,
        background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, padding: '8px 14px', boxSizing: 'border-box' as const,
        display: 'flex', gap: 10, alignItems: 'center',
        opacity: clamp(portIn, 0, 1),
      }}>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.INK_SOFT, minWidth: 40 }}>PORT</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>/dev/cu.usbmodem*</span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>macOS</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK, marginLeft: 16 }}>/dev/ttyACM*</span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>Linux</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK, marginLeft: 16 }}>COM*</span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>Windows — from detect.py at provisioning</span>
      </div>

      {/* Push confusion callout */}
      <div style={{
        position: 'absolute', bottom: H * 0.13, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '7px 14px', boxSizing: 'border-box' as const,
        display: 'flex', gap: 10, alignItems: 'center',
        opacity: clamp(confuseIn, 0, 1),
      }}>
        <svg width={14} height={14} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L11 22l8.91-10.96A1 1 0 0019 9.5H13.5L13 2z" fill={CLAUDE.SPARK} />
        </svg>
        <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK }}>
          <span style={{ fontWeight: 700 }}>install_apps.py vs push.py:</span>
          {' install_apps pushes the full apps directory; push.py targets named files. Use push.py for a single changed file.'}
        </span>
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
