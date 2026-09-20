# How to guide `art fill-pantry`'s style

Style is a **picture, not a prompt.** flux_kontext conditions on a reference
image, so the *plate* in this folder IS the look. The per-beat prompt only picks
the subject. Three layers, in order of leverage:

## 1. The plates — the look (80% of your control)
Author 2–4 reference stills, one per compositional archetype:

```
vox-plate-object.png    ← a generic object, close-ish, on the Claude stage
vox-plate-scene.png     ← a generic wide interior / landscape
vox-plate-portrait.png  ← a generic figure / silhouette (NEVER a named person)
```

**Where the plates live — most-specific wins:**

```
books/<book>/youtube/<slug>/style/       ← per-reel (bespoke, rare)
books/<book>/youtube/_style/             ← PER-BOOK (the home you'll actually use)
runtime/style/vox-plates/claude/         ← channel default (generic fallback — this folder)
```

The *look* (grade, grain, terracotta, stage) is channel-constant — it's in the
treatment fn + negative-prompt, not the plate. But plate *subjects* belong to
the book: a "scene" plate that's a seminar room fits an epistemology book and
looks wrong in cancer-nanomedicine. So **keep your plates per-book** in
`books/<book>/youtube/_style/`, shared by every reel in that book; drop to a
per-reel `style/` only for a one-off, and let the channel folder be the last
resort. `style.json` overrides stack the same way (channel → book → reel).

Rules for a good plate:
- **Bake the treatment in.** Run the plate through your pantry treatment ONCE
  by hand (desaturate ~80%, contrast ~1.15, cream `#F2F0E9` ground, film grain,
  one terracotta accent) so it encodes the target grade directly — the fill
  then only has to match subject + composition, not hit a palette on every call.
- **Encode the LOOK, not a specific subject.** Every "scene" beat references
  `vox-plate-scene.png`, so if that plate is "a seminar room," every scene beat
  drifts toward seminar rooms. Make the plate read as *a look applied to a
  generic wide interior* — lighting, grain, palette, framing — so subjects can
  vary without the look drifting.
- **Fill the frame.** The plate's own composition should already pass Gate V
  (content occupies the safe area). The fills inherit its framing bias.

You author these ONCE for the channel. They live here (channel default) and are
inherited by every reel. A reel only needs its own `<slug>/style/vox-plate-*.png`
when it wants a bespoke look — otherwise it uses these.

## 2. The prompt — subject + framing (per beat)
Comes from each vox slate's suggested prompt in the beat sheet. Edit it to
change *what's in frame*. Push composition words ("subject fills the frame,
centered, minimal margins") because Gate V rejects under-filled results and the
pass will re-prompt with exactly that nudge on a failure.

## 3. The treatment fn — final grade (already yours)
Runs on every pantry asset regardless of source. You never touch it per-beat;
it's the reason the plates only need to be *close* on grade.

## The knobs — `style.json`
`model`, `credits_per_gen`, `max_tries`, `archetype_keywords` (how a prompt maps
to a plate), and `negative_prompt`. The negative prompt is also a **safety
rail**: it forbids text, numbers, real faces, named places, and brand marks —
which keeps vox plates claim-free (numbers live in the Manim beats) and reduces
accidental rights-sensitive output. It does NOT replace the fill-time tier
re-check, which refuses any prompt containing a proper noun or date.

## The Midjourney route — style modifiers, not plates
`--backend midjourney` doesn't use image plates. It uses a **named style
modifier** (a text suffix + `--profile`) from `style.json`'s `style_modifiers`.
The `--profile` IS the style lock (MJ's own trained anchor — stronger than flux
image-conditioning). Each fill posts `SUBJECT + modifier.suffix + modifier.params`.

Pick the modifier per asset with `shot.style_type` (default `default_style_type`):
- `artsy` — the Tove Jansson 3D-sculpture children's-book look.
- `photo` — 1980s Eggleston iPhone photography. **This route makes photoreal
  people.** So: the tier re-check still refuses any subject naming a real
  person/place/date; every photo fill writes an explicit AI-disclosure sidecar
  ("not a real photograph; no real person/place; illustrative only"); and it's
  for atmosphere, never passed off as archival evidence in a claim context.

MJ is **rate-limited** — the pass paces one post every `mj_interval_sec` (default
240s / ~4 min), never a tight loop. MJ has no API, so posting is agent-driven
(Claude-in-Chrome): `--go` writes `pantry/_mj_queue.json`; Claude works it at pace
(post → wait → grab the chosen grid index → save → Gate V → sidecar + `.auto`).

## Authoring a plate quickly
Generate one candidate with Higgsfield (unstyled), run it through your treatment
function, eyeball it, freeze it here as `vox-plate-<archetype>.png`. That plate
is now the channel's look for that archetype. Re-do it whenever you want to
evolve the channel's visual identity — every future fill follows.
