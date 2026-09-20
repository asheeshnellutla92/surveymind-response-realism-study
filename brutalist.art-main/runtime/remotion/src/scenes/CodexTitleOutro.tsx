import React from 'react';
import {AbsoluteFill,Easing,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {z} from 'zod';
import {CODEX,CODEX_FONT} from '../tokens/codex';
import {CodexMark} from './CodexChrome';

export const codexTitleOutroSchema=z.object({title:z.string().default('Build it with Codex.'),handle:z.string().default('@NikBearBrown'),subline:z.string().default('inspect · change · verify')});
export type CodexTitleOutroProps=z.infer<typeof codexTitleOutroSchema>;
export const CodexTitleOutro:React.FC<CodexTitleOutroProps>=({title,handle,subline})=>{const frame=useCurrentFrame();const {fps}=useVideoConfig();const p=interpolate(frame,[0,.6*fps],[0,1],{easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});return <AbsoluteFill style={{background:CODEX.PAGE,alignItems:'center',justifyContent:'center',fontFamily:CODEX_FONT.ui,opacity:p}}><CodexMark size={48}/><div style={{fontSize:70,fontWeight:700,letterSpacing:'-.035em',color:CODEX.INK,marginTop:24,textAlign:'center'}}>{title}</div><div style={{width:76,height:4,borderRadius:4,background:CODEX.ACCENT,marginTop:24}}/><div style={{fontSize:24,color:CODEX.INK,marginTop:24}}>{handle}</div><div style={{fontFamily:CODEX_FONT.mono,fontSize:17,color:CODEX.INK_SOFT,marginTop:12}}>{subline}</div></AbsoluteFill>};
