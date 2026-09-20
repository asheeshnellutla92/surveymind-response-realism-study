import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

export const salesforceApiTellSchema = z.object({
  sparkLine: z.string().optional(),
});

type Props = z.infer<typeof salesforceApiTellSchema>;

const PAGE = CLAUDE.PAGE;
const INK = CLAUDE.INK;
const SPARK = CLAUDE.SPARK;
const INK_SOFT = CLAUDE.INK_SOFT;
const BORDER = CLAUDE.BORDER;
const GREEN = '#4A7C59';
const GREEN_BG = '#EAF2EC';
const SPARK_BG = '#FAE8E0';

const GETS_RIGHT = [
  'sf_query.sh paginates nextRecordsUrl, strips attributes envelope, flattens parent-path columns',
  'Error-array shape documented early with the type-guard pattern — not buried in error handling',
  'Upsert 300 documented correctly — external ID matched multiple records, nothing written',
  'Composite: concrete working example with cross-refs, allOrNone, and the outer-200 caveat',
  'Rate limits: Sforce-Limit-Info header shown, daily cap and concurrent cap both explained',
];

const WHERE_BITES = [
  'PATCH 204 only a parenthetical — first-time users misread empty body as failure',
  'SOSL -G flag documented without explaining why — other clients make the same mistake silently',
  '__r relationship syntax not shown with a concrete SOQL example — users discover it via INVALID_FIELD',
  'Composite subrequest version coupling silent — wrong version fails without a helpful error',
  'DELETE recycle-bin cascade warning minimal — master-detail can cascade across many records silently',
];

const CALLOUT = 'Errors in the Salesforce REST API return as a JSON array: [{\"errorCode\": ..., \"message\": ...}]. Success returns as an object. A jq projection written for the success shape will crash with a null dereference when it receives the error array — and the crash swallows the errorCode you need. Always guard: if type == "array" then . else <projection> end.';

export const SalesforceApiTell: React.FC<Props> = ({sparkLine}) => {
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
      <div style={{position: 'absolute', top: 0, left: 0, width: W, height: TITLE_H, borderBottom: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', paddingLeft: W * 0.04}}>
        <span style={{fontFamily: CLAUDE_FONT.mono, fontSize: H * 0.022, color: SPARK, letterSpacing: '0.12em', textTransform: 'uppercase'}}>SALESFORCE-API · CLAUDE PLUGINS</span>
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

      {sparkLine && (
        <div style={{position: 'absolute', bottom: H * 0.01, left: W * 0.04, right: W * 0.04, fontFamily: CLAUDE_FONT.serif, fontStyle: 'italic', fontSize: H * 0.019, color: INK_SOFT, textAlign: 'center'}}>
          {sparkLine}
        </div>
      )}
    </div>
  );
};
