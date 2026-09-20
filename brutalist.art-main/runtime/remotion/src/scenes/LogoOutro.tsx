import React from 'react';
import {
  AbsoluteFill, Img, staticFile,
  useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from 'remotion';
import { z } from 'zod';
import { evolvePath } from '@remotion/paths';

/**
 * LogoOutro — the brand sting appended after a reel's last beat by the `logo`
 * skill (skills/make/logo/). One random-once pick per reel: an animation
 * technique from the wordmark-showcase catalog, a brand SVG, a brand MP3.
 * The MP3 is the clock: durationS = the jingle's measured length, and
 * calculateMetadata (Root.tsx) derives durationInFrames + canvas size from
 * props, so the composition conforms to any reel aspect with no re-code.
 *
 * Rendering is Img-based (the SVG file itself, via staticFile) so any brand
 * SVG works — groups, fills, gradients. The one path-dependent technique,
 * drawOn, is only eligible when logo.py could extract clean <path> data;
 * it receives the merged path + viewBox as props.
 *
 * Audio is NOT played here — compile.py muxes mp3/beat-<BID>.mp3 as the
 * master clock, same as every other beat.
 */

export const ANIMATIONS = [
  'springEntrance', 'drawOn', 'rotation', 'kineticGrid',
  'elasticPhysics', 'noiseWobble', 'trailEcho', 'glitchSlices',
] as const;

export const logoOutroSchema = z.object({
  svgFile: z.string().describe('path under public/, e.g. logo-outro/bear-brown/bear-brown-logo-1.svg'),
  animation: z.enum(ANIMATIONS),
  durationS: z.number().min(0.5).default(4),
  aspect: z.enum(['16:9', '9:16']).default('16:9'),
  aspectRatio: z.number().positive().default(1.5).describe('svg intrinsic width/height'),
  bg: z.string().default('#FAF9F5'),
  accent: z.string().default('#D97757'),
  fill: z.string().default('#000000').describe('drawOn flood fill'),
  paths: z.string().default('').describe('merged <path d> data — drawOn only'),
  viewBox: z.string().default('').describe('source viewBox — drawOn only'),
  handle: z.string().default('').describe('optional small handle line at the bottom'),
});
export type LogoOutroProps = z.infer<typeof logoOutroSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ── mark sizing: fit the mark to the canvas, whatever its intrinsic ratio ────
const useMarkSize = (aspectRatio: number, shrink = 1) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const maxW = width * (portrait ? 0.78 : 0.55);
  const maxH = height * (portrait ? 0.34 : 0.5);
  const w = Math.min(maxW, maxH * aspectRatio) * shrink;
  return { w, h: w / aspectRatio };
};

const Mark: React.FC<{ svgFile: string; w: number; h: number; style?: React.CSSProperties }> = ({
  svgFile, w, h, style = {},
}) => (
  <Img
    src={staticFile(svgFile)}
    style={{ width: w, height: h, display: 'block', ...style }}
  />
);

// ── the stage: mark centered, optional handle at the bottom ──────────────────
const Stage: React.FC<{
  bg: string; accent: string; handle: string; children: React.ReactNode;
}> = ({ bg, accent, handle, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const handleIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  return (
    <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </AbsoluteFill>
      {handle ? (
        <div style={{
          position: 'absolute', bottom: '6%', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          opacity: clamp(handleIn, 0, 1),
        }}>
          <div style={{ width: 48, height: 2, background: accent }} />
          <span style={{
            fontFamily: '"EB Garamond", Georgia, serif', fontSize: 30,
            color: '#3D3929', letterSpacing: '0.01em',
          }}>{handle}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── techniques (ported from the wordmark showcases, made mark-agnostic) ─────

const SpringEntrance: React.FC<LogoOutroProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h } = useMarkSize(p.aspectRatio);
  const s = spring({ frame, fps, config: { damping: 24, stiffness: 100, mass: 1 } });
  return (
    <div style={{ transform: `scale(${s})`, opacity: clamp(s, 0, 1) }}>
      <Mark svgFile={p.svgFile} w={w} h={h} />
    </div>
  );
};

const DrawOn: React.FC<LogoOutroProps> = (p) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { w, h } = useMarkSize(p.aspectRatio);
  const progress = clamp(frame / (durationInFrames * 0.88), 0, 1);
  const strokeP = clamp(progress / 0.55, 0, 1);
  const fillOpacity = clamp((progress - 0.55) / 0.45, 0, 1);
  const strokeFadeOut = strokeP >= 1 ? clamp(1 - (progress - 0.55) / 0.2, 0, 1) : 1;
  if (!p.paths || !p.viewBox) {
    // logo.py never picks drawOn without extracted paths; this is a belt-and-
    // braces fallback so a hand-edited sheet still renders something sane.
    return <SpringEntrance {...p} />;
  }
  const { strokeDasharray, strokeDashoffset } = evolvePath(strokeP, p.paths);
  const vbW = Number(p.viewBox.split(/\s+/)[2] || 1000);
  return (
    <svg width={w} height={h} viewBox={p.viewBox} style={{ display: 'block', overflow: 'visible' }}>
      <path d={p.paths} fill={p.fill} opacity={fillOpacity} />
      <path d={p.paths} fill="none"
        stroke={p.accent} strokeWidth={Math.max(2, vbW * 0.0032)}
        strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
        strokeLinecap="round" opacity={strokeFadeOut} />
    </svg>
  );
};

const Rotation: React.FC<LogoOutroProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { w, h } = useMarkSize(p.aspectRatio, 0.9);
  const entryFrames = fps * 1.2;
  const entranceS = spring({ frame, fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
  const pivotAngle = interpolate(1 - entranceS, [0, 1], [0, -45]);
  const drift = frame > entryFrames
    ? interpolate(frame - entryFrames, [0, Math.max(1, durationInFrames - entryFrames)], [0, 180])
    : 0;
  return (
    <div style={{ transform: `rotate(${pivotAngle + drift}deg)`, opacity: clamp(entranceS, 0, 1) }}>
      <Mark svgFile={p.svgFile} w={w} h={h} />
    </div>
  );
};

const KineticGrid: React.FC<LogoOutroProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;
  const cols = portrait ? 2 : 4;
  const rows = portrait ? 5 : 3;
  const cellW = width / cols;
  const cellH = height / rows;
  const tileW = Math.min(cellW * 0.8, cellH * 0.8 * p.aspectRatio);
  return (
    <AbsoluteFill>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const delay = (row * cols + col) * 4;
          const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 130, mass: 0.9 } });
          const rippleY = Math.sin((frame - delay) / 9) * 4;
          return (
            <div key={`${row}-${col}`} style={{
              position: 'absolute',
              left: col * cellW + cellW / 2,
              top: row * cellH + cellH / 2,
              transform: `translate(-50%, -50%) scale(${clamp(s, 0, 1)}) translateY(${rippleY}px)`,
              opacity: clamp(s * 1.2, 0, 1),
            }}>
              <Mark svgFile={p.svgFile} w={tileW} h={tileW / p.aspectRatio} />
            </div>
          );
        })
      )}
    </AbsoluteFill>
  );
};

const ElasticPhysics: React.FC<LogoOutroProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h } = useMarkSize(p.aspectRatio);
  const dropS = spring({ frame, fps, config: { damping: 10, stiffness: 180, mass: 1.2 } });
  const dropY = interpolate(clamp(dropS, 0, 2), [0, 1], [-300, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const LAND = 12;
  const squashBurst = Math.max(0, Math.sin(Math.PI * clamp((frame - LAND) / 10, 0, 1)));
  return (
    <div style={{
      transform: `translateY(${dropY}px) scaleX(${1 + squashBurst * 0.26}) scaleY(${1 - squashBurst * 0.20})`,
      transformOrigin: 'bottom center',
      opacity: clamp(dropS * 1.5, 0, 1),
    }}>
      <Mark svgFile={p.svgFile} w={w} h={h} />
    </div>
  );
};

const NoiseWobble: React.FC<LogoOutroProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { w, h } = useMarkSize(p.aspectRatio);
  const entryS = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  const amp = interpolate(frame, [0, durationInFrames * 0.88], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const wobbleX = Math.sin(frame * 0.43) * amp;
  const wobbleY = Math.sin(frame * 0.29 + 1.1) * amp * 0.55;
  const wobbleRot = Math.sin(frame * 0.21) * amp * 0.25;
  return (
    <div style={{
      transform: `translate(${wobbleX}px, ${wobbleY}px) rotate(${wobbleRot}deg)`,
      opacity: clamp(entryS, 0, 1),
    }}>
      <Mark svgFile={p.svgFile} w={w} h={h} />
    </div>
  );
};

const TrailEcho: React.FC<LogoOutroProps> = (p) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const { w, h } = useMarkSize(p.aspectRatio, 0.85);
  const TRAVEL = Math.round(width * 0.25);
  const ease = (t: number) => t * t * (3 - 2 * t);
  const slide = (f: number) => {
    const sp = interpolate(f, [0, durationInFrames * 0.72], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease,
    });
    return interpolate(sp, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
  };
  const trailCount = 5;
  const trailDelay = 5;
  return (
    <div style={{ position: 'relative', width: w + TRAVEL, height: h }}>
      {Array.from({ length: trailCount }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', left: slide(Math.max(0, frame - (i + 1) * trailDelay)) + TRAVEL / 2, top: 0,
          opacity: (1 - i / trailCount) * 0.22,
        }}>
          <Mark svgFile={p.svgFile} w={w} h={h} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: slide(frame) + TRAVEL / 2, top: 0 }}>
        <Mark svgFile={p.svgFile} w={w} h={h} />
      </div>
    </div>
  );
};

const GlitchSlices: React.FC<LogoOutroProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h } = useMarkSize(p.aspectRatio);
  const GLITCH_START = 18;
  const GLITCH_END = GLITCH_START + 10;
  const isGlitching = frame >= GLITCH_START && frame < GLITCH_END;
  const seed = frame * 1337;
  const pseudo = (n: number) => ((seed * (n + 1) * 2654435761) & 0xffffffff) / 0xffffffff;
  const entryS = spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } });
  const slices = 7;
  return (
    <div style={{ opacity: clamp(entryS, 0, 1), position: 'relative', width: w, height: h }}>
      {isGlitching ? (
        Array.from({ length: slices }, (_, i) => {
          const offsetX = (pseudo(i * 3 + frame) - 0.5) * w * 0.33;
          const top = (i / slices) * 100;
          const bottom = 100 - ((i + 1) / slices) * 100;
          const tint = pseudo(i + frame * 2) > 0.78;
          return (
            <div key={i} style={{
              position: 'absolute', left: offsetX, top: 0,
              clipPath: `inset(${top}% 0 ${bottom}% 0)`,
              filter: tint ? 'invert(0.5) sepia(1) saturate(4) hue-rotate(330deg)' : 'none',
            }}>
              <Mark svgFile={p.svgFile} w={w} h={h} />
            </div>
          );
        })
      ) : (
        <Mark svgFile={p.svgFile} w={w} h={h} />
      )}
    </div>
  );
};

const TECHNIQUES: Record<(typeof ANIMATIONS)[number], React.FC<LogoOutroProps>> = {
  springEntrance: SpringEntrance,
  drawOn: DrawOn,
  rotation: Rotation,
  kineticGrid: KineticGrid,
  elasticPhysics: ElasticPhysics,
  noiseWobble: NoiseWobble,
  trailEcho: TrailEcho,
  glitchSlices: GlitchSlices,
};

export const LogoOutro: React.FC<LogoOutroProps> = (props) => {
  const Technique = TECHNIQUES[props.animation] ?? SpringEntrance;
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // gentle global fade-out over the last ~0.4s so the cut never hard-stops
  const fadeOut = clamp(interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }), 0, 1);
  return (
    <AbsoluteFill style={{ opacity: durationInFrames > 24 ? fadeOut : 1 }}>
      <Stage bg={props.bg} accent={props.accent} handle={props.handle}>
        <Technique {...props} />
      </Stage>
    </AbsoluteFill>
  );
};
