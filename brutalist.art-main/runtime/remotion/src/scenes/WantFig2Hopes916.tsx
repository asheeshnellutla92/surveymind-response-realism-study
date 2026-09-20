/**
 * WantFig2Hopes916 — portrait 9:16 (1080×1920) alias of WantFig2Hopes.
 * The source component reads useVideoConfig() for all dimensions and uses
 * proportional width/height fractions throughout, so it auto-reflows to portrait.
 * This file exists solely so Root.tsx can register a <Composition id="WantFig2Hopes916"
 * width={1080} height={1920} ...> that points to the same component.
 */
export { WantFig2Hopes as WantFig2Hopes916, wantFig2HopesSchema as wantFig2Hopes916Schema } from './WantFig2Hopes';
export type { WantFig2HopesProps as WantFig2Hopes916Props } from './WantFig2Hopes';
