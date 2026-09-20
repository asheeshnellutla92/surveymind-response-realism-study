# Examples campaign — the toolkit tests itself by building every video

**The principle: you can't test the system without testing the system.** Static inspection guesses
at what's broken; building a real video of every type *finds* what's actually broken. So the old
"Phase 4.5 (fix first) then Phase 5 (build examples)" collapses into one loop — **validation by
construction.** Each example is simultaneously the acceptance test for its video type *and* the
shipped example that teaches it. Fixes are discovered by building, not guessed up front.

**Keys are validated free first.** Step 2 is `./art keys` — a no-spend live probe of every key/voice before any paid build (see the table). Every video here is **meta**: made *by* the toolkit, *about* the toolkit — the
"Brutalist — Claude for Video Production" playlist. The first is **"What is Brutalist?"**

## Where this runs

On **your machine, in Claude Code** — it has the `higgsfield` CLI, Manim,
Playwright/Chromium, Node/Remotion. (This cloud session set the campaign up; it can't render.)
Run unattended is fine (`claude --dangerously-skip-permissions`) — the render contract holds
(retry ≤5×, skip, human redoes).

## Scope: confined to `brutalist-art/` — report-and-add (the self-containment test)

Claude Code operates **only inside `brutalist-art/`**. It may NOT reach outside the folder — no
`../vox/`, no `../unreal-reels/`, no absolute paths to `books/…`, no `~/…`. Keys come from
`brutalist-art/.env` (already copied from `vox/.env`).

This is deliberate: it turns the "clone-and-go" goal into an enforced test. When a build needs
something that isn't in the folder, Claude Code does NOT quietly resolve it against a parent repo —
it **stops and reports** in the BUILD-LOG:

```
MISSING: <what it needed> — was at <where it used to live, if known> — blocks <which beat/step>
```

Then **we add it** — vendor the file/asset into `brutalist-art/` (a script → `runtime/scripts/`,
a shared asset → `runtime/`, a font → `runtime/fonts/`, brand media → the folder or an `ART_*`
path) — and re-run. Every `MISSING` report is one more reach-out eliminated. When the campaign
finishes with zero `MISSING` left, the toolkit is genuinely self-contained: a fresh clone builds
every video type with nothing but `brutalist-art/` + `.env`.

(This is why the campaign is the real acceptance test for the whole refactor: a reach-out that
static inspection missed becomes a loud `MISSING` the moment a real build needs it.)

## Standing rules (every build, every iteration)

1. **Log human feedback FIRST.** Before acting on any instruction I give, append it verbatim to the
   video's `BUILD-LOG.md` under a `## HUMAN FEEDBACK — <date>` heading. This is automatic — I should
   never have to ask for it.
2. **Verify renders by LOOKING.** Never report a visual fix as done without extracting a frame and
   checking it. "The box fits now" is only true if a mid-frame PNG shows the text inside the border.
   A fix that was discussed but not visually verified is not a fix. This includes the `qc-sheet.png`
   contact sheet after a compile — read it and confirm every beat shows THIS video's content.
3. **Render Remotion beats ONLY via `runtime/scripts/remotion_scenes.py <reel>`** (foreground,
   `--concurrency=1`, one beat at a time — what the helper already does). NEVER hand-roll
   `npx remotion render`, NEVER background a render (`&`), and NEVER poll `ps`/`grep` for Chrome to
   guess whether a render finished. That path burned hours on the `installs` build chasing phantom
   "stale Chrome" processes that were the user's real browser. The helper is proven — video 1 used it.
4. **Match Remotion props to the component's real zod schema.** A beat sheet's `shot.remotion.props`
   keys must be the exact prop names in the component's `z.object({...})` (`topic`, `segment`,
   `runningText`, `filename`, `code`, `variant`, …). Any key that doesn't match is ignored and the
   composition falls back to its `Root.tsx` `defaultProps` — demo placeholders from other videos
   (cancer-biology, photoelectric-effect). Read each component's schema before writing props, then
   confirm on `qc-sheet.png` that no beat shows another video's placeholder text.

5. **Library-first — ask before you author.** No beat is authored, routed to Manim, slated, or
   written up as a request card until the library has been asked: `./art scenes "<what the beat
   needs>"`, and `./art scenes --check <Name>` before writing any component name into a beat sheet.
   A hit is a LEAD (read the props); a genuine miss is a PUNT, which is a design card, never a
   licence to slate — and the search logs it to `TEMPLATE-MISSES.md` on its own. After adding a
   component, `./art scene-index`: an unindexed component is an invisible one.

## The loop (per video type)

1. **Build** it with Claude Code (start from the type's `BUILD-PROMPT.md`; `what-is-brutalist`
   already has one). One self-contained folder under `youtube/<slug>/`.
2. **Log everything** to `youtube/<slug>/BUILD-LOG.md`: every command run, every error hit, the
   fix applied, and the final result (beats rendered / beats left for human). Append-only.
3. **If something doesn't work, fix it** — in the *toolkit*, not just the example. A broken script,
   a stale path, a missing SKILL.md, a palette gap → fix in `runtime/`/`skills/`, commit with a
   message naming the video that surfaced it. **If the thing is simply not in the folder, log a
   `MISSING:` line and stop that thread** — the human vendors it in (report-and-add), then continue.
   The fix is the point; the example proved it was needed.
4. **Ship the example** — the finished folder stays as the CAPABILITIES/LEARN example for that type.
5. **Mark verified** in the table below (⬜ → ✅), note the commit(s) that fixed anything.

A type isn't "done" until its example builds end-to-end (minus genuinely-human beats) and every
breakage it hit is fixed and committed.

## The report that comes back to the refactor

Each build must end by appending a **structured feedback block** to its `BUILD-LOG.md` AND to the
shared **`CAMPAIGN-FEEDBACK.md`** at the repo root — so every build aggregates into one report the
refactor consumes (to update TODO, INSTALL, the doctor, and the vendor list). Format, verbatim:

```
## REFACTOR FEEDBACK — <video slug> — <YYYY-MM-DD>
MISSING (vendor into brutalist-art):
  - <file/asset> — was at <source, if known> — needed for <step/beat>
FIXED (toolkit bugs this build surfaced):
  - <what was wrong> — <file changed> — commit <hash>
DEPS (had to install / must be installed to build this type):
  - <dep> — for <step>   (e.g. "remotion node_modules — cd runtime/remotion && npm install")
STILL BLOCKED (needs a human decision / key / asset):
  - <what> — <what it needs>
RESULT: <N> beats rendered, <M> left for the human (list the M)
```

This block is the deliverable *to the refactor*. Paste `CAMPAIGN-FEEDBACK.md` back to the refactor
session; it maps 1:1 onto: MISSING → vendor list, FIXED → confirmed regressions closed, DEPS →
INSTALL.md + `./setup` rows, STILL BLOCKED → open gates.

## Build order — climb the key ladder (no-key first, so core-pipeline breakage surfaces first)

Legend: 🔑 keys needed · 📁 existing folder to rebuild-and-verify · ✨ new folder to create.

### Tier 0 — no keys (ffmpeg + Pillow; Manim/Node where noted). Fixes the core `./art run`/`fill-in`.
| # | Video | Skill | Folder | Status | Notes |
|---|---|---|---|---|---|
| 1 | **What is Brutalist?** | explainer + terminal | ✨ `youtube/what-is-brutalist` | ✅ | **DONE** — 16/16 beats rendered (174s, narrated); 0 MISSING; **5 toolkit bugs found & fixed** (commit `50df886`). 3 beats flagged for pacing review (B11/B06/B02). |
| 2 | **Installs, .env & credentials** | explainer + terminal | ✨ `youtube/installs` | ✅ | **DONE — 15/15 beats compiled (224.7s, narrated); all content verified on rendered frames.** Source doc `docs/Installs.md`. **2 toolkit bugs found & fixed** → standing rules #3/#4: (a) agent hand-rolled background `npx remotion render` + `ps` polling instead of `remotion_scenes.py` (burned hrs); (b) 6 Remotion beats rendered `Root.tsx` demo defaults until beat-sheet props were matched to each component's zod schema. Hero B11 CLONE YOUR VOICE. Watch: graphic 60% > cap; terminal beats center-cut to audio. |
| 3 | **When Cowork Can Help Claude Code** | explainer + terminal | ✨ `youtube/when-cowork-helps-claude-code` | ✅ | **DONE** — 16/16 beats rendered (233.9s, narrated); 0 MISSING; 0 slates. Standing rules #3/#4 followed exactly (remotion_scenes.py foreground; props matched; qc-sheet verified). B14 hero (dark bg, EB Garamond, "A SECOND SET OF EYES") confirmed on qc-sheet. Source doc `docs/cowork-and-claude-code.md`. |
| 4 | **Posting to YouTube** | explainer + terminal | ✨ `youtube/posting-to-youtube` | ✅ | **PUBLISHED unlisted (rev 2 final)** — https://youtu.be/S7rmHr36C74 · 16/16 beats, 261.5s, captions beat B04A + B03 "four things" (CC ships with every post). Rev history: rev-1 5iadw1MET3Q and rev-2-review PE2Zv8hBDzc superseded — delete in Studio. Surfaced 3 toolkit fixes: caption parity (c3cac9b), stale --playlist default (ART_PLAYLIST), master-staged-before-final mixup (symlink convention). |
| 5 | slate-cut | (compile) | 📁 `examples/slate-cut--base-rate` | ⬜ | the no-key first pass; verify `./art run` + request cards |
| 6 | previz | (fill_slates) | ✨ `youtube/previz-*` | ⬜ | any beat sheet → all-slate timing pass |
| 7 | line-art-vectorizer | line-art-vectorizer | ✨ `youtube/*` | ⬜ | vtracer, no key |
| 8 | figure-planner | figure-planner | ✨ `youtube/*` | ⬜ | **author its SKILL.md first** (D5), then a figure |
| 9 | sketch-explainer (silent) | sketch-explainer | ✨ `youtube/*` | ⬜ | Manim only, no key |

**GATE — key check (free, not a video).** **Run `./art keys` BEFORE any paid build.** Free live probes (higgsfield `account status`, YouTube `channels.list`=1 unit). Confirms every key is valid + shows quota/credits. No spend. Fix any ❌ before Tier 2+.

### Tier 1 — Kokoro (narration, free)
| # | Video | Skill | Folder | Status |
|---|---|---|---|---|
| 10 | sketch-explainer (narrated) | sketch-explainer | ✨ | ⬜ |
| 11 | math-explainer | math-explainer | ✨ (+LaTeX) | ⬜ |
| 12 | explainer | explainer | 📁 `examples/explainer--size-paradox` | ⬜ |
| 13 | cli-explainer | cli-explainer | 📁 `examples/terminal-screencast--compression-journey` | ⬜ |
| 14 | bio | bio | ✨ (`--length` 3:00) | ⬜ |
| 15 | code-walkthrough | code-walkthrough | ✨ | ⬜ |
| 16 | kids-video | kids-video | ✨ | ⬜ |
| 17 | recitation-film | recitation-film | ✨ (+faster-whisper) | ⬜ |
| 18 | **deck-lecture** | deck-lecture | ✨ (vendor `animated-deck`; +Playwright) | ⬜ | restore one of the 34 lectures as the example |
| 19 | story-film (narration) | story-film | 📁 `examples/00-story-film-demos` | ⬜ |
| 19a | **Suno vs Kokoro Cost Test** | (voice-engine A/B) | ✨ `youtube/suno-vs-kokoro-cost-test` | ⬜ | THE VIDEO IS THE EXPERIMENT: its own narration voiced both ways (generate_audio_kokoro.py vs ./art suno → pantry stem → ./art suno-slice), real time/quality in COST-LOG.md, human picks the voice that ships. BUILD-PROMPT.md ready. |
| 19c | **Kokoro: Free Voices (With Names)** | generate_audio_kokoro | ✨ `youtube/kokoro-free-voices` | ⬜ | THE THIRD ENGINE — free/local/named. Onyx opens (B00), then the cast carries it: Bella (A-), Sarah, Adam (F+ — the honest-record beat), Michael, Emma, George, Puck, Santa (D-), each introducing themselves via the sheet's per-beat voice field. Grades from the pack's own VOICES.md, re-verified at build. Sheet + BUILD-PROMPT ready; ch6. |
| 19d | **Kokoro: All 28 English Voices (The Full Roster)** | generate_audio_kokoro | ✨ `youtube/kokoro-all-28-english-voices` | ⬜ | COMPANION REFERENCE CUT to 19c — for people who want to hear the full 28 before casting. Onyx intro → all 28 in group order, each: name + origin + the pack's grade + the SAME closing line (compare voices, not scripts) → Heart (the only A) closes. One props-driven KokoroRosterCard renders every roster beat; YouTube chapter markers per voice make it a usable reference. No chapter slot; cross-links 19c both ways. ~4:16. Sheet + BUILD-PROMPT ready. |
| 19e | **Kokoro: The 8 Mandarin Voices** | generate_audio_kokoro | ✨ `youtube/kokoro-mandarin-voices` | ⬜ | Language-roster reference. Onyx intro says it straight: all eight are graded D by the pack itself — hear a D before you build with it. In-language name lines + localized house tagline. ~1:41. Sheet + BUILD-PROMPT ready. |
| 19f | **Kokoro: The 5 Japanese Voices** | generate_audio_kokoro | ✨ `youtube/kokoro-japanese-voices` | ⬜ | Language-roster reference, C+ to C-. jf_tebukuro's grade flagged for build-time verification. ~1:14. Sheet + BUILD-PROMPT ready. |
| 19g | **Kokoro: The 4 Hindi Voices** | generate_audio_kokoro | ✨ `youtube/kokoro-hindi-voices` | ⬜ | Language-roster reference — Alpha, Beta, Omega, Psi, all C. ~1:05. Sheet + BUILD-PROMPT ready. |
| 19h | **Kokoro: The 9 Romance-Language Voices** | generate_audio_kokoro | ✨ `youtube/kokoro-romance-voices` | ⬜ | ES 3 + PT-BR 3 + IT 2 + FR 1 in one cut; Spanish/Portuguese ship UNGRADED (cards say so); Siwis (FR, B-) is the pack's best non-English and closes. ~1:50. Sheet + BUILD-PROMPT ready. |
| 19b | **Session, Karaoke & Audiogram** | session + lyric-overlay | ✨ `youtube/session-karaoke-audiogram` | ⬜ | Teaches session notes (direct the reading), the align.py word clock, and the lyric-overlay audiogram — Byron's *She Walks in Beauty* (channel's own session-directed Suno reading, `youtube/she-walks-in-beauty/pantry/`) threaded through as the worked example. BUILD-PROMPT.md ready. |

### Tier 2 — higgsfield CLI (AI image/video)
| # | Video | Skill | Folder | Status |
|---|---|---|---|---|
| 20 | lyric-resync | lyric-resync | ✨ | ⬜ |
| 21 | dance-video | dance-video | ✨ | ⬜ |
| 22 | ai-asset-gen | ai-asset-gen | ✨ | ⬜ |
| 23 | collage-ads | collage-ads | ✨ | ⬜ |

### Tier 3 — local audio (bring a WAV)
| # | Video | Skill | Folder | Status |
|---|---|---|---|---|
| 24 | music-video | music-video | 📁 `examples/music-video--c-is-for-cookie` | ⬜ |
| 25 | lyric-overlay | lyric-overlay | ✨ | ⬜ |

### Final
| # | Video | Skill | Folder | Status |
|---|---|---|---|---|
| 26 | youtube-publisher | youtube-publisher | (publishes the built playlist) | ⬜ | OAuth; publishes everything above as the real playlist. **API quota: ~6 uploads/day** — the default 10,000 units/day ÷ 1,600 units per `videos.insert` = ~6, NOT the console's "100 uploads/day" (that limit never binds). So ~23 videos = ~4 days via API, unless you request a quota increase (adjustable, needs audit) or upload some manually via Studio (web uploads don't touch the API quota). **Chosen: publish via the API, batched ~6/day over ~4 days** (keeps the automation — transcript, chapters, description, playlist order, bookends — that Studio uploads lose). The API quota resets at **midnight Pacific (3:00 AM ET)**; the `ART_PUBLISH_LEDGER` tracks what's already up, so each daily run publishes the next unpublished batch until the playlist is complete. Can be a daily scheduled task. |

### Helpers to exercise along the way (not videos; no dedicated example)
`scout`, `cli-scout`, `script-writer`, `audience-preset`, `shot-planner`, `duration-planner`,
`explainer-deepen`, `reel-updater`, `remotion-explainer`, `component-showcase` (riff), `slate-filler`
— each gets used in service of the builds above; log any breakage the same way.

## Known fixes this campaign will force (from the TODO scan — expect to hit these early)

- `examples/*/scenes.py` import a dead `aspects/…` path → repoint to `runtime/manim` (Tier-0 #2/#9/#10).
- GATE F needs `PROMPTS.md`; QC gates now in `runtime/qc/` — verify they pass.
- `./art fill-in` doesn't exist yet — build it when the first Tier-0 video needs it.
- `figure-planner` has no SKILL.md (#5). No `LICENSE`. Manim registry missing `brutalist`+`musinique`.
- `deck-lecture` (#15) needs `animated-deck` vendored + Playwright.

Each of these should surface *as a build failure with a log entry*, get fixed in the toolkit, and
get a commit. That's the campaign working as intended: the videos find the bugs.
