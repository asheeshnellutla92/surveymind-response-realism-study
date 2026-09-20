# PORT-LOG.md — curated ports from `brutalist-art/` (sandbox) into this public cut

The sandbox is bloated (67 skills, 583 scenes, 102 root docs, 417 reels, 58 GB).
This cut is deliberately curated: **15 skills, free-by-default, no publishing
machinery** (CLAUDE.md rule 5). Ports are therefore *selective* — only what makes
the retained skills correct. This file records what came across and what did not.

---

## Batch 1 — 2026-08-30 · correctness: the two accepted card forms

**Why:** this cut shipped `SlateCard` — the DESIGN-PRINCIPLES §1 **banned** card
(eyebrow/kicker + bold sans headline + rule + decorative circle) — and did **not**
ship either accepted replacement. Across the wider tree `FormBCard` is used by
3,147 reels and `FormACard` by 1,347; both were absent here.

| Action | File |
|---|---|
| DELETED | `runtime/remotion/src/scenes/SlateCard.tsx` (+ Root.tsx import/composition) |
| added | `scenes/FormACard.tsx`, `FormBCard.tsx`, `FormACard916.tsx`, `FormBCard916.tsx` |
| added | `DESIGN-PRINCIPLES.md` — the doc that *defines* the two accepted forms |
| updated | `runtime/scripts/fill_slates.py` — now stamps **FormACard**, not SlateCard |
| updated | `runtime/scripts/generate_audio_kokoro.py` — hard-skips `⚠` / `[LOST]` / `[PLACEHOLDER]` narration sentinels (a batch build voiced one as narration, 2026-08-27) |

## Batch 2 — 2026-08-30 · components this cut's own skills already name

Of 49 reusable components (used by >1 reel) absent here, **10 were named by this
cut's own SKILL.md / docs** — i.e. already referenced but not shippable. Ported
those, minus one:

`ClaudeMascotGrid` · `ClaudeMascotScene` · `DoodleChart` · `DoodleScene` ·
`GitHubSectionRail` · `GitHubStructureMap` · `ShellSession`

Dependencies pulled in to make them build: `tokens/shell.ts`,
`doodle/{handFont.ts,PaperGrain.tsx,roughen.ts}`, `vendor/` (rough.js + LICENSE).

**NOT ported — `FlowDiagram.tsx`.** Its sandbox original has 2 real zod type errors
(a `"⚠ SET IN BEAT SHEET"` sentinel used as the default of an enum field). The
sandbox tree currently has **28 TypeScript errors**; this cut has **0**, and that is
worth protecting. Port it after the schema is fixed upstream.

**Verification:** `node_modules/.bin/tsc --noEmit` → **0 errors**.
`./art scene-index` → 601 renderable compositions.

---

## Deliberately NOT ported (bloat, or contrary to this cut's charter)

| Not ported | Why |
|---|---|
| Publishing lane — `post`, `youtube-publisher`, `video-inventory`, `post.py`, `stage_publish.py` | CLAUDE.md rule 5: "Never publish. There is no publishing machinery here." Excluded **by design**, not missing. |
| 49 × `CLAUDE-CODE-*.md` one-off prompts | Bear's private one-off runbooks; not toolkit doctrine. |
| 417 reel folders in sandbox `youtube/` (14 GB) | Content, not toolkit. Rule 3: videos travel with their book. |
| 39 reusable components not referenced by any skill here | No consumer in this cut. Port on demand, with its skill. |
| 43 single-reel souvenir components + 44 zero-reference components | Bloat by definition. |
| Paid-tier skills beyond the documented tiering | Rule 6/7: free by default; never escalate a fellow into a paid tier. |
| `.env`, `.fuse_hidden*`, `*.bak`, `*.pre-*` | Junk / secrets. |

## Drift the other way — do not clobber

Five skills exist ONLY here and are real work: `anthropics`, `finance`, `guests`,
`logo-motion`, `screen-clean`. Any future sync must merge, never overwrite.

## Open

- 8 pre-existing uncommitted edits were in this tree before these ports
  (`package.json`, `Root.tsx`, `scenes.json`, `capture_sim.py`, two SKILL.md,
  plus untracked `art.pre-scene-search` and `BrutalistHesitantWriter.tsx`).
  `capture_sim.py` is byte-identical to the sandbox; the two SKILL.md differ.
  Resolve before committing.
- Rule-owner docs still only in the sandbox and arguably worth porting:
  `REMOTION-STANDARDS.md` (component-authoring contract — this cut's rule 8
  already assumes it), `SHOT-FORM-SYSTEM.md`, `SHOTS.md`, `GLOSSARY.md`,
  `VOICE-LOCK.md`, `BRAND-LOCKS.md`, `TEMPLATE-MISSES.md`, `CAPABILITIES.md`.
