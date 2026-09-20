import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BuildMcpbPipeline — B02 — when to use + build pipeline + security invariants.
 */

export const buildMcpbPipelineSchema = z.object({
  sparkLine: z.string().default('Local machine only. No sandbox. Test without your toolchain before shipping.'),
});
export type BuildMcpbPipelineProps = z.infer<typeof buildMcpbPipelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const USE_CASES = [
  { label: 'USE MCPB', color: '#4A7C59', cases: ['Local filesystem read/write', 'Drive a desktop app', 'Localhost services / OS APIs'] },
  { label: 'USE REMOTE HTTP', color: CLAUDE.SPARK, cases: ['Cloud API / SaaS / REST', 'Any server that doesn\'t touch local machine', 'Don\'t pay packaging tax for a URL'] },
];

const PIPELINE_STEPS = [
  { n: '1', cmd: 'npm install', note: 'Install all dependencies' },
  { n: '2', cmd: 'npx esbuild src/index.ts --bundle --platform=node --outfile=server/index.js', note: 'Bundle into one file (or copy node_modules for native deps)' },
  { n: '3', cmd: 'npx @anthropic-ai/mcpb pack', note: 'Zip archive + validate manifest schema' },
];

const INVARIANTS = [
  { icon: '⚠', color: CLAUDE.SPARK, text: 'No sandbox — full user privileges. Validate paths, refuse root escapes, allowlist spawns.' },
  { icon: '✓', color: '#4A7C59', text: 'Check roots/list before hardcoding config: spec-native way to get user-approved directories.' },
  { icon: '⚠', color: CLAUDE.SPARK, text: 'Test on machine without dev toolchain — unbundled dep = works-on-my-machine failure.' },
];

export const BuildMcpbPipeline: React.FC<BuildMcpbPipelineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const useSprings = USE_CASES.map((_, i) =>
    spring({ frame: frame - 8 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const pipeLabelIn = spring({ frame: frame - 42, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const pipeSprings = PIPELINE_STEPS.map((_, i) =>
    spring({ frame: frame - 48 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const invSprings = INVARIANTS.map((_, i) =>
    spring({ frame: frame - 88 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const USE_W = (W - W * 0.10 - 16) / 2;
  const USE_H = H * 0.18;
  const USE_TOP = H * 0.22;
  const PIPE_TOP = H * 0.48;
  const PIPE_H = (H * 0.15) / 3 - 4;
  const INV_TOP = H * 0.70;
  const INV_H = (H * 0.21) / 3 - 5;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BUILD MCPB · WHEN TO USE + PIPELINE + SECURITY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        If your server only hits cloud APIs, stop — use remote HTTP.
      </div>

      {/* Use cases */}
      {USE_CASES.map((uc, i) => {
        const op = clamp(useSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute', top: USE_TOP,
            left: W * 0.05 + i * (USE_W + 16), width: USE_W, height: USE_H,
            background: i === 0 ? 'rgba(74,124,89,0.05)' : 'rgba(217,119,87,0.05)',
            border: `1.5px solid ${uc.color}`,
            borderTop: `4px solid ${uc.color}`,
            borderRadius: 12, padding: '12px 14px', boxSizing: 'border-box' as const,
            opacity: op, transform: `translateY(${(1 - op) * -10}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: uc.color, marginBottom: 10 }}>{uc.label}</div>
            {uc.cases.map((c, j) => (
              <div key={j} style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.8 }}>· {c}</div>
            ))}
          </div>
        );
      })}

      {/* Build pipeline */}
      <div style={{
        position: 'absolute', top: PIPE_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(pipeLabelIn, 0, 1),
      }}>NODE BUILD PIPELINE</div>

      {PIPELINE_STEPS.map((step, i) => {
        const op = clamp(pipeSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: PIPE_TOP + i * (PIPE_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: PIPE_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid #4A7C59`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 12px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 3px rgba(61,57,41,0.03)',
            opacity: op, transform: `translateX(${(1 - op) * -8}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#4A7C59', minWidth: 20 }}>{step.n}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' as const, textOverflow: 'ellipsis' }}>{step.cmd}</span>
            <span style={{ fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, minWidth: 200, textAlign: 'right' as const }}>{step.note}</span>
          </div>
        );
      })}

      {/* Security invariants */}
      {INVARIANTS.map((inv, i) => {
        const op = clamp(invSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: INV_TOP + i * (INV_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: INV_H,
            background: i === 0 || i === 2 ? 'rgba(217,119,87,0.04)' : 'rgba(74,124,89,0.04)',
            border: `1px solid ${inv.color}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 14px', boxSizing: 'border-box' as const,
            opacity: op, transform: `translateY(${(1 - op) * 6}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 14, color: inv.color, flexShrink: 0 }}>{inv.icon}</span>
            <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{inv.text}</span>
          </div>
        );
      })}

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
