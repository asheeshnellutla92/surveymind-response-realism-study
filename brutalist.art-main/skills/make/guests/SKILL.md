---
name: guests
description: >
  Guest-showcase reels for Humanitarians AI — board members, advisors, partners
  and invited speakers. Sibling of `fellows`: same Claude-branded bookends, same
  "the guest's video PLAYS AS IS" contract, same free Kokoro narration, same
  "the guest video's own runtime is that beat's clock". SIX beats — cold open
  naming the guest's STANDING and the video's SUBJECT (never a progress report),
  a summary of what the video covers written from the transcript, the video
  itself unmodified, a RECAP of what it established, a Your Turn handoff, and
  the Humanitarians AI outro. The one structural difference from `fellows`:
  this skill has NO feedback beat and no Professor Bear's notes. A fellow is
  mentored; a board member is not evaluated by staff. GATE G replaces GATE N —
  the GUEST approves the summary and recap text before render. Calls
  `screen-clean` on the source recording. Use when the user types `guests
  [video]`, or drops a board member's or invited speaker's video. Never publishes.
---

# guests — the board member / advisor / invited-speaker reel

A guests episode answers *what did this person come to show us?* — and lets them
show it. The reel is a frame around their own recording: the narrator sets it up,
the video plays untouched, the narrator recaps what it established, the viewer
gets a prompt. The skill's job is the frame, never a re-edit of their talk.

## The one rule that makes this a separate skill

`fellows` beat 4 is **Professor Bear's notes — feedback and next steps,
human-signed (GATE N)**. That belongs there because a fellow is being mentored;
assessment is the point of that relationship.

A board member is not evaluated by staff. Running the fellows chassis with a
board member's name in it ships an episode where Professor Bear assesses a board
member's work and assigns him next steps — an org-chart inversion, on the org's
own channel.

**So this skill has no feedback beat. Not disabled — absent.** There is no flag
to forget and no default to get wrong. Any evaluative or assessment language
appearing in a guests script is a **BUILD FAILURE**, not a style note. Do not
port GATE N, "next steps", "areas to improve", or any grading register into this
skill, ever, under any instruction.

Beat 4 is a **RECAP**: what the video established, descriptive only.

## Trigger

- `guests <video|folder>`, `guest showcase`, `board member video`
- Dropping a board member's, advisor's, partner's, or invited speaker's recording

If the person is a Humanitarians AI **fellow**, use `fellows` instead — they
should get the feedback beat.

## The required beat spine

| # | Beat | Content |
|---|---|---|
| 1 | **COLD OPEN** (`ClaudeComposerAsk`) | Names the guest's STANDING (e.g. HAI board member) and the video's SUBJECT. Not a progress report, and it must not read like one. |
| 2 | **SUMMARY** | What the video covers, 2–3 beats, written FROM the faster-whisper transcript. Never invented. |
| 3 | **THE GUEST'S VIDEO** | Plays AS IS, unmodified. Its own runtime is this beat's clock. |
| 4 | **RECAP** | What the video established. Descriptive. No evaluation, no assignment. |
| 5 | **YOUR TURN** | `greeting: "Your turn."` — a prompt the viewer can run. |
| 6 | **HAI OUTRO** | The standard Humanitarians AI outro, as in `fellows`. |

## GATE G — the guest approves the framing

GATE N has no meaning here. Its replacement points at the right person.

**The guest approves the summary and recap text before render.** You are
paraphrasing someone else's talk in your own words and putting their face in a
branded episode. Write the summary and recap to a review file, print them, and
**STOP**. Do not render past it unsigned.

Under `--silent`, GATE G is a **third-party gate**: the reel is SKIPPED and
queued, never auto-passed. Auto-passing puts unapproved words in someone's mouth.

## The recording

Always call **`screen-clean`** on the source before assembling. It handles the
probe and audio gate, the aspect fit (crop the taskbar, pad in Claude cream,
never crop from the top where the webcam sits), the legibility check, the privacy
scan, and the dead-air trim. Show its full report before building beats.

Never crop or excerpt the guest's talk itself to fit a runtime. If a recording is
long enough that a cut would help, **surface the runtime at GATE G and let the
guest decide** — generate YouTube chapters from the transcript instead. Cutting a
board member's talk on your own editorial judgment is precisely what GATE G
exists to prevent.

## Voice

Free Kokoro, as `fellows`. One persistent narrator voice per channel. No spend.

## Laws — inherited

Cold open law, executive-summary discipline, illustrate law, no gen-AI, no
doodle, card text carries its own content (no "see narration"), GATE AUDIO
(decoded mean_volume > -40 dB per beat), GATE TYPE (contrast ≥ 4.5:1, no
overflow, no mid-word truncation).

## Naming

`guest-<firstname>` or `guest-<topic>`. Follow the channel's privacy posture —
first names unless the guest's full name and standing are the point of the
episode, which for a board member they usually are.

## Never

Never publish. Never evaluate the guest. Never render past GATE G unsigned.
