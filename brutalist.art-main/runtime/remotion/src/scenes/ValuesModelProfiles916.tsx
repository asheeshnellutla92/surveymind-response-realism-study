/**
 * ValuesModelProfiles916 — portrait 9:16 (1080×1920) alias of ValuesModelProfiles.
 * The source component reads useVideoConfig() for all dimensions and uses
 * proportional width/height fractions throughout. The four axes + chip spread
 * use proportional AXES_TOP = PAD_Y + height * 0.18 and AXIS_BLOCK_H that
 * distribute content down the height in portrait orientation.
 * This file exists solely so Root.tsx can register a <Composition id="ValuesModelProfiles916"
 * width={1080} height={1920} ...> that points to the same component.
 */
export { ValuesModelProfiles as ValuesModelProfiles916, valuesModelProfilesSchema as valuesModelProfiles916Schema } from './ValuesModelProfiles';
export type { ValuesModelProfilesProps as ValuesModelProfiles916Props } from './ValuesModelProfiles';
