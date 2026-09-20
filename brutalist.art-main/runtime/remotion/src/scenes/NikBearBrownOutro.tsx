import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * NikBearBrownOutro — NikBearBrown brand outro beat.
 * Teardown palette: flat white ground, INK brand name, CRIMSON rule.
 * Big name → tagline → red divider → handle · url.
 * Works at any aspect ratio — all dims are % of viewport.
 */
export const nikBearBrownOutroSchema = z.object({
  brand:   z.string().default('Nik Bear Brown'),
  tagline: z.string().default('Brutalist + Educational AI'),
  handle:  z.string().default('@NikBearBrown'),
  url:     z.string().default('nikbearbrown.com'),
});
export type NikBearBrownOutroProps = z.infer<typeof nikBearBrownOutroSchema>;

export const NikBearBrownOutro: React.FC<NikBearBrownOutroProps> = ({brand, tagline, handle, url}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const brandIn   = spring({frame,            fps, config: SPRING_SMOOTH});
  const taglineIn = spring({frame: frame - 6,  fps, config: SPRING_SMOOTH});
  const ruleIn    = spring({frame: frame - 10, fps, config: SPRING_SMOOTH});
  const linksIn   = spring({frame: frame - 16, fps, config: SPRING_SMOOTH});

  return (
    <AbsoluteFill style={{
      backgroundColor: VOX.CREAM,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Brand name */}
      <div style={{
        fontFamily: FONT.display,
        fontSize: height * 0.12,
        fontWeight: 700,
        color: VOX.INK,
        letterSpacing: -1,
        opacity: brandIn,
        transform: `translateY(${(1 - brandIn) * 22}px)`,
        textAlign: 'center',
      }}>
        {brand}
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: FONT.display,
        fontSize: height * 0.030,
        fontWeight: 400,
        color: VOX.SLATE,
        marginTop: height * 0.016,
        opacity: taglineIn,
        transform: `translateY(${(1 - taglineIn) * 10}px)`,
        textAlign: 'center',
        maxWidth: width * 0.72,
      }}>
        {tagline}
      </div>

      {/* CRIMSON rule */}
      <div style={{
        width: width * 0.10,
        height: 3,
        backgroundColor: VOX.CRIMSON,
        marginTop: height * 0.045,
        opacity: ruleIn,
        transform: `scaleX(${ruleIn})`,
        transformOrigin: 'center',
      }} />

      {/* Handle + URL */}
      <div style={{
        display: 'flex',
        gap: width * 0.05,
        marginTop: height * 0.040,
        opacity: linksIn,
        transform: `translateY(${(1 - linksIn) * 8}px)`,
        alignItems: 'baseline',
      }}>
        <div style={{
          fontFamily: FONT.display,
          fontSize: height * 0.034,
          fontWeight: 700,
          color: VOX.CRIMSON,
        }}>
          {handle}
        </div>
        <div style={{
          fontFamily: FONT.display,
          fontSize: height * 0.030,
          fontWeight: 400,
          color: VOX.SLATE,
        }}>
          {url}
        </div>
      </div>

    </AbsoluteFill>
  );
};
