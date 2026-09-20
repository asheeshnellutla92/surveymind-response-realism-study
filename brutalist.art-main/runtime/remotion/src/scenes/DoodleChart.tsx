import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {z} from 'zod';
import {VOX, SPRING_SMOOTH} from '../tokens/vox';
import {rough} from '../doodle/roughen';
import type {RoughPathInfo} from '../vendor/rough.esm';
import {PaperGrain} from '../doodle/PaperGrain';
import {HAND_FONT, loadHandFont} from '../doodle/handFont';

/**
 * DoodleChart — a sketchy, hand-drawn data beat (the roughViz idea, done
 * against the house rules): rough.js geometry, hand-lettered labels, and the
 * teardown color grammar — ink on white, ONE red element (`accentIndex`)
 * marking the datum under scrutiny. Slices/bars are distinguished by hachure
 * ANGLE, not by hue, so every chart survives grayscale.
 *
 * Scales are hand-rolled (a linear scale is three lines); no D3 dependency,
 * no roughViz (D3 v5, charts-only, unmaintained) — self-containment law.
 */

const datumSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const doodleChartSchema = z.object({
  kind: z.enum(['bar', 'line', 'pie']),
  title: z.string().default(''),
  data: z.array(datumSchema).min(1),
  unit: z.string().default(''),
  /** index of the ONE red datum; -1 = all ink */
  accentIndex: z.number().int().default(-1),
  /** y-axis max; 0 = auto (nice-rounded above the data max) */
  yMax: z.number().default(0),
  caption: z.string().default(''),
  grain: z.boolean().default(true),
  seed: z.number().default(42),
  /** beat length in seconds (doodle_fill.py copies actual_duration_s); 0 = composition default */
  durationS: z.number().default(0),
});

export type DoodleChartProps = z.infer<typeof doodleChartSchema>;

const niceMax = (v: number): number => {
  if (v <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (v <= m * mag) return m * mag;
  }
  return 10 * mag;
};

const RoughPaths: React.FC<{
  paths: RoughPathInfo[];
  opacity?: number;
}> = ({paths, opacity = 1}) => (
  <g opacity={opacity}>
    {paths.map((p, i) => (
      <path
        key={i}
        d={p.d}
        fill="none"
        stroke={p.stroke}
        strokeWidth={p.strokeWidth}
        strokeLinecap="round"
      />
    ))}
  </g>
);

export const DoodleChart: React.FC<DoodleChartProps> = ({
  kind,
  title,
  data,
  unit,
  accentIndex,
  yMax,
  caption,
  grain,
  seed,
}) => {
  loadHandFont();
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // ---- chart frame (pixel space) --------------------------------------
  const M = {top: height * 0.2, right: width * 0.09, bottom: height * 0.24, left: width * 0.12};
  const cw = width - M.left - M.right;
  const ch = height - M.top - M.bottom;
  const maxV = yMax > 0 ? yMax : niceMax(Math.max(...data.map((d) => d.value)));
  const n = data.length;

  const gen = useMemo(() => rough.generator(), []);
  const colorFor = (i: number) => (i === accentIndex ? VOX.CRIMSON : VOX.INK);

  // ---- axes (bar + line) ----------------------------------------------
  const axes = useMemo(() => {
    if (kind === 'pie') return [];
    const opts = {seed: seed + 1, roughness: 1.8, bowing: 1.6, stroke: VOX.SLATE, strokeWidth: 5};
    return [
      ...gen.toPaths(gen.line(M.left, M.top + ch, M.left + cw, M.top + ch, opts)),
      ...gen.toPaths(gen.line(M.left, M.top, M.left, M.top + ch, opts)),
    ];
  }, [kind, gen, seed, M.left, M.top, cw, ch]);

  const axisProgress = interpolate(frame, [0, Math.round(0.6 * fps)], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // ---- per-kind geometry (roughened ONCE — fixed seed, memoized) -------
  const bars = useMemo(() => {
    if (kind !== 'bar') return [];
    const bw = (cw / n) * 0.58;
    return data.map((d, i) => {
      const x = M.left + (cw / n) * (i + 0.5) - bw / 2;
      const h = (d.value / maxV) * ch;
      const drawable = gen.rectangle(x, M.top + ch - h, bw, h, {
        seed: seed + 10 + i,
        roughness: 2.6,
        bowing: 2,
        stroke: colorFor(i),
        strokeWidth: 6,
        fill: colorFor(i),
        fillStyle: 'hachure',
        hachureGap: 14,
        fillWeight: 3,
        hachureAngle: -41 + i * 24, // angle, not hue, distinguishes bars
      });
      return {paths: gen.toPaths(drawable), x, h, cx: x + bw / 2, top: M.top + ch - h, value: d.value, label: d.label};
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, gen, JSON.stringify(data), seed, maxV, cw, ch, M.left, M.top, accentIndex]);

  const line = useMemo(() => {
    if (kind !== 'line') return null;
    const pts: [number, number][] = data.map((d, i) => [
      M.left + (cw / Math.max(1, n - 1)) * i,
      M.top + ch - (d.value / maxV) * ch,
    ]);
    const drawable = gen.curve(pts, {
      seed: seed + 20,
      roughness: 1.6,
      bowing: 2.4,
      stroke: VOX.INK,
      strokeWidth: 7,
    });
    const dots = pts.map(([x, y], i) =>
      gen.toPaths(
        gen.circle(x, y, 22, {
          seed: seed + 30 + i,
          roughness: 1.8,
          stroke: colorFor(i),
          strokeWidth: 5,
          fill: colorFor(i),
          fillStyle: 'solid',
        }),
      ),
    );
    return {paths: gen.toPaths(drawable), pts, dots};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, gen, JSON.stringify(data), seed, maxV, cw, ch, M.left, M.top, accentIndex]);

  const pie = useMemo(() => {
    if (kind !== 'pie') return [];
    const cx = width * 0.42;
    const cy = height * 0.52;
    const R = Math.min(width, height) * 0.31;
    const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
    let a0 = -Math.PI / 2;
    return data.map((d, i) => {
      const a1 = a0 + (Math.max(0, d.value) / total) * Math.PI * 2;
      const drawable = gen.arc(cx, cy, R * 2, R * 2, a0, a1, true, {
        seed: seed + 40 + i,
        roughness: 2,
        bowing: 1.6,
        stroke: colorFor(i),
        strokeWidth: 6,
        fill: colorFor(i),
        fillStyle: 'hachure',
        hachureGap: 16,
        fillWeight: 3,
        hachureAngle: -41 + i * 32,
      });
      const mid = (a0 + a1) / 2;
      const lx = cx + Math.cos(mid) * R * 1.38;
      const ly = cy + Math.sin(mid) * R * 1.38;
      a0 = a1;
      return {paths: gen.toPaths(drawable), lx, ly, label: d.label, value: d.value, i};
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, gen, JSON.stringify(data), seed, width, height, accentIndex]);

  // ---- reveal timing ---------------------------------------------------
  const startF = Math.round(0.55 * fps); // after the axes
  const perF = Math.round(0.28 * fps);

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    fontFamily: HAND_FONT,
    color: VOX.INK,
    textAlign: 'center',
    transform: 'translate(-50%, 0)',
  };

  const fmt = (v: number) => `${Number.isInteger(v) ? v : v.toFixed(1)}${unit}`;

  return (
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, overflow: 'hidden'}}>
      {title !== '' && (
        <div
          style={{
            position: 'absolute',
            top: height * 0.055,
            left: width * 0.07,
            fontFamily: HAND_FONT,
            fontSize: height * 0.075,
            color: VOX.INK,
            opacity: interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {title}
        </div>
      )}

      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {/* axes draw on first */}
        {axes.map((p, i) => {
          const evolved = evolvePath(axisProgress, p.d);
          return (
            <path
              key={`a${i}`}
              d={p.d}
              fill="none"
              stroke={p.stroke}
              strokeWidth={p.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={evolved.strokeDasharray}
              strokeDashoffset={evolved.strokeDashoffset}
            />
          );
        })}

        {/* bars: grow bottom-up via clip (geometry roughened once, never per frame) */}
        {kind === 'bar' &&
          bars.map((b, i) => {
            const grow = spring({frame: frame - startF - i * perF, fps, config: SPRING_SMOOTH});
            if (grow <= 0) return null;
            const clipTop = b.top + b.h * (1 - grow);
            return (
              <g key={`b${i}`} clipPath={`url(#barclip${i})`}>
                <clipPath id={`barclip${i}`}>
                  <rect x={b.x - 30} y={clipTop - 30} width={cw / n + 60} height={b.h * grow + 60} />
                </clipPath>
                <RoughPaths paths={b.paths} />
              </g>
            );
          })}

        {/* line: evolve along the stroke; dots pop as the line reaches them */}
        {kind === 'line' && line && (
          <>
            {line.paths.map((p, i) => {
              const progress = interpolate(
                frame,
                [startF, startF + Math.round(1.6 * fps)],
                [0, 1],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)},
              );
              const evolved = evolvePath(progress, p.d);
              return (
                <path
                  key={`l${i}`}
                  d={p.d}
                  fill="none"
                  stroke={p.stroke}
                  strokeWidth={p.strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={evolved.strokeDasharray}
                  strokeDashoffset={evolved.strokeDashoffset}
                />
              );
            })}
            {line.dots.map((dot, i) => {
              const at = startF + Math.round((1.6 * fps * i) / Math.max(1, n - 1));
              const pop = spring({frame: frame - at, fps, config: SPRING_SMOOTH});
              if (pop <= 0) return null;
              return (
                <g
                  key={`d${i}`}
                  transform={`translate(${line.pts[i][0]} ${line.pts[i][1]}) scale(${pop}) translate(${-line.pts[i][0]} ${-line.pts[i][1]})`}
                >
                  <RoughPaths paths={dot} />
                </g>
              );
            })}
          </>
        )}

        {/* pie: slices appear one at a time */}
        {kind === 'pie' &&
          pie.map((s, i) => {
            const inOp = interpolate(frame - startF - i * perF, [0, Math.round(0.3 * fps)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return <RoughPaths key={`p${i}`} paths={s.paths} opacity={inOp} />;
          })}
      </svg>

      {/* hand-lettered labels (HTML so text metrics behave) */}
      {kind === 'bar' &&
        bars.map((b, i) => {
          const grow = spring({frame: frame - startF - i * perF, fps, config: SPRING_SMOOTH});
          return (
            <React.Fragment key={`bl${i}`}>
              <div
                style={{
                  ...labelStyle,
                  left: b.cx,
                  top: M.top + ch + 14,
                  fontSize: height * 0.042,
                  opacity: grow,
                  maxWidth: cw / n,
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  ...labelStyle,
                  left: b.cx,
                  top: b.top - height * 0.062,
                  fontSize: height * 0.046,
                  color: colorFor(i),
                  opacity: grow,
                }}
              >
                {fmt(b.value)}
              </div>
            </React.Fragment>
          );
        })}

      {kind === 'line' &&
        line &&
        data.map((d, i) => {
          const at = startF + Math.round((1.6 * fps * i) / Math.max(1, n - 1));
          const op = interpolate(frame - at, [0, Math.round(0.25 * fps)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={`ll${i}`}
              style={{
                ...labelStyle,
                left: line.pts[i][0],
                top: M.top + ch + 14,
                fontSize: height * 0.04,
                opacity: op,
              }}
            >
              {d.label}
            </div>
          );
        })}

      {kind === 'pie' &&
        pie.map((s, i) => {
          const op = interpolate(frame - startF - i * perF, [0, Math.round(0.3 * fps)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={`pl${i}`}
              style={{
                ...labelStyle,
                left: s.lx,
                top: s.ly - height * 0.028,
                fontSize: height * 0.042,
                color: colorFor(i),
                opacity: op,
              }}
            >
              {s.label} · {fmt(s.value)}
            </div>
          );
        })}

      {/* y-max tick (bar + line) */}
      {kind !== 'pie' && (
        <div
          style={{
            ...labelStyle,
            left: M.left - width * 0.035,
            top: M.top - height * 0.03,
            fontSize: height * 0.038,
            color: VOX.SLATE,
            opacity: axisProgress,
          }}
        >
          {fmt(maxV)}
        </div>
      )}

      {caption !== '' && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.045,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: HAND_FONT,
            fontSize: height * 0.05,
            color: VOX.INK,
            opacity: interpolate(frame, [startF, startF + Math.round(0.5 * fps)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {caption}
        </div>
      )}

      {grain && <PaperGrain />}
    </AbsoluteFill>
  );
};
