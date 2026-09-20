/**
 * WantFig1Scale916 — portrait 9:16 (1080×1920) alias of WantFig1Scale.
 * The source component reads useVideoConfig() for all dimensions and uses
 * proportional width/height fractions throughout, so it auto-reflows to portrait.
 * This file exists solely so Root.tsx can register a <Composition id="WantFig1Scale916"
 * width={1080} height={1920} ...> that points to the same component.
 */
export { WantFig1Scale as WantFig1Scale916, wantFig1ScaleSchema as wantFig1Scale916Schema } from './WantFig1Scale';
export type { WantFig1ScaleProps as WantFig1Scale916Props } from './WantFig1Scale';
