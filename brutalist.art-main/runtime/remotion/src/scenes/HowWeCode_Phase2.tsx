import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HowWeCode_Phase2 — Phase 2: Four Divergent Design Directions
 * Source: cwc-workshops/how-we-claude-code, Anthropic
 *
 * 2×2 grid of four wireframe panels, each labeled with a design direction.
 * Each panel springs in with stagger: top-left, top-right, bottom-left, bottom-right.
 * After all four land, a terracotta ring appears around "Minimal" — the selection.
 *
 * Directions: "Minimal" | "Data-Dense" | "Narrative" | "Rich Visual"
 * Terracotta: the selection ring (the ONE orange moment per beat).
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const howWeCodePhase2Schema = z.object({
  sparkLine: z.string().default('Diverge before you converge.'),
});
export type HowWeCodePhase2Props = z.infer<typeof howWeCodePhase2Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Wireframe placeholder rows inside each panel
const PlaceholderRows: React.FC<{ count: number; accent?: boolean }> = ({ count, accent = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} style={{
        height: 10,
        borderRadius: 4,
        background: accent && i === 0 ? CLAUDE.BORDER : CLAUDE.PILL,
        width: i === 0 ? '85%' : i % 2 === 0 ? '65%' : '75%',
      }} />
    ))}
  </div>
);

// Small header bar inside a wireframe panel
const WireframeHeader: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    width: '100%',
    height: 28,
    background: CLAUDE.PILL,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    boxSizing: 'border-box',
    marginBottom: 10,
  }}>
    <span style={{
      fontFamily: SANS,
      fontSize: 11,
      fontWeight: 700,
      color: CLAUDE.GHOST,
      letterSpacing: 1,
    }}>{label}</span>
  </div>
);

// One design direction panel
const DirectionPanel: React.FC<{
  label: string;
  description: string;
  rowCount: number;
  selected: boolean;
  progress: number;
  selectionProgress: number;
}> = ({ label, description, rowCount, selected, progress, selectionProgress }) => {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 14,
      background: CLAUDE.CARD,
      border: `1.5px solid ${CLAUDE.BORDER}`,
      padding: '16px 18px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      opacity: clamp(progress, 0, 1),
      transform: `scale(${0.92 + 0.08 * clamp(progress, 0, 1)}) translateY(${(1 - clamp(progress, 0, 1)) * 20}px)`,
      overflow: 'hidden',
    }}>
      {/* Direction label */}
      <div style={{
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
        color: selected ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
        marginBottom: 6,
      }}>
        {label}
      </div>

      {/* Description */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 13,
        color: CLAUDE.GHOST,
        marginBottom: 12,
        lineHeight: 1.4,
      }}>
        {description}
      </div>

      {/* Wireframe content */}
      <WireframeHeader label="[ mockup ]" />
      <PlaceholderRows count={rowCount} />

      {/* Terracotta selection ring — the ONE orange moment */}
      {selected && (
        <div style={{
          position: 'absolute',
          inset: -4,
          borderRadius: 18,
          border: `3px solid ${CLAUDE.SPARK}`,
          opacity: clamp(selectionProgress, 0, 1),
          pointerEvents: 'none',
        }} />
      )}

      {/* "Selected" badge */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 14,
          background: CLAUDE.SPARK,
          borderRadius: 6,
          padding: '3px 9px',
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: 1,
          opacity: clamp(selectionProgress, 0, 1),
        }}>
          CHOSEN
        </div>
      )}
    </div>
  );
};

const DIRECTIONS = [
  { label: 'Minimal', description: 'Fast, one-screen, nothing extra.', rowCount: 3, selected: true },
  { label: 'Data-Dense', description: 'All numbers visible at once.', rowCount: 5, selected: false },
  { label: 'Narrative', description: 'Step-by-step guided flow.', rowCount: 4, selected: false },
  { label: 'Rich Visual', description: 'Charts, color, personality.', rowCount: 4, selected: false },
];

// Spring order: top-left (0), top-right (1), bottom-left (2), bottom-right (3)
const PANEL_ORDER = [0, 1, 2, 3];

export const HowWeCode_Phase2: React.FC<HowWeCodePhase2Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Each panel springs in with 20-frame stagger
  const panelDelay = 20;
  const panelAnims = PANEL_ORDER.map(i =>
    spring({
      frame: frame - i * panelDelay,
      fps,
      config: { damping: 26, stiffness: 95, mass: 0.9 },
    })
  );

  // Selection ring appears after all panels (at frame ~4*panelDelay + 20)
  const selectionStart = PANEL_ORDER.length * panelDelay + 20;
  const selectionProgress = spring({
    frame: frame - selectionStart,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });

  const sparkIn = spring({ frame: frame - (selectionStart + 20), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - (selectionStart + 25), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Grid layout
  const GRID_TOP = height * 0.26;
  const GRID_H = height * 0.58;
  const GRID_GAP = 18;
  const CELL_W = (width - PAD_X * 2 - GRID_GAP) / 2;
  const CELL_H = (GRID_H - GRID_GAP) / 2;

  const positions = [
    { col: 0, row: 0 }, // top-left
    { col: 1, row: 0 }, // top-right
    { col: 0, row: 1 }, // bottom-left
    { col: 1, row: 1 }, // bottom-right
  ];

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
        PHASE 2 · FOUR DESIGN DIRECTIONS
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
        Four static HTML mockups. One afternoon.
      </div>

      {/* 2×2 grid */}
      {DIRECTIONS.map((dir, i) => {
        const pos = positions[i];
        const x = PAD_X + pos.col * (CELL_W + GRID_GAP);
        const y = GRID_TOP + pos.row * (CELL_H + GRID_GAP);

        return (
          <div
            key={dir.label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: CELL_W,
              height: CELL_H,
            }}
          >
            <DirectionPanel
              label={dir.label}
              description={dir.description}
              rowCount={dir.rowCount}
              selected={dir.selected}
              progress={panelAnims[i]}
              selectionProgress={selectionProgress}
            />
          </div>
        );
      })}

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
