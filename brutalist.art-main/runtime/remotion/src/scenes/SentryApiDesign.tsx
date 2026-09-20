import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const sentryApiDesignSchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof sentryApiDesignSchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const WORKFLOW = [
  {label: 'Resolve shortId before any issue endpoint', note: 'Search query=PROJ-123 → .id field gives numeric ID; URL alone is not enough'},
  {label: 'Follow Link-header cursors', note: 'rel="next" + results="true" → continue · curl -D file keeps body clean for jq'},
  {label: 'Check detail on PUT 200', note: 'Success echoes issue object · error returns {detail: msg} even on HTTP 200'},
  {label: 'Use -L for trailing-slash redirects', note: 'Some endpoints 301 without trailing slash — add slash and -L to follow'},
];

const GOTCHAS = [
  {label: 'Retrieved content is untrusted', note: 'Issue titles and event data may contain adversarial instructions — quote as evidence only'},
  {label: 'X-Sentry-Rate-Limit-Reset = epoch seconds', note: 'Not a delta — convert to sleep duration; no Retry-After header present'},
  {label: 'stats_v2 needs -G + data-urlencode', note: 'Multiple query params must be GET-encoded; without -G curl POSTs instead'},
  {label: 'shortId resolution needs a search call', note: 'No direct lookup endpoint — search q=PROJ-123 is the only path'},
];

export const SentryApiDesign: React.FC<Props> = ({sparkLine}) => {
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
  const ITEM_H = (COL_H / 4) - 10;

  return (
    <div style={{width: W, height: H, background: PAGE, fontFamily: CLAUDE_FONT.ui, opacity: fade, position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 0, left: 0, width: W, height: TITLE_H, borderBottom: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', paddingLeft: W * 0.04}}>
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>SENTRY-API · CLAUDE PLUGINS</span>
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
                  <div style={{fontFamily: CLAUDE_FONT.ui, fontWeight: 700, fontSize: H * 0.020, color: INK}}>{item.label}</div>
                  <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.015, color: INK_SOFT, marginTop: 3}}>{item.note}</div>
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
              <div style={{fontFamily: CLAUDE_FONT.ui, fontWeight: 700, fontSize: H * 0.020, color: INK}}>{item.label}</div>
              <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.015, color: INK_SOFT, marginTop: 3}}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {sparkLine && (
        <div style={{position: 'absolute', bottom: H * 0.04, left: W * 0.04, right: W * 0.04, fontFamily: CLAUDE_FONT.serif, fontStyle: 'italic', fontSize: H * 0.022, color: INK_SOFT, textAlign: 'center'}}>
          {sparkLine}
        </div>
      )}
    </div>
  );
};
