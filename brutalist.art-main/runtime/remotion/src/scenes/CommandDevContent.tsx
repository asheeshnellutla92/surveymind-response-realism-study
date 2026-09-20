import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CommandDevContent — B02 — instructions rule + four command patterns.
 */

export const commandDevContentSchema = z.object({
  sparkLine: z.string().default('The body is Claude\'s directive. Write it that way.'),
});
export type CommandDevContentProps = z.infer<typeof commandDevContentSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PATTERNS = [
  {
    label: 'REVIEW',
    tools: 'Read, Bash(git:*)',
    body: '!`git diff --name-only` → review each file for quality, bugs, test coverage',
    color: CLAUDE.SPARK,
  },
  {
    label: 'TESTING',
    tools: 'Bash(npm:*)',
    body: '!`npm test $1` → analyze failures and suggest fixes',
    color: '#4A7C59',
  },
  {
    label: 'DOCS',
    tools: '(none)',
    body: '@$1 → generate comprehensive docs: functions, params, return values, examples',
    color: CLAUDE.SPARK,
  },
  {
    label: 'WORKFLOW',
    tools: 'Bash(gh:*), Read',
    body: '!`gh pr view $1` → numbered phases: fetch → review → check → approve/request',
    color: '#4A7C59',
  },
];

export const CommandDevContent: React.FC<CommandDevContentProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const ruleIn = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const patternSprings = PATTERNS.map((_, i) =>
    spring({ frame: frame - 76 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const RULE_TOP = H * 0.27;
  const PATTERN_TOP = H * 0.56;
  const PATTERN_H = (H * 0.35) / 4 - 9;

  const wrongOp = clamp(ruleIn, 0, 1);
  const rightOp = clamp(spring({ frame: frame - 24, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } }), 0, 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        COMMAND DEVELOPMENT · INSTRUCTIONS RULE + PATTERNS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Instructions for Claude, not messages to users.
      </div>

      {/* Wrong / Right comparison */}
      <div style={{ position: 'absolute', top: RULE_TOP, left: W * 0.05, right: W * 0.05, display: 'flex', gap: 16 }}>
        {/* Wrong */}
        <div style={{
          flex: 1, background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`,
          borderRadius: 12, padding: '14px 18px',
          opacity: wrongOp, transform: `translateX(${(1 - wrongOp) * -12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.SPARK, marginBottom: 8 }}>✗ WRONG — message to user</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.5 }}>
            This command will review your code for security issues. You will receive a detailed report with findings.
          </div>
        </div>
        {/* Right */}
        <div style={{
          flex: 1, background: 'rgba(74,124,89,0.06)', border: `1.5px solid #4A7C59`,
          borderLeft: `5px solid #4A7C59`,
          borderRadius: 12, padding: '14px 18px',
          opacity: rightOp, transform: `translateX(${(1 - rightOp) * 12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 8 }}>✓ CORRECT — directive for Claude</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.5 }}>
            Review this code for SQL injection, XSS attacks, and authentication issues. Provide specific line numbers and severity ratings.
          </div>
        </div>
      </div>

      {/* Patterns section label */}
      <div style={{
        position: 'absolute', top: PATTERN_TOP - 26, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(patternSprings[0], 0, 1),
      }}>
        FOUR COMMON PATTERNS
      </div>

      {/* Pattern cards */}
      {PATTERNS.map((p, i) => {
        const op = clamp(patternSprings[i], 0, 1);
        const colLeft = i % 2 === 0 ? W * 0.05 : W * 0.52;
        const rowTop = PATTERN_TOP + Math.floor(i / 2) * (PATTERN_H + 10);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: colLeft, top: rowTop,
            width: W * 0.42,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderTop: `3px solid ${p.color}`,
            borderRadius: 10, padding: '11px 14px',
            height: PATTERN_H, boxSizing: 'border-box' as const,
            boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
            opacity: op, transform: `translateY(${(1 - op) * 10}px)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: p.color }}>{p.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, background: 'rgba(61,57,41,0.06)', padding: '2px 7px', borderRadius: 4 }}>{p.tools}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{p.body}</div>
          </div>
        );
      })}

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 26, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
