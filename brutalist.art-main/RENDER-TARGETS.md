# RENDER-TARGETS.md — brutalist.art renders; it does not publish

**Rule-owner for: where a master goes, and how 9:16 is made.**
Companion to `CLAUDE.md` rule 5 ("Never publish") — this file says what the
toolkit *does* do instead.

---

## 1 · The boundary

brutalist.art turns **a beat sheet into a 4K master.** That is the whole job.

Staging, ledgers, channel credentials, playlists, uploads — **none of that lives
here.** They belong to whatever publishing system you run downstream, which reads
finished files out of a folder. The toolkit never needs to know that system exists.

The author's own setup (a `TOPOST/` staging folder, per-channel OAuth creds, an
upload ledger) is **one person's downstream choice**, not part of this toolkit and
not a path you inherit by downloading it.

## 2 · Where a master lands

A clean 4K final is written to the first of these that is set:

| Order | Target | Use |
|---|---|---|
| 1 | `--out DIR` | explicit, always wins — one-off renders, a shared drive, a Google Drive mount |
| 2 | `$ART_OUT` | your standing render folder, set once in `.env` |
| 3 | `<toolkit>/renders/` | built-in default, so a fresh clone works with zero configuration |

```bash
./art final <reel>                          # → $ART_OUT, else brutalist.art/renders/
./art final <reel> --out ~/Drive/4K         # → anywhere, including a mounted drive
```

`renders/` is gitignored. A `--review` cut is a *working artifact* and always stays
beside the reel — only the clean final follows the target above.

`./art run` produces a review only; `./art final` checks the actual candidate before
promoting it. Missing approvals, missing sound, incomplete QC or failed rendering
block a final. See [pipeline safety](docs/PIPELINE-SAFETY.md) for the checks and
hash-bound export receipts. A successful export is not approval to publish.

**Landscape 4K is the default.** `./art final` renders at height 2160 unless you
pass `--height`. For a 9:16 **2160×3840** master, pass `--height 3840` explicitly.
Code lanes (Remotion, Manim) are born at 4K and are never upscaled.

## 3 · 9:16 is a DIFFERENT beat sheet

A vertical cut is **not** a crop of the wide one. `shorts.py` derives a short into
its own `short/` folder with **its own `beat_sheet.json`**, and that sheet is
rewired to portrait components:

For a complete vertical companion, use `./art vertical <reel>` instead. It writes
`vertical/`, keeps all beats and the existing outro, adds no endcard, and never
shortens the report to satisfy a Short cap. Both commands prepare sheets/assets;
native portrait renders and final verification still follow.

- If `Root.tsx` registers a composition named `<Pattern>916`, the short's sheet is
  **rewired to it** and the beat re-renders portrait. Props must satisfy the 916
  composition's own zod schema.
- If no `916` composition exists, the plan is **blocked** — add the composition, or
  drop a `pantry/<beat>-916.mp4|png`. It is not silently center-cut.
- Generated graphics are never center-cut. A Short may crop ordinary captured/user
  media using `shot.focus`, but writes `<beat>-916.*` inside `short/media/`, never
  beside the parent source. Source reports and full-length companions retain their
  source framing. `pantry/<beat>-916.*` is the explicit replacement slot.
- Audio/media files are independent copies, not links into the parent. Rewritten
  outro audio is regenerated only inside the derivative. Missing portrait scenes
  cannot be marked ready by reusing an old landscape render.

Portrait compositions currently registered here:

`ClaudeTitleOutro916` · `ClaudeVerdictArtifact916` · `ClaudeWindow916` ·
`ContactSheet916` · `FormACard916` · `FormBCard916` · `LookPlate916` ·
`SleeperAgents*916` · `Values*916` · `Want*916`

Authoring a new portrait variant is one component file registering both ids —
`<Name>` at 3840×2160 and `<Name>916` at 2160×3840 (`REMOTION-STANDARDS.md`,
dual-aspect law). Ratio-encoded legacy names (`*169.tsx`) are frozen; never add one.

## 4 · What this means for a downloader

You need no account, no key, and no upload permission to get a finished 4K file.
Set `ART_OUT` (or pass `--out`) and render. What happens to the file afterwards is
entirely yours.

Humanitarians AI fellows follow an additional [weekly submission workflow](docs/FELLOWS-SUBMISSION.md):
GitHub for source and small documents, Drive for the four media files, PM review,
then the professors' publication decision. This is a handoff guide, not a toolkit
upload feature.
