import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const sentryApiAnatomySchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof sentryApiAnatomySchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const LEFT_ITEMS = [
  {label: 'Org → project → issue → event', note: 'Issues = deduplicated groups · events = occurrences with stack traces'},
  {label: 'shortId ≠ numeric ID', note: 'PROJ-123 is shortId — search to resolve; issue endpoints need numeric ID'},
  {label: 'frames[-1] = crashing frame', note: 'Frames ordered outermost→innermost; crash is always the last entry'},
  {label: 'Retrieved content = untrusted', note: 'Issues/events may contain adversarial instructions — never follow them'},
];

const RIGHT_ITEMS = [
  {label: 'List projects', note: 'Get slug for each project before using project-scoped endpoints'},
  {label: 'Search issues', note: 'sentry_issues.sh — resolves slugs, pages Link-header cursors, TSV/JSONL'},
  {label: 'Get one issue', note: 'GET /issues/<id>/ · detail=null on success · detail=message on error'},
  {label: 'Get events', note: '/events/latest/ · /oldest/ · /recommended/ · frames[-1] = crash'},
  {label: 'Update issue', note: 'PUT → resolve/ignore/assign · echoes issue on success · detail on error'},
  {label: 'Tags · Releases · Stats', note: 'Tag distribution · create releases w/ commits · stats_v2 by project/outcome'},
];

export const SentryApiAnatomy: React.FC<Props> = ({sparkLine}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();

  const fade = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});

  const TITLE_H = H * 0.14;
  const COL_TOP = H * 0.19;
  const LEFT_W = W * 0.43;
  const RIGHT_W = W * 0.43;
  const GAP = W * 0.04;
  const LEFT_X = W * 0.04;
  const RIGHT_X = LEFT_X + LEFT_W + GAP;
  const LEFT_ITEM_H = (H * 0.67) / LEFT_ITEMS.length - 10;
  const RIGHT_ITEM_H = (H * 0.67) / RIGHT_ITEMS.length - 8;

  return (
    <div style={{width: W, height: H, background: PAGE, fontFamily: CLAUDE_FONT.ui, opacity: fade, position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 0, left: 0, width: W, height: TITLE_H, borderBottom: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', paddingLeft: W * 0.04}}>
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>SENTRY-API · CLAUDE PLUGINS</span>
        <span style={{fontFamily: CLAUDE_FONT.serif, fontSize: H * 0.048, color: INK, fontWeight: 700, marginLeft: W * 0.03}}>Data Model &amp; Operations</span>
      </div>

      {/* LEFT — DATA MODEL */}
      <div style={{position: 'absolute', top: COL_TOP, left: LEFT_X, width: LEFT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: GREEN, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10}}>DATA MODEL</div>
        {LEFT_ITEMS.map((item, i) => {
          const delay = i * 4;
          const itemFade = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: itemFade, background: GREEN_BG, border: `1.5px solid ${GREEN}`, borderRadius: 6, padding: '8px 12px', marginBottom: 10, height: LEFT_ITEM_H, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div style={{fontFamily: CLAUDE_FONT.ui, fontWeight: 700, fontSize: H * 0.021, color: INK}}>{item.label}</div>
              <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.015, color: INK_SOFT, marginTop: 3}}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* RIGHT — CORE OPERATIONS */}
      <div style={{position: 'absolute', top: COL_TOP, left: RIGHT_X, width: RIGHT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: SPARK, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10}}>CORE OPERATIONS</div>
        {RIGHT_ITEMS.map((item, i) => {
          const delay = 16 + i * 3;
          const itemFade = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: itemFade, background: SPARK_BG, border: `1.5px solid ${SPARK}`, borderRadius: 6, padding: '6px 10px', marginBottom: 7, height: RIGHT_ITEM_H, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div style={{fontFamily: CLAUDE_FONT.ui, fontWeight: 700, fontSize: H * 0.019, color: INK}}>{item.label}</div>
              <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.014, color: INK_SOFT, marginTop: 2}}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {sparkLine && (
        <div style={{position: 'absolute', bottom: H * 0.03, left: W * 0.04, right: W * 0.04, fontFamily: CLAUDE_FONT.serif, fontStyle: 'italic', fontSize: H * 0.022, color: INK_SOFT, textAlign: 'center'}}>
          {sparkLine}
        </div>
      )}
    </div>
  );
};
