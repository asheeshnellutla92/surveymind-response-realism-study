import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/**
 * BadgeReveal — a logo-badge reveal: the mark tumbles in from an overexposed,
 * out-of-focus haze, settles to centre, floods with colour, and a wordmark rises
 * beneath it.
 *
 * The reference animation reads as one move but is four overlapping ones, and they
 * have to overlap or it looks like a slideshow:
 *
 *   1. BLOOM   the whole frame is blown out to near-white and the badge is blurred
 *              past legibility. You cannot tell what it is yet.
 *   2. TUMBLE  the badge rotates on X and Y through a large arc and settles. This
 *              runs on a spring, so it overshoots slightly and comes back.
 *   3. FLOOD   saturation and fill-opacity come up together. The mark is fully
 *              resolved in shape before it is resolved in colour — that ordering is
 *              what makes it feel like focus rather than a fade.
 *   4. WORDMARK rises and fades in last, after the badge has stopped moving.
 *
 * Everything is parameterised. Nothing about the reference brand is baked in:
 * pass your own colours, letter or image, shape, and wordmark.
 *
 * The shape is a rounded regular polygon built as an SVG path, so `sides` gives you
 * hexagon (6), pentagon (5), squircle (4), triangle (3), or circle (< 3) from the
 * same component, and `cornerRadius` is real geometry rather than a border-radius
 * approximation that clip-path would throw away.
 */

// ---------------------------------------------------------------- geometry

type Pt = [number, number];

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const len = (a: Pt) => Math.hypot(a[0], a[1]);
const norm = (a: Pt): Pt => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};

/** Rounded regular polygon as an SVG path. `sides < 3` returns a circle. */
function polygonPath(
  sides: number,
  cx: number,
  cy: number,
  r: number,
  cornerRadius: number,
  rotationDeg = 0,
): string {
  if (sides < 3) {
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  }
  const rot = (rotationDeg * Math.PI) / 180;
  const pts: Pt[] = [];
  for (let i = 0; i < sides; i++) {
    // -PI/2 puts vertex 0 at the top, which is the pointy-top orientation the
    // reference uses. Rotate by 180/sides for a flat top.
    const a = rot + (i * 2 * Math.PI) / sides - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  let d = '';
  for (let i = 0; i < sides; i++) {
    const prev = pts[(i - 1 + sides) % sides];
    const cur = pts[i];
    const next = pts[(i + 1) % sides];
    const toPrev = norm(sub(prev, cur));
    const toNext = norm(sub(next, cur));
    // Never round more than half the shorter adjacent edge, or corners collide.
    const rr = Math.min(cornerRadius, len(sub(prev, cur)) / 2, len(sub(next, cur)) / 2);
    const p1 = add(cur, mul(toPrev, rr));
    const p2 = add(cur, mul(toNext, rr));
    d += i === 0 ? `M ${p1[0]} ${p1[1]}` : ` L ${p1[0]} ${p1[1]}`;
    d += ` Q ${cur[0]} ${cur[1]} ${p2[0]} ${p2[1]}`;
  }
  return `${d} Z`;
}

// ---------------------------------------------------------------- props

export type BadgeRevealProps = {
  /** The glyph on the badge. Ignored when `imageSrc` is set. */
  letter?: string;
  /** Any image — a letter as artwork, a logotype, an icon. Replaces `letter`. */
  imageSrc?: string;
  /** Image/letter size as a fraction of the badge's inner width. */
  markScale?: number;

  /** Gradient stops across the badge face. One colour gives a flat fill. */
  badgeColors?: string[];
  /** Gradient direction in degrees. 0 = left→right, 90 = top→bottom. */
  gradientAngle?: number;
  /** Colour of the letter, or of a mono image tint (images are not tinted). */
  markColor?: string;

  /** Page behind everything. Also the colour the opening bloom washes to. */
  ground?: string;

  /** Text under the badge. Empty string renders nothing. */
  wordmark?: string;
  wordmarkColor?: string;
  wordmarkSize?: number;
  wordmarkTracking?: number;

  /** 6 = hexagon, 5 = pentagon, 4 = squircle, 3 = triangle, < 3 = circle. */
  sides?: number;
  /** Corner rounding in badge-space units (the badge is drawn in a 100-unit box). */
  cornerRadius?: number;
  /** Badge diameter as a fraction of the composition height. */
  badgeScale?: number;
  /** Rotate the polygon itself, in degrees. 30 turns a pointy-top hex flat-top. */
  shapeRotation?: number;

  /** Typography for the letter and wordmark. */
  fontFamily?: string;

  /** Phase boundaries as fractions of the clip. Must ascend. */
  timing?: {
    tumbleEnd?: number;   // badge stops moving
    floodStart?: number;  // colour begins
    floodEnd?: number;    // colour complete
    wordmarkIn?: number;  // wordmark starts rising
  };

  /** How hard the opening bloom blows out. 0 disables it. */
  bloom?: number;
  /** Peak blur in pixels at frame 0. */
  blurPx?: number;
  /** Degrees of X/Y tumble the badge travels through. */
  tumbleDeg?: number;
  /** Drop shadow under the badge. */
  shadow?: boolean;
  /** The dotted ring that flickers past mid-flight. */
  speckle?: boolean;
};

const DEFAULTS: Required<Omit<BadgeRevealProps, 'imageSrc' | 'timing'>> & {
  timing: Required<NonNullable<BadgeRevealProps['timing']>>;
} = {
  letter: 'M',
  markScale: 0.42,
  badgeColors: ['#F5A25D', '#E86A6A', '#B06BC9'],
  gradientAngle: 135,
  markColor: '#FFFFFF',
  ground: '#F1F2F4',
  wordmark: '',
  wordmarkColor: '#4A4A52',
  wordmarkSize: 34,
  wordmarkTracking: 3,
  sides: 6,
  cornerRadius: 9,
  badgeScale: 0.46,
  shapeRotation: 0,
  fontFamily: 'Inter, Helvetica, Arial, sans-serif',
  timing: { tumbleEnd: 0.62, floodStart: 0.52, floodEnd: 0.82, wordmarkIn: 0.78 },
  bloom: 1,
  blurPx: 20,
  tumbleDeg: 190,
  shadow: true,
  speckle: true,
};

// ---------------------------------------------------------------- component

export const BadgeReveal: React.FC<BadgeRevealProps> = (props) => {
  const p = { ...DEFAULTS, ...props, timing: { ...DEFAULTS.timing, ...(props.timing ?? {}) } };
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const D = durationInFrames;
  const at = (fraction: number) => fraction * D;
  const ramp = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [at(a), at(b)], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // TUMBLE — a spring so it overshoots and settles rather than easing to a stop.
  // damping stays high enough that the overshoot reads as weight, not as a bounce.
  const settle = spring({
    frame,
    fps,
    config: { damping: 26, stiffness: 90, mass: 1.4 },
    durationInFrames: Math.round(at(p.timing.tumbleEnd)),
  });

  const rotY = interpolate(settle, [0, 1], [p.tumbleDeg, 0]);
  const rotX = interpolate(settle, [0, 1], [-p.tumbleDeg * 0.42, 0]);
  const rotZ = interpolate(settle, [0, 1], [-18, 0]);
  const driftX = interpolate(settle, [0, 1], [-width * 0.06, 0]);
  const driftY = interpolate(settle, [0, 1], [-height * 0.10, 0]);
  const scale = interpolate(settle, [0, 1], [1.38, 1]);

  // BLOOM + FOCUS — both resolve before colour does. Shape first, colour second.
  const blur = interpolate(settle, [0, 0.85], [p.blurPx, 0], {
    extrapolateRight: 'clamp',
  });
  // The wash peaks at 0.9, never 1.0. A full-opacity overlay on frame 0 makes the
  // opening a flat colour field with nothing in it — the reference is blown out but
  // something is always moving. It also clears well before the colour flood, so the
  // two effects read as separate events rather than one long fade.
  const wash = p.bloom * 0.9 * ramp(0, p.timing.floodStart, 1, 0);

  // FLOOD — saturation and fill opacity together.
  const flood = ramp(p.timing.floodStart, p.timing.floodEnd);
  const saturate = interpolate(flood, [0, 1], [0.05, 1]);
  const fillOpacity = interpolate(flood, [0, 1], [0.12, 1]);

  // WORDMARK — last, and only after the badge has stopped.
  const wordIn = ramp(p.timing.wordmarkIn, Math.min(1, p.timing.wordmarkIn + 0.18));

  // SPECKLE — the dotted ring only exists while the badge is still in flight.
  const speckleOn = interpolate(
    frame,
    [at(0.16), at(0.34), at(0.52), at(0.64)],
    [0, 0.5, 0.5, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const badgePx = height * p.badgeScale;
  const BOX = 100;                       // badge drawn in a 100-unit box, then scaled
  const R = BOX / 2;
  const path = polygonPath(p.sides, R, R, R, p.cornerRadius, p.shapeRotation);

  // Gradient endpoints from an angle, in objectBoundingBox space.
  const a = (p.gradientAngle * Math.PI) / 180;
  const gx = Math.cos(a) * 0.5;
  const gy = Math.sin(a) * 0.5;
  const gradId = `badge-grad-${p.badgeColors.join('-').replace(/[^a-z0-9]/gi, '')}`;
  const stops = p.badgeColors.length === 1 ? [p.badgeColors[0], p.badgeColors[0]] : p.badgeColors;

  return (
    <AbsoluteFill style={{ background: p.ground }}>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          perspective: 1400,
        }}
      >
        <div
          style={{
            width: badgePx,
            height: badgePx,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
            filter: `blur(${blur}px) saturate(${saturate})`,
            ...(p.shadow
              ? { boxShadow: 'none', WebkitFilter: `blur(${blur}px) saturate(${saturate})` }
              : {}),
          }}
        >
          {/* the badge face */}
          <svg
            viewBox={`0 0 ${BOX} ${BOX}`}
            width="100%"
            height="100%"
            style={{ display: 'block', overflow: 'visible' }}
          >
            <defs>
              <linearGradient
                id={gradId}
                x1={0.5 - gx}
                y1={0.5 - gy}
                x2={0.5 + gx}
                y2={0.5 + gy}
              >
                {stops.map((c, i) => (
                  <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
              {p.shadow && (
                <filter id={`${gradId}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow
                    dx="0"
                    dy="3.5"
                    stdDeviation="4"
                    floodColor="#7A7F8C"
                    floodOpacity={0.28 * flood}
                  />
                </filter>
              )}
            </defs>

            <path
              d={path}
              fill={`url(#${gradId})`}
              fillOpacity={fillOpacity}
              filter={p.shadow ? `url(#${gradId}-shadow)` : undefined}
            />

            {p.speckle && speckleOn > 0 && (
              <g opacity={speckleOn}>
                {Array.from({ length: 34 }, (_, i) => {
                  const ang = (i / 34) * Math.PI * 2;
                  const rr = R * 0.86;
                  const s = i % 3 === 0 ? 2.4 : 1.5;
                  return (
                    <rect
                      key={i}
                      x={R + rr * Math.cos(ang) - s / 2}
                      y={R + rr * Math.sin(ang) - s / 2}
                      width={s}
                      height={s}
                      rx={0.4}
                      fill={p.markColor}
                      opacity={0.85}
                    />
                  );
                })}
              </g>
            )}

            {/* the letter, when no image was supplied */}
            {!p.imageSrc && (
              <text
                x={R}
                y={R}
                textAnchor="middle"
                dominantBaseline="central"
                fill={p.markColor}
                fontFamily={p.fontFamily}
                fontWeight={700}
                fontSize={BOX * p.markScale * 1.35}
                style={{ userSelect: 'none' }}
              >
                {p.letter}
              </text>
            )}
          </svg>

          {/* the image, when one was supplied — sits on the badge face */}
          {p.imageSrc && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Img
                src={p.imageSrc}
                style={{
                  width: badgePx * p.markScale,
                  height: badgePx * p.markScale,
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>

        {/* WORDMARK */}
        {p.wordmark !== '' && (
          <div
            style={{
              position: 'absolute',
              top: `calc(50% + ${badgePx * 0.62}px)`,
              opacity: wordIn,
              transform: `translateY(${(1 - wordIn) * 14}px)`,
              fontFamily: p.fontFamily,
              fontSize: p.wordmarkSize,
              fontWeight: 700,
              letterSpacing: p.wordmarkTracking,
              color: p.wordmarkColor,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {p.wordmark}
          </div>
        )}
      </AbsoluteFill>

      {/* BLOOM — a full-frame wash in the ground colour. This is what makes the
          opening read as overexposure rather than as a simple fade-in. */}
      {p.bloom > 0 && (
        <AbsoluteFill style={{ background: p.ground, opacity: wash, pointerEvents: 'none' }} />
      )}
    </AbsoluteFill>
  );
};

export default BadgeReveal;
