import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, staticFile, Img } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * FormBCard — Design vocabulary Form B card (DESIGN-PRINCIPLES.md §1).
 * Text + simple line icon per enumerated item. Karaoke reveal: title at t=0,
 * each item appears on its cueFrame (accumulate + stay). Items are laid out
 * via an N-AWARE layout table — the template is selected by items.length (N),
 * never hand-laid per beat.
 *
 * Layout table (N → template):
 *   N=1 → caller must route to single-subject/stills — FormBCard is a fallback only.
 *   N=2 → two cards, centered as a pair.
 *   N=3 → three-up (Anthropic reference frame).
 *   N=4 → four-up, single row.
 *   N=5 → 2-over-3 (two panels top, three panels bottom, both rows centered).
 *
 * SLOTS vs MISSES: the layout never collapses for missing icons. icon="BOX"
 * renders a labeled dashed placeholder in the slot — the slot count (N) is
 * always the full script intent.
 *
 * Icons: Lucide line-mono SVGs from public/form-b-icons/<name>.svg.
 *        Icon render size LOCKED: 44×44 px (DESIGN-PRINCIPLES §1).
 *        icon="BOX" renders a labeled placeholder box when no icon exists yet.
 * License: Lucide MIT — see runtime/remotion/public/form-b-icons/rights.md.
 *
 * BANNED patterns this component never has: eyebrow / kicker label, bold
 * geometric sans headline, decorative circle / blob, underline accent,
 * all-items-at-once reveal (karaoke is required).
 */

// ── Schema ────────────────────────────────────────────────────────────────────

export const formBItemSchema = z.object({
  label:      z.string(),
  sub:        z.string().default(''),
  icon:       z.string().default('BOX'),
  cueFrame:   z.number().int().default(0),
  cue_phrase: z.string().optional(), // narration phrase that triggers reveal (pipeline metadata)
});

export const formBCardSchema = z.object({
  title: z.string().default(''),
  items: z.array(formBItemSchema).min(1).max(5),
  dark:  z.boolean().default(false),
});

export type FormBCardProps = z.infer<typeof formBCardSchema>;
export type FormBItemProps = z.infer<typeof formBItemSchema>;

// ── Constants ─────────────────────────────────────────────────────────────────

const SERIF      = CLAUDE_FONT.serif;
const DARK_BG    = '#2A2720';
const TITLE_START = 6;
const ICON_PX    = 44; // LOCKED — DESIGN-PRINCIPLES §1 "Brutalist icon size — 44×44 px"

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ── N-Aware layout table ───────────────────────────────────────────────────────
// Each entry defines how N items are arranged. rows[] holds the item-index
// groups per row; each row is centered independently.
// panelWFrac = panel width as fraction of canvas width.
// panelHFrac = panel height as fraction of canvas height.
// panelPadFrac = internal vertical padding as fraction of canvas height.
// rowGapFrac = gap between rows (multi-row layouts only) as fraction of canvas height.

type LayoutConfig = {
  rows:         number[][];
  panelWFrac:   number;
  panelHFrac:   number;
  panelPadFrac: number;
  rowGapFrac:   number;
};

const LAYOUTS: Record<number, LayoutConfig> = {
  // N=1: fallback — caller should route to single-subject/stills template
  1: { rows: [[0]],             panelWFrac: 0.42, panelHFrac: 0.50, panelPadFrac: 0.042, rowGapFrac: 0 },
  // N=2: centered pair
  2: { rows: [[0, 1]],          panelWFrac: 0.28, panelHFrac: 0.44, panelPadFrac: 0.038, rowGapFrac: 0 },
  // N=3: Anthropic three-up reference frame
  3: { rows: [[0, 1, 2]],       panelWFrac: 0.22, panelHFrac: 0.40, panelPadFrac: 0.032, rowGapFrac: 0 },
  // N=4: 2-over-2 grid (panelW=614px; 2×614+54=1282px — wider cards extend ink bbox to ~61% GATE V)
  4: { rows: [[0, 1], [2, 3]],  panelWFrac: 0.32, panelHFrac: 0.36, panelPadFrac: 0.026, rowGapFrac: 0.04 },
  // N=5: 2-over-3 (balanced; top row 2 items, bottom row 3 items, both centered)
  // panelPadFrac 0.014 / rowGapFrac 0.012 — tightened for §8.2 (overflow) compliance at 50px font sizes
  5: { rows: [[0, 1], [2, 3, 4]], panelWFrac: 0.22, panelHFrac: 0.30, panelPadFrac: 0.014, rowGapFrac: 0.012 },
};

function getLayout(n: number): LayoutConfig {
  return LAYOUTS[n] ?? LAYOUTS[4]; // clamp unknown N to 4-up
}

// ── BoxPlaceholder ────────────────────────────────────────────────────────────

const BoxPlaceholder: React.FC<{ label: string; fg: string }> = ({ label, fg }) => (
  <div style={{
    width: ICON_PX, height: ICON_PX,
    border: `2px dashed ${fg}`, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0.38,
  }}>
    <span style={{
      fontFamily: CLAUDE_FONT.mono, fontSize: 8,
      color: fg, textAlign: 'center', padding: '0 2px',
      lineHeight: 1.15,
    }}>
      {label}
    </span>
  </div>
);

// ── ItemPanel ─────────────────────────────────────────────────────────────────
// One card panel. Owns its spring so hooks stay at component top level.

interface ItemPanelProps {
  item:       FormBItemProps;
  panelW:     number;
  panelH:     number;
  panelPad:   number;
  labelSz:    number;
  subSz:      number;
  fg:         string;
  fgSub:      string;
  panelBg:    string;
  dark:       boolean;
}

const ItemPanel: React.FC<ItemPanelProps> = ({
  item, panelW, panelH, panelPad, labelSz, subSz, fg, fgSub, panelBg, dark,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = item.cueFrame ?? 0;
  const sp  = spring({ frame: frame - cue, fps,
                       config: { damping: 30, stiffness: 170, mass: 0.7 } });
  const p   = frame >= cue ? clamp(sp, 0, 1) : 0;

  const iconFilter = dark
    ? 'brightness(0) invert(1) opacity(0.85)'
    : 'brightness(0) opacity(0.78)';

  return (
    <div style={{
      width: panelW, minHeight: panelH,
      background: panelBg, borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: `${panelPad}px ${Math.round(panelPad * 0.8)}px`,
      gap: Math.round(panelPad * 0.6),
      opacity: p,
      transform: `translateY(${(1 - p) * 16}px)`,
    }}>
      {/* Icon — LOCKED 44×44 px (DESIGN-PRINCIPLES §1) */}
      <div style={{ width: ICON_PX, height: ICON_PX,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0 }}>
        {(!item.icon || item.icon === 'BOX') ? (
          <BoxPlaceholder label={item.label} fg={fg} />
        ) : (
          <Img
            src={staticFile(`form-b-icons/${item.icon}.svg`)}
            style={{ width: ICON_PX, height: ICON_PX, filter: iconFilter }}
          />
        )}
      </div>

      {/* Label */}
      <div style={{
        fontFamily: SERIF, fontSize: labelSz, fontWeight: 700,
        color: fg, textAlign: 'center', lineHeight: 1.15,
        letterSpacing: '-0.01em',
      }}>
        {item.label}
      </div>

      {/* Sub */}
      {item.sub ? (
        <div style={{
          fontFamily: SERIF, fontSize: subSz, fontWeight: 400,
          color: fgSub, textAlign: 'center', lineHeight: 1.3,
        }}>
          {item.sub}
        </div>
      ) : null}
    </div>
  );
};

// ── ItemRow — one centered row of panels ──────────────────────────────────────

interface ItemRowProps {
  indices:  number[];
  items:    FormBItemProps[];
  panelW:   number;
  panelH:   number;
  panelPad: number;
  panelGap: number;
  labelSz:  number;
  subSz:    number;
  fg:       string;
  fgSub:    string;
  panelBg:  string;
  dark:     boolean;
}

const ItemRow: React.FC<ItemRowProps> = ({ indices, items, panelGap, ...rest }) => (
  <div style={{
    display: 'flex', flexDirection: 'row',
    alignItems: 'flex-start', justifyContent: 'center',
    gap: panelGap,
  }}>
    {indices.map(i => (
      <ItemPanel key={i} item={items[i]} {...rest} />
    ))}
  </div>
);

// ── FormBCard ─────────────────────────────────────────────────────────────────

export const FormBCard: React.FC<FormBCardProps> = ({ title, items, dark }) => {
  const frame  = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const bg      = dark ? DARK_BG     : CLAUDE.PAGE;
  const fg      = dark ? CLAUDE.PAGE : CLAUDE.INK;
  const fgSub   = dark ? '#A9A491'   : CLAUDE.INK_SOFT;
  const panelBg = dark ? '#2F2C24'   : CLAUDE.PILL;

  const layout   = getLayout(items.length);
  const panelW   = Math.round(width  * layout.panelWFrac);
  const panelH   = Math.round(height * layout.panelHFrac);
  const panelPad = Math.round(height * layout.panelPadFrac);
  const panelGap = Math.round(width  * 0.028);
  const rowGap   = Math.round(height * layout.rowGapFrac);

  // Font sizes — height-based with explicit §8.1 floor (3.2% of frame height).
  // Panel-width-relative sizing fails at N=4 (panelW=326px → sub=22px, below floor).
  const floorPx = Math.ceil(height * 0.032);                           // 35px at 1080p
  const labelSz = Math.max(floorPx + 4, Math.round(height * 0.046));  // 50px at 1080p; x-height ≥ §8.1 floor
  const subSz   = Math.max(floorPx,     Math.round(height * 0.046));  // 50px at 1080p; x-height ≥ §8.1 floor
  const titleSz = Math.round(height * 0.052);                          // 56px at 1080p

  const titleSp = spring({ frame: frame - TITLE_START, fps,
                           config: { damping: 30, stiffness: 170, mass: 0.7 } });
  const titleP  = frame >= TITLE_START ? clamp(titleSp, 0, 1) : 0;

  const rowProps = { items, panelW, panelH, panelPad, panelGap, labelSz, subSz, fg, fgSub, panelBg, dark };

  return (
    <AbsoluteFill style={{ background: bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: Math.round(height * 0.048),
        padding: `0 ${Math.round(width * 0.04)}px`, width: '100%',
      }}>
        {/* Title — persistent from frame TITLE_START */}
        {title ? (
          <div style={{
            fontFamily: SERIF, fontSize: titleSz, fontWeight: 700,
            color: fg, letterSpacing: '-0.02em', lineHeight: 1.1,
            textAlign: 'center',
            opacity: titleP,
            transform: `translateY(${(1 - titleP) * 10}px)`,
          }}>
            {title}
          </div>
        ) : null}

        {/* Rows — each row centered independently */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: rowGap, width: '100%',
        }}>
          {layout.rows.map((indices, ri) => (
            <ItemRow key={ri} indices={indices} {...rowProps} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
