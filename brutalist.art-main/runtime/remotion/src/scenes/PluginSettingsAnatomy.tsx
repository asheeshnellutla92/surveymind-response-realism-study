import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PluginSettingsAnatomy — B01 — file structure + three consumers.
 */

export const pluginSettingsAnatomySchema = z.object({
  sparkLine: z.string().default('One file. Three consumers. YAML on top, context below.'),
});
export type PluginSettingsAnatomyProps = z.infer<typeof pluginSettingsAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const CONSUMERS = [
  {
    label: 'HOOKS',
    sub: 'Bash scripts',
    detail: 'Check file exists → parse frontmatter with sed → extract fields → exit 0 if not enabled',
    color: '#4A7C59',
  },
  {
    label: 'COMMANDS',
    sub: 'Read tool',
    detail: 'Read file → parse YAML frontmatter in Claude context → apply to processing logic',
    color: CLAUDE.INK_SOFT,
  },
  {
    label: 'AGENTS',
    sub: 'Instructions',
    detail: 'Reference file path in agent instructions → parse frontmatter → adapt behavior',
    color: CLAUDE.INK_SOFT,
  },
];

export const PluginSettingsAnatomy: React.FC<PluginSettingsAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const fileIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const consumerSprings = CONSUMERS.map((_, i) =>
    spring({ frame: frame - 60 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const FILE_TOP = H * 0.27;
  const FILE_H = H * 0.26;
  const CONSUMER_TOP = FILE_TOP + FILE_H + 24;
  const CONSUMER_H = (H * 0.34) / 3 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PLUGIN SETTINGS · FILE STRUCTURE + CONSUMERS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        One file pattern. Three consumers.
      </div>

      {/* File structure box */}
      <div style={{
        position: 'absolute', top: FILE_TOP, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 14, padding: '18px 28px',
        opacity: clamp(fileIn, 0, 1),
        transform: `translateY(${(1 - clamp(fileIn, 0, 1)) * 12}px)`,
        height: FILE_H, boxSizing: 'border-box' as const,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, marginBottom: 10 }}>FILE LOCATION + STRUCTURE</div>
        <div style={{ display: 'flex', gap: 32, height: 'calc(100% - 28px)' }}>
          {/* Left: location */}
          <div style={{ flex: '0 0 auto', minWidth: 280 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, marginBottom: 6, fontWeight: 700 }}>LOCATION</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: '#4A7C59', marginBottom: 4 }}>project-root/</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT, marginLeft: 16, marginBottom: 4 }}>└── .claude/</div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: CLAUDE.SPARK, marginLeft: 36, marginBottom: 12 }}>plugin-name.local.md</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              <span style={{ fontFamily: SANS, fontSize: 10, color: '#4A7C59', background: 'rgba(74,124,89,0.08)', border: '1px solid #4A7C59', borderRadius: 4, padding: '2px 7px' }}>.claude/ directory</span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.SPARK, background: 'rgba(217,119,87,0.08)', border: `1px solid ${CLAUDE.SPARK}`, borderRadius: 4, padding: '2px 7px' }}>.local.md suffix</span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, background: 'rgba(61,57,41,0.06)', border: `1px solid ${CLAUDE.BORDER}`, borderRadius: 4, padding: '2px 7px' }}>not git-committed</span>
            </div>
          </div>
          {/* Divider */}
          <div style={{ width: 1, background: CLAUDE.BORDER, alignSelf: 'stretch' }} />
          {/* Right: structure */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, marginBottom: 6, fontWeight: 700 }}>STRUCTURE</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1, background: 'rgba(74,124,89,0.06)', border: '1px solid #4A7C59', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#4A7C59', fontWeight: 700, marginBottom: 4 }}>YAML FRONTMATTER</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT }}>---</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK }}>enabled: true</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK }}>mode: standard</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK }}>max_retries: 3</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT }}>---</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(61,57,41,0.03)', border: `1px solid ${CLAUDE.BORDER}`, borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, fontWeight: 700, marginBottom: 4 }}>MARKDOWN BODY</div>
                <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>Task descriptions · additional instructions · prompts to feed back to Claude · documentation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consumer label */}
      <div style={{
        position: 'absolute', top: CONSUMER_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(consumerSprings[0], 0, 1),
      }}>
        CONSUMERS
      </div>

      {/* Consumer cards */}
      {CONSUMERS.map((c, i) => {
        const op = clamp(consumerSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: CONSUMER_TOP + i * (CONSUMER_H + 10),
            left: W * 0.05, right: W * 0.05,
            height: CONSUMER_H, boxSizing: 'border-box' as const,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${c.color}`,
            borderRadius: 9, padding: '10px 16px',
            boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: c.color }}>{c.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: '#FFFFFF', background: c.color, padding: '1px 6px', borderRadius: 4 }}>{c.sub}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{c.detail}</div>
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
