import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
  delayRender,
  continueRender,
  staticFile,
} from 'remotion';
import {z} from 'zod';
import {MEDHAVY_PARTS, MEDHAVY_VIEWBOX, MEDHAVY_TRANSFORM, LogoPart} from '../logos/medhavy';

/**
 * LogoMotion — a parametric logo sting. ONE composition, any mark.
 *
 * Everything a sting varies by is a prop: the logo (a registry key), the
 * wordmark, the tagline, the palette, and the LENGTH. Every ramp is a FRACTION
 * of the total, so a 5s cut and a 9s cut are the same animation at different
 * speeds — no re-timing by hand, no second composition.
 *
 * ── The move this scene exists to perform ────────────────────────────────────
 *
 * The mark does NOT arrive at full strength and then get decorated. It arrives
 * as a near-invisible EMBOSS — pressed into the page, readable only as a shadow
 * and a highlight — and stays that way for roughly the first half. Then it
 * MATERIALISES: one slow, continuous ramp from emboss to full ink.
 *
 * Measured off the reference sting (see reference/TIMING.md), contrast in the
 * mark region as std-dev of luma:
 *
 *     p=0.03..0.16  fragments converge, already ghost-faint   sd  2.9
 *     p=0.16..0.43  settled, still a ghost                    sd  2.6  <- floor
 *     p=0.43..0.48  the first hint                            sd  3.4
 *     p=0.57                                                  sd  9.7
 *     p=0.67                                                  sd 19.8
 *     p=0.80  95% materialised                                sd 28.4
 *     p=0.86  plateau                                         sd 29.5
 *
 * Half the runtime spent nearly invisible is the whole effect. An assembly that
 * lands at full ink and then changes one sub-element's colour is a DIFFERENT,
 * much cheaper animation — that was the first cut of this scene and it was
 * wrong. If you shorten the ghost phase, you lose the sting.
 */

export const logoMotionSchema = z.object({
  logo: z.enum(['medhavy']).default('medhavy'),
  wordmark: z.string().default('Medhavy'),
  tagline: z.string().default('AI-POWERED INTELLIGENT LEARNING SYSTEMS'),
  durationInSeconds: z.number().default(7),
  page: z.string().default('#F1E9D6'),
  ink: z.string().default('#1E1E1E'),
  accent: z.string().default('#009D70'),
  /** Fractions of the total. Ascending. Measured, not invented — see the header. */
  phases: z
    .object({
      /** camera starts pulling back */
      buildStart: z.number().default(0.03),
      /** camera has settled; the mark is front-on at final scale */
      build: z.number().default(0.157),
      /** the emboss holds, doing nothing, until here */
      ghost: z.number().default(0.44),
      /** full ink reached */
      materialise: z.number().default(0.83),
    })
    .default({buildStart: 0.03, build: 0.157, ghost: 0.44, materialise: 0.83}),
  /**
   * The rule and the tagline. Separate from `phases` because a sting with a
   * voice-over usually wants them AFTER the mark has resolved and the line has
   * started — not folded into the transition.
   */
  textPhases: z
    .object({
      ruleStart: z.number().default(0.44),
      ruleEnd: z.number().default(0.78),
      tagStart: z.number().default(0.50),
      tagEnd: z.number().default(0.87),
    })
    .default({ruleStart: 0.44, ruleEnd: 0.78, tagStart: 0.5, tagEnd: 0.87}),
  /**
   * The camera pull-back. The reference opens on an extreme close-up of the
   * letterform — oversized and tilted — and zooms out to the front-on lockup.
   * That move IS the geometric transition; without it the ghost just fades up.
   */
  camera: z
    .object({
      scale: z.number().default(6.5),
      rotate: z.number().default(-19),
      /** offset at full zoom, as a fraction of the mark's box */
      x: z.number().default(0.16),
      y: z.number().default(0.12),
    })
    .default({scale: 6.5, rotate: -19, x: 0.16, y: 0.12}),
  /** Depth of the emboss at full ghost, as a fraction of the mark's height. */
  embossDepth: z.number().default(0.006),
  fadeOut: z.boolean().default(true),
});
export type LogoMotionProps = z.infer<typeof logoMotionSchema>;

const LOGOS: Record<string, {parts: LogoPart[]; viewBox: string; transform: string}> = {
  medhavy: {parts: MEDHAVY_PARTS, viewBox: MEDHAVY_VIEWBOX, transform: MEDHAVY_TRANSFORM},
};

const SANS = 'Montserrat, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif';

// Montserrat is bundled in runtime/fonts but nothing in this project ever loaded
// it — tokens/vox.ts says as much ("fall back to system faces until the bundled
// Montserrat ... "), so every scene naming it has silently been rendering in the
// system sans. Loaded here per-component (NOT at module scope): Root.tsx imports
// 600+ compositions, and a module-scope delayRender would block every one of them
// on a font only this scene uses.
const FONT_FILES: [number, string][] = [
  [700, 'fonts/Montserrat-Bold.ttf'],
  [500, 'fonts/Montserrat-Medium.ttf'],
];

const useMontserrat = () => {
  const [handle] = useState(() => delayRender('LogoMotion: Montserrat'));
  useEffect(() => {
    let live = true;
    Promise.all(
      FONT_FILES.map(([weight, file]) =>
        new FontFace('Montserrat', `url(${staticFile(file)}) format('truetype')`, {
          weight: String(weight),
        })
          .load()
          .then((f) => {
            // This project's TS lib predates FontFaceSet.add in lib.dom; the API
            // is present in every browser Remotion renders in.
            (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
          }),
      ),
    )
      // Continue on failure too: a missing font should degrade to the system sans,
      // never hang the render at 100% forever.
      .catch(() => undefined)
      .then(() => {
        if (live) continueRender(handle);
      });
    return () => {
      live = false;
    };
  }, [handle]);
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ramp = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
// The materialisation is slow at both ends — it creeps out of the ghost floor and
// eases into the plateau. Smoothstep matches the measured curve to within a few
// percent across the whole window.
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Mix a colour toward the page — how a ghost is made. */
const toward = (c: string, page: string, amount: number) =>
  interpolateColors(amount, [0, 1], [c, page]);

export const LogoMotion: React.FC<LogoMotionProps> = ({
  logo,
  wordmark,
  tagline,
  page,
  ink,
  accent,
  phases,
  textPhases,
  camera,
  embossDepth,
  fadeOut,
}) => {
  useMontserrat();
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const p = frame / durationInFrames;

  const {parts, viewBox, transform} = LOGOS[logo] ?? LOGOS.medhavy;
  const [, , vbW, vbH] = viewBox.split(' ').map(Number);

  // ── the three things that actually happen ──────────────────────────────────
  const pAssemble = ramp(p, phases.buildStart, phases.build);
  const mat = smooth(ramp(p, phases.ghost, phases.materialise));
  const pOut = fadeOut ? ramp(p, 0.975, 0.999) : 0;

  // The camera. easeOut, hard — the big move is over early and the last third of
  // the pull-back is a crawl, which is what makes it land rather than stop.
  const cam = 1 - Math.pow(1 - pAssemble, 4);
  const camScale = interpolate(cam, [0, 1], [camera.scale, 1]);
  const camRot = interpolate(cam, [0, 1], [camera.rotate, 0]);
  const camDX = interpolate(cam, [0, 1], [camera.x * 100, 0]);
  const camDY = interpolate(cam, [0, 1], [camera.y * 100, 0]);

  // ── layout ─────────────────────────────────────────────────────────────────
  // MEASURED off the Medhavy lockup, not eyeballed. Ink bounding boxes at
  // 1920x1080, from a settled frame:
  //   mark      y 216-621 (h 406)   x 714-1204 (w 491)
  //   wordmark  y 669-755 (h  87)   x 764-1161 (w 398)   cap-top at y=669
  //   rule      y 794-797 (h   4)   x 672-1247 (w 576)
  //   tagline   y 845-865 (h  21)   x 507-1407 (w 901)   cap-top at y=845
  // The traced viewBox carries ~6px of padding per side, so markH is the INK
  // height grossed up by 418/406 and markY pulled up to match.
  const markH = height * 0.38704;
  const markW = markH * (vbW / vbH);
  const markX = (width - markW) / 2;
  const markY = height * 0.19444;

  // Type is positioned by CAP-TOP. A CSS box top is not where the letters start;
  // 0.115em below it is, for Montserrat at line-height 1. Measured, because the
  // nominal metrics predict 0.1585 and that put both cap tops 4px high.
  const CAP_INSET = 0.115;
  const wordSize = height * 0.08519;
  const wordY = height * 0.61944 - wordSize * CAP_INSET;
  const ruleY = height * 0.73519;
  const ruleH = Math.max(2, height * 0.0037);
  const ruleW = width * 0.3;
  const tagSize = height * 0.02778;
  const tagY = height * 0.78241 - tagSize * CAP_INSET;

  // ── the emboss ─────────────────────────────────────────────────────────────
  // A debossed mark is three copies: a dark edge pushed down-right, a light edge
  // pushed up-left, and a face barely off the page. As `mat` rises the offsets
  // collapse to zero and the face takes the real colour, so the emboss does not
  // "cross-fade out" — it resolves INTO the solid mark.
  const depth = vbH * embossDepth * (1 - mat);
  const ghostFace = toward(ink, page, 0.955);
  const ghostShadow = toward(ink, page, 0.80);
  const ghostHigh = '#FFFFFF';
  const edgeOpacity = (1 - mat) * 0.9;

  // The wordmark rides the mark's materialisation. The rule and the tagline do
  // NOT — they get their own late window, so a narrated sting can resolve the
  // logo first and bring the supporting type in under the voice.
  const matWord = smooth(ramp(p, phases.ghost + 0.04, phases.materialise + 0.02));
  const matRule = smooth(ramp(p, textPhases.ruleStart, textPhases.ruleEnd));
  const matTag = smooth(ramp(p, textPhases.tagStart, textPhases.tagEnd));

  return (
    <AbsoluteFill style={{background: page, overflow: 'hidden'}}>
      {/* The camera. Oversized and tilted at the open, pulling back to front-on.
          AbsoluteFill clips it, so the first frames are an extreme close-up of
          whatever part of the mark happens to be under the lens. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${camDX}%, ${camDY}%) scale(${camScale}) rotate(${camRot}deg)`,
          transformOrigin: '50% 46%',
        }}
      >
      <svg
        width={markW}
        height={markH}
        viewBox={viewBox}
        style={{position: 'absolute', left: markX, top: markY}}
      >
        {parts.map((part) => {
          // Under the camera move the parts also arrive staggered by radius —
          // outermost first, letter last. Subtle on its own; what it buys is that
          // the mark is still assembling as the camera settles, so the two moves
          // finish together instead of one waiting on the other.
          const isCore = part.role !== 'circuit';
          const lane = isCore ? 0 : 0.28 + part.rad * 0.62;
          const t = easeOut(ramp(pAssemble, lane * 0.5, Math.min(1, lane * 0.5 + 0.45)));

          const face = interpolateColors(mat, [0, 1], [ghostFace, ink]);

          return (
            <g key={part.id} opacity={t}>
              <g transform={transform} stroke="none">
                {depth > 0.01 && (
                  <>
                    <path d={part.d} fill={ghostHigh} opacity={edgeOpacity}
                      transform={`translate(${-depth * 10} ${depth * 10})`} />
                    <path d={part.d} fill={ghostShadow} opacity={edgeOpacity}
                      transform={`translate(${depth * 10} ${-depth * 10})`} />
                  </>
                )}
                <path d={part.d} fill={face} />
              </g>
            </g>
          );
        })}
      </svg>

      {/* wordmark — embossed with the mark, resolves with it */}
      <div
        style={{
          position: 'absolute',
          top: wordY,
          left: 0,
          width,
          textAlign: 'center',
          lineHeight: 1,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: wordSize,
          // Montserrat sets ~9% wider than the reference face at matched cap
          // height; a touch of negative tracking closes it without cramping.
          letterSpacing: '-0.048em',
          textIndent: '0.048em', // cancel the trailing letter-space so it stays centred
          color: interpolateColors(matWord, [0, 1], [toward(ink, page, 0.955), ink]),
          textShadow:
            matWord < 1
              ? `${-depth * 0.06}px ${depth * 0.06}px 0 rgba(255,255,255,${edgeOpacity}), ` +
                `${depth * 0.06}px ${-depth * 0.06}px 0 ${toward(ink, page, 0.8)}`
              : 'none',
          opacity: easeOut(ramp(pAssemble, 0.45, 1)),
        }}
      >
        {wordmark}
      </div>

      {/* accent rule — the one place colour, not just contrast, arrives */}
      <div
        style={{
          position: 'absolute',
          top: ruleY,
          left: width / 2,
          width: interpolate(matRule, [0, 1], [0, ruleW]),
          height: ruleH,
          marginLeft: interpolate(matRule, [0, 1], [0, -ruleW / 2]),
          background: interpolateColors(matRule, [0, 1], [toward(accent, page, 0.9), accent]),
        }}
      />

      {/* tagline — last to resolve */}
      <div
        style={{
          position: 'absolute',
          top: tagY,
          left: 0,
          width,
          textAlign: 'center',
          lineHeight: 1,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: tagSize,
          letterSpacing: '0.143em',
          textIndent: '0.143em',
          color: interpolateColors(matTag, [0, 1], [toward(ink, page, 0.94), ink]),
          opacity: 0.82 * matTag,
        }}
      >
        {tagline}
      </div>
      </div>

      {pOut > 0 && <AbsoluteFill style={{background: '#000000', opacity: smooth(pOut)}} />}
    </AbsoluteFill>
  );
};
