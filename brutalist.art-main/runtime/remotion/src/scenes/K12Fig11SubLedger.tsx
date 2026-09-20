import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig11SubLedger — "Substitution Ledger for Fluency Practice"
 * Source: Agent Skills for K-12 Teachers (Anthropic) — k12-fluency-scaffolding
 *
 * 5-row table: Role | Verdict. Rows animate in staggered.
 * Phase 2 (PHASE_SWITCH=120): Row 1 and Row 5 get terracotta left-border highlight (the two poles).
 */

export const k12Fig11SubLedgerSchema = z.object({
  sparkLine: z.string().default("Five roles. Three verdicts. The reader is never substitutable."),
});
export type K12Fig11SubLedgerProps = z.infer<typeof k12Fig11SubLedgerSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PHASE_SWITCH = 120;


type Verdict = 'NEVER' | 'AI_GEN' | 'AI_SUB' | 'HUMAN_PREF' | 'HUMAN_REQ';

interface Row {
  role: string;
  verdict: Verdict;
  verdictLabel: string;
  icon?: string;
}

const ROWS: Row[] = [
  {
    role: 'Reader (the child)',
    verdict: 'NEVER',
    verdictLabel: 'NEVER substitutable',
  },
  {
    role: 'Text (passages)',
    verdict: 'AI_GEN',
    verdictLabel: 'AI-generatable ✓',
  },
  {
    role: 'Listener / Error-catcher',
    verdict: 'AI_SUB',
    verdictLabel: 'AI-substitutable',
    icon: '⚡',
  },
  {
    role: 'Prosody model',
    verdict: 'HUMAN_PREF',
    verdictLabel: 'Human-preferred',
  },
  {
    role: 'Motivation / Relationship',
    verdict: 'HUMAN_REQ',
    verdictLabel: 'HUMAN-required',
  },
];

const VERDICT_STYLE: Record<Verdict, {
  bg: string; border: string; color: string; fontWeight: number;
}> = {
  NEVER: {
    bg: '#1A1A18', border: '#D97757',
    color: '#FAF9F5', fontWeight: 700,
  },
  AI_GEN: {
    bg: '#FAF9F5', border: '#E5E3DD',
    color: '#6B6B68', fontWeight: 400,
  },
  AI_SUB: {
    bg: '#FAF9F5', border: '#E5E3DD',
    color: '#6B6B68', fontWeight: 400,
  },
  HUMAN_PREF: {
    bg: '#F1EFE7', border: '#E5E3DD',
    color: '#6B6B68', fontWeight: 400,
  },
  HUMAN_REQ: {
    bg: '#D97757', border: '#D97757',
    color: '#FAF9F5', fontWeight: 700,
  },
};

const ROW_H = 68;
const ROW_GAP = 6;

export const K12Fig11SubLedger: React.FC<K12Fig11SubLedgerProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 18, stiffness: 80 } });
  const showP2 = frame >= PHASE_SWITCH;
  const phase2Prog = clamp(phase2In, 0, 1);

  const tableY = height * 0.27;
  const tableW = width - PAD_X * 2;
  const roleColW = tableW * 0.60;
  const verdictColW = tableW * 0.40;

  return (
    <AbsoluteFill style={{ background: '#FAF9F5', overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: '#6B6B68', opacity: clamp(titleIn, 0, 1),
      }}>
        FLUENCY PRACTICE · SUBSTITUTION LEDGER
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.052,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: '#1A1A18', opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        5 roles. 3 verdicts.
      </div>

      {/* Table header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: tableY - 36,
        width: tableW,
        display: 'flex', alignItems: 'center',
        borderBottom: `2px solid #1A1A18`,
        paddingBottom: 6,
        opacity: clamp(titleIn, 0, 1),
      }}>
        <div style={{
          width: roleColW,
          fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase' as const, color: '#6B6B68',
        }}>
          Role
        </div>
        <div style={{
          width: verdictColW,
          fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase' as const, color: '#6B6B68',
          textAlign: 'right' as const,
        }}>
          Verdict
        </div>
      </div>

      {/* Rows */}
      {ROWS.map((row, ri) => {
        const rowIn = spring({
          frame: frame - 20 - ri * 8,
          fps,
          config: { damping: 18, stiffness: 80 },
        });
        const rowProg = clamp(rowIn, 0, 1);

        const isEven = ri % 2 === 0;
        const rowBg = isEven ? '#FFFFFF' : '#F5F4EE';

        const isPole = ri === 0 || ri === 4;
        const leftBorderColor = isPole && showP2
          ? '#D97757'
          : 'transparent';
        const leftBorderW = isPole && showP2
          ? interpolate(phase2Prog, [0, 1], [0, 4])
          : 0;

        const vs = VERDICT_STYLE[row.verdict];

        const rowY = tableY + ri * (ROW_H + ROW_GAP);

        return (
          <div key={ri} style={{
            position: 'absolute',
            left: PAD_X, top: rowY,
            width: tableW, height: ROW_H,
            background: rowBg,
            borderRadius: 6,
            display: 'flex', alignItems: 'center',
            opacity: rowProg,
            transform: `translateX(${(1 - rowProg) * -24}px)`,
            overflow: 'hidden',
          }}>
            {/* Left accent bar */}
            <div style={{
              width: leftBorderW,
              height: '100%',
              background: leftBorderColor,
              flexShrink: 0,
              transition: 'none',
            }} />

            {/* Role */}
            <div style={{
              width: roleColW - 8,
              paddingLeft: isPole && showP2 ? 12 : 16,
              fontFamily: SERIF, fontSize: height * 0.018,
              fontWeight: isPole ? 600 : 400,
              color: '#1A1A18',
              lineHeight: 1.3,
            }}>
              {row.role}
            </div>

            {/* Verdict tag */}
            <div style={{
              marginLeft: 'auto',
              marginRight: 12,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: vs.bg,
              border: `1.5px solid ${vs.border}`,
              borderRadius: 5,
              padding: '5px 12px',
              fontFamily: SANS, fontSize: height * 0.012,
              fontWeight: vs.fontWeight,
              color: vs.color,
              whiteSpace: 'nowrap' as const,
            }}>
              {row.icon && <span>{row.icon}</span>}
              {row.verdictLabel}
            </div>
          </div>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Agent Skills for K-12 Teachers (Anthropic)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: '#1A1A18' }}>
          {sparkLine}
        </span>
      </div>
    
      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>
    </AbsoluteFill>

  );
};
