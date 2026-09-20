import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const hubSpotApiTellSchema = z.object({
  sparkLine: z.string().default('Uniform model and properties= contract both correct. Default property set deferred to references/api.md.'),
});
export type HubSpotApiTellProps = z.infer<typeof hubSpotApiTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Uniform v3 URL model: one path pattern for all object types — learn it once, apply everywhere',
  'Properties opt-in documented with "always pass properties=" — prevents the near-empty record mistake',
  'hsapi() + hs_search.sh remove boilerplate and handle pagination correctly via paging.next.after',
  'Error handling specific: VALIDATION_ERROR → errors[] · CONFLICT → upsert · RATE_LIMITS → retry',
  'Rate limit headers documented per endpoint including separate 5 req/s cap for search',
];

const BITES = [
  'Search eventual consistency mentioned but no retry guidance — read-after-write through search fails silently',
  'Default property set per type deferred to references/api.md — "a handful" leaves devs guessing what comes free',
  'v3 end-of-support date not yet set — "no migration required for now" with no advice on when to check',
  '18-filter search cap stated but workaround for OR groups is just "post raw body" with no example',
  'Association type IDs: only one example (341 deal_to_company) inline — the rest require references/api.md or a live call',
];

const CALLOUT = 'Properties are opt-in and the defaults are minimal. Contacts get hs_object_id, createdate, lastmodifieddate, email, and firstname. A list call without properties= returns records that look almost empty. The skill says "always pass properties=" — but the complete default set per object type is in references/api.md, not inline.';

export const HubSpotApiTell: React.FC<HubSpotApiTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const biteSprings = BITES.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.40;
  const ITEM_H = (H * 0.51) / 5 - 10;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.40;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        HUBSPOT API · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        What it gets right / where it bites
      </div>

      {/* Callout */}
      <div style={{
        position: 'absolute', left: W * 0.04, top: H * 0.255, right: W * 0.04,
        background: 'rgba(217,119,87,0.07)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '10px 16px',
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 8}px)`,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="9" cy="9" r="8" fill="none" stroke={CLAUDE.SPARK} strokeWidth="1.5" />
          <text x="9" y="13.5" textAnchor="middle" fontFamily="serif" fontSize="11" fontWeight="700" fill={CLAUDE.SPARK}>!</text>
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 11.5, color: CLAUDE.INK, lineHeight: 1.55 }}>{CALLOUT}</div>
      </div>

      {/* Gets right column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          GETS RIGHT
        </div>
        {GETS_RIGHT.map((txt, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', alignItems: 'center',
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{txt}</div>
            </div>
          );
        })}
      </div>

      {/* Bites column */}
      <div style={{ position: 'absolute', left: W * 0.52, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(biteSprings[0], 0, 1),
        }}>
          WHERE IT BITES
        </div>
        {BITES.map((txt, i) => {
          const op = clamp(biteSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', alignItems: 'center',
              boxShadow: '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{txt}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
          <polygon points="8,1 10,6 15,6 11,10 13,15 8,12 3,15 5,10 1,6 6,6" fill={CLAUDE.SPARK} />
        </svg>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
