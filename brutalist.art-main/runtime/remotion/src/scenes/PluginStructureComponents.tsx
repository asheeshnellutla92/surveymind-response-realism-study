import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PluginStructureComponents — B02 — five component types + CLAUDE_PLUGIN_ROOT.
 */

export const pluginStructureComponentsSchema = z.object({
  sparkLine: z.string().default('Commands slash. Agents auto. Skills need SKILL.md. Paths need ${CLAUDE_PLUGIN_ROOT}.'),
});
export type PluginStructureComponentsProps = z.infer<typeof pluginStructureComponentsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const COMPONENTS = [
  {
    type: 'COMMANDS',
    dir: 'commands/',
    file: '*.md',
    discovery: 'All .md files auto-load as slash commands',
    color: '#4A7C59',
  },
  {
    type: 'AGENTS',
    dir: 'agents/',
    file: '*.md',
    discovery: 'All .md files auto-load; invoked manually or auto-selected by context',
    color: '#4A7C59',
  },
  {
    type: 'SKILLS',
    dir: 'skills/name/',
    file: 'SKILL.md',
    discovery: 'Subdirs with SKILL.md auto-load — exact filename required, silent if wrong',
    color: CLAUDE.SPARK,
  },
  {
    type: 'HOOKS',
    dir: 'hooks/',
    file: 'hooks.json',
    discovery: 'hooks.json registers automatically on plugin enable',
    color: CLAUDE.INK_SOFT,
  },
  {
    type: 'MCP',
    dir: '.mcp.json',
    file: '(root)',
    discovery: '.mcp.json at plugin root or inline mcpServers in plugin.json',
    color: CLAUDE.INK_SOFT,
  },
];

export const PluginStructureComponents: React.FC<PluginStructureComponentsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const pathIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const compSprings = COMPONENTS.map((_, i) =>
    spring({ frame: frame - 50 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COMP_TOP = H * 0.27;
  const COMP_H = (H * 0.44) / 5 - 8;
  const PATH_TOP = COMP_TOP + H * 0.44 + 16;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PLUGIN STRUCTURE · COMPONENT TYPES + PATHS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five components. All auto-discovered.
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute', top: COMP_TOP - 18, left: W * 0.05, right: W * 0.05,
        display: 'flex', opacity: clamp(compSprings[0], 0, 1),
      }}>
        {['TYPE', 'DIRECTORY', 'FILE', 'DISCOVERY'].map((h, i) => (
          <div key={i} style={{
            width: i === 0 ? '12%' : i === 1 ? '18%' : i === 2 ? '14%' : '56%',
            fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2,
            color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
          }}>{h}</div>
        ))}
      </div>

      {/* Component rows */}
      {COMPONENTS.map((c, i) => {
        const op = clamp(compSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COMP_TOP + i * (COMP_H + 8),
            left: W * 0.05, right: W * 0.05,
            height: COMP_H,
            background: c.type === 'SKILLS' ? 'rgba(217,119,87,0.04)' : '#FFFFFF',
            border: `1px solid ${c.type === 'SKILLS' ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderLeft: `4px solid ${c.color}`,
            borderRadius: 9,
            display: 'flex', alignItems: 'center',
            padding: '0 16px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ width: '12%', fontFamily: MONO, fontSize: 11, fontWeight: 700, color: c.color }}>{c.type}</div>
            <div style={{ width: '18%', fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT }}>{c.dir}</div>
            <div style={{ width: '14%', fontFamily: MONO, fontSize: 11, color: c.type === 'SKILLS' ? CLAUDE.SPARK : CLAUDE.INK, fontWeight: c.type === 'SKILLS' ? 700 : 400 }}>{c.file}</div>
            <div style={{ width: '56%', fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{c.discovery}</div>
          </div>
        );
      })}

      {/* ${CLAUDE_PLUGIN_ROOT} callout */}
      <div style={{
        position: 'absolute', top: PATH_TOP, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 14, padding: '14px 24px',
        opacity: clamp(pathIn, 0, 1),
        transform: `translateY(${(1 - clamp(pathIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, marginBottom: 8 }}>PORTABLE PATHS — USE ALWAYS</div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, color: '#4A7C59', fontWeight: 700, marginBottom: 4 }}>✓ CORRECT</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK }}>{'bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/run.sh'}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.SPARK, fontWeight: 700, marginBottom: 4 }}>✗ NEVER USE</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.SPARK }}>
              /Users/name/plugins/my-plugin/scripts/run.sh<br />
              ./scripts/run.sh &nbsp;·&nbsp; ~/plugins/run.sh
            </div>
          </div>
          <div style={{ flex: '0 0 auto', width: 200 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, fontWeight: 700, marginBottom: 4 }}>WHERE TO USE</div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.6 }}>Hook commands · MCP server args · Script references · Resource paths</div>
          </div>
        </div>
      </div>

      {/* spark line */}
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
