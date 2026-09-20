import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * OutroSeries — the series sign-off outro (vox scene_type: outro-series).
 * Bookends the B01 title treatment: teal tracked-caps eyebrow, serif line, the
 * crimson editor's-pen underline drawing in. On the cream ground. Content is
 * injected per reel (from the book's ABOUT.MD in the audience pipeline).
 */
export const outroSeriesSchema = z.object({
  eyebrow: z.string(),
  line: z.string(),
});
export type OutroSeriesProps = z.infer<typeof outroSeriesSchema>;

export const OutroSeries: React.FC<OutroSeriesProps> = ({eyebrow, line}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const inn = spring({frame, fps, config: SPRING_SMOOTH});
  const underline = interpolate(frame, [7, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: inn, transform: `translateY(${(1 - inn) * 14}px)`, textAlign: 'center'}}>
        <div style={{fontFamily: FONT.display, color: VOX.TEAL, fontSize: height * 0.026, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', marginBottom: height * 0.05}}>{eyebrow}</div>
        <div style={{fontFamily: FONT.serif, color: VOX.INK, fontSize: height * 0.06, lineHeight: 1.15, maxWidth: width * 0.78}}>{line}</div>
        <div style={{height: 3, backgroundColor: VOX.CRIMSON, width: `${underline * 34}%`, margin: `${height * 0.035}px auto 0`}} />
      </div>
    </AbsoluteFill>
  );
};
