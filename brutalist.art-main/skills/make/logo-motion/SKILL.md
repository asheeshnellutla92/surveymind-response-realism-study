---
name: logo-motion
description: >
  Build a logo sting — the 4–8 second animated brand mark that opens or closes a
  reel. ONE parametric Remotion composition (`LogoMotion`) drives every mark: the
  logo, the wordmark, the tagline, the palette and the LENGTH are all props, so a
  new brand is a traced part-list plus a props block, never a copied scene file.
  Use when the user types `logo motion`, `logo sting`, `logo animation`,
  `animate my logo`, `brand intro`, `intro animation`, `outro sting`, or hands
  over a logo (PNG/SVG) and asks to make it move — and when a reel needs a
  branded open/close. Also the right skill when an existing sting is being FIXED
  ("the transition looks wrong/cheap"): the phase map below is the diagnosis
  tool. Requires a mark that can be traced (dark ink on a light ground). Unlike
  every other skill here, the TRANSITION CURVE sets the timing and narration is
  laid over it — a sting is a fixed-length slot, not an audio-driven beat.
  Register: Teardown. Never publishes.
---

# logo-motion — one composition, every mark

## The problem this exists to stop

Before this skill, `runtime/remotion/src/` held **eight** logo showcase files —
`BearBrownLogoRemotionShowcase{,16x9}`, `BearBrownInitialsShowcase{,169}`,
`HLogoRemotionShowcase{,169}`, `Musiniqu*` ×3, `HaiWordmarkShowcase{,16x9}` — at
40–75 KB each. Every one is the same architecture copy-pasted: an inlined
`LOGO_PATH` const, a hand-written timing JSON, and a 20-plus-beat catalog of
motion techniques. The vocabulary is genuinely good. It was just never once
written down, and adding a ninth brand meant copying 50 KB.

**A new mark must not add a scene file.** It adds:

1. `runtime/remotion/src/logos/<name>.ts` — generated, never hand-edited
2. one line in the `LOGOS` registry in `scenes/LogoMotion.tsx`
3. a props block in the reel's `beat_sheet.json`

If you find yourself copying `LogoMotion.tsx`, stop — the thing you want is a
prop that does not exist yet. Add the prop.

## Inputs

| Input | Required | Notes |
|---|---|---|
| **logo** | yes | Raster, dark ink on a light ground. Any size — everything downstream is vector. |
| **wordmark** | no | String. Live text, not traced. |
| **tagline** | no | String. |
| **page / ink / accent** | no | Hex. Defaults are Medhavy's. |
| **narration** | no | **A STRING.** Kokoro synthesises it — free, local, no keys. |
| **voice** | no | `am_onyx` (Onyx) or `af_bella` (Bella). Those two, nothing else. |
| **audio file** | no | Only when the client supplies a recording you must keep. |
| **length** | no | An output when narrated: transition + speech + tail. |

**Narration is text by default.** Put the line in the beat's `narration_text`
and run `runtime/scripts/generate_audio_kokoro.py <REEL>` — it writes
`mp3/beat-B00.mp3` and `mp3/timings.json`, and the measured duration is ground
truth for everything downstream. Reach for a supplied mp3 ONLY when the voice
must be a specific human's, or when re-synthesising would change a track the
client has already signed off. Medhavy is the second case and is therefore the
exception, not the pattern.

GATE P applies to audio generation as it does everywhere in this toolkit. For a
one-line sting that is heavy; `--no-gate` exists and is the honest flag to use
when the "script" is a single sentence nobody needs to review.

## Flow

### Step 1 — get the mark as parts

A sting needs the logo **broken into pieces**. One flat path can only fade or
scale. Separate parts converge and stagger — that is the difference between a
logo that appears and a logo that is built.

```bash
python3 skills/make/logo-motion/scripts/trace_logo.py mark.png --name acme \
  --out runtime/remotion/src/logos/acme.ts
```

Input is any raster with dark ink on a light ground — a PNG export, or a frame
lifted out of an existing sting with `ffmpeg`. It need not be large; everything
downstream is vector. The script crops to the ink, upsamples 4×, labels
8-connected components, traces each one separately with `potrace`, and records
for every part its centroid, its angle from centre, and its normalised radius.
Those three numbers are what the scene staggers on.

Then add the key to `LOGOS` in `scenes/LogoMotion.tsx`. That is the whole
integration.

**Check the trace by looking at it.** Render the parts to a flat SVG and open it
before animating anything — a bad threshold silently drops hairlines, and at
ghost opacity you will never catch it in the render.

### Step 2 — measure the lockup, do not eyeball it

If you are matching an existing sting, take the ink bounding boxes off a settled
frame and put them in the scene as fractions. Measured, the Medhavy rebuild lands
within a pixel on the mark, the rule and the tagline. Eyeballed, the first cut had
the wordmark 24 px low and the tagline 56 px high, and neither was visible at
thumbnail size.

Position type by **cap-top**, not by box top. A CSS box top is not where the
letters start; at `line-height: 1` Montserrat's cap top sits `0.115em` below it.
That constant is in the scene.

### Step 3 — set the phase map, then lay the audio over it

The transition curve is the timing. If the sting is narrated, get word times so
you know what lands where — not to bend the curve to them:

```bash
python3 -c "from faster_whisper import WhisperModel as M; m=M('base.en',device='cpu',compute_type='int8'); s,_=m.transcribe('audio.wav',word_timestamps=True); [print(f'{w.start:5.2f}-{w.end:5.2f} {w.word}') for x in s for w in x.words]"
```

Note the word times — but do **not** re-time the transition to them. See
[reference/TIMING.md](reference/TIMING.md): the materialisation curve is the
thing that makes a sting work, and bending it to land on a word breaks it. Lay
the narration over the sting and let the picture finish after the line, which is
what the reference does.

### Step 4 — render, then LOOK

```bash
python3 runtime/scripts/remotion_scenes.py <REEL> --only B00 --force
```

Never trust the probe. Pull a contact sheet and read it. The defects that matter
in a sting — a ghost phase that is too short, a mark that arrives at full
strength, a part that never converges, type 4 px off its baseline — are all
invisible to `ffprobe` and obvious in a frame grid. Contrast-stretch the ghost
frames or you will be reviewing a blank page.

## Hard rules

- **The build is a camera move.** Staggering parts inward is not a geometric
  transition — at ghost opacity nobody can see it. Open on an extreme close-up
  and pull back.
- **Runtime is transition + voice, in that order** — an output, not a round
  number picked up front. Trim leading silence off the supplied track before
  offsetting it, or the voice starts late by exactly that much.
- **Length is a prop, not a re-time.** `calculateMetadata` turns
  `durationInSeconds` into `durationInFrames`, and every ramp in the scene is a
  fraction of the total. A 4-second cut and a 9-second cut are the same animation
  at different speeds. Never fork the scene to change length.
- **Duration is an INPUT here — the one place in this toolkit where it is.**
  Everywhere else duration falls out of measured narration
  (see `skills/make/duration-planner/`). A sting is a fixed-length slot: a
  pre-roll is 5 seconds because the channel says 5 seconds. And when a sting *is*
  narrated the words still do not move the phases — the materialisation curve
  does. This is a deliberate exception to the audio-first law, not an oversight;
  see reference/TIMING.md.
- **The mark enters as a ghost.** Nearly invisible for the first ~44% of the
  runtime, then one slow materialisation. A mark that arrives at full strength
  has nothing to arrive *from*, and no amount of later colour work rescues it.
  This is the single easiest thing to get wrong from a contact sheet.
- **The accent is earned.** One accent colour, arriving once, after a full stop.
  If the accent is present from frame one it is decoration and it is not doing
  any work.
- **Parts, not a picture.** If a mark is traced as a single component the
  assembly phase has nothing to stagger and the sting collapses into a fade. Fix
  the trace, not the animation.
- **No chrome, no gloss, no bevel.** A metallic sweep across a flat mark is the
  single most common way a sting reads as a stock template. It also destroys the
  logo's own colour while it passes. The replacement is the ghost→materialise
  ramp, which gets you the same "something is happening to the surface" read
  without ever showing the brand in the wrong colour.
- **Never publish.** Same as every skill here: the master stays in the reel folder.

## Where a sting lives

Same law as every reel — it travels with its book, at
`<book>/youtube/<slug>/`, never inside the toolkit. A one-beat reel folder is the
right shape: `beat_sheet.json` with a single `B00`, `mp3/B00.mp3`, a comment-only
`scenes.py`, and the master beside them.

## Reference

- [reference/TIMING.md](reference/TIMING.md) — the phase map, measured off two
  real stings, and the failure mode each phase prevents
- `scripts/trace_logo.py` — raster → animatable part list
- `runtime/remotion/src/scenes/LogoMotion.tsx` — the composition
- Worked examples:
  - `youtube/medhavy-logo-sting-onyx/` (Medhavy AI, 11.700 s) — **the pattern**:
    mark traced from source artwork, narration text synthesised with Kokoro
    `am_onyx`, runtime falling out as transition + speech + tail
  - `youtube/medhavy-logo-sting/` (Medhavy AI, 11.500 s) — the same sting with the
    client's own recording reused verbatim; the supplied-mp3 exception

## Keep in sync

`nopunt`'s catalog has no row for a brand mark. When this skill changes, add or
update the row there — a beat that says "the logo animates in" is otherwise an
unfilled slate with no named tool.
