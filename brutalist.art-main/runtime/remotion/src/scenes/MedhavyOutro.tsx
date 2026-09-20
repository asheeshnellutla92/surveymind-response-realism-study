import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {z} from 'zod';
import {MEDHAVY} from '../tokens/medhavy';
import {FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * MedhavyOutro — Medhavy brand outro beat (B13).
 * Clean CREAM card: brand name large, tagline, TEAL rule, handle + URL.
 * Works at any aspect ratio — all dims are % of viewport.
 * Permanent rule: narration_text feeds ElevenLabs "med havy"; on-screen text
 * shows "Medhavy" / "@MedhavyAI" / "medhavy.com". Never swap.
 */
export const medhavyOutroSchema = z.object({
  brand:   z.string().default('Medhavy'),
  tagline: z.string().default('AI-powered intelligent learning systems'),
  handle:  z.string().default('@MedhavyAI'),
  url:     z.string().default('medhavy.com'),
});
export type MedhavyOutroProps = z.infer<typeof medhavyOutroSchema>;

export const MedhavyOutro: React.FC<MedhavyOutroProps> = ({brand, tagline, handle, url}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const brandIn   = spring({frame,            fps, config: SPRING_SMOOTH});
  const taglineIn = spring({frame: frame - 6,  fps, config: SPRING_SMOOTH});
  const ruleIn    = spring({frame: frame - 10, fps, config: SPRING_SMOOTH});
  const linksIn   = spring({frame: frame - 16, fps, config: SPRING_SMOOTH});

  return (
    <AbsoluteFill style={{
      backgroundColor: MEDHAVY.CREAM,
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
        color: MEDHAVY.INK,
        letterSpacing: -1,
        opacity: brandIn,
        transform: `translateY(${(1 - brandIn) * 22}px)`,
      }}>
        {brand}
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: FONT.display,
        fontSize: height * 0.030,
        fontWeight: 400,
        color: MEDHAVY.SLATE,
        marginTop: height * 0.016,
        opacity: taglineIn,
        transform: `translateY(${(1 - taglineIn) * 10}px)`,
        textAlign: 'center',
        maxWidth: width * 0.72,
      }}>
        {tagline}
      </div>

      {/* TEAL rule */}
      <div style={{
        width: width * 0.10,
        height: 3,
        backgroundColor: MEDHAVY.TEAL,
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
          color: MEDHAVY.TEAL,
        }}>
          {handle}
        </div>
        <div style={{
          fontFamily: FONT.display,
          fontSize: height * 0.030,
          fontWeight: 400,
          color: MEDHAVY.SLATE,
        }}>
          {url}
        </div>
      </div>

    </AbsoluteFill>
  );
};
