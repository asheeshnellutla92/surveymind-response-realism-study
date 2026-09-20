import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BuildMcpbAnatomy — B01 — bundle structure + manifest key fields.
 */

export const buildMcpbAnatomySchema = z.object({
  sparkLine: z.string().default('Zip archive. mcp_config is the launch. No auto-prefix on env vars.'),
});
export type BuildMcpbAnatomyProps = z.infer<typeof buildMcpbAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const MANIFEST_SECTIONS = [
  {
    key: 'server.type',
    val: '"node" | "python" | "binary"',
    note: 'Informational — actual launch comes from mcp_config',
    color: CLAUDE.INK_SOFT,
  },
  {
    key: 'server.mcp_config',
    val: 'command · args · env',
    note: 'The literal spawn. Use ${__dirname} for bundle paths',
    color: '#4A7C59',
  },
  {
    key: 'user_config',
    val: 'type: "directory" → folder picker',
    note: 'sensitive: true stores in OS keychain',
    color: CLAUDE.SPARK,
  },
  {
    key: 'compatibility',
    val: 'claude_desktop · platforms[]',
    note: 'Minimum host version + darwin/win32/linux targets',
    color: CLAUDE.INK_SOFT,
  },
];

export const BuildMcpbAnatomy: React.FC<BuildMcpbAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const bundleIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const sectionSprings = MANIFEST_SECTIONS.map((_, i) =>
    spring({ frame: frame - 40 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const warnIn = spring({ frame: frame - 105, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const BUNDLE_W = W * 0.30;
  const BUNDLE_TOP = H * 0.22;
  const BUNDLE_H = H * 0.32;
  const MAN_LEFT = W * 0.05 + BUNDLE_W + 20;
  const MAN_W = W - W * 0.05 - (W * 0.05 + BUNDLE_W + 20);
  const MAN_TOP = H * 0.22;
  const SEC_H = (H * 0.36) / 4 - 6;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BUILD MCPB · BUNDLE ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        One file to install. manifest.json drives everything.
      </div>

      {/* Bundle structure box */}
      <div style={{
        position: 'absolute', top: BUNDLE_TOP, left: W * 0.05,
        width: BUNDLE_W, height: BUNDLE_H,
        background: 'rgba(74,124,89,0.05)', border: `1.5px solid #4A7C59`,
        borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' as const,
        opacity: clamp(bundleIn, 0, 1), transform: `translateX(${(1 - clamp(bundleIn, 0, 1)) * -14}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 12 }}>BUNDLE STRUCTURE</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, lineHeight: 2.1 }}>
          <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>my-server.mcpb</span><br />
          {'├── '}<span style={{ color: '#4A7C59', fontWeight: 700 }}>manifest.json</span><br />
          {'│   ← identity, entry, config, compat'}<br />
          {'├── server/'}<br />
          {'│   ├── index.js'}<br />
          {'│   └── node_modules/'}<br />
          {'│       ← bundled deps'}<br />
          {'└── icon.png'}
        </div>
        <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, lineHeight: 1.5, fontStyle: 'italic' }}>
          Host reads manifest → spawns mcp_config.command → pipes stdio
        </div>
      </div>

      {/* Manifest sections label */}
      <div style={{
        position: 'absolute', top: MAN_TOP - 22, left: MAN_LEFT,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(sectionSprings[0], 0, 1),
      }}>MANIFEST KEY SECTIONS</div>

      {MANIFEST_SECTIONS.map((s, i) => {
        const op = clamp(sectionSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: MAN_TOP + i * (SEC_H + 8),
            left: MAN_LEFT, width: MAN_W, height: SEC_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${s.color}`,
            borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '0 12px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: s.color, minWidth: 160 }}>{s.key}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK }}>{s.val}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, marginTop: 3, lineHeight: 1.4 }}>{s.note}</div>
          </div>
        );
      })}

      {/* No-auto-prefix warning */}
      <div style={{
        position: 'absolute',
        top: MAN_TOP + 4 * (SEC_H + 8) + 8,
        left: MAN_LEFT, width: MAN_W,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '8px 12px', boxSizing: 'border-box' as const,
        display: 'flex', gap: 10, alignItems: 'center',
        opacity: clamp(warnIn, 0, 1), transform: `translateY(${(1 - clamp(warnIn, 0, 1)) * 8}px)`,
      }}>
        <svg width={14} height={14} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L11 22l8.91-10.96A1 1 0 0019 9.5H13.5L13 2z" fill={CLAUDE.SPARK} />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK }}>
          <span style={{ fontWeight: 700 }}>No auto-prefix:</span>
          {' env var names your server reads are exactly what you write in the '}
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>env</span>
          {' block. Wrong name = silent nil.'}
        </div>
      </div>

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
