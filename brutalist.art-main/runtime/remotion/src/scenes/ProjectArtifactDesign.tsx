import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const projectArtifactDesignSchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof projectArtifactDesignSchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const WORKFLOW = [
  {label: 'Gather live sources', note: 'Read Artifact + Sources from config before any tab'},
  {label: 'Pick tabs', note: 'Check config content — conditional tabs only if material'},
  {label: 'Generate + embed state', note: 'Build HTML · include state block in every publish'},
  {label: 'Publish → write config', note: 'Artifact tool → uuid URL · update config.md slug'},
];

const GOTCHAS = [
  {label: 'Artifact tool needs claude.ai login', note: 'Stakeholders without an account get a login wall'},
  {label: 'Config is machine-local', note: 'Not synced — colleague must reconstruct config to refresh'},
  {label: 'Delta requires prior render on disk', note: 'No HTML on disk → rebuilds from template, no diff'},
  {label: 'Refresh rebuilds on structure change only', note: 'Content updates rewrite in-place — HTML may drift'},
];

export const ProjectArtifactDesign: React.FC<Props> = ({sparkLine}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();

  const fade = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});

  const TITLE_H = H * 0.14;
  const COL_TOP = H * 0.20;
  const COL_H = H * 0.66;
  const LEFT_W = W * 0.43;
  const RIGHT_W = W * 0.43;
  const GAP = W * 0.04;
  const LEFT_X = W * 0.04;
  const RIGHT_X = LEFT_X + LEFT_W + GAP;
  const ITEM_H = (COL_H / WORKFLOW.length) - 10;

  return (
    <div style={{width: W, height: H, background: PAGE, fontFamily: CLAUDE_FONT.ui, opacity: fade, position: 'relative', overflow: 'hidden'}}>
      {/* header */}
      <div style={{position: 'absolute', top: 0, left: 0, width: W, height: TITLE_H, borderBottom: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', paddingLeft: W * 0.04}}>
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>PROJECT-ARTIFACT · CLAUDE PLUGINS</span>
        <span style={{fontFamily: CLAUDE_FONT.serif, fontSize: H * 0.048, color: INK, fontWeight: 700, marginLeft: W * 0.03}}>Workflow &amp; Gotchas</span>
      </div>

      {/* LEFT — WORKFLOW */}
      <div style={{position: 'absolute', top: COL_TOP, left: LEFT_X, width: LEFT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: GREEN, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10}}>WORKFLOW</div>
        {WORKFLOW.map((item, i) => {
          const delay = i * 5;
          const itemFade = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: itemFade, background: GREEN_BG, border: `1.5px solid ${GREEN}`, borderRadius: 6, padding: '10px 12px', marginBottom: 10, height: ITEM_H, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div style={{display: 'flex', alignItems: 'flex-start', gap: 8}}>
                <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: GREEN, fontWeight: 700, minWidth: 22}}>{i + 1}.</span>
                <div>
                  <div style={{fontFamily: CLAUDE_FONT.ui, fontWeight: 700, fontSize: H * 0.021, color: INK}}>{item.label}</div>
                  <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.016, color: INK_SOFT, marginTop: 3}}>{item.note}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT — GOTCHAS */}
      <div style={{position: 'absolute', top: COL_TOP, left: RIGHT_X, width: RIGHT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: SPARK, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10}}>GOTCHAS</div>
        {GOTCHAS.map((item, i) => {
          const delay = 20 + i * 5;
          const itemFade = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: itemFade, background: SPARK_BG, border: `1.5px solid ${SPARK}`, borderRadius: 6, padding: '10px 12px', marginBottom: 10, height: ITEM_H, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div style={{fontFamily: CLAUDE_FONT.ui, fontWeight: 700, fontSize: H * 0.021, color: INK}}>{item.label}</div>
              <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.016, color: INK_SOFT, marginTop: 3}}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      {sparkLine && (
        <div style={{position: 'absolute', bottom: H * 0.04, left: W * 0.04, right: W * 0.04, fontFamily: CLAUDE_FONT.serif, fontStyle: 'italic', fontSize: H * 0.022, color: INK_SOFT, textAlign: 'center'}}>
          {sparkLine}
        </div>
      )}
    </div>
  );
};
