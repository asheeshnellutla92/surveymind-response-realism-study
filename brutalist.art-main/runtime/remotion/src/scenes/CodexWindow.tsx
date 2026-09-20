import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {CODEX, CODEX_FONT} from '../tokens/codex';
import {CodexSidebar, StatusDot} from './CodexChrome';

export const codexWindowSchema = z.object({
  view: z.enum(['diff', 'report', 'blank']).default('report'),
  title: z.string().default('Task complete'),
  heading: z.string().default('What changed'),
  lines: z.array(z.string()).default(['Updated the implementation', 'Added verification', 'No unrelated files changed']),
  workspace: z.string().default('bear-textbooks'),
  fileLabel: z.string().default('src/example.ts'),
  added: z.number().default(12),
  removed: z.number().default(3),
  statusLine: z.string().default('Checks passed'),
});
export type CodexWindowProps = z.infer<typeof codexWindowSchema>;

export const CodexWindow: React.FC<CodexWindowProps> = ({view, title, heading, lines, workspace, fileLabel, added, removed, statusLine}) => {
  const frame = useCurrentFrame(); const {fps, width, height} = useVideoConfig();
  const enter = interpolate(frame, [0, 0.65 * fps], [0, 1], {easing: Easing.bezier(0.16,1,0.3,1), extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  if (view === 'blank') return <AbsoluteFill style={{background: CODEX.PAGE}}/>;
  return <AbsoluteFill style={{background: CODEX.PAGE, flexDirection: 'row'}}>
    <CodexSidebar workspace={workspace} activeThread={title}/>
    <div style={{flex: 1, padding: `${height * 0.065}px ${width * 0.045}px`, boxSizing: 'border-box', fontFamily: CODEX_FONT.ui}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', opacity:enter}}>
        <div><div style={{fontSize:13, color:CODEX.INK_SOFT}}>{title}</div><div style={{fontSize:32, fontWeight:650, marginTop:8, color:CODEX.INK}}>{heading}</div></div>
        <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:CODEX.INK_SOFT}}><StatusDot/>{statusLine}</div>
      </div>
      <div style={{marginTop:32, background:CODEX.PANEL, border:`1px solid ${CODEX.BORDER}`, borderRadius:12,
        boxShadow:'0 8px 30px rgba(0,0,0,.06)', overflow:'hidden', opacity:enter, transform:`translateY(${(1-enter)*14}px)`}}>
        <div style={{padding:'13px 18px', background:CODEX.SIDEBAR, borderBottom:`1px solid ${CODEX.BORDER}`,
          display:'flex', fontFamily:CODEX_FONT.mono, fontSize:13, color:CODEX.INK_SOFT}}>
          <span>{view === 'diff' ? fileLabel : 'codex result'}</span>
          {view === 'diff' && <span style={{marginLeft:'auto'}}><b style={{color:CODEX.ACCENT}}>+{added}</b> <b style={{color:'#C2413B'}}>-{removed}</b></span>}
        </div>
        <div style={{padding:'28px 30px 30px'}}>{lines.map((line,i)=>{
          const p=interpolate(frame,[(0.25+i*0.12)*fps,(0.6+i*0.12)*fps],[0,1],{easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
          return <div key={`${line}-${i}`} style={{display:'flex', gap:14, marginBottom:18, opacity:p, transform:`translateY(${(1-p)*10}px)`,
            fontFamily:view==='diff'?CODEX_FONT.mono:CODEX_FONT.ui, fontSize:16, lineHeight:1.5, color:CODEX.INK}}>
            <span style={{color:view==='diff'?(line.startsWith('-')?'#C2413B':CODEX.ACCENT):CODEX.ACCENT,fontWeight:700}}>{view==='diff'?(line.startsWith('-')?'−':'+'):'✓'}</span><span>{line.replace(/^[-+]\s?/, '')}</span>
          </div>})}</div>
      </div>
    </div>
  </AbsoluteFill>;
};
