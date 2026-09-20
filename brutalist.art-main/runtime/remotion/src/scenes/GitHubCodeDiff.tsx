import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { GH, GH_FONT } from '../tokens/github';

export const diffLineSchema = z.object({
  gutter: z.string().default(''),
  text:   z.string().default(''),
  kind:   z.enum(['context', 'add', 'del']).default('context'),
});
export type DiffLine = z.infer<typeof diffLineSchema>;

export const gitHubCodeDiffSchema = z.object({
  file:    z.string().default('claude-style-tokens.js'),
  badge:   z.string().default('+1 −1'),
  lines:   z.array(diffLineSchema).default([
    { gutter: '12', text: 'const seedFromKey = k =>', kind: 'context' },
    { gutter: '-',  text: '  parseInt(sha256(k).slice(0,8), 16);', kind: 'del' },
    { gutter: '+',  text: '  parseInt(sha256(k).slice(0,8), 16) || 1;', kind: 'add' },
  ]),
  caption: z.string().default('seed 0 silently falls back to Math.random() — guard it.'),
});
export type GitHubCodeDiffProps = z.infer<typeof gitHubCodeDiffSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SPRING = { damping: 26, stiffness: 120, mass: 0.9 };

const kindStyle = (kind: DiffLine['kind']): React.CSSProperties => {
  if (kind === 'add') return { background: GH.ADD_BG };
  if (kind === 'del') return { background: GH.DEL_BG };
  return {};
};
const gutterColor = (kind: DiffLine['kind']): string => {
  if (kind === 'add') return GH.GREEN;
  if (kind === 'del') return GH.RED;
  return GH.DIM;
};

export const GitHubCodeDiff: React.FC<GitHubCodeDiffProps> = ({
  file, badge, lines, caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn   = spring({ frame,           fps, config: SPRING });
  const captionIn = spring({ frame: frame - 8, fps, config: SPRING });

  const op = (s: number) => clamp(s, 0, 1);

  return (
    <AbsoluteFill style={{
      background: GH.BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 0,
    }}>
      {/* Panel */}
      <div style={{
        width: 1500,
        background: GH.PANEL, border: `1px solid ${GH.BORDER}`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,.5)',
        opacity: op(panelIn), transform: `translateY(${(1 - op(panelIn)) * 30}px)`,
      }}>
        {/* Header: file + badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '22px 28px', borderBottom: `1px solid ${GH.BORDER}`,
          fontFamily: GH_FONT.ui, fontSize: 28,
        }}>
          <span style={{ fontSize: 24 }}>📄</span>
          <span style={{ color: GH.FG, fontWeight: 700 }}>{file}</span>
          <div style={{
            marginLeft: 'auto', fontFamily: GH_FONT.mono, fontSize: 22,
            color: GH.MUTED, border: `1px solid ${GH.BORDER}`,
            borderRadius: 8, padding: '6px 14px',
          }}>
            {badge}
          </div>
        </div>

        {/* Code rows */}
        <div style={{ fontFamily: GH_FONT.mono, fontSize: 30, lineHeight: 1.7, padding: '20px 0' }}>
          {lines.map((ln, i) => {
            const lineOp = clamp(
              interpolate(frame, [Math.round(fps * 0.25) + i * 6, Math.round(fps * 0.25) + i * 6 + 10], [0, 1]),
              0, 1,
            );
            return (
              <div key={i} style={{
                display: 'flex', whiteSpace: 'pre',
                opacity: lineOp,
                ...kindStyle(ln.kind),
              }}>
                <span style={{
                  width: 70, textAlign: 'center', color: gutterColor(ln.kind),
                  flexShrink: 0,
                }}>
                  {ln.gutter}
                </span>
                <span style={{ paddingRight: 30, color: GH.BODY }}>{ln.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption below panel */}
      <div style={{
        width: 1500, padding: '20px 0',
        color: GH.MUTED, fontSize: 26, fontFamily: GH_FONT.ui,
        opacity: op(captionIn),
      }}>
        {caption}
      </div>
    </AbsoluteFill>
  );
};
