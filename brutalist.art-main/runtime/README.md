# runtime/ — the shared engine every skill runs on

Vendored in Phase 3 from the parent toolkits so the skills run **in isolation** —
no `../vox/…` or `books/…` reach-outs. Names are plain (the trademarked "vox"
prefix was removed; see the repo `GLOSSARY.md` §"runtime files").

```
runtime/
  scripts/                 the spine (canonical copies, reconciled from vox/ — the newer toolkit)
    run.sh                 one-command QC → render → slot → compile           (was vox_run.sh)
    compile.py             per-beat slot compiler + assembler; renders slates  (was vox_compile.py)
                           as REQUEST CARDS via beat_plan.owner_line
    beat_plan.py           NEW: derives each beat's fill plan from its shot.type × shot.source
                           annotations (manim|remotion|ai-video-prompt|historical-image|user-capture)
    todo.py                NEW: the per-video beat ledger → todo.json + STATUS.md (derived; edit the sheet)
    align.py               forced-alignment word clock                         (was vox_align.py)
    outro.py               branded outro stage                                 (was vox_outro.py)
    pantry.py              intake: prepped media → slot-contract clips          (was vox_pantry.py)
    shorts.py              9:16 Shorts cut                                     (was vox_short.py)
    fill_slates.py         fill slate beats with Remotion scenes               (was vox_fill_slates.py)
    remotion_scenes.py     palette-matched Remotion motion graphics            (was vox_remotion.py)
    brand_variant.py       scaffold an audience-variant beat sheet             (was vox_variant.py)
    update_reels.py        migrate built reels to latest specs                 (was vox_update.py)
    inventory.py           audit published reels across books                  (was vox_audit.py)
    convert.py, stage_publish.py, teardown_rerender.{py,sh}, brutalist_update.py
  manim/animated_graphics.py   per-beat: choose Manim vs Remotion; if neither fits, emit a
                               request card asking for 5–10s gen-AI video + a suggested prompt
                               (was vox_graphics.py; the palette-registry superset copy)
  remotion/                the Medhavy bookends Remotion project (youtube-publisher + slate-filler)
  design/DESIGN.md         the visual constitution (palette, type)
  prose/                   register guides — the WRITING voice, never the TTS voice
                           (ships: plain, pragmatist, teardown)
  fonts/                   bundled TTFs (EB Garamond, Inter, Montserrat, PT Mono; OFL)
  schema/beat_sheet.schema.json   the shared beat-sheet contract (the heart)
```

## The beat is the heart

Every reel is a `beat_sheet.json`. Each beat carries `shot.type × shot.source`
(what the beat is, who produces it). `beat_plan.py` turns those into a fill plan;
`compile.py` renders a filled beat or, if unfilled, a **request card** naming what
it needs and (for gen-AI / historical beats) a suggested prompt or search terms;
`todo.py` writes the queryable ledger. Change a beat's plan by editing the sheet —
`todo.json` and `STATUS.md` are derived and regenerate on every compile.

Agent fill loop:

```
./art todo <reel> --method animated_graphics --open   # beats the pipeline should animate
./art todo <reel> --open                              # everything still missing, with prompts
# fill each; if a gen-AI clip or a real historical image teaches better, edit the
# beat's shot.type/source (+ prompt) in beat_sheet.json and re-run — card + ledger follow.
```

## One folder = one video

Every video is a single self-contained folder (typically under a book's or the toolkit's
`youtube/<slug>/`): the `beat_sheet.json`, the rendered scenes (`manim/`, `media/`), audio
(`mp3/`), the compiled cut, and the derived ledger (`todo.json`, `STATUS.md`). Builds happen in
place; nothing reaches outside the folder except this shared `runtime/`. Copy the folder, point the
pipeline at it, and it rebuilds.

## The render contract — retry ≤5×, then move on, then the human redoes

Claude Code runs the build; the human does not render scenes by hand. Per scene the base
instruction is: **attempt the render, and on failure retry up to five times, fixing the error
between attempts.** If a scene still fails after five tries, **skip it and continue to the next
beat** — never stall the whole reel on one scene. The skipped beat stays a slate in the cut and
`needs-fill` in the ledger.

So a completed pass can contain a few unrendered or rough beats **on purpose**. The human is
expected to review the cut and redo those specific beats — adjust the beat in `beat_sheet.json` (the
heart) and re-run fill-in on it, or fix and re-render the scene. Running unattended (e.g.
`claude --dangerously-skip-permissions`) is supported and fast; it just means the machine hands back
a full draft with the hard beats flagged for your judgment. That review-and-redo pass is the
conductor's work, not a failure of the build.

Nothing here is called directly in normal use — go through `./art` at the repo root.
