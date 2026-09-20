#!/usr/bin/env python3
"""
pace_check.py — pacing check for a beat sheet (audio-first).

Duration in this pipeline is an OUTPUT: each beat runs for the length of its real
Kokoro narration (mp3/timings.json). This tool reads those real durations and, per
beat, checks them against a per-content_type *consolidation floor* (the minimum
on-screen time for working memory to register and start integrating the new element).

It flags:
  - BELOW FLOOR  → the idea gets too little time. Fix with a HOLD (extra on-screen time
                   past the narration), NOT by shortening the next beat or speeding the
                   voice. Reported as the hold length to add.
  - OVER CEILING → the beat likely carries more than one idea. Consider SPLITTING it
                   (one element per beat).
It reports total runtime as an output and never imposes a clock target. Advisory: it
never edits the sheet.

The floors/ceilings are heuristics (see ../reference/duration-evidence.md) — defaults to
adjust by the actual element count in a beat.

Usage:
    python pace_check.py path/to/<video-folder>
    python pace_check.py path/to/<video-folder> --hold 1.5   # assumed inter-beat hold
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# content_type -> (consolidation floor s, split-signal ceiling s) — HEURISTIC
FLOOR_CEIL = {
    "title":     (3.0, 9.0),
    "realworld": (4.0, 11.0),
    "structure": (6.0, 16.0),
    "geometric": (6.0, 18.0),
    "data":      (6.0, 18.0),
    "mechanism": (6.0, 20.0),
    "equation":  (7.0, 24.0),
    "default":   (5.0, 18.0),
}
WORDS_PER_SEC = 2.6  # ~156 wpm, to estimate narration length when timings.json is absent


def beat_seconds(beat: dict, timings: dict) -> tuple[float, str]:
    bid = beat.get("beat_id", "?")
    if bid in timings:
        return float(timings[bid]), "audio"
    if "actual_duration_s" in beat:
        return float(beat["actual_duration_s"]), "audio"
    words = len((beat.get("narration_text") or "").split())
    return (words / WORDS_PER_SEC if words else 0.0), "estimated"


def ctype_of(beat: dict) -> str:
    ct = beat.get("content_type")
    if ct in FLOOR_CEIL:
        return ct
    if beat.get("beat_id") in ("INTRO", "OUTRO"):
        return "title"
    return "default"


def main(argv=None):
    ap = argparse.ArgumentParser(description="Audio-first pacing check for a beat sheet.")
    ap.add_argument("target", help="video folder or beat_sheet.json")
    ap.add_argument("--hold", type=float, default=1.0,
                    help="inter-beat hold assumed between beats (s, default 1.0)")
    args = ap.parse_args(argv)

    p = Path(args.target)
    sheet_path = p / "beat_sheet.json" if p.is_dir() else p
    if not sheet_path.exists():
        print(f"[pacing] beat sheet not found: {sheet_path}", file=sys.stderr)
        return 2
    folder = sheet_path.parent
    sheet = json.loads(sheet_path.read_text())
    beats = sheet.get("beats", [])
    tp = folder / "mp3" / "timings.json"
    timings = json.loads(tp.read_text()) if tp.exists() else {}
    src_note = "real (timings.json)" if timings else "ESTIMATED from word count — generate audio for real numbers"

    print(f"[pacing] {sheet.get('metadata', {}).get('title', folder.name)}   durations: {src_note}")
    print(f"{'beat':6} {'type':10} {'dur':>6}  status")
    print("-" * 78)

    total = 0.0
    n_content = 0
    below = []
    over = []
    untagged = 0
    for b in beats:
        bid = b.get("beat_id", "?")
        ct = ctype_of(b)
        if not b.get("content_type") and bid not in ("INTRO", "OUTRO"):
            untagged += 1
        dur, src = beat_seconds(b, timings)
        floor, ceil = FLOOR_CEIL[ct]
        total += dur
        if bid not in ("INTRO", "OUTRO"):
            n_content += 1
        mark = "ok"
        if dur + 1e-6 < floor:
            need = round(floor - dur, 1)
            mark = f"⚑ BELOW FLOOR by {need:.1f}s → add a ~{need:.1f}s hold (don't shorten narration)"
            below.append((bid, need))
        elif dur > ceil:
            mark = f"⚑ OVER CEILING ({dur:.1f}>{ceil:.0f}s) → likely >1 idea; consider splitting"
            over.append((bid, dur))
        flag = "" if src == "audio" else " (est)"
        print(f"{bid:6} {ct:10} {dur:5.1f}s{flag}  {mark}")

    holds = args.hold * max(0, n_content - 1)
    grand = total + holds
    print("-" * 78)
    print(f"[pacing] narration total {total:5.1f}s + ~{holds:.0f}s inter-beat holds "
          f"= ~{grand:5.1f}s ({grand/60:.1f} min) — this is an OUTPUT, not a target.")
    if below:
        print(f"[pacing] {len(below)} beat(s) below consolidation floor → add holds: "
              + ", ".join(f"{b}(+{n}s)" for b, n in below))
    if over:
        print(f"[pacing] {len(over)} dense beat(s) → consider splitting: "
              + ", ".join(f"{b}({d:.0f}s)" for b, d in over))
    if untagged:
        print(f"[pacing] {untagged} content beat(s) have no content_type → floors used "
              f"are generic defaults. Run media-router `recommend.py --tag` first for sharper floors.")
    print("[pacing] reminder: never split a beat or speed the voice to hit a clock number. "
          "If a fixed target is forcing that, it's a production compromise with a learning cost.")
    return 1 if (below or over) else 0


if __name__ == "__main__":
    raise SystemExit(main())
