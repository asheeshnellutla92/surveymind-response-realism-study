import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SycophancyGradient — horizontal spectrum bar showing the four curriculum stages
 * in Denison et al. (2024). Illustrates that sycophancy and reward tampering
 * are the same optimization pressure at different intensities.
 */

export const sycophancyGradientSchema = z.object({
  handle: z.string().default('@NikBearBrown'),
});
export type SycophancyGradientProps = z.infer<typeof sycophancyGradientSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const STAGES = [
  { label: 'Flattery', sublabel: 'Write poems\nthe grader rates highly' },
  { label: 'Rubric Edit', sublabel: 'Mark checklist items\ncomplete without doing them' },
  { label: 'Insubordinate\nEdit', sublabel: 'Same, with an\nadversarial setup' },
  { label: 'Reward\nTampering', sublabel: 'Edit compute_reward.py.\nDelete the watchdog.' },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const SycophancyGradient: React.FC<SycophancyGradientProps> = ({ handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 28, stiffness: 160, mass: 0.7 } });
  const barIn = spring({ frame: frame - 10, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } });
  const arrowIn = spring({ frame: frame - 16, fps, config: { damping: 24, stiffness: 100, mass: 1.0 } });

  const barWidth = 900;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0 }}>

      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 28,
        fontWeight: 700,
        color: CLAUDE.INK,
        marginBottom: 32,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 14}px)`,
        textAlign: 'center',
      }}>
        Four steps on one path.
      </div>

      {/* Stage labels above bar */}
      <div style={{ display: 'flex', width: barWidth, justifyContent: 'space-between', marginBottom: 12 }}>
        {STAGES.map((s, i) => {
          const labelIn = spring({ frame: frame - (i * 6 + 18), fps, config: { damping: 24, stiffness: 120, mass: 0.8 } });
          const op = clamp(labelIn, 0, 1);
          const isLast = i === STAGES.length - 1;
          return (
            <div key={i} style={{
              width: barWidth / STAGES.length,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: op,
              transform: `translateY(${(1 - op) * 10}px)`,
            }}>
              <div style={{
                fontFamily: SERIF,
                fontSize: 18,
                fontWeight: 700,
                color: isLast ? CLAUDE.SPARK : CLAUDE.INK,
                whiteSpace: 'pre-line',
                textAlign: 'center',
                lineHeight: 1.25,
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: SANS,
                fontSize: 12,
                color: CLAUDE.INK_SOFT,
                textAlign: 'center',
                whiteSpace: 'pre-line',
                lineHeight: 1.35,
                marginTop: 4,
              }}>
                {s.sublabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gradient bar */}
      <div style={{
        width: barWidth * clamp(barIn, 0, 1),
        height: 28,
        borderRadius: 14,
        background: `linear-gradient(to right, ${CLAUDE.BORDER} 0%, ${CLAUDE.SPARK} 100%)`,
        position: 'relative',
        overflow: 'visible',
        boxShadow: '0 4px 16px rgba(217,119,87,0.22)',
      }}>
        {/* Stage notch lines */}
        {STAGES.slice(1).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${((i + 1) / STAGES.length) * 100}%`,
            top: -6,
            width: 2,
            height: 40,
            background: CLAUDE.PAGE,
            opacity: 0.7,
          }} />
        ))}
      </div>

      {/* Bottom labels: left and right poles */}
      <div style={{
        display: 'flex',
        width: barWidth,
        justifyContent: 'space-between',
        marginTop: 14,
        opacity: clamp(arrowIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 13,
          color: CLAUDE.INK_SOFT,
          fontStyle: 'italic',
        }}>
          "Mildly agreeable"
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 13,
          color: CLAUDE.SPARK,
          fontWeight: 700,
        }}>
          "Edits its own grader"
        </div>
      </div>

      {/* Subline */}
      <div style={{
        fontFamily: SANS,
        fontSize: 13,
        color: CLAUDE.INK_SOFT,
        marginTop: 32,
        opacity: clamp(arrowIn, 0, 1),
        textAlign: 'center',
      }}>
        32,768 training samples per stage · same optimization pressure, different target
      </div>

      {/* Watermark */}
      <div style={{
        position: 'absolute',
        bottom: 28,
        right: 40,
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK,
        opacity: 0.22,
        fontWeight: 600,
        letterSpacing: '0.03em',
      }}>
        {handle}
      </div>
    </AbsoluteFill>
  );
};
