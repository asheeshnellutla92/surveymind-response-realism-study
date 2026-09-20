import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * OutroCTA — the like/comment/subscribe outro (vox scene_type: outro-cta).
 * A serif call line, a teal Subscribe pill with a gentle pulse, and the handle.
 * On the cream ground. Content injected per reel (from AUTHOR.MD in the pipeline).
 */
export const outroCtaSchema = z.object({
  line: z.string(),
  handle: z.string(),
});
export type OutroCtaProps = z.infer<typeof outroCtaSchema>;

export const OutroCTA: React.FC<OutroCtaProps> = ({line, handle}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const inn = spring({frame, fps, config: SPRING_SMOOTH});
  const pulse = 1 + 0.03 * Math.sin(frame * 0.35);
  return (
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: inn, transform: `translateY(${(1 - inn) * 14}px)`, textAlign: 'center'}}>
        <div style={{fontFamily: FONT.serif, color: VOX.INK, fontSize: height * 0.056, marginBottom: height * 0.06}}>{line}</div>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: height * 0.032}}>
          <div style={{fontFamily: FONT.display, fontWeight: 700, color: '#FFFFFF', backgroundColor: VOX.TEAL, padding: `${height * 0.018}px ${height * 0.042}px`, borderRadius: 999, fontSize: height * 0.028, letterSpacing: 1, textTransform: 'uppercase', transform: `scale(${pulse})`}}>Subscribe</div>
          <div style={{fontFamily: FONT.display, color: VOX.TEAL, fontSize: height * 0.03, fontWeight: 600}}>{handle}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
