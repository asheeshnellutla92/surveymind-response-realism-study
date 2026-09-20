import React from 'react';
import {AbsoluteFill,Easing,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {z} from 'zod';
import {CODEX,CODEX_FONT} from '../tokens/codex';
import {CodexSidebar} from './CodexChrome';

export const codexCalloutSchema=z.object({title:z.string().default('Why this matters'),body:z.string().default('Codex works against the repository, so the result is a verified change—not merely advice.'),label:z.string().default('DESIGN DECISION'),workspace:z.string().default('bear-textbooks'),target:z.enum(['task','diff','terminal']).default('diff')});
export type CodexCalloutProps=z.infer<typeof codexCalloutSchema>;
export const CodexCallout:React.FC<CodexCalloutProps>=({title,body,label,workspace,target})=>{
  const frame=useCurrentFrame();const {fps,width,height}=useVideoConfig();const p=interpolate(frame,[0,.7*fps],[0,1],{easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const x=target==='task'?width*.40:target==='terminal'?width*.70:width*.58; const y=target==='task'?height*.26:target==='terminal'?height*.70:height*.45;
  return <AbsoluteFill style={{background:CODEX.PAGE,flexDirection:'row'}}><CodexSidebar workspace={workspace} activeThread="Review repository change"/>
    <div style={{flex:1,position:'relative',fontFamily:CODEX_FONT.ui}}><div style={{position:'absolute',left:'10%',right:'10%',top:'16%',bottom:'16%',background:CODEX.PANEL,border:`1px solid ${CODEX.BORDER}`,borderRadius:12,boxShadow:'0 10px 35px rgba(0,0,0,.07)'}}/>
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}}><path d={`M ${x-250} ${y-80} C ${x-100} ${y-80}, ${x-110} ${y}, ${x} ${y}`} fill="none" stroke={CODEX.ACCENT} strokeWidth="3" strokeDasharray={`${p*500} 500`}/><circle cx={x} cy={y} r={10*p} fill="none" stroke={CODEX.ACCENT} strokeWidth="3"/></svg>
      <div style={{position:'absolute',left:'8%',top:'55%',width:380,background:CODEX.INK,color:'#fff',padding:'22px 24px',borderRadius:10,opacity:p,transform:`translateY(${(1-p)*16}px)`}}><div style={{fontSize:11,letterSpacing:1.6,color:'#8EE0C5',fontWeight:700}}>{label}</div><div style={{fontSize:24,fontWeight:650,marginTop:9}}>{title}</div><div style={{fontSize:15,lineHeight:1.5,color:'#D9D9D5',marginTop:10}}>{body}</div></div>
    </div></AbsoluteFill>;
};
