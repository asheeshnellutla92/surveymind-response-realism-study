import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BuildMcpAppAnatomy — B01 — two-part registration + App class methods.
 */

export const buildMcpAppAnatomySchema = z.object({
  sparkLine: z.string().default('Tool returns data. Resource serves HTML. App bridges them. Bundle must be inlined.'),
});
export type BuildMcpAppAnatomyProps = z.infer<typeof buildMcpAppAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const APP_METHODS = [
  { name: 'ontoolresult', dir: '← host', use: 'Receive tool return value in widget' },
  { name: 'sendMessage', dir: '→ host', use: 'Inject visible user message into conversation' },
  { name: 'updateModelContext', dir: '→ host', use: 'Update Claude state silently (no chat message)' },
  { name: 'callServerTool', dir: '→ server', use: 'Call another tool on your MCP server' },
  { name: 'openLink', dir: '→ host', use: 'Open URL — window.open blocked by sandbox' },
];

export const BuildMcpAppAnatomy: React.FC<BuildMcpAppAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const part1In = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const part2In = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const bundleIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const methodSprings = APP_METHODS.map((_, i) =>
    spring({ frame: frame - 80 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const TOP = H * 0.27;
  const REG_W = (W - W * 0.10) / 2 - 10;
  const REG_H = H * 0.18;
  const METHOD_TOP = H * 0.64;
  const METHOD_H = (H * 0.26) / 5 - 4;
  const METHOD_W = (W - W * 0.10) / 2 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BUILD MCP APP · TWO-PART REGISTRATION
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 36, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Tool returns data. Resource serves HTML. App bridges.
      </div>

      {/* Part 1: Tool */}
      <div style={{
        position: 'absolute', top: TOP, left: W * 0.05, width: REG_W, height: REG_H,
        background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '12px 16px', boxSizing: 'border-box' as const,
        opacity: clamp(part1In, 0, 1), transform: `translateX(${(1 - clamp(part1In, 0, 1)) * -14}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: CLAUDE.SPARK, marginBottom: 6 }}>PART 1 — TOOL</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.7 }}>
          {'registerAppTool(server, "pick_contact", {'}<br />
          {'  '}<span style={{ color: CLAUDE.SPARK }}>_meta: {'{'} ui: {'{'} resourceUri: "ui://widgets/picker.html" {'}'} {'}'}</span>,<br />
          {'}, async ({ filter }) => {'}<br />
          {'  return { content: [{ type: "text", text: JSON.stringify(data) }] };'}<br />
          {'});'}
        </div>
      </div>

      {/* Part 2: Resource */}
      <div style={{
        position: 'absolute', top: TOP, left: W * 0.05 + REG_W + 20, width: REG_W, height: REG_H,
        background: 'rgba(74,124,89,0.05)', border: `1.5px solid #4A7C59`,
        borderRadius: 12, padding: '12px 16px', boxSizing: 'border-box' as const,
        opacity: clamp(part2In, 0, 1), transform: `translateX(${(1 - clamp(part2In, 0, 1)) * 14}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 6 }}>PART 2 — RESOURCE</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.7 }}>
          {'registerAppResource(server, "Picker",'}<br />
          {'  "ui://widgets/picker.html", {},'}<br />
          {'  async () => ({ contents: [{'}<br />
          {'    '}<span style={{ color: '#4A7C59' }}>mimeType: RESOURCE_MIME_TYPE</span>,<br />
          {'    text: pickerHtml }] }),'}<br />
          {');'}
        </div>
      </div>

      {/* Bundle callout */}
      <div style={{
        position: 'absolute', top: TOP + REG_H + 10, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '8px 14px', boxSizing: 'border-box' as const,
        display: 'flex', gap: 10, alignItems: 'center',
        opacity: clamp(bundleIn, 0, 1), transform: `translateY(${(1 - clamp(bundleIn, 0, 1)) * 8}px)`,
      }}>
        <svg width={16} height={16} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L11 22l8.91-10.96A1 1 0 0019 9.5H13.5L13 2z" fill={CLAUDE.SPARK} />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK }}>
          <span style={{ fontWeight: 700 }}>Bundle inlining mandatory:</span>
          {' CSP blocks CDN fetches — replace '}
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>/*__EXT_APPS_BUNDLE__*/</span>
          {' with the ext-apps browser bundle at server startup. Wrong MIME or missing bundle = blank widget, no error.'}
        </div>
      </div>

      {/* App class methods */}
      <div style={{
        position: 'absolute', top: METHOD_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(methodSprings[0], 0, 1),
      }}>APP CLASS — KEY METHODS</div>

      {APP_METHODS.map((m, i) => {
        const op = clamp(methodSprings[i], 0, 1);
        const col = i % 2;
        const row = Math.floor(i / 2);
        const isLast = i === APP_METHODS.length - 1;
        const mW = isLast ? W - W * 0.10 : METHOD_W;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: METHOD_TOP + row * (METHOD_H + 5),
            left: W * 0.05 + col * (METHOD_W + 20),
            width: mW, height: METHOD_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${m.dir.startsWith('←') ? '#4A7C59' : CLAUDE.SPARK}`,
            borderRadius: 8, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateY(${(1 - op) * 6}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: CLAUDE.INK, minWidth: 160 }}>{m.name}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: m.dir.startsWith('←') ? '#4A7C59' : CLAUDE.SPARK, minWidth: 64 }}>{m.dir}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{m.use}</span>
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
