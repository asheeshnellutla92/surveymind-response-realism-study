import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const a5aInputWiringSchema = z.object({
  sparkLine: z.string().default('The label is the instruction.'),
});
export type A5aInputWiringProps = z.infer<typeof a5aInputWiringSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FIELDS = [
  {
    type: 'Textbox',
    varName: 'user_query',
    badLabel: 'user_query',
    goodLabel: 'What would you like to know?',
    icon: '☰',
  },
  {
    type: 'Dropdown',
    varName: 'output_format',
    badLabel: 'output_format',
    goodLabel: 'How should I format the answer?',
    icon: '▾',
  },
  {
    type: 'Slider',
    varName: 'max_results',
    badLabel: 'max_results',
    goodLabel: 'How many results? (1–10)',
    icon: '⊸',
  },
];

export const A5aInputWiring: React.FC<A5aInputWiringProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const subIn    = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rowIns = FIELDS.map((_, i) =>
    spring({ frame: frame - (18 + i * 12), fps, config: { damping: 28, stiffness: 120, mass: 0.9 } })
  );

  const ruleIn  = spring({ frame: frame - 58, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 74, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.07,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        INFO 7375 · ASSIGNMENT 5A · PART 1
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.125,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 40,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        Wire Your Inputs from the Data Contract
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute',
        top: height * 0.255,
        left: width * 0.07,
        right: width * 0.07,
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1fr 1fr',
        gap: 16,
        opacity: clamp(subIn, 0, 1),
      }}>
        <div />
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, textAlign: 'center' }}>
          Widget type
        </div>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#C0392B', textTransform: 'uppercase' as const, textAlign: 'center' }}>
          ✗ Wrong label
        </div>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#1A6E3A', textTransform: 'uppercase' as const, textAlign: 'center' }}>
          ✓ Right label
        </div>
      </div>

      {/* Field rows */}
      <div style={{
        position: 'absolute',
        top: height * 0.315,
        left: width * 0.07,
        right: width * 0.07,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {FIELDS.map((f, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 1fr 1fr',
            gap: 16,
            alignItems: 'center',
            opacity: clamp(rowIns[i], 0, 1),
            transform: `translateY(${(1 - clamp(rowIns[i], 0, 1)) * 14}px)`,
          }}>
            {/* Icon */}
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: CLAUDE.PILL,
              border: `1.5px solid ${CLAUDE.BORDER}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: SANS,
              fontSize: 22,
              color: CLAUDE.SPARK,
            }}>
              {f.icon}
            </div>

            {/* Widget type */}
            <div style={{
              background: CLAUDE.PILL,
              border: `1.5px solid ${CLAUDE.BORDER}`,
              borderRadius: 10,
              padding: '10px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: CLAUDE.INK }}>{f.type}</div>
            </div>

            {/* Bad label */}
            <div style={{
              background: '#FFF5F5',
              border: '1.5px solid #FCBDBD',
              borderRadius: 10,
              padding: '10px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#9B2C1A' }}>{f.badLabel}</div>
            </div>

            {/* Good label */}
            <div style={{
              background: '#F0FAF4',
              border: '1.5px solid #52C47C',
              borderRadius: 10,
              padding: '10px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: '#1A6E3A', lineHeight: 1.3 }}>{f.goodLabel}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Rule bar */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.135,
        left: width * 0.07,
        right: width * 0.07,
        background: CLAUDE.PILL,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '11px 22px',
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK_SOFT,
        lineHeight: 1.4,
        opacity: clamp(ruleIn, 0, 1),
        transform: `translateY(${(1 - clamp(ruleIn, 0, 1)) * 8}px)`,
      }}>
        Read each label out loud as your Part 2 user — with no context. If it's not obvious, rewrite it.
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.065,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
