import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const projectArtifactTellSchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof projectArtifactTellSchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const GETS_RIGHT = [
  'Opinionated tab catalog — two always, five conditional; no blank pages, no overcrowding',
  'State block for delta — prior state embedded in artifact; refresh is self-contained',
  'Freshness conventions explicit — last-updated, per-workstream dates, re-read Sources every build',
  'Entity-encoding security — fetched text encoded; < → \\u003c in JSON; injection path closed',
  'CSP self-contained — no external CDN; all styles/scripts inline; works without network',
];

const WHERE_BITES = [
  'Artifact tool requires claude.ai login — stakeholders without account get a wall, not a page',
  'Config is machine-local — not synced; colleague must reconstruct config from scratch to refresh',
  'Delta requires prior render on disk — no HTML on disk → rebuilds from template, no change summary',
  'Refresh rebuilds from template on structure change only — content updates may cause HTML drift',
  'Prompt injection flagged not blocked — crafted title/status field can still appear in artifact',
];

const CALLOUT = 'The state block is the invariant: every published artifact must embed <script type="application/json" id="artifact-state"> with the full rendered data. Without it, the refresh call has no prior state to diff against and rebuilds from template with no change summary and no indication the delta was skipped.';

export const ProjectArtifactTell: React.FC<Props> = ({sparkLine}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();

  const fade = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});

  const TITLE_H = H * 0.14;
  const COL_TOP = H * 0.18;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.40;
  const GAP = W * 0.04;
  const LEFT_X = W * 0.04;
  const RIGHT_X = LEFT_X + LEFT_W + GAP;
  const ITEM_H = (H * 0.51) / 5 - 10;

  const CALLOUT_TOP = COL_TOP + 5 * (ITEM_H + 10) + 10;
  const CALLOUT_H = H - CALLOUT_TOP - H * 0.04;

  return (
    <div style={{width: W, height: H, background: PAGE, fontFamily: CLAUDE_FONT.ui, opacity: fade, position: 'relative', overflow: 'hidden'}}>
      {/* header */}
      <div style={{position: 'absolute', top: 0, left: 0, width: W, height: TITLE_H, borderBottom: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', paddingLeft: W * 0.04}}>
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>PROJECT-ARTIFACT · CLAUDE PLUGINS</span>
        <span style={{fontFamily: CLAUDE_FONT.serif, fontSize: H * 0.048, color: INK, fontWeight: 700, marginLeft: W * 0.03}}>Teardown</span>
      </div>

      {/* LEFT — GETS RIGHT */}
      <div style={{position: 'absolute', top: COL_TOP, left: LEFT_X, width: LEFT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.017, color: GREEN, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8}}>GETS RIGHT</div>
        {GETS_RIGHT.map((text, i) => {
          const delay = i * 4;
          const itemFade = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: itemFade, background: GREEN_BG, border: `1.5px solid ${GREEN}`, borderRadius: 5, padding: '5px 9px', marginBottom: 8, height: ITEM_H, display: 'flex', alignItems: 'center'}}>
              <span style={{fontFamily: CLAUDE_FONT.ui, fontSize: H * 0.017, color: INK, lineHeight: 1.35}}>{text}</span>
            </div>
          );
        })}
      </div>

      {/* RIGHT — WHERE IT BITES */}
      <div style={{position: 'absolute', top: COL_TOP, left: RIGHT_X, width: RIGHT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.017, color: SPARK, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8}}>WHERE IT BITES</div>
        {WHERE_BITES.map((text, i) => {
          const delay = 20 + i * 4;
          const itemFade = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: itemFade, background: SPARK_BG, border: `1.5px solid ${SPARK}`, borderRadius: 5, padding: '5px 9px', marginBottom: 8, height: ITEM_H, display: 'flex', alignItems: 'center'}}>
              <span style={{fontFamily: CLAUDE_FONT.ui, fontSize: H * 0.017, color: INK, lineHeight: 1.35}}>{text}</span>
            </div>
          );
        })}
      </div>

      {/* CALLOUT */}
      <div style={{position: 'absolute', top: CALLOUT_TOP, left: LEFT_X, right: W * 0.04, height: CALLOUT_H, background: '#F0EBE3', border: `2px solid ${SPARK}`, borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{flexShrink: 0}}>
          <svg width={36} height={36} viewBox="0 0 36 36">
            <circle cx={18} cy={18} r={17} fill={SPARK} />
            <text x={18} y={24} textAnchor="middle" fontFamily="Georgia, serif" fontSize={22} fill={PAGE} fontWeight="bold">!</text>
          </svg>
        </div>
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.016, color: INK, lineHeight: 1.45}}>{CALLOUT}</span>
      </div>

      {/* spark line */}
      {sparkLine && (
        <div style={{position: 'absolute', bottom: H * 0.01, left: W * 0.04, right: W * 0.04, fontFamily: CLAUDE_FONT.serif, fontStyle: 'italic', fontSize: H * 0.019, color: INK_SOFT, textAlign: 'center'}}>
          {sparkLine}
        </div>
      )}
    </div>
  );
};
