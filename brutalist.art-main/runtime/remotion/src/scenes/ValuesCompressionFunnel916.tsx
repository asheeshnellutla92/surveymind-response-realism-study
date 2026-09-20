/**
 * ValuesCompressionFunnel916 — portrait 9:16 (1080×1920) alias of ValuesCompressionFunnel.
 * The source component reads useVideoConfig() for all dimensions and uses
 * proportional width/height fractions throughout. The chip swirl animation
 * is centered in the canvas (CX = width * 0.5, CY = height * 0.52) and
 * the four axis lines use PAD_X / PAD_Y offsets that scale to portrait.
 * This file exists solely so Root.tsx can register a <Composition id="ValuesCompressionFunnel916"
 * width={1080} height={1920} ...> that points to the same component.
 */
export { ValuesCompressionFunnel as ValuesCompressionFunnel916, valuesCompressionFunnelSchema as valuesCompressionFunnel916Schema } from './ValuesCompressionFunnel';
export type { ValuesCompressionFunnelProps as ValuesCompressionFunnel916Props } from './ValuesCompressionFunnel';
