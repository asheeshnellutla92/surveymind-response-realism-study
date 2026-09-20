# shopping-list.md — the Gate D2 manifest (SHOPPING.md format)

Written AFTER audio lock, never before. One entry per pantry asset the
machine cannot make itself, grouped by act, each carrying the locked duration
requirement and a sourcing tier. This is the pantry's work order — specific
enough to hand to a human, an archive search, or a generation prompt with
nothing left to guess.

## Why after audio lock

A card written before the beat's real length is known can only ask for
"a clip of X." Then conform must stretch, trim, or loop whatever arrives —
stretching is lossy. A card written after lock asks for "≥ 7.2 s of X":
the constraint moves upstream, and trimming down (lossless) becomes the
default conform operation. Stills are duration-free but NOT constraint-free:
the Ken Burns crop implies a minimum resolution, and parallax implies layers.

## Tier 0 — the local library (search law, runs before every entry)

The toolkit ships its own still stock: `svg/svg/images/` (~1,500 generated
PNGs) + the doodle icon library, all indexed in `svg/svg/icons.json`
(rebuild: `python3 skills/make/doodle/scripts/build_index.py`). Before ANY
entry below is written:

1. `python3 runtime/scripts/pantry_search.py "<the beat's visual terms>"`
2. LOOK at the top candidates — open the png. A token match is a lead,
   not a verdict; no "close enough" stills, ever.
3. Real match → `... --copy <reel> --beat <BID>` lands it at
   `pantry/<BID>-<id>.png`; write the entry anyway, pre-checked
   (`[x] … — filled from library: <id>`), so the manifest stays the
   complete work order.
4. No good match → the entry stands, unchecked; the human searches.

Tier 0 changes SOURCING only, never the risk law: a library still of a real
object or named person still carries its tier-2/3 rights line (the library is
a source, not a rights clear), and library stills intake as `source: ai`
unless provenance says otherwise.

## The three tiers (risk law)

| Tier | Covers | Default source | The check |
|---|---|---|---|
| **1 — generic / illustrative** | no specific real referent (a lab bench, ambient b-roll, an abstract texture) | AI-generate or stock, directly | none — no escalation |
| **2 — specific real object** | a named building, document, machine, artifact | the real image first; AI fallback allowed but LABELED (`source: ai` + disclosure sidecar) | the ITEM's stated rights field, verbatim — never the hosting institution's reputation as a blanket clear |
| **3 — specific named real person** | any historical or public figure depicted by name | archival photo first; a trained per-figure likeness model beats one-off generation if no cleared photo exists (consistent likeness across beats) | the PHOTOGRAPH's rights (photographer's term governs, not the subject's) — and the check itself ESCALATES TO THE HUMAN, every time. Never silently auto-resolved. |

Every tier-2/3 entry carries its own rights-check line in the manifest.
"Verify rights" is a human judgment call; the manifest-generation step never
marks it done.

## Entry format

```
ACT II — "the gettier trap"
├─ pantry/B14.png                                    [VOX · kenburns]
│    tier: 3 (named person: Edmund Gettier)
│    need: archival portrait, ≥1600px on the long edge (survives the
│          planned 1.6× push-in toward the eyes; focus [0.5, 0.38])
│    sourcing: university archive / obituary press photo — read the
│          photograph's own rights statement; escalate to human
│    beat window: B14 locked 8.4s
│
├─ pantry/B22-bg.png + B22-mid.png                   [VOX · parallax]
│    tier: 1 (generic: server-rack corridor, depth-separated)
│    need: two layers, alpha on mid; ≥2200px wide (parallax overscan)
│    sourcing: AI-generate; suggested prompt in the entry
│    beat window: B22 locked 9.1s
│
└─ pantry/B31.mp4                                    [VOX · keying]
     tier: 1 (generic: ink drop in water, black background)
     need: ≥ 11.0s (beat locked 9.2s — request MORE so conform TRIMS,
           never stretches); key action in the first 3s (tail trims)
     sourcing: stock or generate; screen-blend keyed at composite
```

Rules baked into the format: the beat's locked duration appears on every
entry; motion assets request more than the window; resolution minimums are
derived from the planned camera move, not guessed; cutout/parallax entries
name every layer file; suggested generation prompts ride along on tier-1
entries so the human can delegate without re-reading the beat sheet.

## Lifecycle

`SHOPPING.md` is a living checklist: entries get checked off as pantry files
land (the pantry intake reconciles and warns on undersized/short/contradicting
assets). The review cut waits on an empty list OR an explicit human
"ship with slates" override logged in BUILD-LOG.md.
