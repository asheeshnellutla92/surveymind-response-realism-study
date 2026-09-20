# continuity.md — the vox-run handoff contract

The documentary continuous-shot feel, scoped to where it can't break the
build: runs of 2–3 consecutive VOX beats. Everything else cuts.

## Why scoped

Whole-film frame-continuity means every scene's frame 0 must equal the prior
scene's final frame — across 40+ beats, authored by prose, that contract
fails silently and re-renders cascade. Scoping continuity to short vox runs
keeps the camera-glide drama where the pantry stills live and keeps every
lane boundary a plain cut, which Manim/Remotion beats want anyway.

## The contract

- A run = 2–3 consecutive vox beats sharing `shot.vox_run: "R<n>"`.
- Every beat in the run except the last carries `shot.handoff` — its OWN
  last frame, serialized:

```jsonc
"handoff": {
  "camera":  { "x": 0.62, "y": 0.40, "scale": 1.8 },        // 0–1 frame coords
  "objects": [
    { "id": "portrait-hume", "x": 0.50, "y": 0.45, "scale": 1.0, "opacity": 1.0 }
  ]
}
```

- The NEXT beat's first frame MUST reproduce those values exactly. Two legal
  implementations:
  1. **One composition** — the run renders as a single clip internally (one
     camera spline; beat boundaries = narration boundaries from the word
     clock), then splits into per-beat mp4s at conform. Simplest and
     preferred when the run shares one plate.
  2. **Pinned clips** — separate per-beat renders whose first/last frames
     read the handoff values. Required when the run's beats use different
     plates (e.g. a match-cut on position).
- Either way the handoff block is authored AT PLAN TIME. It is data, not
  narrative trust — a re-render of beat 2 alone still starts where beat 1
  ended, because the numbers say so.

## Limits (plan-gate failures)

- Max 3 beats per run.
- A run never crosses an act boundary.
- A run never contains a non-vox beat (the lane change is a cut by law).
- Handoff values live in 0–1 frame coordinates so aspect derivatives (9:16
  shorts) re-band without re-authoring.

## The worked shapes (what runs are FOR)

- **Reveal**: beat 1 tight on a detail (scale 2.2) → beat 2 eases out to the
  whole plate (scale 1.0) as the narration widens the claim.
- **Consequence pan**: beat 1 subject at left → beat 2 pans right to the
  thing it caused; handoff pins the mid-pan frame.
- **Rise**: beat 1 background plate settles → beat 2 cutout subject springs
  up from it (the classic figure-over-the-map move); handoff pins the
  background camera so the rise lands on a still stage.
