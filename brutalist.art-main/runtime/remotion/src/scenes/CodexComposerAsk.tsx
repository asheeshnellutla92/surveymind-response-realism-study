import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {CODEX, CODEX_FONT} from '../tokens/codex';
import {CodexSidebar, StatusDot} from './CodexChrome';

export const codexComposerAskSchema = z.object({
  command: z.string().default('Inspect the repository and fix the failing test.'),
  topic: z.string().default('CODEX · REPOSITORY TASK'),
  segment: z.string().default('Fix the failing test'),
  workspace: z.string().default('bear-textbooks'),
  runningText: z.string().default('Working in the repository…'),
  output: z.array(z.string()).default(['Read project instructions', 'Inspect relevant files', 'Run verification']),
  modelLabel: z.string().default('Codex'),
  modeLabel: z.string().default('Local'),
});
export type CodexComposerAskProps = z.infer<typeof codexComposerAskSchema>;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const progress = (frame: number, start: number, end: number) => interpolate(frame, [start, end], [0, 1], {
  easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});

export const CodexComposerAsk: React.FC<CodexComposerAskProps> = ({
  command, topic, segment, workspace, runningText, output, modelLabel, modeLabel,
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const panelIn = progress(frame, 0, 0.7 * fps);
  const typeStart = 0.5 * fps;
  const typeDuration = 1.5 * fps;
  const shown = Math.min(command.length, Math.max(0, Math.floor(((frame - typeStart) / typeDuration) * command.length)));
  const done = shown >= command.length;
  const resultIn = progress(frame, typeStart + typeDuration + 0.25 * fps, typeStart + typeDuration + 0.7 * fps);
  const ui = height * 0.019;

  return <AbsoluteFill style={{background: CODEX.PAGE, flexDirection: 'row', overflow: 'hidden'}}>
    <CodexSidebar workspace={workspace} activeThread={segment}/>
    <div style={{flex: 1, position: 'relative', fontFamily: CODEX_FONT.ui}}>
      <div style={{position: 'absolute', left: width * 0.045, right: width * 0.045, top: height * 0.065,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: panelIn}}>
        <div><div style={{fontSize: 12, letterSpacing: 2, fontWeight: 700, color: CODEX.INK_SOFT}}>{topic}</div>
          <div style={{fontSize: height * 0.036, fontWeight: 650, color: CODEX.INK, marginTop: 8}}>{segment}</div></div>
        <div style={{fontSize: 12, color: CODEX.INK_SOFT, display: 'flex', gap: 8, alignItems: 'center'}}>
          <StatusDot active={done}/>{done ? 'Running' : 'Ready'}
        </div>
      </div>

      <div style={{position: 'absolute', left: width * 0.05, right: width * 0.05, bottom: height * 0.10,
        opacity: panelIn, transform: `translateY(${(1 - panelIn) * 18}px)`}}>
        {done && <div style={{marginBottom: 18, opacity: resultIn}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 9, fontSize: ui * 0.85, color: CODEX.INK_SOFT}}>
            <StatusDot/><span>{runningText}</span>
          </div>
          <div style={{marginTop: 10, borderLeft: `2px solid ${CODEX.ACCENT}`, paddingLeft: 14}}>
            {output.map((line, index) => <div key={line} style={{fontFamily: CODEX_FONT.mono,
              fontSize: ui * 0.76, color: CODEX.INK_SOFT, marginTop: 6,
              opacity: progress(frame, typeStart + typeDuration + (0.35 + index * 0.12) * fps,
                typeStart + typeDuration + (0.65 + index * 0.12) * fps)}}>✓ {line}</div>)}
          </div>
        </div>}
        <div style={{background: CODEX.PANEL, border: `1px solid ${done ? CODEX.ACCENT : CODEX.BORDER}`,
          borderRadius: 14, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: `${ui}px ${ui * 1.2}px`}}>
          <div style={{minHeight: ui * 3.2, fontSize: ui * 1.05, lineHeight: 1.45, color: CODEX.INK,
            whiteSpace: 'pre-wrap'}}>{command.slice(0, shown)}<span style={{opacity: Math.floor(frame / 12) % 2}}>│</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: ui * 0.75, color: CODEX.INK_SOFT}}>
            <span style={{padding: '5px 8px', borderRadius: 6, background: CODEX.SIDEBAR}}>{workspace}</span>
            <span style={{marginLeft: 'auto'}}>{modeLabel}</span><span>·</span><span>{modelLabel}</span>
            <div style={{width: ui * 1.6, height: ui * 1.6, borderRadius: 8, background: done ? CODEX.ACCENT : CODEX.INK,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>↑</div>
          </div>
        </div>
      </div>
    </div>
  </AbsoluteFill>;
};
