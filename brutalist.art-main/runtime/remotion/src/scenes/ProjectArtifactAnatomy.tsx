import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const projectArtifactAnatomySchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof projectArtifactAnatomySchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const LEFT_TABS = [
  {label: 'Overview', note: 'always — status badge, summary, last-updated'},
  {label: 'Workstreams', note: 'always — tracks, status, owner, key dates'},
  {label: 'Attention', note: 'conditional — blockers, decisions needed now'},
  {label: 'Background', note: 'conditional — context that buries Overview'},
  {label: 'Plan', note: 'conditional — milestones and timeline'},
  {label: 'Risks & open questions', note: 'conditional — tracked uncertainties'},
  {label: 'Decisions / FAQ', note: 'conditional — closed decisions + rationale'},
];

const RIGHT_ITEMS = [
  {label: 'Project', note: 'name · current-status · last-updated · summary'},
  {label: 'Artifact', note: 'source files to read before building'},
  {label: 'Sources', note: 'data files, API outputs, live documents'},
  {label: 'People', note: 'names + roles for workstream ownership'},
];

export const ProjectArtifactAnatomy: React.FC<Props> = ({sparkLine}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();

  const fade = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});

  const TITLE_H = H * 0.14;
  const COL_TOP = H * 0.20;
  const COL_H = H * 0.68;
  const LEFT_W = W * 0.44;
  const RIGHT_W = W * 0.40;
  const GAP = W * 0.04;
  const LEFT_X = W * 0.04;
  const RIGHT_X = LEFT_X + LEFT_W + GAP;
  const ITEM_H = (COL_H - 20) / LEFT_TABS.length - 8;
  const R_ITEM_H = (COL_H * 0.55) / RIGHT_ITEMS.length - 8;

  return (
    <div style={{width: W, height: H, background: PAGE, fontFamily: CLAUDE_FONT.ui, opacity: fade, position: 'relative', overflow: 'hidden'}}>
      {/* header bar */}
      <div style={{position: 'absolute', top: 0, left: 0, width: W, height: TITLE_H, borderBottom: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', paddingLeft: W * 0.04}}>
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>PROJECT-ARTIFACT · CLAUDE PLUGINS</span>
        <span style={{fontFamily: CLAUDE_FONT.serif, fontSize: H * 0.048, color: INK, fontWeight: 700, marginLeft: W * 0.03}}>Tab Catalog &amp; Config</span>
      </div>

      {/* LEFT — TAB CATALOG */}
      <div style={{position: 'absolute', top: COL_TOP, left: LEFT_X, width: LEFT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: GREEN, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10}}>TAB CATALOG</div>
        {LEFT_TABS.map((item, i) => {
          const isAlways = i < 2;
          const bg = isAlways ? GREEN_BG : SPARK_BG;
          const borderColor = isAlways ? GREEN : SPARK;
          const delay = i * 4;
          const itemFade = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: itemFade, background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 6, padding: '6px 10px', marginBottom: 8, height: ITEM_H, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div style={{fontFamily: CLAUDE_FONT.ui, fontWeight: 700, fontSize: H * 0.020, color: INK}}>{item.label}</div>
              <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.015, color: INK_SOFT, marginTop: 2}}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* RIGHT — CONFIG + STATE BLOCK */}
      <div style={{position: 'absolute', top: COL_TOP, left: RIGHT_X, width: RIGHT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: SPARK, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10}}>CONFIG SECTIONS</div>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.014, color: INK_SOFT, marginBottom: 10}}>{'${CLAUDE_PLUGIN_DATA}/artifacts/<slug>/config.md'}</div>
        {RIGHT_ITEMS.map((item, i) => {
          const delay = 14 + i * 4;
          const itemFade = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: itemFade, background: GREEN_BG, border: `1.5px solid ${GREEN}`, borderRadius: 6, padding: '6px 10px', marginBottom: 8, height: R_ITEM_H, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div style={{fontFamily: CLAUDE_FONT.ui, fontWeight: 700, fontSize: H * 0.020, color: INK}}>{item.label}</div>
              <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.015, color: INK_SOFT, marginTop: 2}}>{item.note}</div>
            </div>
          );
        })}

        {/* State block callout */}
        <div style={{marginTop: 12, background: '#F0EBE3', border: `1.5px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px'}}>
          <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.015, color: SPARK, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4}}>STATE BLOCK</div>
          <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.014, color: INK}}>{'<script type="application/json" id="artifact-state">'}</div>
          <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.013, color: INK_SOFT, marginTop: 2}}>Embedded in every publish — enables delta on refresh</div>
        </div>
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
