# `--silent` — the unattended production mode

A cross-cutting flag honoured by **every** explainer skill, implemented once in
the shared runtime. Not a per-skill feature.

The rule is one line: **never stop to wait for a human.**

But "never stop" has to mean something precise, or an overnight run produces two
hundred broken reels instead of one.

---

## Three classes of gate, three behaviours

| Class | Gates | In silent mode |
|---|---|---|
| **Machine** | GATE AUDIO · GATE TYPE · GATE VERIFY | **Still fail the build.** Unchanged. |
| **Third-party** | GATE N — Bear signs a fellow's feedback · GATE G — the guest approves the framing | **Skip the reel and queue it.** Never auto-pass. |

### The middle row is where this goes wrong

"Don't stop" gets read as "don't block," and then a machine gate is relaxed to
keep the queue moving. **That is exactly how silent audio, truncated cards and
"see narration" punts shipped in the first place** — a pipeline that valued
throughput over verification.

**Silent mode removes the human from the loop. It never removes the gates.** A
reel that fails GATE AUDIO does not ship; it goes on the failure list and the run
continues to the next reel.

### The bottom row cannot be deferred at all

GATE N is a human signature on feedback *about a person*. GATE G is a board
member approving how his own talk was summarised. Auto-passing either puts
unapproved words in someone else's mouth.

Those reels are **skipped with a reason** and wait for a human. That is the
correct outcome, not a shortfall of the mode.

---

## Audio is always generated, never deferred

A run once stopped after its first reel with a silent previz, because the skill
tangled *audio* with *paid audio spend*. In silent mode this is explicit:

- **Force free voices** — claude-liam / Kokoro. Every beat gets narration, always.
- **The slate cut carries sound.** It is the review artifact. A silent slate is a
  **failed build**, not a stage.
- **Audio is generated on every reel, always.** Any reel whose beat sheet still
  carries `engine: "elevenlabs"` is CONVERTED to `engine: "kokoro"` with the
  channel's Kokoro voice, the conversion logged, and the build proceeds. There
  is no paid engine; there is nothing to skip.
- **Never spend on any paid API.** Zero exceptions.

---

## The review queue

Silent mode's output is not finished videos. It is **a queue of watchable slate
cuts with audio**, plus a manifest so `is-done` can find them.

`is-done` ranks folders that have *a rendered master plus a fully-filled beat
sheet*. Slate cuts with slated beats are invisible to it — so without a manifest,
a whole night's work does not appear in the tool meant to review it.

Write `REVIEW-QUEUE.json` at the run root, one entry per reel:

```json
{
  "slug": "...",
  "slate_cut": "/absolute/path/....mp4",
  "runtime_s": 264.0,
  "mean_volume_db": -23.7,
  "beats_filled": 8,
  "beats_slated": 2,
  "gates": { "audio": "PASS", "type": "PASS", "verify": "PASS" }
}
```

---

## The circuit breaker

**"Never stop to wait for a human" is not "never stop."**

If the machine is broken, grinding out two hundred failures is worse than
halting. **Stop the run when N consecutive reels fail the same gate** (default
10). That is not a human-wait — it is evidence the environment is wrong: Kokoro
weights missing, a font gone, a full disk.

Write the diagnosis and exit. Everything already completed stays on the queue.

---

## Run discipline

- **Resumable** — finished slugs recorded in `_silent/done.txt`, skipped on restart.
- **Error-isolated** — a per-reel exception is logged to `_silent/errors.txt`; the run continues.
- **Progress-logged** — one line per reel: slug, gates, runtime, dB.

## End of run

`SILENT-RUN-REPORT.md`: attempted · shipped to queue · failed a machine gate
(which gate, with the actual numbers) · skipped for a third-party gate.

**The skipped lists are where human attention goes. The queue is what gets
watched.**

## Never

Never publish. Never spend. Never relax a machine gate to keep the queue moving.
