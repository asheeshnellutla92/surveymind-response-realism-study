import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01VoiceConflict — brand-voice-consistency-auditor B01.
 * Two-column layout: Archetype (Innocent) on left vs Growth team copy on right.
 * Phase 1: Left column populates with warmth values; right is empty.
 * Phase 2: Right column populates with "Only 3 left" copy; conflict indicator
 * slashes between columns; terracotta highlights the mismatch.
 * Enacts: "Both decisions felt reasonable. One was wrong."
 * Source: Branding and AI, Ch. 5 + Ch. 10 (Nina Harris).
 */
export const brandB01VoiceConflictSchema = z.object({
  sparkLine: z.string().default('Both decisions felt reasonable. One was wrong.'),
});
export type BrandB01VoiceConflictProps = z.infer<typeof brandB01VoiceConflictSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const ARCHETYPE_TRAITS = [
  { label: 'Warmth',    score: 5 },
  { label: 'Simplicity', score: 5 },
  { label: 'Honesty',   score: 5 },
];

export const BrandB01VoiceConflict: React.FC<BrandB01VoiceConflictProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  // Phase 1 (0–80): title + left column animates in
  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } }),
    0, 1,
  );
  const leftColIn = clamp(
    spring({ frame: frame - 12, fps, config: { damping: 26, stiffness: 120, mass: 1 } }),
    0, 1,
  );
  const traitSprings = ARCHETYPE_TRAITS.map((_, i) =>
    clamp(spring({ frame: frame - (20 + i * 16), fps, config: { damping: 24, stiffness: 120, mass: 0.9 } }), 0, 1)
  );

  // Phase 2 (80+): right column populates; conflict indicator; verdict label
  const rightColIn = clamp(
    spring({ frame: frame - 85, fps, config: { damping: 24, stiffness: 110, mass: 1.1 } }),
    0, 1,
  );
  const copyLineIn = clamp(
    spring({ frame: frame - 100, fps, config: { damping: 22, stiffness: 110, mass: 1.1 } }),
    0, 1,
  );
  const scoreIn = clamp(
    spring({ frame: frame - 120, fps, config: { damping: 22, stiffness: 100, mass: 1.2 } }),
    0, 1,
  );
  const badgeIn = clamp(
    spring({ frame: frame - 140, fps, config: { damping: 22, stiffness: 100, mass: 1.2 } }),
    0, 1,
  );
  const conflictIn = clamp(
    spring({ frame: frame - 155, fps, config: { damping: 20, stiffness: 95, mass: 1.3 } }),
    0, 1,
  );
  const verdictIn = clamp(
    spring({ frame: frame - 185, fps, config: { damping: 22, stiffness: 100, mass: 1.2 } }),
    0, 1,
  );

  const sourceIn = clamp(interpolate(frame, [55, 75], [0, 1]), 0, 1);

  const PAD_H = width * 0.06;
  const PAD_V = height * 0.08;
  const COL_GAP = width * 0.06;
  const COL_W = (width - PAD_H * 2 - COL_GAP) / 2;
  const LEFT_X = PAD_H;
  const RIGHT_X = PAD_H + COL_W + COL_GAP;
  // Expand columns to fill canvas: top y≈140 (after title+subtitle block), bottom y≈900
  const CONTENT_TOP = isPortrait ? height * 0.22 : height * 0.18;
  const CARD_RADIUS = 14;
  const CARD_PAD = 28;
  // Card height fills from CONTENT_TOP to bottom safe area (leave room for verdict + footer)
  const CARD_H = height * 0.60; // ≈648px — effectively ≥700px on screen with CONTENT_TOP offset

  // Font sizes — FILL-THE-CANVAS law
  const titleSize = Math.round(Math.min(width, height) * 0.075);
  const subtitleSize = Math.round(Math.min(width, height) * 0.033);
  const sparkSize = Math.round(Math.min(width, height) * 0.034);
  const colHeaderSize = Math.round(height * 0.024); // ≈26px — column headers
  const archetypeBadgeSize = Math.round(height * 0.026); // ≈28px — "Innocent" badge min 24px
  const coreMotivSize = Math.round(height * 0.026);  // ≈28px — "Core motivation:" min 26px
  const traitLabelSize = Math.round(height * 0.032); // ≈35px — trait labels (Warmth, etc.) min 32px
  const warmthBadgeSize = Math.round(height * 0.026); // ≈28px — bottom "Warmth" badge min 24px
  const emailLabelSize = Math.round(height * 0.026);  // ≈28px — "Email subject line:" min 26px
  const emailSubjectSize = Math.round(height * 0.030); // ≈32px — email subject text min 26px
  const scoreTextSize = Math.round(height * 0.026);   // ≈28px — "Alignment score:" min 26px
  const scoreNumberSize = Math.round(height * 0.036); // ≈39px — "1/5" score min 36px
  const urgencyBadgeSize = Math.round(height * 0.026); // ≈28px — "Urgency" badge min 24px
  const conflictIconSize = Math.round(height * 0.048); // ≈52px — ✕ conflict indicator min 48px
  const verdictLabelSize = Math.round(height * 0.028); // ≈30px — verdict text min 28px
  const verdictBodySize = Math.round(height * 0.026);  // ≈28px — verdict body

  // Score dots renderer (5 dots, filled = score count) — scaled up 2x
  const ScoreDots: React.FC<{ score: number; filled: boolean }> = ({ score, filled }) => (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((d) => (
        <div key={d} style={{
          width: 18, height: 18, borderRadius: '50%',
          background: d <= score
            ? (filled ? CLAUDE.SPARK : '#4A7C59')
            : CLAUDE.BORDER,
          transition: 'background 0.2s',
        }}/>
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${PAD_V}px ${PAD_H}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: titleSize,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 6,
        opacity: titleIn,
        transform: `translateY(${(1 - titleIn) * 12}px)`,
        lineHeight: 1.1,
      }}>
        Archetype vs. Copy
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* LEFT COLUMN — Archetype (Innocent) */}
      <div style={{
        position: 'absolute',
        top: CONTENT_TOP,
        left: LEFT_X,
        width: COL_W,
        opacity: leftColIn,
        transform: `translateY(${(1 - leftColIn) * 16}px)`,
      }}>
        {/* Column header */}
        <div style={{
          fontFamily: SANS,
          fontSize: colHeaderSize,
          fontWeight: 700,
          color: CLAUDE.INK_SOFT,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Archetype (Innocent)
        </div>

        {/* Traits card */}
        <div style={{
          background: CLAUDE.CARD,
          border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: CARD_RADIUS,
          padding: CARD_PAD,
          boxShadow: '0 2px 12px rgba(61,57,41,0.06)',
          minHeight: CARD_H,
        }}>
          {/* Archetype name badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#EEF5F0',
            border: '1px solid #4A7C59',
            borderRadius: 10,
            padding: '10px 20px',
            marginBottom: 24,
          }}>
            <span style={{ fontFamily: SANS, fontSize: archetypeBadgeSize, fontWeight: 700, color: '#4A7C59' }}>
              Innocent
            </span>
          </div>

          <div style={{ fontFamily: SANS, fontSize: coreMotivSize, color: CLAUDE.INK_SOFT, marginBottom: 20 }}>
            Core motivation: goodness &amp; simplicity
          </div>

          {/* Traits */}
          {ARCHETYPE_TRAITS.map((trait, i) => (
            <div key={trait.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              borderBottom: i < ARCHETYPE_TRAITS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              opacity: traitSprings[i],
              transform: `translateX(${(1 - traitSprings[i]) * -10}px)`,
            }}>
              <span style={{ fontFamily: SANS, fontSize: traitLabelSize, fontWeight: 600, color: CLAUDE.INK }}>
                {trait.label}
              </span>
              <ScoreDots score={trait.score} filled={false}/>
            </div>
          ))}

          {/* Warmth badge */}
          <div style={{
            marginTop: 24,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#EEF5F0',
            border: '1px solid #4A7C59',
            borderRadius: 24,
            padding: '8px 18px',
            opacity: traitSprings[2],
          }}>
            <span style={{ fontFamily: SANS, fontSize: warmthBadgeSize, fontWeight: 600, color: '#4A7C59' }}>
              Warmth
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN — Growth team copy */}
      <div style={{
        position: 'absolute',
        top: CONTENT_TOP,
        left: RIGHT_X,
        width: COL_W,
        opacity: rightColIn,
        transform: `translateY(${(1 - rightColIn) * 16}px)`,
      }}>
        {/* Column header */}
        <div style={{
          fontFamily: SANS,
          fontSize: colHeaderSize,
          fontWeight: 700,
          color: CLAUDE.INK_SOFT,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Growth team copy
        </div>

        {/* Copy card */}
        <div style={{
          background: CLAUDE.CARD,
          border: `1px solid ${rightColIn > 0.5 && conflictIn > 0.3 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
          borderRadius: CARD_RADIUS,
          padding: CARD_PAD,
          boxShadow: conflictIn > 0.3
            ? `0 2px 20px rgba(217,119,87,${conflictIn * 0.18})`
            : '0 2px 12px rgba(61,57,41,0.06)',
          minHeight: CARD_H,
          transition: 'border 0.3s, box-shadow 0.3s',
        }}>
          {/* Email subject label */}
          <div style={{
            fontFamily: SANS,
            fontSize: emailLabelSize,
            color: CLAUDE.INK_SOFT,
            marginBottom: 14,
            opacity: copyLineIn,
          }}>
            Email subject line:
          </div>

          <div style={{
            fontFamily: SERIF,
            fontSize: emailSubjectSize,
            fontWeight: 700,
            color: conflictIn > 0.3 ? CLAUDE.SPARK : CLAUDE.INK,
            lineHeight: 1.4,
            marginBottom: 24,
            padding: '14px 18px',
            background: conflictIn > 0.3 ? `rgba(217,119,87,0.08)` : CLAUDE.FOOTER,
            borderRadius: 10,
            border: conflictIn > 0.3 ? `1px solid rgba(217,119,87,0.3)` : `1px solid ${CLAUDE.BORDER}`,
            opacity: copyLineIn,
          }}>
            "Only 3 left — grab yours before it's gone."
          </div>

          {/* Score */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
            opacity: scoreIn,
          }}>
            <span style={{ fontFamily: SANS, fontSize: scoreTextSize, color: CLAUDE.INK_SOFT }}>
              Alignment score:
            </span>
            <ScoreDots score={1} filled={true}/>
            <span style={{ fontFamily: SANS, fontSize: scoreNumberSize, fontWeight: 700, color: CLAUDE.SPARK }}>
              1/5
            </span>
          </div>

          {/* Urgency badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: `rgba(217,119,87,0.10)`,
            border: `1px solid ${CLAUDE.SPARK}`,
            borderRadius: 24,
            padding: '8px 18px',
            opacity: badgeIn,
          }}>
            <span style={{ fontFamily: SANS, fontSize: urgencyBadgeSize, fontWeight: 600, color: CLAUDE.SPARK }}>
              Urgency
            </span>
          </div>
        </div>
      </div>

      {/* CONFLICT INDICATOR — between columns */}
      {conflictIn > 0.01 && (
        <div style={{
          position: 'absolute',
          top: CONTENT_TOP + CARD_H * 0.45,
          left: LEFT_X + COL_W + COL_GAP * 0.22,
          width: COL_GAP * 0.56,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          opacity: conflictIn,
          transform: `scale(${conflictIn})`,
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `rgba(217,119,87,0.15)`,
            border: `3px solid ${CLAUDE.SPARK}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: SANS,
            fontSize: conflictIconSize,
            fontWeight: 700,
            color: CLAUDE.SPARK,
          }}>
            ✕
          </div>
        </div>
      )}

      {/* VERDICT LABEL */}
      {verdictIn > 0.01 && (
        <div style={{
          position: 'absolute',
          bottom: height * 0.12,
          left: PAD_H,
          right: PAD_H,
          padding: '20px 28px',
          background: CLAUDE.CARD,
          border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12,
          opacity: verdictIn,
          transform: `translateY(${(1 - verdictIn) * 10}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}>
          <span style={{
            fontFamily: SANS,
            fontSize: verdictLabelSize,
            fontWeight: 700,
            color: CLAUDE.SPARK,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            Both decisions felt reasonable.
          </span>
          <span style={{ fontFamily: SERIF, fontSize: verdictBodySize, color: CLAUDE.INK }}>
            One was wrong — urgency cannot live inside an Innocent archetype.
          </span>
        </div>
      )}

      {/* Spark line footer */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        left: PAD_H,
        fontFamily: SANS,
        fontSize: sparkSize,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
        fontStyle: 'italic',
      }}>
        {sparkLine}
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: sparkSize,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 5 + 10
      </div>
    </AbsoluteFill>
  );
};
