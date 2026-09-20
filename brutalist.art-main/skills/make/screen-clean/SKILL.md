---
name: screen-clean
description: >
  Prepare ANY screen recording (Zoom, Teams, Meet, QuickTime) for use as a beat
  inside a reel. Knows nothing about who is speaking — it is called by `fellows`
  and `guests` alike, and by anything else that drops a recorded human into a
  1920x1080 frame. Five passes: PROBE + AUDIO GATE (stop if decoded mean_volume
  is below -40 dB), ASPECT FIT (measure the OS taskbar, crop only that much off
  the bottom, pad the rest with Claude cream bars — never black, never crop from
  the top where webcam thumbnails live), LEGIBILITY (sample frames, confirm
  on-screen text survives at output size), PRIVACY SCAN (list every incidental
  thing visible — clock, taskbar apps, browser tab titles, notification toasts,
  filenames — and FLAG for a human, never auto-blur), and DEAD-AIR TRIM. The
  aspect decision applies a default and then shows a rendered contact sheet so a
  human confirms on pixels rather than on numbers. Use when a reel ingests a
  screen recording, or the user types `screen-clean`. Never publishes.
---

# screen-clean — the shared recording preprocessor

A screen recording is not a reel beat. It is 16:10 when the reel is 16:9, it has
an operating system along the bottom edge, it usually carries somebody's whole
desktop in frame, and its audio may be fine or may be dead. This skill turns one
into the other, and it is deliberately **ignorant of who is speaking** — the
editorial relationship (mentee vs board member vs guest) belongs to the calling
skill, never here.

## Why it is shared, not built into one skill

`fellows` and `guests` both ingest recorded video, and fellows record on Zoom and
Teams exactly as often as board members do. Building the cleanup into either one
means the other ships letterboxed frames with visible taskbars — which is the
state `fellows` was in before this skill existed. **Format is orthogonal to
relationship.** Anything that ingests a recording calls this.

## Trigger

- Called by `fellows`, `guests`, or any skill placing a recording into a beat.
- Direct: `screen-clean <video>` for a one-off pass.
- `--crop=A|B|C|<px>` pre-answers the aspect question for re-runs and batches.

## Pass 1 — probe and audio gate

Report duration, container, video codec, audio codec, resolution, and the
**decoded** `mean_volume` from `ffmpeg -af volumedetect`. 

**If mean_volume is below -40 dB, STOP.** The recording is silent and every
downstream stage will happily build a dead episode around it. Never infer audio
from the presence of an audio stream — decode it.

On a long file, sample a 90-second window from the middle rather than decoding
the whole thing; a 43-minute recording takes minutes to volumedetect end to end.

## Pass 2 — aspect fit

The reel frame is 1920x1080 (16:9). Screen recordings usually are not.

**Measure the taskbar. Do not assume it.** A 2560-wide capture at 150% Windows
scaling puts it around 72px, but scaling varies and macOS docks differ. Measure.

Three routes, worked here against a real 2560x1600 (16:10) source:

| | Output | Bars each side | Cost |
|---|---|---|---|
| A — pillarbox, no crop | 1728x1080 | 96px | taskbar and clock stay on screen |
| **B — crop the taskbar only (~72px)** | **1809x1080** | **56px** | **nothing — no shared content lost** |
| C — full crop to 16:9 (160px) | 1920x1080 | none | ~88px of shared content removed |

**B is the default.** Reaching a true 16:9 needs 160 rows gone but the taskbar is
only ~72 — the other 88 come out of the shared screen itself. Crop what is
genuinely junk; pad the rest.

**Never crop from the top.** Webcam thumbnails sit at the top-right, starting at
y=0. Any top crop clips the speaker's head. Every removed pixel comes off the
bottom.

**Bars are Claude cream `#FAF9F5`, never black.** Black reads as a letterboxed
upload; cream reads as in-register.

### The proof is the review artifact, not the numbers

"Cropped 72px, bars 56px" is not something a human can judge. After applying the
default, render a **contact sheet**: four frames sampled across the recording
(~10%, 35%, 60%, 85%), each composited exactly as it will appear in the reel,
bars included, written as one PNG and opened.

Four frames, not one — the shared screen changes. A crop that costs nothing while
the speaker is on a web page may clip a terminal six minutes later.

Print the measured numbers beside it and offer, in one prompt:

```
[B] keep default — taskbar cropped, ~56px bars each side   (enter)
[A] no crop — everything visible incl. taskbar/clock, ~96px bars
[C] full 16:9 — no bars, but shared content removed
[D] custom crop height in px — say the number
```

**D exists because the measurement can be wrong** — a Zoom control bar, a
notification toast, or non-standard scaling all mean the right crop is not the
taskbar height.

Under `--silent`, apply B, write the contact sheet to the review queue, and
continue. Never block.

## Pass 3 — legibility

Sample frames and confirm on-screen text survives at output size. A screen share
of a terminal at 1728x1080 may be unreadable.

**If it is not legible, say so.** Do not render it anyway and hope. An illegible
screen share is a finding for the human, not a defect to paper over.

## Pass 4 — privacy scan (flag, never decide)

List everything incidental the frame reveals:

- system clock and date
- taskbar / dock application icons, and any notification badges
- browser tab titles (they leak what else is open)
- notification toasts
- visible filenames and folder paths
- calendar or mail content

Print the list, mark which items **survive the crop** and which the crop removes,
and **wait for a human**. Never auto-blur and never decide on someone's behalf —
"is this embarrassing" is judgment, not arithmetic, so this pass flags rather
than loops to a fix.

This matters more for fellows than for guests: board members present
deliberately, fellows are often on personal machines with their own life on
screen.

## Pass 5 — dead-air trim

Trim leading and trailing silence. Never trim the middle — that is an edit of
someone's talk, and it belongs to the calling skill's human gate, not here.

## Output contract

Returns to the calling skill:

- the cleaned video at 1920x1080
- the measured numbers (source dims, taskbar px, output dims, bar width)
- the legibility verdict
- the privacy list, split into removed-by-crop and still-visible
- the contact-sheet path

The calling skill owns the beats. This skill owns the pixels.
