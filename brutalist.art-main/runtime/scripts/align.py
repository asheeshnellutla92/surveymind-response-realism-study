#!/usr/bin/env python3
"""
align.py — the word clock (REMOTION.md, build-order step 1).

Port of skills/deck-lecture/scripts/align_captions.py (itself the muzak lyric
aligner) to house conventions. The narration TEXT is already known — it's what
the TTS synthesised — so we never transcribe blind: faster-whisper supplies
word-level TIMING from each beat's mp3, SequenceMatcher aligns the KNOWN
narration words onto those timestamps, and words Whisper missed (including
tts-respelling drift like "1926" -> "nineteen twenty-six") interpolate between
anchors. Every word lands on the real moment it is spoken — exact text, no
drift.

Runs at audio lock (workflow step 3), right after generate_audio_kokoro.py. Rerun
whenever any beat's mp3 regenerates (--only for just those beats).

Reads  reels/<slug>/beat_sheet.json  (narration_text + audio_file per beat)
Writes reels/<slug>/mp3/words.json:

    { "fps": 24,
      "beats": { "T01": [ {"text": "The", "startFrame": 0, "endFrame": 6}, ... ] } }

Frames are BEAT-LOCAL at the film fps (the pipeline renders at 24; metadata.fps
overrides). Consumers: the Remotion plane (annotations keyed to words),
stage_publish.py (word-grouped SRT cues where words.json exists), and the karaoke
derivative. One clock, three consumers.

Usage:
    python3 scripts/align.py reels/<slug> [--model base] [--only B05 T01]

faster-whisper is required:  pip install faster-whisper   (CPU is fine)
"""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

ART_FPS_DEFAULT = 24


def norm(tok: str) -> str:
    tok = unicodedata.normalize("NFKD", tok)
    tok = "".join(c for c in tok if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", tok.lower())


def whisper_words(audio_path: str, model_size: str, language: str):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit(
            "align: faster-whisper not installed (REMOTION.md word clock).\n"
            "    pip install faster-whisper\n"
            "(CPU is fine; pulls ctranslate2 + downloads a small model on first run)."
        )
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(audio_path, language=language, word_timestamps=True)
    out = []
    for seg in segments:
        for w in (seg.words or []):
            t = w.word.strip()
            if t:
                out.append((t, float(w.start), float(w.end)))
    return out


def align_words(known, recognized):
    """Map each known word ({text}) onto (start,end) seconds via sequence
    matching + neighbour interpolation. Returns None if nothing anchored."""
    from difflib import SequenceMatcher
    for w in known:
        w["start"] = w["end"] = None
    a = [norm(w["text"]) for w in known]
    b = [norm(r[0]) for r in recognized]
    sm = SequenceMatcher(a=a, b=b, autojunk=False)
    for ai, bi, size in sm.get_matching_blocks():
        for k in range(size):
            known[ai + k]["start"] = recognized[bi + k][1]
            known[ai + k]["end"] = recognized[bi + k][2]

    anchors = [i for i, w in enumerate(known) if w["start"] is not None]
    if not anchors:
        return None
    first, last = anchors[0], anchors[-1]
    for i in range(first):
        known[i]["start"] = known[i]["end"] = known[first]["start"]
    for i in range(last + 1, len(known)):
        known[i]["start"] = known[i]["end"] = known[last]["end"]
    for idx in range(len(anchors) - 1):
        a0, a1 = anchors[idx], anchors[idx + 1]
        gap = a1 - a0
        if gap <= 1:
            continue
        t0, t1 = known[a0]["end"], known[a1]["start"]
        span = max(t1 - t0, 0.0)
        for j in range(1, gap):
            known[a0 + j]["start"] = t0 + span * (j / gap)
            known[a0 + j]["end"] = t0 + span * ((j + 0.9) / gap)
    return known


def even_spread(known, duration_s):
    per = duration_s / max(len(known), 1)
    for i, w in enumerate(known):
        w["start"] = i * per
        w["end"] = (i + 0.9) * per
    return known


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("folder", help="reel folder (has beat_sheet.json + mp3/)")
    ap.add_argument("--model", default="base", help="faster-whisper model size")
    ap.add_argument("--language", default="en")
    ap.add_argument("--only", nargs="*", help="only these beat_ids")
    args = ap.parse_args()

    folder = Path(args.folder).expanduser()
    sheet = json.loads((folder / "beat_sheet.json").read_text())
    fps = sheet.get("metadata", {}).get("fps", ART_FPS_DEFAULT)

    timings = {}
    tpath = folder / "mp3" / "timings.json"
    if tpath.exists():
        timings = json.loads(tpath.read_text())

    out_path = folder / "mp3" / "words.json"
    doc = {"fps": fps, "beats": {}}
    if out_path.exists():
        doc = json.loads(out_path.read_text())
        doc["fps"] = fps

    n_ok, n_fallback = 0, 0
    for beat in sheet["beats"]:
        bid = beat["beat_id"]
        if args.only and bid not in args.only:
            continue
        # words.json carries the correctly-spelled narration_text, never the
        # respelled tts text; respelling drift becomes non-anchors and
        # interpolates cleanly.
        text = (beat.get("narration_text") or beat.get("tts_normalized_text") or "").strip()
        audio_rel = beat.get("audio_file")
        if not text or not audio_rel:
            print(f"[skip] {bid}: no narration_text/audio yet")
            continue
        audio_path = folder / audio_rel
        if not audio_path.exists():
            print(f"[skip] {bid}: missing {audio_rel}")
            continue

        dur = beat.get("actual_duration_s") or timings.get(bid) or 0.0
        flat = [{"text": w} for w in re.sub(r"\s+", " ", text).split()]

        recognized = whisper_words(str(audio_path), args.model, args.language)
        timed = align_words(flat, recognized) if recognized else None
        if timed is None:
            if not dur:
                print(f"[skip] {bid}: no alignment and no duration to spread over")
                continue
            timed = even_spread(flat, float(dur))
            n_fallback += 1
            print(f"[warn] {bid}: NO anchors — even spread over {dur}s "
                  f"(word-keyed tracks on this beat are unreliable)")
        else:
            n_ok += 1

        doc["beats"][bid] = [{
            "text": w["text"],
            "startFrame": max(0, round(w["start"] * fps)),
            "endFrame": max(0, round(w["end"] * fps)),
        } for w in timed]
        print(f"[ok] {bid}: {len(flat)} words @ {fps}fps")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(doc, indent=2, ensure_ascii=False))
    print(f"[ok] wrote {out_path}  (aligned {n_ok}, fallback {n_fallback})")


if __name__ == "__main__":
    main()
