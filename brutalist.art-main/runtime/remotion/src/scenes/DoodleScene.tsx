import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {evolvePath, getLength} from '@remotion/paths';
import {z} from 'zod';
import {VOX, SPRING_SMOOTH} from '../tokens/vox';
import {roughenSvg, roughUnderline} from '../doodle/roughen';
import {PaperGrain} from '../doodle/PaperGrain';
import {HAND_FONT, loadHandFont} from '../doodle/handFont';

/**
 * DoodleScene — one doodle beat: 1–4 library icons hand-drawn onto a white
 * page, with an optional handwritten caption. The icon geometry is the
 * organized-svg potrace library roughened by rough.js (fixed seed — see
 * doodle/roughen.ts). Fill via the doodle skill's doodle_fill.py, which
 * resolves icon keywords to svg text and writes shot.remotion.props.
 *
 * Teardown grammar: ink on white; `accent: true` marks AT MOST ONE item red
 * (the thing under scrutiny). The caption underline is the accent wash.
 */

const itemSchema = z.object({
  /** full SVG file text from the doodle library (tier 1). '' when pngSrc is set. */
  svg: z.string().default(''),
  /** staticFile-relative path to a PNG fallback (tier 2), e.g.
   *  'doodle-png/flux-capacitor-01.png' — doodle_fill.py copies the file
   *  into runtime/remotion/public/doodle-png/. PNGs render pasted-into-
   *  sketchbook: multiply blend (white melts into the paper), slight tilt,
   *  popin. Draw-on is SVG-only — a PNG has no paths to trace. */
  pngSrc: z.string().default(''),
  /** small handwritten label under the icon ('' = none) */
  label: z.string().default(''),
  /** center position, percent of frame */
  xPct: z.number().default(50),
  yPct: z.number().default(44),
  /** icon width as percent of frame width */
  widthPct: z.number().default(22),
  /** drawon = progressive stroke reveal; popin = spring scale-in */
  mode: z.enum(['drawon', 'popin']).default('drawon'),
  /** the ONE red item (teardown: red = the mark under scrutiny) */
  accent: z.boolean().default(false),
  /** seconds after scene start this item begins; -1 = auto-stagger */
  delayS: z.number().default(-1),
});

export const doodleSceneSchema = z.object({
  items: z.array(itemSchema).default([]),
  /** big hand-written headline — center of the page when there are no
   *  items (act cards, outro), top-center above the icons otherwise */
  title: z.string().default(''),
  caption: z.string().default(''),
  /** small hand-written note, top-left (acts like an eyebrow) */
  eyebrow: z.string().default(''),
  underlineCaption: z.boolean().default(true),
  grain: z.boolean().default(true),
  seed: z.number().default(42),
  /** beat length in seconds; doodle_fill.py copies actual_duration_s here.
   *  0 = keep the composition default. */
  durationS: z.number().default(0),
});

export type DoodleSceneProps = z.infer<typeof doodleSceneSchema>;

const DRAW_S = 1.4; // seconds an icon takes to draw on
const AUTO_STAGGER_S = 0.55;

const DoodleItem: React.FC<{
  item: z.infer<typeof itemSchema>;
  index: number;
  seed: number;
  frame: number;
  fps: number;
  width: number;
  height: number;
}> = ({item, index, seed, frame, fps, width, height}) => {
  const isPng = item.svg === '' && item.pngSrc !== '';
  const roughened = useMemo(
    () =>
      isPng
        ? null
        : roughenSvg(item.svg, {
            seed: seed + index,
            stroke: item.accent ? VOX.CRIMSON : VOX.INK,
          }),
    [isPng, item.svg, item.accent, seed, index],
  );

  // Contours reveal sequentially, each owning a window of the overall
  // progress PROPORTIONAL TO ITS INK LENGTH — equal windows make the long
  // main contour appear to finish instantly (verified on the heart icon:
  // 13 contours, one carries ~90% of the ink).
  const windows = useMemo(() => {
    if (!roughened) {
      return [];
    }
    const lengths = roughened.outlines.map((p) => Math.max(1, getLength(p.d)));
    const total = lengths.reduce((s, l) => s + l, 0);
    let acc = 0;
    return lengths.map((l) => {
      const start = acc / total;
      acc += l;
      return {start, frac: l / total};
    });
  }, [roughened]);

  const delayS = item.delayS >= 0 ? item.delayS : index * (DRAW_S * 0.55 + AUTO_STAGGER_S);
  const local = frame - Math.round(delayS * fps);
  if (local < 0) {
    return null;
  }

  // ---- tier-2 PNG item: pasted-into-sketchbook treatment ----------------
  if (isPng || !roughened) {
    const pop = spring({frame: local, fps, config: SPRING_SMOOTH});
    const pngLabelIn = interpolate(
      local,
      [Math.round(0.3 * fps), Math.round(0.6 * fps)],
      [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
    );
    const pxWpng = (item.widthPct / 100) * width;
    // Deterministic tilt from the item index — a hand never pastes straight.
    const tilt = ((index * 137) % 5) - 2;
    return (
      <div
        style={{
          position: 'absolute',
          left: `${item.xPct}%`,
          top: `${item.yPct}%`,
          transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${pop})`,
          width: pxWpng,
        }}
      >
        <Img
          src={staticFile(item.pngSrc)}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            mixBlendMode: 'multiply',
            filter: 'grayscale(0.85) contrast(1.05)',
          }}
        />
        {item.label !== '' && (
          <div
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontFamily: HAND_FONT,
              fontSize: Math.max(34, height * 0.042),
              color: item.accent ? VOX.CRIMSON : VOX.INK,
              opacity: pngLabelIn,
            }}
          >
            {item.label}
          </div>
        )}
      </div>
    );
  }

  const [vx, vy, vw, vh] = roughened.parsed.viewBox;
  const pxW = (item.widthPct / 100) * width;
  const pxH = pxW * (vh / vw);

  const drawFrames = Math.round(DRAW_S * fps);
  const progress =
    item.mode === 'drawon'
      ? interpolate(local, [0, drawFrames], [0, 1], {
          // linear: a hand draws at constant speed; ease-out makes the icon
          // look 80% finished a third of the way in (verified on frames).
          extrapolateRight: 'clamp',
        })
      : 1;
  const pop =
    item.mode === 'popin'
      ? spring({frame: local, fps, config: SPRING_SMOOTH})
      : 1;

  // Hachure shading fades in as the outline finishes — pencil-shading after
  // the contour, the way a hand actually draws.
  const hachureOpacity =
    item.mode === 'drawon'
      ? interpolate(progress, [0.55, 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : interpolate(local, [0, Math.round(0.3 * fps)], [0, 1], {
          extrapolateRight: 'clamp',
        });

  const labelIn = interpolate(
    local,
    [drawFrames, drawFrames + Math.round(0.3 * fps)],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: `${item.xPct}%`,
        top: `${item.yPct}%`,
        transform: `translate(-50%, -50%) scale(${pop})`,
        width: pxW,
      }}
    >
      <svg
        width={pxW}
        height={pxH}
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        style={{overflow: 'visible', display: 'block'}}
      >
        <g transform={roughened.parsed.transform}>
          {roughened.outlines.map((p, i) => {
            // Contour i owns [start, start+frac] of the overall progress —
            // one line at a time, at constant hand speed.
            const w = windows[i];
            const pathProgress = Math.max(0, Math.min(1, (progress - w.start) / w.frac));
            if (pathProgress <= 0) {
              return null;
            }
            const evolved = evolvePath(pathProgress, p.d);
            return (
              <path
                key={`o${i}`}
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
          <g opacity={hachureOpacity}>
            {roughened.hachures.map((p, i) => (
              <path
                key={`h${i}`}
                d={p.d}
                fill="none"
                stroke={p.stroke}
                strokeWidth={p.strokeWidth}
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>
      </svg>
      {item.label !== '' && (
        <div
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontFamily: HAND_FONT,
            fontSize: Math.max(34, height * 0.042),
            color: item.accent ? VOX.CRIMSON : VOX.INK,
            opacity: labelIn,
          }}
        >
          {item.label}
        </div>
      )}
    </div>
  );
};

export const DoodleScene: React.FC<DoodleSceneProps> = ({
  items,
  title,
  caption,
  eyebrow,
  underlineCaption,
  grain,
  seed,
}) => {
  loadHandFont();
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // Title: page-center headline on caption/act cards (no items), top-center
  // above the icons otherwise. Gets the rough red underline when there is no
  // caption to carry it.
  const titleCentered = items.length === 0;
  const titlePop = spring({frame, fps, config: SPRING_SMOOTH});
  const titleUnderlineW = Math.min(width * 0.6, 80 + title.length * 34);
  const titleUnderline = useMemo(
    () => roughUnderline(titleUnderlineW, VOX.CRIMSON, 8, seed + 77),
    [titleUnderlineW, seed],
  );
  const titleUnderlineProgress = interpolate(
    frame,
    [Math.round(0.35 * fps), Math.round(0.95 * fps)],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)},
  );

  const captionStart = Math.round(0.4 * fps);
  const captionIn = interpolate(
    frame,
    [captionStart, captionStart + Math.round(0.5 * fps)],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const underlineW = Math.min(width * 0.62, 64 + caption.length * 26);
  const underline = useMemo(
    () => roughUnderline(underlineW, VOX.CRIMSON, 7, seed + 99),
    [underlineW, seed],
  );
  const underlineProgress = interpolate(
    frame,
    [captionStart + Math.round(0.35 * fps), captionStart + Math.round(0.95 * fps)],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)},
  );

  return (
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, overflow: 'hidden'}}>
      {eyebrow !== '' && (
        <div
          style={{
            position: 'absolute',
            top: height * 0.05,
            left: width * 0.05,
            fontFamily: HAND_FONT,
            fontSize: height * 0.038,
            color: VOX.SLATE,
            opacity: interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {eyebrow}
        </div>
      )}

      {title !== '' && (
        <div
          style={{
            position: 'absolute',
            top: titleCentered ? '38%' : height * 0.115,
            left: 0,
            right: 0,
            textAlign: 'center',
            transform: titleCentered ? 'translateY(-50%)' : undefined,
            opacity: titlePop,
          }}
        >
          <div
            style={{
              fontFamily: HAND_FONT,
              fontSize: height * (titleCentered ? 0.115 : 0.072),
              color: VOX.INK,
              lineHeight: 1.15,
              padding: `0 ${width * 0.08}px`,
              transform: `scale(${0.9 + 0.1 * titlePop})`,
            }}
          >
            {title}
          </div>
          {caption === '' && underlineCaption && titleUnderlineProgress > 0 && (
            <svg
              width={titleUnderlineW}
              height={22}
              viewBox={`0 -11 ${titleUnderlineW} 22`}
              style={{overflow: 'visible', marginTop: 4}}
            >
              {titleUnderline.map((p, i) => {
                const evolved = evolvePath(titleUnderlineProgress, p.d);
                return (
                  <path
                    key={i}
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
            </svg>
          )}
        </div>
      )}

      {items.map((item, i) => (
        <DoodleItem
          key={i}
          item={item}
          index={i}
          seed={seed}
          frame={frame}
          fps={fps}
          width={width}
          height={height}
        />
      ))}

      {caption !== '' && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.075,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: captionIn,
          }}
        >
          <div
            style={{
              fontFamily: HAND_FONT,
              fontSize: height * 0.062,
              color: VOX.INK,
              lineHeight: 1.25,
              padding: `0 ${width * 0.08}px`,
            }}
          >
            {caption}
          </div>
          {underlineCaption && underlineProgress > 0 && (
            <svg
              width={underlineW}
              height={20}
              viewBox={`0 -10 ${underlineW} 20`}
              style={{overflow: 'visible', marginTop: 2}}
            >
              {underline.map((p, i) => {
                const evolved = evolvePath(underlineProgress, p.d);
                return (
                  <path
                    key={i}
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
            </svg>
          )}
        </div>
      )}

      {grain && <PaperGrain />}
    </AbsoluteFill>
  );
};
