import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * PaperGrain — a procedural paper-texture overlay for the doodle look.
 *
 * feTurbulence with a FIXED seed: no noise asset to ship, fully
 * deterministic frame-to-frame (the grain is *static*, like paper — it does
 * not boil). Composited with mix-blend multiply at low opacity so white
 * stays white and ink barely darkens; cheap for the renderer because the
 * filter output is constant across frames.
 */
export const PaperGrain: React.FC<{opacity?: number}> = ({opacity = 0.05}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity}}>
    <svg width="100%" height="100%">
      <filter id="doodle-paper-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves={2}
          seed={7}
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.16  0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 0.9 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#doodle-paper-grain)" />
    </svg>
  </AbsoluteFill>
);
