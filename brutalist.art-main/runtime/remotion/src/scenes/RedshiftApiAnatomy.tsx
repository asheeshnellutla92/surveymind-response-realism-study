import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const redshiftApiAnatomySchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof redshiftApiAnatomySchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const LEFT_ITEMS = [
  {label: 'POST only — no REST paths', note: 'redshift-data.<region>.amazonaws.com/ · X-Amz-Target header'},
  {label: 'Region required', note: 'AWS_DEFAULT_REGION — part of endpoint hostname'},
  {label: 'RS_TARGET — connection mode', note: 'WorkgroupName · ClusterIdentifier+DbUser · SecretArn'},
  {label: 'rsapi() helper', note: 'wraps endpoint + headers + action name; auth by runtime'},
];

const RIGHT_ITEMS = [
  {label: 'Run query', note: 'rs_query.sh — submit, poll, page, decode typed cells'},
  {label: 'Resume by ID', note: 'DescribeStatement → GetStatementResult · Duration in nanoseconds'},
  {label: 'Cancel', note: 'CancelStatement — best-effort; confirm with DescribeStatement'},
  {label: 'BatchExecuteStatement', note: 'all commit or all roll back · sub-statement IDs :1 :2 …'},
  {label: 'ListStatements', note: 'defaults to finished only; pass Status ALL to see everything'},
  {label: 'Catalog browse', note: 'ListDatabases / ListSchemas / ListTables / DescribeTable · all paginate'},
];

export const RedshiftApiAnatomy: React.FC<Props> = ({sparkLine}) => {
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
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>REDSHIFT-API · CLAUDE PLUGINS</span>
        <span style={{fontFamily: CLAUDE_FONT.serif, fontSize: H * 0.048, color: INK, fontWeight: 700, marginLeft: W * 0.03}}>Setup &amp; Operations</span>
      </div>

      {/* LEFT — REQUEST SETUP */}
      <div style={{position: 'absolute', top: COL_TOP, left: LEFT_X, width: LEFT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: GREEN, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10}}>REQUEST SETUP</div>
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
