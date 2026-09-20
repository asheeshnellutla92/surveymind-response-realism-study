import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandVoiceAudit — C09 brand-voice-consistency-auditor centerpiece.
 * Five-sample scoring table (sample × alignment score × flagged phrase) populating row by row.
 * Lowest-scoring sample shown with drifting phrase highlighted in terracotta.
 * Rewritten version appearing below.
 * Source: Branding and AI, Chapter 10 + 5 (Nina Harris).
 */
export const brandVoiceAuditSchema = z.object({
  archetype: z.string().default('Innocent'),
});
export type BrandVoiceAuditProps = z.infer<typeof brandVoiceAuditSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const SAMPLES = [
  { id: 1, text: 'Start fresh every morning with us.', score: 5, flag: 'none', isLowest: false },
  { id: 2, text: 'Simple ingredients, honest taste.', score: 4, flag: 'none', isLowest: false },
  { id: 3, text: "Only 3 left — grab yours before it's gone.", score: 1, flag: '"Only 3 left" — scarcity, not warmth.', isLowest: true },
  { id: 4, text: 'Good mornings start with good choices.', score: 4, flag: 'none', isLowest: false },
  { id: 5, text: 'Last chance to get the summer bundle.', score: 2, flag: '"Last chance" — urgency drift.', isLowest: false },
];

const REWRITE = "The summer bundle is still here, whenever you're ready.";

export const BrandVoiceAudit: React.FC<BrandVoiceAuditProps> = ({ archetype }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const headerIn = clamp(spring({ frame: frame - 8, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);

  const rowSprings = SAMPLES.map((_, i) =>
    clamp(spring({ frame: frame - (14 + i * 10), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );
  const rewriteIn = clamp(spring({ frame: frame - 62, fps, config: { damping: 24, stiffness: 110, mass: 1 } }), 0, 1);
  const sourceIn = clamp(interpolate(frame, [75, 90], [0, 1]), 0, 1);

  const PAD = width * 0.07;
  const TABLE_W = width - PAD * 2;

  const scoreColor = (s: number) => {
    if (s <= 1) return CLAUDE.SPARK;
    if (s <= 2) return '#C4823A';
    if (s <= 3) return CLAUDE.INK_SOFT;
    return '#4A7C59';
  };

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.06}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 34,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 8,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Brand Voice Consistency Audit
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>
      <div style={{
        fontFamily: SANS,
        fontSize: 16,
        color: CLAUDE.INK_SOFT,
        marginBottom: 18,
        opacity: headerIn,
      }}>
        Archetype: <strong style={{ color: CLAUDE.INK }}>{archetype}</strong> · Voice adjectives: warmth, simplicity, honesty
      </div>

      {/* Table */}
      <div style={{
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 18,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          background: CLAUDE.FOOTER,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          opacity: headerIn,
        }}>
          {['#', 'Copy Sample', 'Alignment (1–5)', 'Flagged Phrase'].map((h, ci) => (
            <div key={ci} style={{
              flex: ci === 0 ? '0 0 5%' : ci === 1 ? '1' : ci === 2 ? '0 0 18%' : '0 0 35%',
              padding: '11px 14px',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: CLAUDE.INK_SOFT,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRight: ci < 3 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            }}>{h}</div>
          ))}
        </div>

        {SAMPLES.map((s, ri) => (
          <div key={ri} style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: ri < SAMPLES.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            background: s.isLowest ? 'rgba(217,119,87,0.06)' : 'transparent',
            opacity: rowSprings[ri],
            transform: `translateX(${(1 - rowSprings[ri]) * -14}px)`,
            minHeight: 52,
          }}>
            <div style={{
              flex: '0 0 5%', padding: '12px 14px',
              fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT,
              borderRight: `1px solid ${CLAUDE.BORDER}`,
            }}>{s.id}</div>
            <div style={{
              flex: '1', padding: '12px 14px',
              fontFamily: SERIF, fontSize: 16, color: CLAUDE.INK,
              borderRight: `1px solid ${CLAUDE.BORDER}`,
            }}>
              {s.text}
            </div>
            <div style={{
              flex: '0 0 18%', padding: '12px 14px',
              fontFamily: MONO, fontSize: 22, fontWeight: 700,
              color: scoreColor(s.score),
              borderRight: `1px solid ${CLAUDE.BORDER}`,
              textAlign: 'center',
            }}>{s.score}</div>
            <div style={{
              flex: '0 0 35%', padding: '12px 14px',
              fontFamily: SANS, fontSize: 13,
              color: s.flag !== 'none' ? CLAUDE.SPARK : CLAUDE.GHOST,
              fontStyle: s.flag !== 'none' ? 'normal' : 'italic',
            }}>{s.flag !== 'none' ? s.flag : 'No drift detected'}</div>
          </div>
        ))}
      </div>

      {/* Rewrite of lowest-scoring sample */}
      <div style={{
        padding: '16px 20px',
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        opacity: rewriteIn,
        transform: `translateY(${(1 - rewriteIn) * 10}px)`,
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: CLAUDE.SPARK,
          marginBottom: 8,
        }}>
          Rewritten in Innocent register
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: 20,
          color: CLAUDE.INK,
          fontWeight: 600,
        }}>
          "{REWRITE}"
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 13,
          color: CLAUDE.INK_SOFT,
          marginTop: 8,
        }}>
          Same offer. Warmth replaces urgency. Same informational content.
        </div>
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: PAD,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 10 + 5
      </div>
    </AbsoluteFill>
  );
};
