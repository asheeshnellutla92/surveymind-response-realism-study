// roughen.ts — turn a potrace-style SVG (filled black shapes) into rough.js
// "doodle" geometry: a sketchy outline + hachure shading per path.
//
// THE TWO LAWS OF THIS MODULE (learned the hard way, do not undo):
//   1. FIXED SEED. Re-roughening the same shape with a fresh random seed on
//      every frame produces a different wobble each frame — visible flicker,
//      not a hand-drawn look. The seed is a prop with a default, never random.
//   2. ROUGHEN ONCE, CACHE. rough.js on a 2000-unit potrace path costs
//      ~100–200ms. Fine once per shape per render process; catastrophic per
//      frame. Callers go through roughenSvg(), which memoizes on
//      (svgText, options) — components additionally wrap it in useMemo.
//
// DOM-free on purpose: only regex parsing + the rough.js *generator* API, so
// the same module works in the Remotion browser context and in plain Node
// (e.g. a QC script that writes a contact-sheet SVG).

import rough from '../vendor/rough.esm';
import type {RoughOptions, RoughPathInfo} from '../vendor/rough.esm';

export interface ParsedSvg {
  /** [minX, minY, width, height] from the source viewBox */
  viewBox: [number, number, number, number];
  /** the potrace <g transform="..."> wrapper, verbatim ('' if absent) */
  transform: string;
  /** raw path d-strings, in document order */
  paths: string[];
}

export interface RoughenedIcon {
  parsed: ParsedSvg;
  /** outline strokes (drawn first, evolvable for the draw-on reveal) */
  outlines: RoughPathInfo[];
  /** hachure shading strokes (faded/revealed after the outline) */
  hachures: RoughPathInfo[];
}

/** Parse the subset of SVG that the potrace-generated library uses. */
export const parsePotraceSvg = (svgText: string): ParsedSvg => {
  const vbMatch = /viewBox="([^"]+)"/.exec(svgText);
  const vb = vbMatch
    ? (vbMatch[1].trim().split(/[\s,]+/).map(Number) as [number, number, number, number])
    : ([0, 0, 1000, 1000] as [number, number, number, number]);
  const gMatch = /<g[^>]*\btransform="([^"]+)"/.exec(svgText);
  const paths: string[] = [];
  const re = /<path[^>]*\bd="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svgText)) !== null) {
    paths.push(m[1]);
  }
  return {viewBox: vb, transform: gMatch ? gMatch[1] : '', paths};
};

export interface DoodleStyle {
  seed: number;
  stroke: string;
  /** hachure shading color; defaults to stroke */
  fillColor?: string;
  /** values are in source-viewBox units (the library is 2000×2000) */
  strokeWidth: number;
  roughness: number;
  bowing: number;
  hachureGap: number;
  fillWeight: number;
  simplification: number;
}

/** House defaults, tuned on the 2000×2000 potrace library (see the doodle
 *  skill's reference/style.md for the tuning session notes). */
export const DOODLE_DEFAULTS: DoodleStyle = {
  seed: 42,
  stroke: '#2A1A0E', // teardown INK
  strokeWidth: 14,
  roughness: 4,
  bowing: 2,
  hachureGap: 55,
  fillWeight: 7,
  simplification: 0.6,
};

const cache = new Map<string, RoughenedIcon>();

/** djb2 — tiny stable hash so the cache key isn't a 6KB string. */
const hash = (s: string): string => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return String(h >>> 0);
};

/**
 * Roughen every path of a potrace SVG. Deterministic for a given
 * (svgText, style) — safe to call per frame, but wrap in useMemo anyway.
 */
export const roughenSvg = (svgText: string, style?: Partial<DoodleStyle>): RoughenedIcon => {
  const s: DoodleStyle = {...DOODLE_DEFAULTS, ...style};
  const key = `${hash(svgText)}|${s.seed}|${s.stroke}|${s.fillColor ?? ''}|${s.strokeWidth}|${s.roughness}|${s.bowing}|${s.hachureGap}|${s.fillWeight}|${s.simplification}`;
  const hit = cache.get(key);
  if (hit) {
    return hit;
  }

  const parsed = parsePotraceSvg(svgText);
  const gen = rough.generator();
  const opts: RoughOptions = {
    seed: s.seed,
    roughness: s.roughness,
    bowing: s.bowing,
    stroke: s.stroke,
    strokeWidth: s.strokeWidth,
    fill: s.fillColor ?? s.stroke,
    fillStyle: 'hachure',
    hachureGap: s.hachureGap,
    fillWeight: s.fillWeight,
    simplification: s.simplification,
    preserveVertices: false,
  };

  const outlines: RoughPathInfo[] = [];
  const hachures: RoughPathInfo[] = [];
  for (const d of parsed.paths) {
    for (const p of gen.toPaths(gen.path(d, opts))) {
      // rough.js encodes hachure shading as a path whose *stroke* is the fill
      // color and whose strokeWidth is the fillWeight; outlines carry the
      // stroke color at the full strokeWidth. Classify by width — robust even
      // when fillColor === stroke (the house default).
      if (p.strokeWidth < s.strokeWidth) {
        hachures.push(p);
      } else {
        outlines.push(p);
      }
    }
  }
  const result: RoughenedIcon = {parsed, outlines, hachures};
  cache.set(key, result);
  return result;
};

/** A rough, hand-drawn underline (for captions / emphasis). Deterministic. */
export const roughUnderline = (
  width: number,
  stroke: string,
  strokeWidth: number,
  seed: number,
): RoughPathInfo[] => {
  const gen = rough.generator();
  const drawable = gen.line(0, 0, width, 0, {
    seed,
    roughness: 2.2,
    bowing: 3,
    stroke,
    strokeWidth,
  });
  return gen.toPaths(drawable);
};

export {rough};
