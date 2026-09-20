# vox-beats.md — the cutout grammar, implementation terms

How a deep-explainer vox beat animates a static pantry still. This file is
deliberately small: the parent doctrine (`../../explainer/MOTION.md`,
`../../explainer/REMOTION.md`) owns motion law; this is the genre-specific
recipe sheet, with provenance flags on every technique.

## The three-layer stage

Every vox beat composites onto the Claude cream stage in at most three planes:

```
foreground   annotation plane: terracotta ring/underline, serif labels,
             spark line (Remotion — never baked into the plate)
midground    the subject: treated still, cutout, or layer stack
background   the stage: cream #F2F0E9, grain overlay, vignette
```

Annotations live on the assembly overlay per the parent slot contract — a
re-annotated beat never re-renders its plate.

## Treatment pass (deterministic, at pantry intake)

Per still, in order: scale/crop for the beat's aspect and planned camera
travel (Ken Burns needs overscan — reject stills too small to survive the
crop; the intake warns) → desaturate ~80% → contrast ~1.15 → seat on cream →
vignette (warm ink, subtle). Grain is NOT baked per-plate; it's one shared
overlay layer at assembly (screen or overlay blend, low opacity, seamless
loop) so every beat's grain matches.

Cutout subjects (alpha PNGs) skip the seat step — they land directly on the
stage and the background plane does the seating.

## Motion recipes

- **kenburns** — single camera move per beat, ease-out bias
  (`Easing.out(Easing.cubic)`), constant-ish velocity tail. `shot.focus`
  aims the move at the sentence's subject. Never two direction changes in
  one beat.
- **cutout** — subject springs up/in (damped spring — pop, settle, no
  bounce-past on documentary register), background holds. The signature
  "figure rises over the map" move. Stagger multiple cutouts with per-element
  frame offsets (sequenced entrances), never one shared spring.
- **parallax** — bg/mid/fg drift at ratios roughly 1 : 1.4 : 1.9 of the base
  travel. Requires layered pantry files; the shopping list names each layer.
- **drawon / annotate** — plate holds; the ONE terracotta editor's-pen
  element draws on, keyed to the word clock.
- **keying (black-background footage)** — stock/generated clips shot on
  black composite with `mixBlendMode: 'screen'` — no keying library. Only
  for motion assets a shopping-list card requested (explosions, smoke,
  light effects); still subject to the treatment pass.

## Provenance flags (read before trusting)

- Verified against Remotion docs at authoring time (2026-07): the
  `@remotion/media` `<Audio>`/`<Video>` components take `trimBefore` /
  `trimAfter` (frames) — the older `startFrom`/`endAt` props still resolve
  but must not be mixed with the new ones in one component. Re-check on
  Remotion major upgrades.
- Verified: d3-geo/TopoJSON winding-order gotcha — if a map beat ever
  sources raw GeoJSON (not `world-atlas` TopoJSON), polygons can render
  inverted/empty with no error. Sanity-check the drawn landmass by eye.
  Map boundary datasets also embed editorial decisions on contested
  territory — a deliberate human check before publish, not a bug.
- NOT a library: halftone/dither is custom code if ever needed — review the
  actual implementation, don't trust a prompt that claims a built-in filter
  exists (a claimed Remotion `paper()` filter was checked and does not
  exist).
- General caution: the research lineage behind this grammar mixes verified
  API facts with fabricated benchmark claims that read identically. Anything
  in this file gains authority only from being re-checked, never from being
  written down here.
