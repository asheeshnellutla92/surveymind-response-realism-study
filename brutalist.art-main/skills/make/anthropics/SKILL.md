---
name: anthropics
description: >
  A BEAT covering everything Anthropic publishes, read independently — code,
  papers and model cards, their own educational content, and capability claims.
  The thesis is what the artifact ACTUALLY DOES, not what it says about itself,
  and the finding is always the gap between claim and behaviour. Four modes
  under one router: --repo (inventory, commit DNA, behavioural probes, defaults),
  --paper (does the released evidence support the headline claim), --content
  (what has changed since this was made), --capability (run it and show the real
  output, including side-by-side cross-tool comparison — the one thing no vendor
  channel can ship). The register is a practitioner reporting from their own
  work: another perspective, never a correction; independence stated once;
  situated in a date and a real task so it stays true rather than going stale.
  Hard disqualifier — if the episode could be made by reading the docs, it is not
  this series. Use when the user types `anthropics`. Never publishes.
---

# anthropics — the beat

Most "Learn Claude" content is abundant, well-made, and downstream of the same
docs. This is upstream of them: it reads the artifact rather than the explanation
of the artifact.

That is the whole differentiation, and it is checkable at review:

> **If the episode could be made by reading the docs, it is not this series.**

Every episode needs at least one spine beat only visible by opening the artifact
and running it. Point at that beat, or the episode is **NOT READY** — report it
rather than building it.

## Why the corpus names the skill

A method applied to one corpus would be named for the method. But this covers
four artifact types with four different methods, unified only by subject and
stance. That is a **beat**, in the journalism sense, and a beat is named for what
it covers. The per-artifact analyses stay reusable underneath so they can be
pointed at another org later.

## Four modes, one router

| Mode | Artifact | The question | Evidence |
|---|---|---|---|
| `--repo` | a repository | What is this actually, vs what it is named and described as? | inventory, commit DNA, behavioural probes, defaults |
| `--paper` | report, model card, system card | Does the RELEASED EVIDENCE support the headline claim? | is the figure regenerable, the eval runnable, the dataset present |
| `--content` | their own published教 material | What has changed since this was made? | ship history vs the content's assumptions |
| `--capability` | a stated capability | Does it do this, and what does the output look like? | run it; show both outputs side by side |

`--repo` dispatches to `git-explainer`'s analysis engine; `--paper` dispatches to
`ai-paper`. Do not reimplement either.

`--capability` is the mode only an independent can run, because no vendor
channel ships "the competitor is better at this."

## --repo behavioural probes

Structure and history are artifacts of a repo's shape. **Behaviour is the
thesis.** Write these as reusable scripts so they run on any repo — which is also
what makes the Your Turn beat real rather than rhetorical.

- **network** — every URL contacted; telemetry or phone-home; disclosed? opt-in or opt-out?
- **filesystem** — reads/writes outside the working dir: config, credentials, history, caches
- **DEFAULTS** — for every safety/privacy/consent feature, extract its default value. *A feature that exists but ships off tells a different story than the paragraph describing it,* and it is invisible unless you read the default.
- **gating** — what needs a key, a tier, an enterprise plan: demonstrated but not usable
- **LICENSE** text vs how the repo is described
- **maintenance** — bot vs human commits, last human commit date: "maintained" vs merely "published"

## --paper: the sharpest fair question

**Does the released code reproduce the published claim?**

Not "is the paper right" — that is not checkable from a repo. But: is the
headline figure regenerable from what is here? Is the eval runnable, or only
described? Are the datasets present, referenced, or absent? Fully checkable,
entirely fair, and the honest answer is often *partially* — a more interesting
finding than either "open science ✓" or "it's a sham."

## The register

**Another perspective, not a correction.** Never "they're wrong" or "they're
behind." A practitioner reporting from their own work.

**Independence, stated once, plainly.** Builds with Claude daily; nobody is
paying for this. Understated is stronger than any amount of hedging — it is the
credential a vendor channel cannot hold.

**Show the artifact, not the verdict.** "Codex is better at image generation" is
a claim; the prompt with both outputs on screen is the thing. The illustrate law
pointed at comparison. It also makes mixed results natural — side-by-side rarely
produces a clean sweep.

**Situated, therefore durable.** *"In July 2026, doing this real task, here is
what each gave me."* That does not go stale when models update — it becomes
history and stays true. A benchmark claiming generality becomes wrong.

**Date and version stamp, every episode.** Commit SHA for a repo; model versions
and date for a capability test. Not for falsifiability — so the viewer who takes
up the invitation to go check is not confused when upstream has moved.

**A matching claim is a finding.** Some repos are exactly what they say. Some
capabilities work as advertised. If every episode uncovers a gap, it is a formula
rather than an analysis — and manufacturing gaps is the dishonesty this beat is
positioned against.

## Fairness rails — violations are build failures

- Absence of code is **never** evidence of bad faith. Report the absence; assign no motive.
- Separate **"not released"** from **"released and broken."** Only the second is a criticism.
- Judge each artifact against what it **claims to be**. A demo held to production standards is a strawman.
- **Charitable reading first**, then the critical one. If both survive the evidence, say so.
- Every claim cites `file:line` or shows the output.
- **Label inference as inference**, visually distinct from disclosed fact.

## The generation-honesty law

**Never generate an image that poses as evidence of a fact.**

Fictional and mythological subjects may be generated — no photograph exists and
none is implied. Real people and real events use real archival evidence. And an
image shown as **the output of a tool under test** is evidence about the tool,
not a depiction of its subject; there a poor generation is as informative as a
good one.

## Triage before building

For `--org` runs, run the probes across the whole corpus first, write
`FINDINGS.md` ranked by claim-vs-behaviour gap, and only build where there is
something real. Report how many artifacts were examined versus how many earned an
episode. **Thirty episodes with findings beats ninety-three with a template.**

## Gates

`--verify` holds (LOC == cloc, churn == git log, diff == git show) · every
on-screen number reconciles against its source **and against the other numbers in
the same reel** — internal consistency, because a reel once divided all-time
releases by a six-month window and reported twice the real cadence · GATE AUDIO ·
GATE TYPE · no "see narration".

## Never

Never publish. Never manufacture a gap. Never assign motive.
