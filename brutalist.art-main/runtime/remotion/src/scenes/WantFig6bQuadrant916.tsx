/**
 * WantFig6bQuadrant916 — portrait 9:16 (1080×1920) alias of WantFig6bQuadrant.
 * The source component reads useVideoConfig() for all dimensions and derives
 * the scatter plot coordinates proportionally. The chart fills 80% of height
 * by default (CHART_T = PAD_Y + height * 0.20, CHART_B = height * 0.80),
 * which works well in portrait orientation.
 * This file exists solely so Root.tsx can register a <Composition id="WantFig6bQuadrant916"
 * width={1080} height={1920} ...> that points to the same component.
 */
export { WantFig6bQuadrant as WantFig6bQuadrant916, wantFig6bQuadrantSchema as wantFig6bQuadrant916Schema } from './WantFig6bQuadrant';
export type { WantFig6bQuadrantProps as WantFig6bQuadrant916Props } from './WantFig6bQuadrant';
