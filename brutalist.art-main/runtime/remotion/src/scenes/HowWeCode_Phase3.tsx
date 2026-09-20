import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HowWeCode_Phase3 — Phase 3: Verifiable Component Architecture
 * Source: cwc-workshops/how-we-claude-code, Anthropic
 *
 * Two-column layout:
 *   Left:  "Component Contract" card — code-like card showing three component contracts
 *   Right: Terminal verification output — line-by-line reveal
 *          "✓ Header renders with title"        (INK — pass)
 *          "✓ DataTable sorts by column"         (INK — pass)
 *          "✗ Chart initializes without data"    (TERRACOTTA — the caught bug)
 *
 * Terracotta: the FAILING line on the right — the one bug caught before shipping.
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const howWeCodePhase3Schema = z.object({
  sparkLine: z.string().default('The test suite is the output.'),
});
export type HowWeCodePhase3Props = z.infer<typeof howWeCodePhase3Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Component contracts shown in the left panel
const CONTRACTS = [
  {
    name: 'Header',
    props: 'title (string), nav (array)',
    expected: '→ renders nav links',
  },
  {
    name: 'DataTable',
    props: 'rows (array), sort (boolean)',
    expected: '→ columns sortable',
  },
  {
    name: 'Chart',
    props: 'data (array)',
    expected: '→ initializes without error',
  },
];

// Verification output lines for the right panel
const VERIFY_LINES = [
  { icon: '✓', text: 'Header renders with title', pass: true },
  { icon: '✓', text: 'DataTable sorts by column', pass: true },
  { icon: '✗', text: 'Chart initializes without data', pass: false },
];

export const HowWeCode_Phase3: React.FC<HowWeCodePhase3Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.065;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Left panel slides in
  const leftIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });

  // Right panel appears slightly after
  const rightIn = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });

  // Each verify line animates in sequentially (30 frames apart, starting at frame 30)
  const lineDelay = 30;
  const lineAnims = VERIFY_LINES.map((_, i) =>
    spring({
      frame: frame - (30 + i * lineDelay),
      fps,
      config: { damping: 24, stiffness: 120, mass: 0.8 },
    })
  );

  // "bun run verify" command reveal
  const cmdIn = spring({ frame: frame - 15, fps, config: { damping: 28, stiffness: 110, mass: 0.8 } });

  const sparkIn = spring({
    frame: frame - (30 + VERIFY_LINES.length * lineDelay + 20),
    fps,
    config: { damping: 28, stiffness: 100, mass: 0.8 },
  });
  const citeIn = spring({
    frame: frame - (30 + VERIFY_LINES.length * lineDelay + 28),
    fps,
    config: { damping: 28, stiffness: 100, mass: 0.8 },
  });

  // Layout
  const CONTENT_TOP = height * 0.28;
  const CONTENT_H = height * 0.54;
  const GAP = width * 0.03;
  const COL_W = (width - PAD_X * 2 - GAP) / 2;
  const leftX = PAD_X;
  const rightX = PAD_X + COL_W + GAP;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.015,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        PHASE 3 · VERIFIABLE COMPONENT ARCHITECTURE
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.058,
        fontFamily: SERIF,
        fontSize: height * 0.038,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        DOM contracts. Machine-readable. Verifiable.
      </div>

      {/* ── LEFT COLUMN: Component Contract card ── */}
      <div style={{
        position: 'absolute',
        left: leftX,
        top: CONTENT_TOP,
        width: COL_W,
        height: CONTENT_H,
        borderRadius: 14,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        padding: '22px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        opacity: clamp(leftIn, 0, 1),
        transform: `translateX(${(1 - leftIn) * -20}px)`,
      }}>
        {/* Card header */}
        <div style={{
          fontFamily: SANS,
          fontSize: height * 0.012,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT,
          marginBottom: 18,
        }}>
          Component Contracts
        </div>

        {/* Contract rows */}
        {CONTRACTS.map((contract, i) => (
          <div key={i} style={{
            width: '100%',
            marginBottom: 18,
            paddingBottom: 18,
            borderBottom: i < CONTRACTS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
          }}>
            {/* Component name */}
            <div style={{
              fontFamily: MONO,
              fontSize: height * 0.02,
              fontWeight: 700,
              color: CLAUDE.INK,
              marginBottom: 6,
            }}>
              {contract.name}
            </div>

            {/* Props line */}
            <div style={{
              fontFamily: MONO,
              fontSize: height * 0.014,
              color: CLAUDE.INK_SOFT,
              marginBottom: 4,
              lineHeight: 1.4,
            }}>
              props: {contract.props}
            </div>

            {/* Expected output */}
            <div style={{
              fontFamily: MONO,
              fontSize: height * 0.014,
              color: CLAUDE.GHOST,
              lineHeight: 1.4,
            }}>
              {contract.expected}
            </div>
          </div>
        ))}
      </div>

      {/* ── RIGHT COLUMN: Verification terminal output ── */}
      <div style={{
        position: 'absolute',
        left: rightX,
        top: CONTENT_TOP,
        width: COL_W,
        height: CONTENT_H,
        borderRadius: 14,
        background: '#1C1917',
        border: `1.5px solid #2D2A24`,
        padding: '22px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        opacity: clamp(rightIn, 0, 1),
        transform: `translateX(${(1 - rightIn) * 20}px)`,
      }}>
        {/* Terminal header */}
        <div style={{
          fontFamily: SANS,
          fontSize: height * 0.012,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase' as const,
          color: '#5A5248',
          marginBottom: 18,
        }}>
          Terminal
        </div>

        {/* bun run verify command */}
        <div style={{
          fontFamily: MONO,
          fontSize: height * 0.016,
          color: '#8B8070',
          marginBottom: 20,
          opacity: clamp(cmdIn, 0, 1),
        }}>
          $ bun run verify
        </div>

        {/* Verification lines */}
        {VERIFY_LINES.map((line, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            opacity: clamp(lineAnims[i], 0, 1),
            transform: `translateX(${(1 - clamp(lineAnims[i], 0, 1)) * 16}px)`,
          }}>
            {/* Icon */}
            <span style={{
              fontFamily: MONO,
              fontSize: height * 0.025,
              color: line.pass ? '#5C9E6A' : CLAUDE.SPARK,
              fontWeight: 700,
              flexShrink: 0,
              lineHeight: 1,
            }}>
              {line.icon}
            </span>

            {/* Text */}
            <span style={{
              fontFamily: MONO,
              fontSize: height * 0.018,
              color: line.pass ? '#C8C0B0' : CLAUDE.SPARK,
              fontWeight: line.pass ? 400 : 600,
              lineHeight: 1.3,
            }}>
              {line.text}
            </span>
          </div>
        ))}

        {/* Verdict line (appears after all checks) */}
        <div style={{
          marginTop: 8,
          fontFamily: MONO,
          fontSize: height * 0.014,
          color: CLAUDE.SPARK,
          opacity: clamp(lineAnims[VERIFY_LINES.length - 1], 0, 1),
        }}>
          1 component contract failed — caught before shipping
        </div>
      </div>

      {/* Column labels */}
      {[
        { x: leftX + COL_W / 2, label: 'The contract', anim: leftIn },
        { x: rightX + COL_W / 2, label: 'The verdict', anim: rightIn },
      ].map(({ x, label, anim }, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: x - 70,
          top: CONTENT_TOP + CONTENT_H + 14,
          width: 140,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: height * 0.013,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: 'uppercase' as const,
          color: i === 1 ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
          opacity: clamp(anim, 0, 1),
        }}>
          {label}
        </div>
      ))}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Source: cwc-workshops/how-we-claude-code, Anthropic
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
