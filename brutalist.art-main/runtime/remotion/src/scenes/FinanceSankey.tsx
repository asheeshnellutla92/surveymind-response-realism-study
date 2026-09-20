import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE_FONT } from '../tokens/claude';

// Finance palette — SKILL.md §Palette
const F = {
  PAGE:     '#FAF9F5',
  INK:      '#3D3929',
  RULE:     '#D8D2C4',
  INK_SOFT: '#73705F',
  GHOST:    '#A9A491',
  SUBJECT:  '#D97757',  // terracotta — subject company ONLY
  KEYLINE:  '#1a1a1a',  // mandatory 1px keyline on every fill
  // CVD-safe series
  TOTAL:    '#000000',
  INFLOW:   '#009E73',  // Okabe-Ito bluish green — profit/inflow. 1.13:1 vs OUTFLOW → geometry/label MUST also encode meaning
  OUTFLOW:  '#D55E00',  // Okabe-Ito vermilion — loss/cost/outflow
  OTHER:    '#F0E442',
} as const;

const COLOR_MAP: Record<string, string> = {
  total:   F.TOTAL,
  inflow:  F.INFLOW,
  outflow: F.OUTFLOW,
  other:   F.OTHER,
};

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ── Schema ────────────────────────────────────────────────────────────────────

export const financeSankeySchema = z.object({
  title:    z.string(),
  subtitle: z.string().default(''),
  nodes: z.array(z.object({
    id:     z.string(),
    label:  z.string(),
    value:  z.number(),    // must be positive — SKILL.md rule 1
    column: z.number().int().min(0).max(4),
    color:  z.enum(['total', 'inflow', 'outflow', 'other']).default('inflow'),
  })),
  links: z.array(z.object({
    source:   z.string(),
    target:   z.string(),
    value:    z.number(),  // must be positive — SKILL.md rule 1
    color:    z.enum(['total', 'inflow', 'outflow', 'other']).default('other'),
    estimate: z.boolean().default(false),  // dashed border — SKILL.md rule 6
  })),
  unit:               z.string().default('$B'),
  source:             z.string().default(''),
  sparkLine:          z.string().default(''),
  // 'income' (revenue→gross→operating→net) or 'cashflow' (sources→uses)
  statement:          z.enum(['income', 'cashflow']).default('income'),
  // SKILL.md rule 2: if chart spans two statements, say so on chart. Empty = single-statement.
  crossStatementNote: z.string().default(''),
  // Gloss line — GATE: every acronym/term-of-art on screen must have an entry here.
  // Format: "TERM (Expansion)" — multiple entries joined by · at render time.
  glossTerms:         z.array(z.string()).default([]),
});
export type FinanceSankeyProps = z.infer<typeof financeSankeySchema>;

// ── Layout helpers ────────────────────────────────────────────────────────────

interface NodeLayout {
  id:     string;
  label:  string;
  value:  number;
  color:  string;
  col:    number;
  x:      number;   // left edge of node rect
  y:      number;   // top of node rect
  h:      number;   // height of node rect
}

interface LinkLayout {
  sourceId: string;
  targetId: string;
  color:    string;
  estimate: boolean;
  value:    number;
  // source right edge offsets
  srcX:     number;
  srcY0:    number;
  srcY1:    number;
  // target left edge offsets
  tgtX:     number;
  tgtY0:    number;
  tgtY1:    number;
}

function buildLayout(
  nodes: FinanceSankeyProps['nodes'],
  links: FinanceSankeyProps['links'],
  plotLeft: number,
  plotTop:  number,
  plotW:    number,
  plotH:    number,
): { nodeLayouts: NodeLayout[]; linkLayouts: LinkLayout[] } {
  const NODE_W = 48;
  const GAP    = 22;

  const maxCol = Math.max(...nodes.map(n => n.column), 0);
  const numCols = maxCol + 1;

  // Group nodes by column
  type SankeyNode = FinanceSankeyProps['nodes'][number];
  const byCol: SankeyNode[][] = Array.from({ length: numCols }, () => []);
  nodes.forEach(n => byCol[n.column].push(n));

  // Scale: based on column with the greatest total value
  const colSums = byCol.map(col => col.reduce((s, n) => s + n.value, 0));
  const maxSum  = Math.max(...colSums, 1);
  const scale   = (plotH - GAP * (Math.max(...byCol.map(c => c.length)) - 1)) / maxSum;

  // Column x positions
  const colX = (c: number) =>
    numCols === 1
      ? plotLeft + (plotW - NODE_W) / 2
      : plotLeft + c * (plotW - NODE_W) / (numCols - 1);

  // Build node layouts
  const nodeLayouts: NodeLayout[] = [];
  byCol.forEach((col, ci) => {
    const totalH = col.reduce((s, n) => s + n.value * scale, 0) + GAP * (col.length - 1);
    let y = plotTop + (plotH - totalH) / 2;
    col.forEach(n => {
      const h = n.value * scale;
      nodeLayouts.push({
        id: n.id, label: n.label, value: n.value,
        color: COLOR_MAP[n.color] ?? F.INFLOW,
        col: ci, x: colX(ci), y, h,
      });
      y += h + GAP;
    });
  });

  const nodeMap = new Map(nodeLayouts.map(n => [n.id, n]));

  // Track link offsets per node
  const outOffset = new Map(nodeLayouts.map(n => [n.id, 0]));
  const inOffset  = new Map(nodeLayouts.map(n => [n.id, 0]));

  // Build link layouts
  const linkLayouts: LinkLayout[] = links.map(lk => {
    const src   = nodeMap.get(lk.source);
    const tgt   = nodeMap.get(lk.target);
    if (!src || !tgt) {
      return null as unknown as LinkLayout;
    }

    // Ribbon height proportional to link value within the source node's height
    const srcH  = (lk.value / src.value) * src.h;
    const tgtH  = (lk.value / tgt.value) * tgt.h;

    const srcY0 = src.y + (outOffset.get(src.id) ?? 0);
    const tgtY0 = tgt.y + (inOffset.get(tgt.id)  ?? 0);

    outOffset.set(src.id, (outOffset.get(src.id) ?? 0) + srcH);
    inOffset.set(tgt.id,  (inOffset.get(tgt.id)  ?? 0) + tgtH);

    return {
      sourceId: lk.source, targetId: lk.target,
      color: COLOR_MAP[lk.color] ?? F.OTHER,
      estimate: lk.estimate,
      value: lk.value,
      srcX:  src.x + NODE_W,
      srcY0, srcY1: srcY0 + srcH,
      tgtX:  tgt.x,
      tgtY0, tgtY1: tgtY0 + tgtH,
    };
  }).filter(Boolean);

  return { nodeLayouts, linkLayouts };
}

// ── Ribbon path — variable-width cubic-bezier ─────────────────────────────────

function ribbonPath(
  sx: number, sy0: number, sy1: number,
  tx: number, ty0: number, ty1: number,
): string {
  const cx = (sx + tx) / 2;
  // Top edge: M srcX,srcY0 C midX,srcY0 midX,tgtY0 tgtX,tgtY0
  // Bottom edge (reversed): L tgtX,tgtY1 C midX,tgtY1 midX,srcY1 srcX,srcY1 Z
  return (
    `M ${sx},${sy0} C ${cx},${sy0} ${cx},${ty0} ${tx},${ty0} ` +
    `L ${tx},${ty1} C ${cx},${ty1} ${cx},${sy1} ${sx},${sy1} Z`
  );
}

// ── Spark icon ────────────────────────────────────────────────────────────────


// ── Component ─────────────────────────────────────────────────────────────────

export const FinanceSankey: React.FC<FinanceSankeyProps> = ({
  title, subtitle, nodes, links, unit, source, sparkLine, statement, crossStatementNote = '', glossTerms = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Reject negative values — SKILL.md rule 1: Sankeys cannot draw negative-width ribbons.
  const negNode = nodes.find(n => n.value <= 0);
  const negLink = links.find(l => l.value <= 0);
  if (negNode) throw new Error(`FinanceSankey: node "${negNode.id}" has non-positive value ${negNode.value}. Add a real disclosed inflow (beginning cash) to keep all ribbons positive.`);
  if (negLink) throw new Error(`FinanceSankey: link "${negLink.source}→${negLink.target}" has non-positive value ${negLink.value}.`);

  // Plot area — PAD_X ≥ 10% keeps content inside title-safe boundary
  const PAD_X      = width  * 0.10;
  const PLOT_TOP   = height * 0.25;
  const PLOT_BOT   = height * 0.88;
  const PLOT_H     = PLOT_BOT - PLOT_TOP;
  const PLOT_LEFT  = PAD_X + 10;
  const PLOT_RIGHT = width  - PAD_X - 10;
  const PLOT_W     = PLOT_RIGHT - PLOT_LEFT;

  const { nodeLayouts, linkLayouts } = buildLayout(
    nodes, links, PLOT_LEFT, PLOT_TOP, PLOT_W, PLOT_H,
  );

  const maxCol = Math.max(...nodeLayouts.map(n => n.col), 0);
  const numCols = maxCol + 1;

  // Springs: title, then one per column, then one per link group, then finale
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Column springs: col c appears at frame 12 + c*18
  const colSprings = Array.from({ length: numCols }, (_, c) =>
    spring({ frame: frame - 12 - c * 18, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );

  // Link group springs: links between col c and c+1 appear at frame 20 + c*18 + 10
  const linkSprings = Array.from({ length: numCols - 1 }, (_, c) =>
    spring({ frame: frame - 22 - c * 18, fps, config: { damping: 24, stiffness: 90, mass: 1.0 } })
  );

  const afterAll = 12 + numCols * 18 + 20;
  const srcIn    = spring({ frame: frame - afterAll,      fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn  = spring({ frame: frame - afterAll + 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Check for estimates
  const hasEstimates = links.some(l => l.estimate);

  return (
    <AbsoluteFill style={{ background: F.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.06,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: F.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        {statement === 'cashflow' ? 'CASH FLOW STATEMENT · FLOW' : 'INCOME STATEMENT · FLOW'}
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.10,
        fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700,
        color: F.INK, letterSpacing: '-0.01em', lineHeight: 1.2,
        maxWidth: width * 0.75,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {title}
      </div>

      {subtitle ? (
        <div style={{
          position: 'absolute', left: PAD_X, top: height * 0.165,
          fontFamily: SERIF, fontSize: height * 0.017, fontStyle: 'italic',
          color: F.INK_SOFT, opacity: clamp(titleIn, 0, 1),
        }}>
          {subtitle}
        </div>
      ) : null}

      {/* SVG: nodes + ribbons */}
      <svg style={{
        position: 'absolute', left: 0, top: 0,
        width, height, overflow: 'visible', pointerEvents: 'none',
      }}>
        {/* Ribbons — drawn BEFORE nodes so nodes sit on top */}
        {linkLayouts.map((lk, li) => {
          const srcNode = nodeLayouts.find(n => n.id === lk.sourceId);
          if (!srcNode) return null;
          const linkGroupIdx = srcNode.col;  // ribbon from col c to c+1
          const sp = clamp(linkSprings[linkGroupIdx] ?? 0, 0, 1);

          const path = ribbonPath(
            lk.srcX, lk.srcY0, lk.srcY1,
            lk.tgtX, lk.tgtY0, lk.tgtY1,
          );
          const isYellow = lk.color === F.OTHER;

          return (
            <path key={li} d={path}
              fill={lk.color}
              stroke={F.KEYLINE} strokeWidth={1}
              strokeDasharray={lk.estimate ? '5 3' : undefined}
              opacity={sp * (isYellow ? 0.75 : 0.55)}
            />
          );
        })}

        {/* Nodes */}
        {nodeLayouts.map(n => {
          const sp   = clamp(colSprings[n.col], 0, 1);
          const isYellow = n.color === F.OTHER;
          return (
            <g key={n.id}>
              <rect
                x={n.x} y={n.y + n.h * (1 - sp) / 2}
                width={48} height={n.h * sp}
                fill={n.color}
                stroke={F.KEYLINE} strokeWidth={1}
                opacity={sp * (isYellow ? 1 : 0.9)}
              />
            </g>
          );
        })}

        {/* Node labels (appear with their column) */}
        {nodeLayouts.map(n => {
          const sp    = clamp(colSprings[n.col], 0, 1);
          // First column: labels LEFT. Last column: labels LEFT (no outgoing links, prevents right overflow).
          // Intermediate: labels RIGHT (won't conflict with incoming links from left).
          const isLeft = n.col === 0 || n.col === maxCol;
          const cy    = n.y + n.h / 2;
          const labelX = isLeft ? n.x - 10 : n.x + 48 + 10;
          const anchor = isLeft ? 'end' : 'start';

          return (
            <g key={`lbl-${n.id}`} opacity={interpolate(sp, [0.5, 1], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            })}>
              {/* Label */}
              <text x={labelX} y={cy - 7}
                textAnchor={anchor as 'start' | 'end' | 'middle'}
                fontFamily={SANS} fontSize={height * 0.013} fontWeight="700"
                fill={F.INK}>
                {n.label}
              </text>
              {/* Value */}
              <text x={labelX} y={cy + 12}
                textAnchor={anchor as 'start' | 'end' | 'middle'}
                fontFamily={SANS} fontSize={height * 0.013}
                fill={F.INK_SOFT}>
                {n.value.toFixed(1)}{unit}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Source + estimate note */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: F.GHOST,
        opacity: clamp(srcIn, 0, 1),
      }}>
        {hasEstimates
          ? `Dashed ribbon = back-solved estimate (total minus disclosed lines). ${source}`
          : source}
      </div>

      {/* Cross-statement disclosure — SKILL.md rule 2 */}
      {crossStatementNote ? (
        <div style={{
          position: 'absolute', left: PAD_X, bottom: height * 0.075,
          fontFamily: SANS, fontSize: height * 0.012, color: F.INK_SOFT,
          fontWeight: 600, opacity: clamp(srcIn, 0, 1),
        }}>
          ⚠ {crossStatementNote}
        </div>
      ) : null}

      {/* Gloss line — GATE: every acronym/term-of-art on this card must have an entry here */}
      {glossTerms.length > 0 && (
        <div style={{
          position: 'absolute', left: PAD_X, right: PAD_X, bottom: height * 0.025,
          fontFamily: SANS, fontSize: height * 0.0095, color: F.RULE,
          letterSpacing: '0.02em', opacity: clamp(srcIn, 0, 1),
        }}>
          {glossTerms.join(' · ')}
        </div>
      )}

      {/* Spark line — bottom 6% keeps text inside title-safe zone at 4K (safe inset = 5%) */}
      {sparkLine ? (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, opacity: clamp(sparkIn, 0, 1),
        }}>
          <span style={{
            fontFamily: SERIF, fontSize: height * 0.022,
            fontStyle: 'italic', color: F.INK,
          }}>
            {sparkLine}
          </span>
        </div>
      ) : null}

    </AbsoluteFill>
  );
};
