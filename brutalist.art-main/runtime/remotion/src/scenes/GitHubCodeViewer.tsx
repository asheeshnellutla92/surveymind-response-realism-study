import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { GH, GH_FONT } from '../tokens/github';
import { OctoMark } from './GitHubRepoHero';

export const gitHubCodeViewerSchema = z.object({
  path:    z.array(z.string()).default(['anthropics', 'claude-plugins-public', 'hooks', 'stop-hook.sh']),
  branch:  z.string().default('main'),
  lang:    z.string().default('bash'),
  lines:   z.array(z.string()).default([
    '#!/bin/bash',
    '# Ralph Loop — Stop hook',
    'RALPH_STATE_FILE=".claude/ralph-loop.local.md"',
    '[[ -f "$RALPH_STATE_FILE" ]] || exit 0',
    '',
    '# max iterations reached? stop and clean up',
    'if (( MAX_ITERATIONS > 0 && ITERATION >= MAX_ITERATIONS )); then',
    '  echo "Max iterations reached"; rm "$RALPH_STATE_FILE"; exit 0',
    'fi',
    '',
    '# did Claude print the promise? then stop',
    'LAST=$(grep \'"role":"assistant"\' "$TRANSCRIPT" | tail -1)',
    'echo "$LAST" | grep -q "$COMPLETION_PROMISE" && exit 0',
    '',
    '# otherwise: block the exit and re-feed the SAME prompt',
    'echo \'{"decision":"block","reason":"<same prompt>"}\'',
  ]),
  caption: z.string().default('A Stop hook that won\'t let go.'),
});
export type GitHubCodeViewerProps = z.infer<typeof gitHubCodeViewerSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SPRING = { damping: 26, stiffness: 120, mass: 0.9 };

const isComment = (line: string) => line.trimStart().startsWith('#') || line.trimStart().startsWith('//');
const lineColor = (line: string): string => isComment(line) ? GH.SYN_COM : GH.BODY;

export const GitHubCodeViewer: React.FC<GitHubCodeViewerProps> = ({
  path, branch, lang, lines, caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn  = spring({ frame,            fps, config: SPRING });
  const captionIn = spring({ frame: frame - 10, fps, config: SPRING });

  const op = (s: number) => clamp(s, 0, 1);
  const ty = (s: number, px = 30) => (1 - op(s)) * px;

  // Breadcrumb: all but last are "links" (blue), last is filename (bold fg)
  const crumb = path.map((seg, i) => {
    const last = i === path.length - 1;
    return (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ color: GH.MUTED2 }}>/</span>}
        <span style={{ color: last ? GH.FG : GH.BLUE, fontWeight: last ? 700 : 400 }}>{seg}</span>
      </React.Fragment>
    );
  });

  return (
    <AbsoluteFill style={{ background: GH.BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Main panel */}
      <div style={{
        width: 1600,
        background: GH.PANEL,
        border: `1px solid ${GH.BORDER}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,.5)',
        opacity: op(panelIn),
        transform: `translateY(${ty(panelIn)}px)`,
      }}>
        {/* Header: breadcrumb + branch */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 28px', borderBottom: `1px solid ${GH.BORDER}`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: GH_FONT.ui, fontSize: 28, flexWrap: 'wrap',
          }}>
            <OctoMark size={30} color={GH.FG} />
            {crumb}
          </div>
          <div style={{
            border: `1px solid ${GH.BORDER}`, borderRadius: 8,
            padding: '8px 16px', color: GH.MUTED,
            fontFamily: GH_FONT.mono, fontSize: 22,
          }}>
            ⎇ {branch}
          </div>
        </div>

        {/* Sub-header: meta + buttons */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px', borderBottom: `1px solid ${GH.BORDER}`,
        }}>
          <div style={{ color: GH.MUTED, fontFamily: GH_FONT.mono, fontSize: 22 }}>
            {lines.length} lines · {lang}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['Blame', 'Raw'].map(label => (
              <div key={label} style={{
                border: `1px solid ${GH.BORDER}`, borderRadius: 8,
                padding: '8px 18px', color: GH.BODY, fontWeight: 600,
                fontSize: 22, fontFamily: GH_FONT.ui,
              }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Code area: line numbers + source */}
        <div style={{ display: 'flex', padding: '22px 0', fontFamily: GH_FONT.mono, fontSize: 26, lineHeight: 1.72 }}>
          {/* Line numbers */}
          <div style={{
            color: GH.MUTED2, textAlign: 'right',
            padding: '0 26px 0 30px', userSelect: 'none', whiteSpace: 'pre',
            flexShrink: 0,
          }}>
            {lines.map((_, i) => {
              const lineOp = clamp(
                interpolate(frame, [Math.round(fps * 0.3) + i * 1.5, Math.round(fps * 0.3) + i * 1.5 + 8], [0, 1]),
                0, 1,
              );
              return (
                <div key={i} style={{ opacity: lineOp }}>{i + 1}</div>
              );
            })}
          </div>

          {/* Source lines */}
          <div style={{ flex: 1, whiteSpace: 'pre', paddingRight: 30, overflow: 'hidden' }}>
            {lines.map((line, i) => {
              const lineOp = clamp(
                interpolate(frame, [Math.round(fps * 0.3) + i * 1.5, Math.round(fps * 0.3) + i * 1.5 + 8], [0, 1]),
                0, 1,
              );
              return (
                <div key={i} style={{ opacity: lineOp, color: lineColor(line) }}>
                  {line || '​'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer caption */}
        <div style={{
          borderTop: `1px solid ${GH.BORDER}`,
          padding: '20px 28px', color: GH.MUTED, fontSize: 24,
          fontFamily: GH_FONT.ui,
          opacity: op(captionIn),
        }}>
          {caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};
