import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {CODEX, CODEX_FONT} from '../tokens/codex';
import {StatusDot} from './CodexChrome';

export const codexCodeBeatSchema = z.object({
  title:z.string().default('src/example.ts'), code:z.string().default('export const answer = 42;'),
  language:z.string().default('typescript'), command:z.string().default('npm test'), statusLine:z.string().default('Tests passed'),
});
export type CodexCodeBeatProps=z.infer<typeof codexCodeBeatSchema>;
export const CodexCodeBeat:React.FC<CodexCodeBeatProps>=({title,code,language,command,statusLine})=>{
  const frame=useCurrentFrame(); const {fps,width,height}=useVideoConfig(); const lines=code.split('\n');
  const enter=interpolate(frame,[0,.55*fps],[0,1],{easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:CODEX.PAGE,alignItems:'center',justifyContent:'center'}}>
    <div style={{width:width*.86,height:height*.78,background:CODEX.CODE,borderRadius:14,overflow:'hidden',boxShadow:'0 16px 50px rgba(0,0,0,.18)',opacity:enter,transform:`translateY(${(1-enter)*18}px)`}}>
      <div style={{height:48,padding:'0 20px',display:'flex',alignItems:'center',borderBottom:'1px solid #303030',fontFamily:CODEX_FONT.mono,fontSize:13,color:'#A7A7A2'}}>
        <StatusDot/><span style={{marginLeft:10,color:CODEX.CODE_INK}}>{title}</span><span style={{marginLeft:'auto'}}>{language}</span>
      </div>
      <pre style={{margin:0,padding:'24px 28px',fontFamily:CODEX_FONT.mono,fontSize:height*.021,lineHeight:1.7,color:CODEX.CODE_INK}}>{lines.map((line,i)=>{
        const p=interpolate(frame,[(.2+i*.08)*fps,(.42+i*.08)*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
        return <div key={i} style={{opacity:p}}><span style={{display:'inline-block',width:34,color:'#666'}}>{i+1}</span>{line||'​'}</div>})}</pre>
      <div style={{position:'absolute',left:width*.07,right:width*.07,bottom:height*.11,height:44,borderTop:'1px solid #303030',background:'#191919',display:'flex',alignItems:'center',padding:'0 20px',fontFamily:CODEX_FONT.mono,fontSize:13,color:'#BDBDB8'}}>
        <span style={{color:CODEX.ACCENT}}>$</span><span style={{marginLeft:9}}>{command}</span><span style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}><StatusDot/>{statusLine}</span>
      </div>
    </div>
  </AbsoluteFill>;
};
