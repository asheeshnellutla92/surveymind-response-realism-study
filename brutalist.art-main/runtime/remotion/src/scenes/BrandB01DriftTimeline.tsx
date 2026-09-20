import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01DriftTimeline — archetype-drift-case-studies B01.
 * Two-line timeline: recognition asset strength (terracotta) steps down with
 * each "improvement" decision; performance dashboard (grey dashed) lags behind.
 * Enacts: "By the time the damage appears in performance data, the recognition
 * asset is already gone."
 * Source: Branding and AI, Ch. 5 (Nina Harris).
 */
export const brandB01DriftTimelineSchema = z.object({
  sparkLine: z.string().default('By the time the dashboard shows it — the asset is gone.'),
});
export type BrandB01DriftTimelineProps = z.infer<typeof brandB01DriftTimelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Decision events: year position (0–1 on x axis) and the drop in recognition
const DECISIONS = [
  { label: 'Redesign',        yearPos: 0.22, recognitionAfter: 0.78 },
  { label: 'New campaign',    yearPos: 0.45, recognitionAfter: 0.54 },
  { label: 'Feature launch',  yearPos: 0.68, recognitionAfter: 0.30 },
];

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

export const BrandB01DriftTimeline: React.FC<BrandB01DriftTimelineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase 1 (0–90): title + axes appear; recognition line draws left at 100%
  // Phase 2 (90+): decision points tick recognition down; perf dashboard rises late

  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } }),
    0, 1,
  );

  const axisIn = clamp(
    spring({ frame: frame - 10, fps, config: { damping: 26, stiffness: 120, mass: 1 } }),
    0, 1,
  );

  // How far the recognition line has drawn (0 → full width) — Phase 1
  const lineDrawProgress = clamp(interpolate(frame, [15, 90], [0, 1]), 0, 1);

  // Each decision point animates in after frame 90
  const decisionSprings = DECISIONS.map((_, i) =>
    clamp(spring({ frame: frame - (95 + i * 30), fps, config: { damping: 24, stiffness: 110, mass: 1.1 } }), 0, 1)
  );

  // Performance dashboard line appears much later — lag indicator
  const perfLineProgress = clamp(interpolate(frame, [160, 250], [0, 1]), 0, 1);

  // Final annotation
  const annotationIn = clamp(
    spring({ frame: frame - 260, fps, config: { damping: 22, stiffness: 100, mass: 1.2 } }),
    0, 1,
  );

  const sourceIn = clamp(interpolate(frame, [55, 75], [0, 1]), 0, 1);

  const PAD_H = width * 0.06;
  const PAD_V = height * 0.08;
  const CHART_L = PAD_H + width * 0.04;
  const CHART_R = width - PAD_H - width * 0.02;
  const CHART_W = CHART_R - CHART_L;
  const CHART_Y = height * 0.32;
  const CHART_H = height * 0.52;
  const CHART_T = CHART_Y;
  const CHART_B = CHART_T + CHART_H;

  // Map a recognition percentage (0–1) to a y pixel in the chart
  const toY = (pct: number) => CHART_B - pct * CHART_H;
  const toX = (pos: number) => CHART_L + pos * CHART_W;

  // Build recognition line path — starts at 100%, steps down at each decision
  // We interpolate within the draw progress
  const recogPoints: { x: number; y: number }[] = [{ x: CHART_L, y: toY(1) }];
  DECISIONS.forEach((d, i) => {
    const prevPct = i === 0 ? 1 : DECISIONS[i - 1].recognitionAfter;
    const decisionX = toX(d.yearPos);
    const decisionY_before = toY(prevPct);
    const decisionY_after = toY(d.recognitionAfter);
    const dropFraction = clamp(decisionSprings[i], 0, 1);
    const currentY = decisionY_before + dropFraction * (decisionY_after - decisionY_before);
    recogPoints.push({ x: decisionX, y: decisionY_before }); // horizontal run
    recogPoints.push({ x: decisionX, y: currentY });          // vertical step-down
  });
  // Continue to right edge with final recognition value
  const finalRecog = DECISIONS[DECISIONS.length - 1].recognitionAfter;
  recogPoints.push({ x: CHART_R, y: toY(finalRecog) });

  // Build the SVG polyline string clipped to lineDrawProgress (Phase 1 draw)
  // After Phase 1 the recognition line is always fully drawn
  const recogPathD = recogPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Performance dashboard: starts showing late, lags — rises from baseline near the end
  // Perf line: flat at about 0.85 until year 3–4, then starts to drop — shows damage late
  const perfPoints: { x: number; y: number }[] = [
    { x: CHART_L, y: toY(0.88) },
    { x: toX(0.55), y: toY(0.85) },  // slow drift
    { x: toX(0.80), y: toY(0.72) },  // finally catches up to damage
    { x: CHART_R, y: toY(0.55) },    // still dropping
  ];
  const perfPathD = perfPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Font sizes — FILL-THE-CANVAS law
  const titleSize = Math.round(height * 0.075);   // ≈81px
  const subtitleSize = Math.round(height * 0.033); // ≈36px
  const sparkSize = Math.round(height * 0.034);    // ≈37px
  const legendSize = Math.round(height * 0.026);   // ≈28px
  const axisLabelSize = Math.round(height * 0.026); // ≈28px — was width*0.011≈21px, now ≥26px
  const decisionLabelSize = Math.round(height * 0.026); // ≈28px — decision point labels min 24px
  const annotationSize = Math.round(height * 0.028); // ≈30px — annotation box min 28px
  const lineLabelSize = Math.round(height * 0.026); // ≈28px — "Performance dashboard" labels

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
        Recognition Asset vs. Performance Dashboard
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: SANS,
        fontSize: subtitleSize,
        color: CLAUDE.INK_SOFT,
        marginBottom: 18,
        opacity: axisIn,
      }}>
        Each "improvement" decision steps the recognition asset down. The dashboard catches up too late.
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 36,
        marginBottom: 10,
        opacity: axisIn,
        fontFamily: SANS,
        fontSize: legendSize,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="36" height="16"><line x1="0" y1="8" x2="36" y2="8" stroke={CLAUDE.SPARK} strokeWidth="5"/></svg>
          <span style={{ color: CLAUDE.INK }}>Recognition asset strength</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="36" height="16">
            <line x1="0" y1="8" x2="36" y2="8" stroke={CLAUDE.INK_SOFT} strokeWidth="3" strokeDasharray="7,5"/>
          </svg>
          <span style={{ color: CLAUDE.INK_SOFT }}>Performance dashboard</span>
        </div>
      </div>

      {/* SVG chart */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Y-axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <g key={pct} opacity={axisIn}>
            <line
              x1={CHART_L - 6} y1={toY(pct)}
              x2={CHART_R} y2={toY(pct)}
              stroke={CLAUDE.BORDER} strokeWidth="1"
            />
            <text
              x={CHART_L - 16} y={toY(pct) + 9}
              fontFamily={SANS} fontSize={axisLabelSize}
              fill={CLAUDE.INK_SOFT} textAnchor="end"
            >
              {Math.round(pct * 100)}%
            </text>
          </g>
        ))}

        {/* X-axis year labels */}
        {YEARS.map((yr, i) => {
          const x = toX(i / (YEARS.length - 1));
          return (
            <g key={yr} opacity={axisIn}>
              <line x1={x} y1={CHART_B} x2={x} y2={CHART_B + 8} stroke={CLAUDE.BORDER} strokeWidth="1"/>
              <text
                x={x} y={CHART_B + 36}
                fontFamily={SANS} fontSize={axisLabelSize}
                fill={CLAUDE.INK_SOFT} textAnchor="middle"
              >{yr}</text>
            </g>
          );
        })}

        {/* Chart axes */}
        <g opacity={axisIn}>
          <line x1={CHART_L} y1={CHART_T - 10} x2={CHART_L} y2={CHART_B} stroke={CLAUDE.BORDER} strokeWidth="1.5"/>
          <line x1={CHART_L} y1={CHART_B} x2={CHART_R + 10} y2={CHART_B} stroke={CLAUDE.BORDER} strokeWidth="1.5"/>
        </g>

        {/* Performance dashboard line (dashed grey) — appears after phase 1 */}
        <path
          d={perfPathD}
          fill="none"
          stroke={CLAUDE.INK_SOFT}
          strokeWidth="5"
          strokeDasharray="10,7"
          opacity={perfLineProgress * 0.8}
          strokeLinecap="round"
          strokeDashoffset={0}
          style={{ clipPath: `inset(0 ${(1 - perfLineProgress) * 100}% 0 0)` }}
        />

        {/* Recognition line (terracotta, solid step-line) */}
        <path
          d={recogPathD}
          fill="none"
          stroke={CLAUDE.SPARK}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={lineDrawProgress}
          style={{ clipPath: `inset(0 ${(1 - lineDrawProgress) * 100}% 0 0)` }}
        />

        {/* Line end labels */}
        {perfLineProgress > 0.9 && (
          <text
            x={CHART_R + 14} y={toY(0.55) + 8}
            fontFamily={SANS} fontSize={lineLabelSize}
            fill={CLAUDE.INK_SOFT} textAnchor="start"
          >Dashboard</text>
        )}
        {lineDrawProgress > 0.9 && (
          <text
            x={CHART_R + 14} y={toY(finalRecog) + 8}
            fontFamily={SANS} fontSize={lineLabelSize}
            fill={CLAUDE.SPARK} textAnchor="start"
          >Recognition</text>
        )}

        {/* Decision point markers */}
        {DECISIONS.map((d, i) => {
          const sp = decisionSprings[i];
          if (sp < 0.01) return null;
          const prevPct = i === 0 ? 1 : DECISIONS[i - 1].recognitionAfter;
          const x = toX(d.yearPos);
          const yDrop = toY(prevPct) + sp * (toY(d.recognitionAfter) - toY(prevPct));
          const labelW = 130;
          const labelH = 36;
          return (
            <g key={i} opacity={sp}>
              {/* Vertical decision marker */}
              <line
                x1={x} y1={CHART_T}
                x2={x} y2={CHART_B}
                stroke={CLAUDE.SPARK}
                strokeWidth="1.5"
                strokeDasharray="5,5"
                opacity={0.4}
              />
              {/* Label above */}
              <rect
                x={x - labelW / 2} y={CHART_T - labelH - 12}
                width={labelW} height={labelH}
                rx={7}
                fill={CLAUDE.CARD}
                stroke={CLAUDE.BORDER}
              />
              <text
                x={x} y={CHART_T - labelH / 2 - 12 + labelH * 0.62}
                fontFamily={SANS}
                fontSize={decisionLabelSize}
                fontWeight={600}
                fill={CLAUDE.SPARK}
                textAnchor="middle"
              >{d.label}</text>
              {/* Dot on recognition line */}
              <circle cx={x} cy={yDrop} r={9} fill={CLAUDE.SPARK}/>
            </g>
          );
        })}

        {/* Final annotation */}
        {annotationIn > 0.01 && (
          <g opacity={annotationIn}>
            <rect
              x={toX(0.55)} y={toY(0.30) + 20}
              width={CHART_R - toX(0.55) - 10} height={70}
              rx={10}
              fill={`rgba(217,119,87,0.10)`}
              stroke={CLAUDE.SPARK}
              strokeWidth="1.5"
            />
            <text
              x={toX(0.55) + 16} y={toY(0.30) + 50}
              fontFamily={SANS}
              fontSize={annotationSize}
              fontWeight={700}
              fill={CLAUDE.SPARK}
            >By the time the dashboard shows it —</text>
            <text
              x={toX(0.55) + 16} y={toY(0.30) + 80}
              fontFamily={SANS}
              fontSize={annotationSize}
              fontWeight={700}
              fill={CLAUDE.SPARK}
            >the asset is already gone.</text>
          </g>
        )}
      </svg>

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
        Source: Branding and AI (Nina Harris) · Ch. 5
      </div>
    </AbsoluteFill>
  );
};
