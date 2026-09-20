# brutalist

The pared-down Brutalist video toolkit: eight builder skills, two personas, five
doctrine modules, two Kokoro voices (Onyx `am_onyx`, Bella `af_bella`).

**Free by default** — Kokoro, Manim, Remotion, no account required.
**Optional:** a Higgsfield CLI login (`higgsfield auth login`) unlocks AI video
beats. Absent = the free path (Ken Burns stills) runs silently. No ElevenLabs,
ever.

**Read [`HOW-TO.md`](HOW-TO.md)** — what Brutalist is, install, the three
core builders, and the worked examples. `CLAUDE.md` has the session rules for
agents.

```bash
./setup --install     # deps + Remotion node modules + the Kokoro model (~340MB, auto-downloaded)
./art --list          # the skills
./art keys            # check optional Higgsfield login + SI key
```

## Builders

| Skill | What it makes |
|---|---|
| `ai-explainer` | Claude-branded explainer reel — the tight cut |
| `cli-explainer` | Prompt → real code → moving output (the build reel) |
| `deep-explainer` | 5–10 min documentary episode with vox pantry beats |
| `anthropics` | Reads an Anthropic artifact (repo/paper/content) against its own claims; practitioner-report register |
| `fashionista` | AI fashion-call experiment — sports-announcer call with stated confidence + correction ask |
| `fellows` | Wraps a HAI fellow's video report in Claude bookends for @HumanitariansAI |
| `finance` | Templatized SEC EDGAR filings reel — 11 beats, 5 charts, fully deterministic, two audits |
| `guests` | Wraps a board-member or invited-speaker video in Claude bookends for @HumanitariansAI |

## Personas

| Skill | Register | Voice |
|---|---|---|
| `nbb` | Teardown — take it apart, judge the design | Kokoro `am_onyx` |
| `hai` | Plain — simple and direct; method, when to use it, when NOT to | Kokoro `af_bella` |

## Doctrine (not entry points — inherited by builders)

| Skill | What it governs |
|---|---|
| `explainer` | Parent compositing chassis all builders inherit |
| `your-turn` | The closing three-beat standard |
| `duration-planner` | Duration is an output of the content, never a target |
| `nopunt` | Maps every animatable beat-type to the right Brutalist primitive |
| `screen-clean` | Prepares screen recordings (Zoom/Teams/Meet) for use as a reel beat |

Note: the Kokoro voice model is not in this repo (GitHub's 100MB file limit)
— `./setup --install` fetches it once from the kokoro-onnx releases.
