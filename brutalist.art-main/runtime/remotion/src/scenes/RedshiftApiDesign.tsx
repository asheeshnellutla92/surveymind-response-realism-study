import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const redshiftApiDesignSchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof redshiftApiDesignSchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const WORKFLOW = [
  {label: 'Poll before reading results', note: 'ExecuteStatement 200 ≠ SQL success — always confirm FINISHED+HasResultSet'},
  {label: 'Decode cells with to_entries[0].value', note: 'Typed one-key objects — false/0 break jq // chain; isNull is distinct'},
  {label: 'Respect 3 TPS catalog rate', note: 'ListDatabases/Schemas/Tables/DescribeTable — far below execute\'s 30 TPS'},
  {label: 'Batch: fetch each sub-result', note: 'Parent DescribeStatement → SubStatements[] :1 :2 → GetStatementResult each'},
];

const GOTCHAS = [
  {label: 'ExecuteStatement not idempotent', note: 'Pass ClientToken to make retries safe — check ListStatements before retrying a write'},
  {label: 'Result retention 24 hours', note: 'Old statement IDs return ResourceNotFoundException — data is gone'},
  {label: 'Error envelope hides in 400/500', note: '{__type, message} instead of expected field — check for absent Id/Status first'},
  {label: '500 MB result limit', note: 'Larger results fail with unclear error — add LIMIT or UNLOAD to S3'},
];

export const RedshiftApiDesign: React.FC<Props> = ({sparkLine}) => {
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
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>REDSHIFT-API · CLAUDE PLUGINS</span>
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
