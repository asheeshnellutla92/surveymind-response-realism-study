# How to create a Claude explainer

`claude-explainer` and `claude-cli` are **siblings**: same Claude-branded bookends,
different middle. Learn the shared skeleton once; the only choice is what goes in the
middle.

## The shared skeleton (both claude-explainer and claude-cli)

Every reel, either skill, has the same four structural moments:

1. **Beat 1 — the Claude terminal, `[Hello], [Name]`.** The Remotion Claude composer
   (`ClaudeComposerAsk`) opens with the world-language hello + persona
   (`Hola, Bear` · `Namaste, Liam` …). This is always beat 0.
2. **Middle — the only part that differs** (see the two skills below).
3. **Second-to-last — "Your Turn".** The Claude composer with a suggested prompt typed
   in for the viewer to paste and explore (`greeting: "Your turn."`).
4. **Last — the channel brand card.** Brands the channel — `@NikBearBrown`, `@Medhavy`,
   `@Musinique`, etc. (title restate + channel handle).

Both are audio-first, phase-gated (GATE P: you approve narration before audio spend),
fill-in-first, and output **`[slug].mp4`** (final) + **`[slug]-slate.mp4`** (slate).

## claude-explainer — the middle is a VOX-STYLE explainer

Use `claude-explainer` when the video **explains a concept**. The middle is a
vox-style explainer: **any media that fits** — archival plates, isotype grids, Manim,
Remotion illustrations, and yes, terminals and code where they earn the beat. The
Claude bookends frame it; the middle teaches.

```
claude-explainer Who was Max Planck?
```

→ Beat 1 `[Hello], [Name]` composer · middle: a vox-style bio of Planck (portraits,
the ultraviolet-catastrophe curve in Manim, a quantized-energy isotype, whatever
teaches) · "Your Turn" prompt · channel outro.

`<input>` can also be a reel folder, a lecture folder, or a whole book (batch). Also
triggers on `claude reel`, `claude style`, `claude cut`.

## claude-cli — the middle shows BUILDING something with Claude

Use `claude-cli` (alias of the `cli` skill) when the video **shows you making
something with Claude**. The middle is the build loop, and every step is *discussed*:

- **CLI prompt** (the Claude Remotion template) + **why this prompt** — what you're
  asking for and the reasoning
- **show the code** + **discuss it** — the real generated source, what matters in it
- **show the output** + **discuss it** — what it produced, whether it's right
- **at least one revision** — a change, re-run, discussed

```
claude-cli build an interactive sim of the photoelectric effect
```

→ Beat 1 `[Hello], [Name]` composer · middle: ask → why → code → discuss → output →
discuss → change → output · "Your Turn" prompt · channel outro.


## Where the ideas come from (scout → builder routing)

The idea's SOURCE picks the builder — this is how the scouts feed the two skills:

| Scout output | Builder |
|---|---|
| **`cli-ideas.md`** (from `cli-scout`) — "build/measure/research X with Claude" | **`claude-cli`** |
| **`simulation-ideas.md`** (from `sim-scout`) — a sim to build with Claude | **`claude-cli`** |
| **video-idea cards** (`vids/` scouts, `media-scout` video cards) — a concept to explain | **`claude-explainer`** |

So: a card from cli-ideas or simulation-ideas → `claude-cli`; a video idea → `claude-explainer`.

## Which one?

| The video is about… | Skill | The middle |
|---|---|---|
| **understanding a concept** | `claude-explainer` | vox-style — any media that fits (incl. terminals/code) |
| **building something with Claude** | `claude-cli` | the build loop: prompt → why → code → discuss → output → discuss |

Same intro (`[Hello], [Name]` Claude terminal), same "Your Turn" handoff, same channel
brand outro. **Concept → `claude-explainer`. Build-with-Claude → `claude-cli`.**
