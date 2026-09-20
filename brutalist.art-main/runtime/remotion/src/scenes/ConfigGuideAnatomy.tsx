import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ConfigGuideAnatomy — B01 — four-layer config model + five reference files.
 */

export const configGuideAnatomySchema = z.object({
  sparkLine: z.string().default('Four layers. Five reference files. Always verify with debug-plugins.'),
});
export type ConfigGuideAnatomyProps = z.infer<typeof configGuideAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LAYERS = [
  { num: '1', name: 'agents', detail: 'Top-level entities the skill manages — the entry point for all @Claude configuration' },
  { num: '2', name: 'agent scopes', detail: 'Resolution chain + per-field inheritance across workspace and channels' },
  { num: '3', name: 'identity profiles', detail: 'Scopes, rules, credentials, and repo permissions — the identity layer' },
  { num: '4', name: 'presets / connections / repos / instructions', detail: 'The capabilities attached to each identity profile' },
];

const REFS = [
  { file: 'agents-and-scopes.md', topic: 'Resolution chain + per-field inheritance' },
  { file: 'identity-profiles.md', topic: 'Scopes, rules, credentials, repo permissions' },
  { file: 'connections-presets.md', topic: 'OAuth, MCP connections, install steps' },
  { file: 'github-instructions.md', topic: 'Repository setup + custom instructions' },
  { file: 'best-practices.md', topic: 'Profile layout, access levels, rollout guidance' },
];

export const ConfigGuideAnatomy: React.FC<ConfigGuideAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const layerSprings = LAYERS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const refSprings = REFS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.28;
  const LAYER_COL_W = W * 0.40;
  const REF_COL_W = W * 0.44;
  const AVAIL_H = H * 0.60;
  const LAYER_H = AVAIL_H / 4 - 12;
  const REF_H = AVAIL_H / 5 - 9;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CONFIG GUIDE · FOUR-LAYER MODEL + FIVE REFERENCE FILES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Index skill: routes to five reference files.
      </div>

      {/* Layers column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LAYER_COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(layerSprings[0], 0, 1),
        }}>
          FOUR CONFIGURATION LAYERS
        </div>
        {LAYERS.map((layer, i) => {
          const op = clamp(layerSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: LAYER_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <div style={{
                fontFamily: MONO, fontSize: 20, fontWeight: 800, color: '#4A7C59',
                lineHeight: 1, marginTop: 2, minWidth: 18,
              }}>{layer.num}</div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{layer.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{layer.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reference files column */}
      <div style={{ position: 'absolute', left: W * 0.49, top: COL_TOP, width: REF_COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(refSprings[0], 0, 1),
        }}>
          FIVE REFERENCE FILES
        </div>
        {REFS.map((ref, i) => {
          const op = clamp(refSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.04)', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 9,
              height: REF_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 3 }}>{ref.file}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{ref.topic}</div>
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
