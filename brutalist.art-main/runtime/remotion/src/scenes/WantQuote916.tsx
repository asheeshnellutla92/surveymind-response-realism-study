/**
 * WantQuote916 — portrait 9:16 (1080×1920) alias of WantQuote.
 * The source component reads useVideoConfig() for all dimensions and uses
 * proportional width/height fractions throughout. The centered quote layout
 * already works well in portrait (centered vertically and horizontally).
 * This file exists solely so Root.tsx can register a <Composition id="WantQuote916"
 * width={1080} height={1920} ...> that points to the same component.
 */
export { WantQuote as WantQuote916, wantQuoteSchema as wantQuote916Schema } from './WantQuote';
export type { WantQuoteProps as WantQuote916Props } from './WantQuote';
