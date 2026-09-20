import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const hubSpotApiAnatomySchema = z.object({
  sparkLine: z.string().default('Uniform v3 path. Properties opt-in. Dedup by email/domain. Search capped at 10,000.'),
});
export type HubSpotApiAnatomyProps = z.infer<typeof hubSpotApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const CRM_FUNDAMENTALS = [
  { label: 'Uniform v3 URL', note: '/crm/v3/objects/{objectType} — same ops for all types', color: '#4A7C59' },
  { label: 'Properties opt-in', note: 'reads without properties= return near-empty records', color: CLAUDE.SPARK },
  { label: 'Dedup keys', note: 'contacts→email · companies→domain · deals+tickets: none', color: '#4A7C59' },
  { label: 'Associations typed', note: 'v4 endpoints for labels · built-in type IDs per pair', color: '#4A7C59' },
];

const QUERY_PRIMITIVES = [
  { label: 'hsapi() helper', note: 'bearer header + Content-Type on every curl', color: '#4A7C59' },
  { label: 'hs_search.sh', note: 'filter/sort/pagination · follows paging.next.after cursor', color: '#4A7C59' },
  { label: 'Search: 10,000 cap', note: 'hard limit per query · eventual consistency on new records', color: CLAUDE.SPARK },
];

export const HubSpotApiAnatomy: React.FC<HubSpotApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const fundSprings = CRM_FUNDAMENTALS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const primSprings = QUERY_PRIMITIVES.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.42;
  const ITEM_H = (H * 0.64) / 4 - 10;
  const RIGHT_ITEM_H = (H * 0.45) / 3 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        HUBSPOT API · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        CRM data model + query primitives
      </div>

      {/* CRM Fundamentals — left */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(fundSprings[0], 0, 1),
        }}>
          CRM MODEL
        </div>
        {CRM_FUNDAMENTALS.map((item, i) => {
          const op = clamp(fundSprings[i], 0, 1);
          const isWarn = item.color === CLAUDE.SPARK;
          return (
            <div key={i} style={{
              background: isWarn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${isWarn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isWarn ? '0 1px 6px rgba(217,119,87,0.07)' : '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isWarn ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Query Primitives — right */}
      <div style={{ position: 'absolute', left: W * 0.54, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(primSprings[0], 0, 1),
        }}>
          HELPERS
        </div>
        {QUERY_PRIMITIVES.map((item, i) => {
          const op = clamp(primSprings[i], 0, 1);
          const isWarn = item.color === CLAUDE.SPARK;
          return (
            <div key={i} style={{
              background: isWarn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${isWarn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 10,
              height: RIGHT_ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: isWarn ? '0 1px 6px rgba(217,119,87,0.07)' : '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isWarn ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
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
