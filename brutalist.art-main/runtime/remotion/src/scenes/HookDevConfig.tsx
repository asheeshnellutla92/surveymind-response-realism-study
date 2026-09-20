import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HookDevConfig — B02 — config formats + matchers + parallel execution.
 */

export const hookDevConfigSchema = z.object({
  sparkLine: z.string().default('Format mismatch is silent. Parallel hooks cannot coordinate.'),
});
export type HookDevConfigProps = z.infer<typeof hookDevConfigSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const MATCHERS = [
  { pattern: '"matcher": "Write"', desc: 'Exact tool name' },
  { pattern: '"matcher": "Read|Write|Edit"', desc: 'Pipe-separated multiples' },
  { pattern: '"matcher": "*"', desc: 'Wildcard — all tools' },
  { pattern: '"matcher": "mcp__.*__delete.*"', desc: 'Regex — MCP delete tools' },
];

export const HookDevConfig: React.FC<HookDevConfigProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const pluginIn = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const settingsIn = spring({ frame: frame - 24, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const matcherIn = spring({ frame: frame - 70, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const parallelIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const matcherSprings = MATCHERS.map((_, i) =>
    spring({ frame: frame - 74 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const FORMAT_TOP = H * 0.27;
  const FORMAT_H = H * 0.38;
  const FORMAT_COL_W = W * 0.42;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        HOOK DEVELOPMENT · CONFIG FORMATS + MATCHERS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Two formats. Not interchangeable.
      </div>

      {/* Plugin format box */}
      <div style={{
        position: 'absolute', top: FORMAT_TOP, left: W * 0.05, width: FORMAT_COL_W,
        opacity: clamp(pluginIn, 0, 1), transform: `translateX(${(1 - clamp(pluginIn, 0, 1)) * -12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#4A7C59', marginBottom: 8 }}>
          PLUGIN FORMAT — hooks/hooks.json
        </div>
        <div style={{
          background: '#FFFFFF', border: `1.5px solid #4A7C59`,
          borderLeft: `5px solid #4A7C59`,
          borderRadius: 10, padding: '14px 18px',
          height: FORMAT_H - 28, boxSizing: 'border-box' as const,
          boxShadow: '0 2px 10px rgba(74,124,89,0.08)',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.6 }}>
            <span style={{ color: CLAUDE.INK_SOFT }}>{'{'}</span>{'\n'}
            {'  '}<span style={{ color: CLAUDE.INK_SOFT }}>"description":</span> <span style={{ color: '#4A7C59' }}>"optional"</span>,{'\n'}
            {'  '}<span style={{ fontWeight: 700, color: CLAUDE.SPARK }}>"hooks":</span> <span style={{ color: CLAUDE.INK_SOFT }}>{'{'}</span>{'\n'}
            {'    '}<span style={{ color: CLAUDE.INK_SOFT }}>"PreToolUse":</span> <span style={{ color: CLAUDE.INK_SOFT }}>[...]</span>,{'\n'}
            {'    '}<span style={{ color: CLAUDE.INK_SOFT }}>"Stop":</span> <span style={{ color: CLAUDE.INK_SOFT }}>[...]</span>{'\n'}
            {'  '}<span style={{ color: CLAUDE.INK_SOFT }}>{'}'}</span>{'\n'}
            <span style={{ color: CLAUDE.INK_SOFT }}>{'}'}</span>
          </div>
          <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 11, color: '#4A7C59', fontWeight: 700 }}>
            Required: <span style={{ fontFamily: MONO }}>"hooks"</span> wrapper key
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            Events nested inside the <span style={{ fontFamily: MONO }}>"hooks"</span> object
          </div>
        </div>
      </div>

      {/* Settings format box */}
      <div style={{
        position: 'absolute', top: FORMAT_TOP, left: W * 0.53, width: FORMAT_COL_W,
        opacity: clamp(settingsIn, 0, 1), transform: `translateX(${(1 - clamp(settingsIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, marginBottom: 8 }}>
          SETTINGS FORMAT — .claude/settings.json
        </div>
        <div style={{
          background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`,
          borderRadius: 10, padding: '14px 18px',
          height: FORMAT_H - 28, boxSizing: 'border-box' as const,
          boxShadow: '0 2px 10px rgba(217,119,87,0.08)',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.6 }}>
            <span style={{ color: CLAUDE.INK_SOFT }}>{'{'}</span>{'\n'}
            {'  '}<span style={{ fontWeight: 700, color: CLAUDE.SPARK }}>"PreToolUse":</span> <span style={{ color: CLAUDE.INK_SOFT }}>[...]</span>,{'\n'}
            {'  '}<span style={{ fontWeight: 700, color: CLAUDE.SPARK }}>"Stop":</span> <span style={{ color: CLAUDE.INK_SOFT }}>[...]</span>{'\n'}
            <span style={{ color: CLAUDE.INK_SOFT }}>{'}'}</span>
          </div>
          <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 11, color: CLAUDE.SPARK, fontWeight: 700 }}>
            No wrapper — events at top level
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            Mixing formats is a <span style={{ fontWeight: 700, color: CLAUDE.SPARK }}>silent failure</span> — no error
          </div>
        </div>
      </div>

      {/* Matchers section */}
      <div style={{
        position: 'absolute',
        top: FORMAT_TOP + FORMAT_H + 12,
        left: W * 0.05, width: W * 0.42,
        opacity: clamp(matcherIn, 0, 1),
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 8 }}>MATCHERS (case-sensitive)</div>
        {MATCHERS.map((m, i) => {
          const op = clamp(matcherSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'center',
              marginBottom: 6, opacity: op,
            }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.SPARK, minWidth: 220 }}>{m.pattern}</span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{m.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Parallel execution callout */}
      <div style={{
        position: 'absolute',
        top: FORMAT_TOP + FORMAT_H + 12,
        left: W * 0.53, width: W * 0.42,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '14px 18px',
        opacity: clamp(parallelIn, 0, 1),
        transform: `translateY(${(1 - clamp(parallelIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, marginBottom: 8 }}>PARALLEL EXECUTION</div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.55 }}>
          All matching hooks run <span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>in parallel</span>. They do not see each other's output. Ordering is non-deterministic.{' '}
          <span style={{ fontWeight: 700 }}>Design for independence.</span>
        </div>
        <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT }}>
          exit 0 → stdout in transcript{'\n'}
          exit 2 → stderr fed back to Claude
        </div>
      </div>

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
