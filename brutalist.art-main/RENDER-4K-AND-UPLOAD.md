# Render Final Cuts at 4K & Upload — Contributor Guide

> **Publishing is not included in this repository.** `./art post` and the
> `youtube-publisher` script referenced below are not present here. This guide
> describes the workflow for the private upload companion (`brutalist.yt`).
> See [`docs/PUBLISHING.md`](docs/PUBLISHING.md) for why the split exists.

*For YouTube team. This is the whole loop: render fast, judge, and either ship a final 4K cut to YouTube or leave notes in the video's folder. Everything here is the real toolkit as it stands — commands are copy-paste ready.*

---

## The two repos, and what each is for

There are two repositories, and they do different jobs. Track both, but for different reasons.

| Repo | What it is | You touch it when… |
|------|-----------|--------------------|
| **[nikbearbrown/humanitarians-youtube](https://github.com/nikbearbrown/humanitarians-youtube)** | The **video library** — one folder per video, organized `<topic>/<video-project>/`. Holds the beat sheet, fact-check, sources, shot list, and per-video notes. **No `.mp4`/`.mp3`** — those are gitignored (too big for git). | Tracking which videos exist and what's changed; writing a video's README when a cut isn't good enough to ship yet. |
| **[nikbearbrown/brutalist.art](https://github.com/nikbearbrown/brutalist.art)** | The **toolkit** — the `./art` command, the render/stage/upload machinery, the publisher. The 4K-render-and-upload ability lives here. | Rendering a final cut, staging it, and pushing it to YouTube. |

**So, to answer the tracking question directly:** track **humanitarians-youtube** for *video updates* — that's where each video's source and README live. Track **brutalist.art** for the *tooling* — that's what you run to render and upload. The finished `.mp4` never lands in either repo; it goes straight to YouTube.

---

## The loop at a glance

1. **Render fast** — draft compile of a reel to eyeball it.
2. **Judge it.**
   - **Good?** → render the **final 4K cut**, stage it, upload it to YouTube.
   - **Not good?** → don't ship. Update that video's **README** in humanitarians-youtube with what's wrong (the "change notes" below), and move on.

That's it. The rest of this doc is the detail behind steps 2-good and 2-not-good.

---

## Part 1 — Render the final cut at 4K

Run these from the **brutalist.art repo root** (locally: the `brutalist-art/` folder). `<reel>` is the path to the video project, e.g. `computational-skepticism-for-ai/youtube/claude-liam-deep-08-agentic-ai`.

**Step 1 — draft compile to eyeball it (fast):**

```
./art run <reel>
```

**Step 2 — cut the clean 4K master.** This runs **GATE T** first: if the reel's `TYPECHECK.md` has any FAILs, the cut is blocked until they're fixed. A reel with type-lock failures cannot ship.

```
./art final <reel>
```

That produces `<slug>-cut.mp4` — the clean master, no review label.

**Step 3 — stage the 4K master for YouTube.** This is the only path that a video may be uploaded from. It writes the master into `youtube/TOPOST/` alongside a `staged.json` QC record and **never uploads on its own**.

```
./art post <reel>
```

After staging, open `youtube/TOPOST/staged.json` and confirm the new entry reads:

- `"resolution": "3840x2160"`
- `"all_beats_4k": true`
- `"markers_clean": true`
- `"gate_t": "pass"`
- `"status": "staged"`

If any of those are off, fix the reel and re-run `./art post` — do **not** upload.

---

## Part 2 — Upload to YouTube

Upload is a separate, deliberate step. It only ever runs on a master that's already staged in `youtube/TOPOST/`.

**Step 1 — dry run first, always.** This authenticates read-only and shows the publish order without touching YouTube:

```
python3 skills/upload/youtube-publisher/scripts/publish_playlist.py \
  <reel-1> <reel-2> ... \
  --playlist "PLAYLIST NAME" --channel nikbearbrown --privacy unlisted \
  --client youtube/credentials/nikbearbrown/client_secret.json \
  --token youtube/credentials/nikbearbrown/youtube_token.json \
  --ledger youtube/credentials/nikbearbrown/youtube_publish_ledger.json \
  --dry-run
```

Check the printed order, that the playlist is found, and that OAuth is valid.

**Step 2 — real upload (same command, drop `--dry-run`):**

```
python3 skills/upload/youtube-publisher/scripts/publish_playlist.py \
  <reel-1> <reel-2> ... \
  --playlist "PLAYLIST NAME" --channel nikbearbrown --privacy unlisted \
  --client youtube/credentials/nikbearbrown/client_secret.json \
  --token youtube/credentials/nikbearbrown/youtube_token.json \
  --ledger youtube/credentials/nikbearbrown/youtube_publish_ledger.json
```

It prints the `https://youtu.be/...` link for each upload and adds it to the playlist. Copy those links — they go in the README (Part 3).

---

## The guardrails (don't skip these)

These are hard rules, learned the expensive way:

- **Upload only from `youtube/TOPOST/`** — never from a reel's own folder or from `mp4/`. The staged master with a passing `staged.json` is the one true source.
- **Don't run Topaz / upscaling on this content.** These are flat-vector, natively-4K renders. Topaz is for photographic footage; on flat art it *degrades* the image (and it errors out anyway — you'll see `topaz.ran: false` in `staged.json`, which is correct and expected). Native 4K needs no upscale.
- **Verify quality at 2160p, not "Auto."** YouTube's Auto serves a low-res transcode, especially right after upload and in small windows — it will look soft and it's lying to you. Open the gear menu and force **2160p** to judge the real thing. On a 4K TV, Auto does serve 4K; everywhere else, check manually. Design still needs to read at 1080p, since that's the floor most viewers get.
- **GATE T is not optional.** If `./art final` blocks on `TYPECHECK.md`, fix the FAILs — don't work around it.

---

## Part 3 — The README / change-notes format

This answers the two format questions: yes, follow an existing example, and here's the template.

**The existing example to follow** is the publish log at `youtube/PUBLISH-LOG.md` in the brutalist.art repo. It's an append-only log: for each publishing session it records a prereq-check table, the exact command run, the dry-run output, and the resulting `youtu.be` links. When you publish, **append a new session block to it** in the same shape.

Its prereq-check table looks like this:

```
| Video | mp4 master | description.txt | ch# | title |
|-------|-----------|----------------|-----|-------|
| what-is-brutalist | youtube/what-is-brutalist/mp4/what-is-brutalist.mp4 ✓ | 1110 bytes ✓ | 1 | What is Brutalist? |
```

**For each video's own folder** in humanitarians-youtube, drop a `README.md` using the template below. This is the per-video record: the link once it's live, or the reason it isn't live yet. Copy it verbatim and fill in the fields.

```markdown
# <Video Title>

- **Status:** shipped | needs-work | draft
- **YouTube:** https://youtu.be/XXXXXXXXXXX   <!-- blank until shipped -->
- **Playlist / chapter:** <playlist name> · ch<N>
- **Channel:** nikbearbrown
- **Resolution:** 3840x2160
- **Last updated:** YYYY-MM-DD

## Change notes
- YYYY-MM-DD — <what changed, or what still needs fixing before it can ship>
- YYYY-MM-DD — <earlier entry>

## Source
- Reel: `<topic>/<video-project>/`
- Beat sheet: `beat_sheet.json`
```

**How to use it in the two cases:**

1. **Video is good and shipped** — set `Status: shipped`, paste the `youtu.be` link, fill playlist/chapter, and add a change-note line dated today ("published to <playlist>").
2. **Video isn't good enough yet** — set `Status: needs-work`, leave the YouTube link blank, and in **Change notes** write exactly what's wrong (soft beats, wrong channel in the outro, audio off, whatever it is). That's the "comments in the folder's README" step — it's how the next pass knows what to fix.

Keep the change-notes list append-only: add a dated line each time you touch the video, newest at the top. Never delete old entries — the history is the point.

---

## Quick reference

```
./art run   <reel>     # fast draft compile — eyeball it
./art final <reel>     # clean 4K master cut (GATE T must pass)  → <slug>-cut.mp4
./art post  <reel>     # stage the 4K master into youtube/TOPOST/ (+ staged.json). Never uploads.
./art --list           # every skill available
./art doctor           # dependency + key readiness check
```

Then dry-run, then real-run `publish_playlist.py` (Part 2). Log the session in `youtube/PUBLISH-LOG.md`, and drop/update the per-video `README.md` in humanitarians-youtube.
