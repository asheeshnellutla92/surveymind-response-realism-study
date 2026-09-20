import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const salesforceApiAnatomySchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof salesforceApiAnatomySchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const LEFT_ITEMS = [
  {label: 'Per-org instance URL', note: 'SALESFORCE_INSTANCE_URL = real My Domain (every org differs)'},
  {label: 'Errors = JSON array', note: 'Success = object — guard every jq projection with type check'},
  {label: 'No SELECT * in SOQL', note: 'FIELDS(ALL/CUSTOM) allowed but requires LIMIT 200'},
  {label: 'Describe = your schema', note: 'Field names · picklist values · __c/__r naming · createable/updateable'},
];

const RIGHT_ITEMS = [
  {label: 'SOQL query', note: 'sf_query.sh — pages nextRecordsUrl, strips attributes, flattens parent paths'},
  {label: 'SOSL search', note: 'GET /search with -G + --data-urlencode q=FIND{...} RETURNING ...'},
  {label: 'CRUD', note: 'POST=create · PATCH=update (204) · DELETE=204 → recycle bin 15d'},
  {label: 'Upsert by external ID', note: 'PATCH /sobjects/Obj/Ext__c/VALUE · 201=created · 200=updated · 300=multi-match'},
  {label: 'Describe sObject', note: 'GET /sobjects/Obj/describe → fields, picklists, childRelationships'},
  {label: 'Composite', note: 'Up to 25 subrequests · @{refName.field} cross-refs · allOrNone · outer 200 ≠ all OK'},
];

export const SalesforceApiAnatomy: React.FC<Props> = ({sparkLine}) => {
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
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>SALESFORCE-API · CLAUDE PLUGINS</span>
        <span style={{fontFamily: CLAUDE_FONT.serif, fontSize: H * 0.048, color: INK, fontWeight: 700, marginLeft: W * 0.03}}>Setup &amp; Operations</span>
      </div>

      {/* LEFT — KEY RULES */}
      <div style={{position: 'absolute', top: COL_TOP, left: LEFT_X, width: LEFT_W}}>
        <div style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.018, color: GREEN, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10}}>KEY RULES</div>
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
