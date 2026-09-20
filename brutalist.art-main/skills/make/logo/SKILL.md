---
name: logo
description: >
  Append a brand logo sting after a reel's last beat — one random-once pick of
  a Remotion animation technique (spring entrance, draw-on stroke, rotation,
  kinetic grid, elastic physics, noise wobble, trail echo, glitch slices), a
  brand SVG, and a brand MP3 from logos/[brand]/. The MP3 is the clock: the
  outro runs exactly as long as the jingle. Use when the user types
  `logo [reel]`, `logo nbb [reel]`, `logo bear-brown [reel]`, `logo hai [reel]`,
  `logo medhavy [reel]`, `logo muz [reel]`, or asks to add a logo outro /
  brand sting / signature outro to a built video.
---

# logo — the random-once brand sting

One command appends one beat: the brand's mark, animated with one technique
from the wordmark-showcase catalog, timed exactly to one of the brand's
jingles. Random across reels, locked within one.

## The one command

```bash
python3 skills/make/logo/scripts/logo.py [book]/youtube/[slug] [brand] [flags]
```

That single run: picks (or reuses the locked pick), copies the jingle to
`mp3/beat-[BID].mp3` and measures it, appends the beat after the last beat,
renders it via `runtime/scripts/remotion_scenes.py` (foreground — the only
lawful Remotion path), and recompiles the review cut. Nothing else to do.

## Brands and aliases

| you type | pool folder | ground / accent |
|---|---|---|
| `nbb`, `bear-brown` (default) | `logos/bear-brown/` | Claude cream `#FAF9F5` / terracotta `#D97757` |
| `hai`, `humanitarians` | `logos/humanitarians/` | vox cream `#F3EBDD` / petrol teal `#1F4E5F` |
| `medhavy` | `logos/medhavy/` | eggshell `#F0EAD6` / vermillion `#D55E00` |
| `muz`, `musinique` | `logos/musinique/` | white `#ffffff` / blue-600 `#2563eb` |

A brand pool is just files: drop more `*.svg` marks and `*.mp3` jingles into
`logos/[brand]/` and they join the lottery. **A pool with no mp3s (or no
svgs) is a MISSING** — the script logs exactly what to drop where in the
reel's `BUILD-LOG.md` and stops (standing rule #3). All four pools are READY:
`bear-brown/` 2 marks · 6 jingles, `humanitarians/` 1 · 9, `medhavy/` 54 · 2,
`musinique/` 2 · 5. Jingles run ~7–18s; the sting is exactly as long as the one
it draws.

### `kineticGrid` is full-bleed

It tiles the whole canvas by design — the tiling runs off every edge, and that
is the effect, not a clip. Gate V reads edge crossings as a BLOCKER, so a beat
using it declares itself:

```jsonc
"qc": { "full_bleed": true }
```

Per beat, in the beat sheet, visible in the diff. It drops **only** the
edge-bleed check for that beat — underfill and everything else still run, and it
can never be a blanket switch that disarms the gate for a whole reel.

### Curate the pool before you trust the draw

The draw is uniform over `logos/<brand>/*.svg`, so the pool IS the quality bar.
Two failure modes, both found in `logos/medhavy/` on 2026-09-01:

- **A wrong mark is drawable.** Misspelled wordmarks and four logos belonging to
  a different company were in the pool. They are now in `logos/medhavy/_rejected/`
  — a subdirectory drops them from the glob without deleting anything.
- **Duplicates skew the odds.** `medhavy-selected-*` is a byte-identical rename of
  `medhavy-logo-12`…`-33`, so those designs are twice as likely to be drawn. 42
  drawable files, 25 unique designs. Harmless to output, wrong as a lottery.

Wordmarks are outlined paths — grep finds nothing. Rasterise and look.

**There is no `logos/nik-bear-brown/`, by design.** @NikBearBrown does not use a
logo sting — it uses `ClaudeTitleOutro`, whose CLAWD mascot is drawn from pixel
rects in `ClaudeMascotScene.tsx` and reads no files at all. See `OUTRO-LOCK.md`.

## The laws

1. **The MP3 is the clock — and the jingle is NEVER cut.** The copied mp3 is
   padded with a trailing silence (`--tail`, default 1.0s) and `durationS` =
   the padded length; the `LogoOutro` composition derives `durationInFrames`
   from it (`calculateMetadata`). The audible jingle therefore ends strictly
   inside the beat: frame rounding, clip conform, and mux can only ever trim
   silence, never sound (same law as outro.py — the silence lives IN the
   clock). Want a different length? Use a different mp3 — never hand-edit
   timings (audio-first law).
2. **Random once, then locked.** The pick (animation + svg + mp3) is recorded
   in the beat at `shot.remotion.picked`; re-runs reuse it, so rebuilds are
   stable. `--reroll` discards the lock, picks fresh, and force-re-renders.
3. **One sting per reel.** Re-running replaces the existing LogoOutro beat in
   place (same beat id) rather than stacking a second one.
4. **Aspect follows the reel.** `metadata.aspect_ratio` 9:16 → 1080×1920,
   anything else → 1920×1080.
5. **No TTS ever touches it.** The beat carries `reuse_audio`, so
   `generate_audio.py` measures the jingle instead of synthesizing over it.
6. **drawOn is earned.** The draw-on-stroke technique needs clean path data;
   it enters the lottery only when the chosen SVG is path-only (no text,
   images, gradients, masks). Every other technique renders the SVG file
   itself, so any mark works.

## Flags

| flag | effect |
|---|---|
| `--reroll` | new random pick, force re-render |
| `--tail 1.0` | silence after the jingle (protects the ring-out; the tail is part of the beat's clock) |
| `--handle @NikBearBrown` | small serif handle line under the mark (default: none — the mark speaks) |
| `--no-render` / `--no-compile` | stop early; the script prints the next commands |

## Moving parts

- `skills/make/logo/scripts/logo.py` — this skill's one script
- `runtime/remotion/src/scenes/LogoOutro.tsx` — the scene: 8 techniques,
  aspect-aware, duration from props; registered in `Root.tsx`
- `runtime/remotion/public/logo-outro/[brand]/` — where the chosen svg is
  staged for `staticFile()`
- the beat it writes: `shot.type: REMOTION`, `shot.remotion.pattern:
  "LogoOutro"` — so `remotion_scenes.py`, `todo.py`, and `compile.py` treat
  it like any other Remotion beat

## Example

```bash
# Bear Brown sting on a physics reel (default brand)
python3 skills/make/logo/scripts/logo.py \
    physics-quantum-mechanics/youtube/particle-in-a-box nbb

# didn't like the draw? re-spin the wheel
python3 skills/make/logo/scripts/logo.py \
    physics-quantum-mechanics/youtube/particle-in-a-box nbb --reroll
```
