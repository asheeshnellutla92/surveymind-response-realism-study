import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BuildMcpServerDeployment — B01 — three deployment models + decision matrix.
 */

export const buildMcpServerDeploymentSchema = z.object({
  sparkLine: z.string().default('Remote HTTP default. MCPB for local. stdio for prototypes only.'),
});
export type BuildMcpServerDeploymentProps = z.infer<typeof buildMcpServerDeploymentSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const MODELS = [
  {
    star: true,
    label: 'REMOTE HTTP',
    tag: 'DEFAULT',
    color: '#4A7C59',
    bg: 'rgba(74,124,89,0.06)',
    when: 'Cloud API / SaaS / REST / GraphQL',
    why: 'Zero install · one deploy · OAuth works · any MCP host',
    unless: 'Unless server must touch user\'s local machine',
  },
  {
    star: false,
    label: 'MCPB',
    tag: 'LOCAL REQUIRED',
    color: CLAUDE.SPARK,
    bg: 'rgba(217,119,87,0.06)',
    when: 'Local filesystem · desktop app · localhost services · OS APIs',
    why: 'Packages runtime — no Node/Python install required',
    unless: 'Hand off to build-mcpb skill',
  },
  {
    star: false,
    label: 'LOCAL STDIO',
    tag: 'PROTOTYPE ONLY',
    color: CLAUDE.INK_SOFT,
    bg: 'rgba(61,57,41,0.04)',
    when: 'Personal tools · prototypes',
    why: 'Easy to start — can\'t push updates, requires user runtime',
    unless: 'Flag MCPB upgrade path before leaving',
  },
];

const MATRIX = [
  { scenario: 'Small SaaS API', deploy: 'Remote HTTP', pattern: 'One-per-action' },
  { scenario: 'Large SaaS API (50+ endpoints)', deploy: 'Remote HTTP', pattern: 'Search+execute' },
  { scenario: 'SaaS API with rich UI', deploy: 'MCP app (remote)', pattern: 'One-per-action' },
  { scenario: 'Local desktop app', deploy: 'MCPB', pattern: 'One-per-action' },
  { scenario: 'Local desktop + in-chat UI', deploy: 'MCP app (MCPB)', pattern: 'One-per-action' },
  { scenario: 'Local filesystem R/W', deploy: 'MCPB', pattern: 'Depends on surface' },
  { scenario: 'Personal prototype', deploy: 'Local stdio', pattern: 'Whatever\'s fastest' },
];

export const BuildMcpServerDeployment: React.FC<BuildMcpServerDeploymentProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const modelSprings = MODELS.map((_, i) =>
    spring({ frame: frame - 8 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const matrixIn = spring({ frame: frame - 65, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const rowSprings = MATRIX.map((_, i) =>
    spring({ frame: frame - 70 - i * 6, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const MODEL_W = (W - W * 0.10 - 20) / 3;
  const MODEL_H = H * 0.19;
  const MODEL_TOP = H * 0.21;
  const MATRIX_TOP = H * 0.48;
  const ROW_H = (H * 0.36) / 7 - 3;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BUILD MCP SERVER · DEPLOYMENT MODELS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Recommend one path. Be opinionated.
      </div>

      {MODELS.map((m, i) => {
        const op = clamp(modelSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: MODEL_TOP,
            left: W * 0.05 + i * (MODEL_W + 10),
            width: MODEL_W, height: MODEL_H,
            background: m.bg,
            border: `1.5px solid ${m.color}`,
            borderTop: `4px solid ${m.color}`,
            borderRadius: 12, padding: '12px 14px',
            boxSizing: 'border-box' as const,
            opacity: op, transform: `translateY(${(1 - op) * -10}px)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {m.star && <span style={{ fontFamily: MONO, fontSize: 14, color: m.color }}>⭐</span>}
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: m.color }}>{m.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 600, color: m.color, opacity: 0.7, marginLeft: 4 }}>{m.tag}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: CLAUDE.INK, marginBottom: 5, lineHeight: 1.4 }}>{m.when}</div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.4, marginBottom: 5 }}>{m.why}</div>
            <div style={{ fontFamily: SANS, fontSize: 9, color: m.color, fontStyle: 'italic', lineHeight: 1.4 }}>{m.unless}</div>
          </div>
        );
      })}

      <div style={{
        position: 'absolute', top: MATRIX_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(matrixIn, 0, 1),
      }}>DECISION MATRIX</div>

      {/* Matrix header */}
      <div style={{
        position: 'absolute', top: MATRIX_TOP, left: W * 0.05, right: W * 0.05,
        display: 'flex', gap: 0,
        opacity: clamp(matrixIn, 0, 1),
      }}>
        <div style={{ flex: 2.2, fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, paddingLeft: 10 }}>Scenario</div>
        <div style={{ flex: 1.4, fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>Deployment</div>
        <div style={{ flex: 1.2, fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>Tool Pattern</div>
      </div>

      {MATRIX.map((row, i) => {
        const op = clamp(rowSprings[i], 0, 1);
        const isLocal = row.deploy.includes('MCPB') || row.deploy.includes('stdio');
        const deployColor = row.deploy.includes('stdio') ? CLAUDE.INK_SOFT : row.deploy.includes('MCPB') ? CLAUDE.SPARK : '#4A7C59';
        return (
          <div key={i} style={{
            position: 'absolute',
            top: MATRIX_TOP + 18 + i * (ROW_H + 3),
            left: W * 0.05, right: W * 0.05,
            height: ROW_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 6, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 3px rgba(61,57,41,0.03)',
            opacity: op, transform: `translateX(${(1 - op) * -8}px)`,
          }}>
            <span style={{ flex: 2.2, fontFamily: SANS, fontSize: 10, color: CLAUDE.INK }}>{row.scenario}</span>
            <span style={{ flex: 1.4, fontFamily: MONO, fontSize: 10, fontWeight: 700, color: deployColor }}>{row.deploy}</span>
            <span style={{ flex: 1.2, fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{row.pattern}</span>
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
