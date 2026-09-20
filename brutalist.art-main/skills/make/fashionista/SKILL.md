---
name: fashionista
tier: advanced
description: >
  THE EXPERIMENT: can an AI act as a fashion journalist? Every episode is one
  trial; the audience is the scoring function. Full-frame video, sports-announcer
  call with stated confidence, spoken correction ask in the outro. Three beats.
  Kokoro am_onyx, free. Never publishes.

---

# fashionista — AI fashion call experiment

## The premise (this governs everything)

**CAN AN AI ACT AS A FASHION JOURNALIST? DOES IT ACCURATELY CHARACTERIZE CLOTHES AND MATERIALS?**

Every episode is one trial. The audience is the scoring function. The uncertainty is the SUBJECT, not a caveat to manage. This must be legible in the title and in the first two lines of the description, every episode.

## Structure

```
INTRO      2–3 s.   ClaudeComposerAsk.
           Default: "Hey Claude — what is he wearing?" or
                    "Hey Claude — what is she wearing?"
           NEVER name the garment in the ask. The naming is the AI's job,
           on camera. If the ask text contains any garment term from the beat
           sheet, the build fails (GATE ASK).
           Bear's clone day: "Hey Claude, Professor Bear needs help with his
             fashion choices — can you suggest a look for him?"
           Bear declares which via is_bear_soul_id. Never infer.

THE VIDEO  The full source clip, full frame. Liam's commentary plays over it.
           One corner stamp only: "generated · <date>". Nothing else on screen.

OUTRO      2–3 s.   ClaudeTitleOutro.
           SPOKEN: "If you know this garment, tell me what I got wrong." — every
           episode, no exceptions. This is the experiment's data collection.
```

Total runtime = clip duration + ~5 s.

## VIDEO IS THE MASTER CLOCK

This skill inverts the audio-first law. State this in every build log.

- Write commentary TO FIT the footage. Never stretch, loop, freeze-pad, or slow the video.
- Extract frames and build a MOTION TIMELINE first — what happens at what second.
- Write the call against that timeline.
- If the narration runs long: CUT WORDS. The video does not move.

```bash
ffmpeg -i <source> -vf "fps=0.5" /tmp/fashionista-frames/%04d.png
```

## The call — sports announcer with stated confidence

- Present tense. Short sentences. Energy.
- **Every garment term is spoken with a stated confidence the viewer can hear.**
  - "That's a sherwani — I'm confident."
  - "I want to say lehenga, but the length and the jacket are fighting me on that."
- **Hedging is content, not weakness.** A call the announcer is unsure of is the most interesting moment.
- **Name the failure mode when you catch yourself in it.** The most common: REACHING FOR THE FAMOUS WORD OVER THE PRECISE ONE (lehenga, kimono, kaftan, blazer). If the well-known term is doing work the evidence does not support, say that out loud.
- **Comment on the clothes only.** Never the camera, lighting, pose, expression, setting, or wearer. One line about anything else fails the build.

## Two stacked error sources

These are generated garments. A wrong episode can be wrong in two distinct ways:

- **GENERATOR ERROR** — the render shows something no real garment of that type does. The image is wrong.
- **DESCRIBER ERROR** — the render is coherent and the name is wrong. The call is wrong.

When these are separable, say which one. When they are not, say that too. Nobody else is doing this and it is the most interesting thing the series does.

## The two cuts — built separately, never derived

```
16:9 cut   Source: the 1920×1080 video. Full frame, no crop, no pad.
9:16 cut   Source: the ~2:3 portrait video. Center-cropped to 9:16, scaled to 1080×1920.
```

**Resolve which is which by ffprobe, never by filename.** The "-916" filename is unreliable. Measure aspect ratio; assign from that. Durations swap between days — measure them.

**Do NOT derive the 9:16 from the 16:9 with shorts.py.** Each cut has its own footage.

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 <file>
```

9:16 crop (portrait source W×H):
```bash
TARGET_W=$(python3 -c "import math; print(math.floor(${H} * 9 / 16 / 2) * 2)")
X_OFF=$(python3 -c "print((${W} - ${TARGET_W}) // 2)")
ffmpeg -i <portrait> -an -vf "crop=${TARGET_W}:${H}:${X_OFF}:0,scale=1080:1920" -c:v libx264 -crf 18 media/B01.mp4
```

**NO VIDEO = hard stop.** Do not build, do not fall back to stills. Report the folder and ask.

## Audio

claude-liam / Kokoro am_onyx, free. Source videos carry digital silence (−91 dB). Strip the source track and lay commentary over it.

## CALLS ledger

Write `books/fashionista/<date>/CALLS.json` per day — one entry per garment term claimed:

```json
[{
  "term": "sherwani",
  "confidence": "high",
  "reasoning": "standing collar, knee length, heavy embroidery, worn over trousers",
  "timestamp_in_clip": "0:00–0:25",
  "alternatives_considered": ["achkan", "kurta"],
  "verdict": null
}]
```

The verdict slot stays null until a human fills it from comments. Without this the correction loop evaporates.

## Title and description

**Title pattern:** `Is this a <call>? — Can AI describe clothes? · Fashion, Rendered <Month Day>`  
- High confidence: `"Is this a linen blazer? — Can AI describe clothes? · Fashion, Rendered Aug 2"`
- Low confidence: `"Is this a lehenga? Not convinced. — Can AI describe clothes? · Fashion, Rendered Aug 4"`

**Description — required sections, in order. No section header renders empty.**

1. **FIRST TWO LINES** (above the fold): the experiment.
   ```
   Can an AI accurately describe what someone is wearing? Every episode is one trial. You're the scoring function.
   ```

2. **TODAY'S CALL**: what the episode claimed + confidence, plain words. One line.
   ```
   The call: [term]. [Confidence] confidence.
   ```

3. **CONFIDENCE**: what is making it uncertain, one sentence (required even at high confidence).
   ```
   What could be wrong: [one sentence].
   ```

4. **THE ASK**: correct me; corrections go into a running ledger.
   ```
   If I named this wrong — the cloth, the construction, or the category — correct me in the comments. Corrections go into a running ledger.
   ```

5. **DISCLOSURE**: AI-generated imagery; the garment may not be real.
   ```
   The imagery is AI-generated. The garment may not correspond to any real piece. That is part of what the series is testing.
   ```

6. **Date, handle, hashtags.**

**A reel under 60 s has NO CHAPTERS.** Remove the Chapters block entirely. Remove any header that would render empty. An empty section header is worse than no header.

## Gates

| Gate | Check |
|---|---|
| **GATE FULLFRAME** | Source video occupies the ENTIRE output frame. No panel, letterbox, or text block alongside it. |
| **GATE NOTEXT** | No on-screen text during the video except the corner stamp. |
| **GATE CLOCK** | Duration = clip + intro + outro, within one frame. Video never time-stretched. |
| **GATE AUDIO** | Decoded mean_volume > −40 dB. Source track stripped. |
| **GATE SUBJECT** | Every narration line is about the clothes. Camera, lighting, pose, expression, setting = FAIL. |
| **GATE ASK** | Cold-open ask NEVER contains the garment name — fail the build if the ask text matches any garment term in the beat sheet. Spoken correction ask in outro. Question visible in title. Ask in description above the fold. |
| **GATE CONFIDENCE** | Every garment term in narration has a matching CALLS.json entry with stated confidence. |
| **GATE DESC** | Description's first two lines state the experiment. No section header renders empty. Today's call, confidence (including what makes it uncertain), and correction request are all present. No Chapters block on reels under 60 s. |

## Trigger

```
fashionista <YYYY-MM-DD>
```
