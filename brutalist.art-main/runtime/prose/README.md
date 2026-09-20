# prose/ — the WRITING register, not the speaking voice

**This folder was called `voices/`. It was renamed because "voice" already means
something else in this toolkit, and the collision was real:**

| Term | What it means here | Where it lives |
|---|---|---|
| **voice** | the Kokoro TTS voice — which synthetic larynx speaks | `beat["voice"]`, `metadata["voice_kokoro"]`, `am_onyx` / `af_bella` / `af_kore` / `am_puck` |
| **prose** | the WRITING register — sentence rhythm, stance, what the words do | this folder |

A beat sheet can say `"voice": "am_onyx"` and `"register": "Teardown"` on the same
beat. Those are orthogonal: the same words can be spoken by any voice, and the same
voice can speak any register. Keeping both under `voices/` invited exactly the
mix-up you would expect.

The beat-sheet field is **`register`**, and every `SKILL.md` frontmatter already
said `Register:` — so the folder was the only thing out of step. `prose/` is the
container; `register` is the field.

## What ships here

| Register | Channel | Character |
|---|---|---|
| `teardown` | **@NikBearBrown** (`nbb`, `claude`, `claude-liam`) | Feynman × MKBHD — take it apart, explain how it works, judge it |
| `plain` | **@HumanitariansAI** (`hai`, `claude-hai`) | simple and direct — transfer of understanding, nothing else |
| `sardonic` | **@Musinique** (`claude-musinique`) | dry, economical, treats the reader as a capable adult |
| `pragmatist` | *(unassigned)* | here's the formula, here's when to use it — zero personality by design |

Each folder holds one `PROSE.md` (formerly `VOICE.md`) — the conversion contract
for rewriting any text into that register.

## Pending — @BearBrown / Baldwin

**@BearBrown is a new channel and its register is Baldwin.** Neither is here yet,
and neither was invented during this rename:

- **Baldwin has no `PROSE.md`.** It was previously cited on `@Musinique` as
  "Baldwin (charter: MUSINIQUE.md)", but that charter is not in this cut — the
  citation pointed at a file a downloader does not get. @Musinique is now
  `sardonic`, which ships. Writing `prose/baldwin/PROSE.md` means extracting the
  register from the charter, which is authoring, not renaming.
- **`brands/bearbrown.md` does not exist.** This cut ships only `nbb.md` and
  `hai.md`. A new brand needs the persona name, the Kokoro voice, and the folder
  chip decided first.

`pragmatist` is unassigned and stays that way — it is a usable register with no
channel pointing at it.

## Not shipped in this cut

The sandbox carries four more registers — `generic`, `narrative`, `socratic`,
`wonder`. They are not here because this cut ships only the brands that use them.
`wonder` arrives with `medhavy` if that channel is ever ported.

Note that the channel tables in `CLAUDE-BRAND.md` and `ai-explainer/SKILL.md` list
`claude-medhavy` and `claude-musinique`, but `brands/` ships only `nbb.md` and
`hai.md`. Those rows describe channels whose brand files are not in this cut.

## Naming rule

**Never name a file or field in this folder `VOICE`.** `VOICE-LOCK.md` is correctly
named and refers to the TTS binding — it is not part of this folder and was not
renamed.
