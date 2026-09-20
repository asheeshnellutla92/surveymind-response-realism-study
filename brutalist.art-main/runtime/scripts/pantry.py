#!/usr/bin/env python3
"""pantry.py — pantry intake: prepped assets -> slot-contract media.

THE PANTRY LAW: raw finds never go straight into media/. They pass through
reels/<slug>/pantry/, prefixed with their beat id, already restored:
  - restoration (nanobanana via Higgsfield): WARMONO for period images,
    NATGEO for modern ones (design/stock-styles.md)
  - upscaled to survive the Ken Burns crop (Topaz etc.)
This script does the mechanical rest:
  - images  -> media/<BID>.png  (DOCUMENT beats: non-16:9 scans are cropped
               to 16:9, anchored top-center so the title stays — override
               with --doc-anchor 0..1, 0 = top)
  - videos  -> media/<BID>.mp4; b-roll audio stripped, source_report audio
               preserved (AAC for MP4 compatibility, including PCM .mov inputs)
  - sidecar stubs (<BID>.source.txt) created when missing — ai/higgsfield
    clips get a disclosure line per SKILL.md provenance rules
  - warns: clip shorter than the beat (freeze-pad territory), undersized
    stills, sheet source axis that contradicts the asset

Usage: python3 scripts/pantry.py reels/<slug> [--doc-anchor 0.0]
Idempotent: reprocesses whatever is in pantry/; compile's hash manifest
decides what actually recompiles.
"""
import argparse, json, re, shutil, subprocess, sys, tempfile, os
from pathlib import Path
from build_safety import is_source_report, writable_path, validate_project

FFMPEG = shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = shutil.which("ffprobe") or "ffprobe"
BID_RE = re.compile(r"^([A-Z]{1,3}\d{2})")


def probe_dur(p):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries",
                        "format=duration", "-of", "csv=p=0", str(p)],
                       capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", type=Path)
    ap.add_argument("--doc-anchor", type=float, default=0.0,
                    help="vertical anchor for DOCUMENT 16:9 crops (0=top)")
    a = ap.parse_args()
    folder = a.folder.resolve()
    pantry, media = folder / "pantry", writable_path(folder, 'media/.check').parent
    if not pantry.is_dir():
        sys.exit(f"[pantry] no pantry/ in {folder}")
    media.mkdir(exist_ok=True)
    sheet = json.loads((folder / "beat_sheet.json").read_text())
    validate_project(sheet)
    beats = {b["beat_id"]: b for b in sheet["beats"]}

    from PIL import Image
    done = []
    for f in sorted(pantry.iterdir()):
        m = BID_RE.match(f.name.lstrip())
        if not m or f.name.endswith(".source.txt"):
            if f.is_file() and not f.name.startswith("."):
                print(f"[pantry] SKIP (no beat prefix): {f.name[:60]}")
            continue
        bid = m.group(1)
        beat = beats.get(bid)
        if beat is None:
            print(f"[pantry] SKIP {f.name[:50]} — no beat {bid} in sheet")
            continue
        shot = beat.get("shot", {})
        ext = f.suffix.lower()

        if ext in (".mp4", ".mov", ".webm", ".mkv"):
            # portrait clips are 9:16 OVERRIDES for the short (<bid>-916.mp4)
            r = subprocess.run([FFPROBE, "-v", "error", "-select_streams", "v:0",
                                "-show_entries", "stream=width,height",
                                "-of", "csv=p=0", str(f)],
                               capture_output=True, text=True)
            try:
                vw, vh = (int(x) for x in r.stdout.strip().splitlines()[0].split(","))
            except (ValueError, IndexError):
                vw, vh = 16, 9
            report = is_source_report(beat, sheet)
            suffix = "-916" if vh > vw and not report else ""
            out = writable_path(folder, f"media/{bid}{suffix}.mp4")
            # Reports keep embedded sound and native framing for the compiler.
            # Generated narration remains the soundtrack for ordinary b-roll.
            with tempfile.TemporaryDirectory(prefix='.pantry-', dir=media) as scratch:
                candidate = Path(scratch) / 'slot.mp4'
                audio = ['-map', '0:a:0', '-c:a', 'aac', '-b:a', '192k'] if report else ['-an']
                subprocess.run([FFMPEG, '-y', '-v', 'error', '-i', str(f),
                                '-map', '0:v:0', '-c:v', 'copy'] + audio + [str(candidate)], check=True)
                os.replace(candidate, out)
            if suffix:
                print(f"[pantry] {bid}  PORTRAIT clip -> media/{out.name} (9:16 override)")
            d, need = probe_dur(out), float(beat.get("actual_duration_s") or 0)
            note = ""
            if not report and d and need and d < need * 0.85:
                note = (f"  · clip {d:.1f}s < beat {need:.1f}s — will slow "
                        f"{need / d:.1f}x to fit" +
                        ("  ⚠ extreme slow-mo, consider a longer generation"
                         if need / d > 3.0 else ""))
            print(f"[pantry] {bid} VIDEO sound {'preserved' if report else 'stripped'} -> {out.name}{note}")
            looks_gen = any(t in f.name for t in ("hf_", "humanitarians.ai", "midjourney", "_mj_", "grok"))
            if shot.get("source") == "archive" and looks_gen:
                print(f"[pantry] {bid}  ⚠ sheet says source=archive but file looks "
                      f"GENERATED — set shot.source to 'ai' + disclosure sidecar")
            done.append((bid, out, "ai" if looks_gen else shot.get("source", "own")))

        elif ext in (".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"):
            out = media / f"{bid}.png"
            im = Image.open(f)
            w, h = im.size
            if shot.get("type") == "DOCUMENT" and (w / h) < 1.5:
                ch = int(w * 9 / 16)
                y0 = int((h - ch) * max(0.0, min(1.0, a.doc_anchor)))
                im = im.crop((0, y0, w, y0 + ch))
                print(f"[pantry] {bid}  DOC    {w}x{h} -> 16:9 crop "
                      f"({w}x{ch} @y={y0}) — CHECK the title survived")
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            im.save(out)
            if im.size[0] < 1920:
                print(f"[pantry] {bid}  ⚠ {im.size[0]}px wide < 1920 — Ken Burns will show artifacts")
            print(f"[pantry] {bid}  IMAGE  -> media/{bid}.png  ({im.size[0]}x{im.size[1]})")
            done.append((bid, out, shot.get("source", "own")))

    # sidecar stubs
    for bid, out, source in done:
        sc = media / f"{bid}.source.txt"
        if not sc.exists():
            if source == "ai":
                sc.write_text("AI-GENERATED (Higgsfield) — disclosure required in credits.\n"
                              "Seed image (if i2v): FILL-IN\nPrompt/style: see SHOTLIST + design/stock-styles.md\n")
            else:
                sc.write_text("URL: FILL-IN\nLicense: FILL-IN\nCredit: FILL-IN\n")
            print(f"[pantry] {bid}  sidecar stub -> media/{bid}.source.txt (FILL-IN)")

    print(f"[pantry] {len(done)} asset(s) slotted. Set shot.focus per still, "
          f"fill sidecars, then: bash scripts/run.sh {folder.name}")


if __name__ == "__main__":
    main()
