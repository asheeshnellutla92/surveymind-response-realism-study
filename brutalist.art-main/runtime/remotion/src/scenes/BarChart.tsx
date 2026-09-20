import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate,
} from 'remotion';
import { z } from 'zod';
import { VOX, FONT, SPRING_SMOOTH } from '../tokens/vox';

/**
 * BarChart — vox scene_type: DATA (comparison).
 * Horizontal-staggered bars that grow from a baseline on the house spring.
 * Single-accent palette: the bar at `accentIndex` earns TEAL (the good/kept/true
 * thing), every other bar sits in SLATE. Duration-driven: reads the composition's
 * durationInFrames via the frame clock, so it fills any beat length the vox
 * compiler assigns. Content (title/data/accent) is injected per beat; nothing here
 * is hardcoded to a topic.
 */
export const barChartSchema = z.object({
  title: z.string(),
  data: z.array(z.object({ label: z.string(), value: z.number() })).min(2).max(7),
  accentIndex: z.number().int().nonnegative().default(0),
  unit: z.string().default(''),
});
export type BarChartProps = z.infer<typeof barChartSchema>;

export const BarChart: React.FC<BarChartProps> = ({ title, data, accentIndex, unit }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const max = Math.max(...data.map((d) => d.value), 1);
  const n = data.length;

  const plotW = width * 0.80;
  const plotH = height * 0.50;
  const left = (width - plotW) / 2;
  const baseline = height * 0.80;
  const gap = plotW / n;
  const barW = gap * 0.50;

  const titleIn = spring({ frame, fps, config: SPRING_SMOOTH });

  return (
    <AbsoluteFill style={{ backgroundColor: VOX.CREAM }}>
      <div
        style={{
          position: 'absolute', top: height * 0.11, left, width: plotW,
          color: VOX.INK, fontFamily: FONT.display, fontSize: height * 0.058,
          fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.5,
          opacity: titleIn, transform: `translateY(${(1 - titleIn) * 16}px)`,
        }}
      >
        {title}
      </div>

      <div style={{ position: 'absolute', left, top: baseline, width: plotW, height: 2, backgroundColor: VOX.INK, opacity: 0.55 }} />

      {data.map((d, i) => {
        const grow = spring({ frame: frame - 8 - i * 5, fps, config: SPRING_SMOOTH });
        const h = (d.value / max) * plotH * grow;
        const x = left + i * gap + (gap - barW) / 2;
        const isAccent = i === accentIndex;
        const valOpacity = interpolate(grow, [0.55, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: x, top: baseline - h, width: barW, height: h, backgroundColor: isAccent ? VOX.TEAL : VOX.SLATE }} />
            <div style={{ position: 'absolute', left: x - gap * 0.25, top: baseline - h - height * 0.058, width: barW + gap * 0.5, textAlign: 'center', color: VOX.INK, fontFamily: FONT.mono, fontSize: height * 0.040 }}>
              <span style={{ opacity: valOpacity }}>{d.value}{unit}</span>
            </div>
            <div style={{ position: 'absolute', left: x - gap * 0.25, top: baseline + 14, width: barW + gap * 0.5, textAlign: 'center', color: isAccent ? VOX.TEAL : VOX.INK, fontFamily: FONT.display, fontSize: height * 0.030, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {d.label}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
