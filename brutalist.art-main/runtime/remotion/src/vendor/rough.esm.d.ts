// Type stub for the vendored rough.js ESM bundle (roughjs 4.6.6, MIT — see
// LICENSE-roughjs). Vendored as a single file so the toolkit stays
// self-contained (no npm reach-out at build time). Only the surface the
// doodle scenes use is typed; everything else is intentionally loose.

export interface RoughOptions {
  seed?: number;
  roughness?: number;
  bowing?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?:
    | 'hachure'
    | 'solid'
    | 'zigzag'
    | 'cross-hatch'
    | 'dots'
    | 'dashed'
    | 'zigzag-line';
  fillWeight?: number;
  hachureAngle?: number;
  hachureGap?: number;
  curveStepCount?: number;
  curveFitting?: number;
  simplification?: number;
  disableMultiStroke?: boolean;
  disableMultiStrokeFill?: boolean;
  preserveVertices?: boolean;
  [key: string]: unknown;
}

export interface RoughDrawable {
  shape: string;
  sets: unknown[];
  options: RoughOptions;
}

export interface RoughPathInfo {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

export interface RoughGenerator {
  path(d: string, options?: RoughOptions): RoughDrawable;
  line(x1: number, y1: number, x2: number, y2: number, options?: RoughOptions): RoughDrawable;
  rectangle(x: number, y: number, w: number, h: number, options?: RoughOptions): RoughDrawable;
  circle(x: number, y: number, diameter: number, options?: RoughOptions): RoughDrawable;
  ellipse(x: number, y: number, w: number, h: number, options?: RoughOptions): RoughDrawable;
  arc(
    x: number, y: number, w: number, h: number,
    start: number, stop: number, closed?: boolean, options?: RoughOptions,
  ): RoughDrawable;
  curve(points: [number, number][], options?: RoughOptions): RoughDrawable;
  polygon(points: [number, number][], options?: RoughOptions): RoughDrawable;
  linearPath(points: [number, number][], options?: RoughOptions): RoughDrawable;
  toPaths(drawable: RoughDrawable): RoughPathInfo[];
  opsToPath(opset: unknown, fixedDecimals?: number): string;
}

declare const rough: {
  generator(config?: { options?: RoughOptions }): RoughGenerator;
  newSeed(): number;
  canvas(canvas: unknown, config?: { options?: RoughOptions }): unknown;
  svg(svg: unknown, config?: { options?: RoughOptions }): unknown;
};

export default rough;
