import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PluginStructureAnatomy — B01 — directory layout + plugin.json manifest.
 */

export const pluginStructureAnatomySchema = z.object({
  sparkLine: z.string().default('plugin.json in .claude-plugin/. Components at root. Never inside .claude-plugin/.'),
});
export type PluginStructureAnatomyProps = z.infer<typeof pluginStructureAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TREE = [
  { text: 'plugin-name/', indent: 0, color: '#4A7C59', bold: true },
  { text: '.claude-plugin/', indent: 1, color: CLAUDE.SPARK, bold: true },
  { text: 'plugin.json', indent: 2, color: CLAUDE.SPARK, bold: false },
  { text: 'commands/', indent: 1, color: '#4A7C59', bold: false },
  { text: 'agents/', indent: 1, color: '#4A7C59', bold: false },
  { text: 'skills/', indent: 1, color: '#4A7C59', bold: false },
  { text: 'hooks/', indent: 1, color: CLAUDE.INK_SOFT, bold: false },
  { text: '.mcp.json', indent: 1, color: CLAUDE.INK_SOFT, bold: false },
  { text: 'scripts/', indent: 1, color: CLAUDE.INK_SOFT, bold: false },
];

export const PluginStructureAnatomy: React.FC<PluginStructureAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const treeIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const manifestIn = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const ruleIn = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const CONTENT_TOP = H * 0.27;
  const CONTENT_H = H * 0.60;
  const LEFT_W = W * 0.38;
  const RIGHT_W = W * 0.52;
  const LEFT_X = W * 0.05;
  const RIGHT_X = LEFT_X + LEFT_W + W * 0.04;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PLUGIN STRUCTURE · DIRECTORY LAYOUT + MANIFEST
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        One root. One manifest. Auto-discovery.
      </div>

      {/* Left: directory tree */}
      <div style={{
        position: 'absolute', top: CONTENT_TOP, left: LEFT_X, width: LEFT_W,
        opacity: clamp(treeIn, 0, 1), transform: `translateX(${(1 - clamp(treeIn, 0, 1)) * -12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, marginBottom: 12, textTransform: 'uppercase' as const }}>DIRECTORY LAYOUT</div>
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderTop: `3px solid #4A7C59`,
          borderRadius: 10, padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
        }}>
          {TREE.map((row, i) => (
            <div key={i} style={{
              fontFamily: MONO, fontSize: 12,
              fontWeight: row.bold ? 700 : 400,
              color: row.color,
              paddingLeft: row.indent * 18,
              marginBottom: 5,
              lineHeight: 1.4,
            }}>
              {row.indent > 0 ? '└── ' : ''}{row.text}
            </div>
          ))}
        </div>
        {/* Rule box */}
        <div style={{
          marginTop: 14,
          background: 'rgba(217,119,87,0.06)', border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 8, padding: '10px 14px',
          opacity: clamp(ruleIn, 0, 1),
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 6, letterSpacing: 1 }}>CRITICAL RULE</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.5 }}>
            <span style={{ color: CLAUDE.SPARK, fontFamily: MONO }}>plugin.json</span> → inside <span style={{ color: CLAUDE.SPARK, fontFamily: MONO }}>.claude-plugin/</span><br />
            <span style={{ color: '#4A7C59', fontFamily: MONO }}>commands/ agents/ skills/</span> → at plugin <span style={{ fontWeight: 700 }}>root</span><br />
            <span style={{ color: CLAUDE.INK_SOFT, fontSize: 10 }}>Misplaced = silent failure. No error.</span>
          </div>
        </div>
      </div>

      {/* Right: manifest fields */}
      <div style={{
        position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W,
        opacity: clamp(manifestIn, 0, 1), transform: `translateX(${(1 - clamp(manifestIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, marginBottom: 12, textTransform: 'uppercase' as const }}>PLUGIN.JSON MANIFEST</div>

        {/* Required */}
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`,
          borderRadius: 10, padding: '14px 18px', marginBottom: 12,
          boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 8, letterSpacing: 2 }}>REQUIRED</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT, marginBottom: 2 }}>{'{'}</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK, paddingLeft: 14 }}>
            <span style={{ color: '#4A7C59' }}>"name"</span>: <span style={{ color: CLAUDE.SPARK }}>"plugin-name"</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT }}>{'}'}</div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, marginTop: 6 }}>Kebab-case · unique across installed plugins · no spaces</div>
        </div>

        {/* Recommended */}
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderLeft: `5px solid #4A7C59`,
          borderRadius: 10, padding: '14px 18px', marginBottom: 12,
          boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#4A7C59', marginBottom: 8, letterSpacing: 2 }}>RECOMMENDED METADATA</div>
          {[
            '"version": "1.0.0"  // semver',
            '"description": "..."',
            '"author": { "name": "...", "email": "..." }',
            '"license": "MIT"',
            '"keywords": ["testing", "ci"]',
          ].map((line, i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT, marginBottom: 3 }}>{line}</div>
          ))}
        </div>

        {/* Custom paths note */}
        <div style={{
          background: 'rgba(61,57,41,0.03)', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 8, padding: '10px 14px',
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.INK_SOFT, marginBottom: 4, letterSpacing: 1 }}>CUSTOM PATHS</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.5 }}>
            Custom paths in manifest <span style={{ fontWeight: 700 }}>supplement</span> auto-discovery — they do <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>not replace</span> default directory scanning. Both locations load.
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
