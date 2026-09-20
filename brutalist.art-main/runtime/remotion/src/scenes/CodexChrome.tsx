import React from 'react';
import {CODEX, CODEX_FONT} from '../tokens/codex';

export const CodexMark: React.FC<{size?: number}> = ({size = 22}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: CODEX.INK,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: CODEX_FONT.mono, fontSize: size * 0.48, fontWeight: 700}}>C</div>
);

export const StatusDot: React.FC<{active?: boolean}> = ({active = true}) => (
  <span style={{width: 8, height: 8, borderRadius: 99,
    background: active ? CODEX.ACCENT : CODEX.GHOST, display: 'inline-block'}} />
);

export const CodexSidebar: React.FC<{workspace: string; activeThread: string}> = ({workspace, activeThread}) => (
  <div style={{width: '25%', height: '100%', alignSelf: 'stretch', flexShrink: 0,
    background: CODEX.SIDEBAR, borderRight: `1px solid ${CODEX.BORDER}`,
    padding: '22px 18px', boxSizing: 'border-box', fontFamily: CODEX_FONT.ui}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 650, color: CODEX.INK}}>
      <CodexMark/><span>Codex</span>
    </div>
    <div style={{marginTop: 32, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5,
      color: CODEX.GHOST, fontWeight: 700}}>Workspace</div>
    <div style={{marginTop: 10, fontSize: 14, color: CODEX.INK, fontWeight: 600,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{workspace}</div>
    <div style={{marginTop: 30, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5,
      color: CODEX.GHOST, fontWeight: 700}}>Tasks</div>
    <div style={{marginTop: 10, padding: '11px 12px', borderRadius: 8, background: CODEX.PANEL,
      border: `1px solid ${CODEX.BORDER}`, color: CODEX.INK, fontSize: 13, lineHeight: 1.3}}>
      {activeThread}
    </div>
  </div>
);
