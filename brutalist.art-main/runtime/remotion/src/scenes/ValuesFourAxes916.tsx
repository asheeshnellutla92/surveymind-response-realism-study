/**
 * ValuesFourAxes916 — portrait 9:16 (1080×1920) alias of ValuesFourAxes.
 * The source component reads useVideoConfig() for all dimensions and uses
 * proportional width/height fractions throughout. The four axes stack
 * vertically using AXIS_BLOCK_H = (height * 0.75) / AXES.length which
 * distributes them proportionally in portrait orientation.
 * This file exists solely so Root.tsx can register a <Composition id="ValuesFourAxes916"
 * width={1080} height={1920} ...> that points to the same component.
 */
export { ValuesFourAxes as ValuesFourAxes916, valuesFourAxesSchema as valuesFourAxes916Schema } from './ValuesFourAxes';
export type { ValuesFourAxesProps as ValuesFourAxes916Props } from './ValuesFourAxes';
