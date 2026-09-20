import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { GH, GH_FONT } from '../tokens/github';

export const callChainNodeSchema = z.object({
  k:  z.string().default('src/rough.ts'),
  d:  z.string().default('entry point'),
  hi: z.boolean().optional(),
});

export const gitHubCallChainSchema = z.object({
  nodes:   z.array(callChainNodeSchema).default([
    { k: 'src/rough.ts',         d: '22 lines — the entry' },
    { k: 'RoughCanvas / RoughSVG', d: 'thin surface adapters' },
    { k: 'RoughGenerator',        d: 'assembles the Drawable' },
    { k: 'renderer.ts',           d: 'perturbs every point', hi: true },
    { k: 'OpSet',                  d: 'vector ops out' },
  ]),
  caption: z.string().default('22 lines in, then everything routes through renderer.ts — the load-bearing file.'),
});
export type GitHubCallChainProps = z.infer<typeof gitHubCallChainSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SPRING = { damping: 26, stiffness: 120, mass: 0.9 };

export const GitHubCallChain: React.FC<GitHubCallChainProps> = ({ nodes, caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickIn    = spring({ frame,            fps, config: SPRING });
  const captionIn = spring({ frame: frame - 6, fps, config: SPRING });

  const op = (s: number) => clamp(s, 0, 1);

  return (
    <AbsoluteFill style={{
      background: GH.BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '90px 120px', boxSizing: 'border-box',
    }}>
      {/* Kicker */}
      <div style={{
        position: 'absolute', top: 70, left: 120,
        color: GH.BLUE, fontWeight: 700, fontSize: 24,
        letterSpacing: '0.20em', textTransform: 'uppercase',
        fontFamily: GH_FONT.ui,
        opacity: op(kickIn), transform: `translateY(${(1 - op(kickIn)) * 8}px)`,
      }}>
        Entry points
      </div>

      {/* Chain */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {nodes.map((node, i) => {
          const nodeOp = clamp(
            interpolate(frame, [Math.round(fps * 0.2) + i * 5, Math.round(fps * 0.2) + i * 5 + 12], [0, 1]),
            0, 1,
          );
          return (
            <React.Fragment key={i}>
              <div style={{
                width: 820,
                background: node.hi ? '#0d1a2b' : GH.PANEL,
                border: `1px solid ${node.hi ? GH.BLUE : GH.BORDER}`,
                borderRadius: 12, padding: '22px 30px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                boxShadow: node.hi ? `0 0 0 2px rgba(47,129,247,.4)` : 'none',
                opacity: nodeOp, transform: `translateY(${(1 - nodeOp) * 8}px)`,
              }}>
                <span style={{ fontFamily: GH_FONT.mono, fontSize: 34, color: node.hi ? GH.BLUE : GH.FG }}>
                  {node.k}
                </span>
                <span style={{ fontFamily: GH_FONT.ui, fontSize: 26, color: GH.MUTED }}>
                  {node.d}
                </span>
              </div>

              {/* Arrow between nodes */}
              {i < nodes.length - 1 && (
                <div style={{
                  color: GH.DIM, fontSize: 34, lineHeight: 1, margin: '12px 0',
                  opacity: nodeOp,
                }}>
                  ↓
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 70, left: 120, right: 120,
        color: GH.MUTED, fontSize: 30, fontFamily: GH_FONT.ui,
        opacity: op(captionIn),
      }}>
        {caption}
      </div>
    </AbsoluteFill>
  );
};
