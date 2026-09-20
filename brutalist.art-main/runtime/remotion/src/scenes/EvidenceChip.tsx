import React from 'react';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * EvidenceChip — fashionista modifier's three evidence-tier chips.
 *
 * RENDERED  (warm ink)  — visible in the generated frame: says "rendering", not "garment".
 * REFERENCE (#0072B2)   — the real, checkable thing the look cites: a house, a decade, a tradition.
 * CALL      (#D55E00)   — Liam's judgment, marked as judgment.
 * NOT_DETERMINABLE      — stated plainly for fibre content, construction, drape, price, availability.
 *
 * NO numeric scores. No invented instruments. These chips enforce that law.
 * Used as a sub-component inside LookPlate / LookPlate916; also registered as
 * a standalone Composition for Studio preview.
 */

export const TIER_COLORS = {
  RENDERED:          CLAUDE.INK,          // warm ink — what can be seen in the frame
  REFERENCE:         '#0072B2',           // Okabe-Ito blue — real, checkable source
  CALL:              '#D55E00',           // Okabe-Ito vermillion — judgment
  NOT_DETERMINABLE:  CLAUDE.INK_SOFT,    // muted — honest absence of evidence
} as const;

export const TIER_LABELS = {
  RENDERED:         'RENDERED',
  REFERENCE:        'REFERENCE',
  CALL:             'CALL',
  NOT_DETERMINABLE: 'NOT DETERMINABLE',
} as const;

export const evidenceChipSchema = z.object({
  tier: z.enum(['RENDERED', 'REFERENCE', 'CALL', 'NOT_DETERMINABLE']),
  text: z.string(),
  fontSize: z.number().optional(),
});
export type EvidenceChipProps = z.infer<typeof evidenceChipSchema>;

export const EvidenceChip: React.FC<EvidenceChipProps> = ({ tier, text, fontSize = 18 }) => {
  const labelColor = TIER_COLORS[tier];
  const isND = tier === 'NOT_DETERMINABLE';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: isND ? 2 : 6,
    }}>
      {/* tier label */}
      <span style={{
        fontFamily: CLAUDE_FONT.ui,
        fontSize: fontSize * 0.72,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
        color: labelColor,
        whiteSpace: 'nowrap' as const,
        lineHeight: 1.6,
        flexShrink: 0,
        minWidth: 118,
        paddingTop: 2,
        fontStyle: isND ? 'italic' : 'normal',
      }}>
        {TIER_LABELS[tier]}
      </span>
      {/* evidence text */}
      <span style={{
        fontFamily: CLAUDE_FONT.serif,
        fontSize,
        fontStyle: isND ? 'italic' : 'normal',
        color: isND ? CLAUDE.GHOST : CLAUDE.INK,
        lineHeight: 1.45,
        flexShrink: 1,
      }}>
        {text}
      </span>
    </div>
  );
};
