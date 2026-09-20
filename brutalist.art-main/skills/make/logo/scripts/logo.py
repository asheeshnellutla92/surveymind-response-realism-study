#!/usr/bin/env python3
"""logo.py — append a random-once brand logo sting after a reel's last beat.

THE LOGO LAW: the sting is one random pick per reel — one Remotion animation
technique (from the wordmark-showcase catalog), one brand SVG, one brand MP3
— and the MP3 IS the clock: the outro runs exactly as long as the jingle.
The pick is RANDOM ONCE, THEN LOCKED: it is recorded in the beat itself, so
rebuilds are stable. `--reroll` picks fresh.

Brand asset pools live in <ART_HOME>/logos/<brand>/ (*.svg + *.mp3). A brand
with no mp3s (or no svgs) is a MISSING per standing rule #3: the script logs
what to drop into the folder in BUILD-LOG.md and stops.

What one run does:
  1. resolves the brand alias (nbb → bear-brown, hai → humanitarians,
     muz → musinique, medhavy → medhavy)
  2. picks (or re-uses the locked pick of) animation + svg + mp3
  3. copies the mp3 to mp3/beat-<BID>.mp3, pads it with a silence tail
     (--tail, default 1.0s — THE JINGLE MUST NEVER BE CUT: the silence lives
     IN the clock, same law as outro.py, so conform/mux rounding can only ever
     trim silence), and measures the padded file (ffprobe) — `reuse_audio`
     marks it so generate_audio never TTSes over it
  4. copies the svg into runtime/remotion/public/logo-outro/<brand>/ and,
     when the svg is clean path-only, extracts the merged path + viewBox
     (drawOn is only eligible then)
  5. appends the beat after the last beat: shot.type REMOTION,
     shot.remotion.pattern "LogoOutro", props carrying the pick; aspect
     follows metadata.aspect_ratio
  6. renders it via runtime/scripts/remotion_scenes.py (foreground, the only
     lawful Remotion path) and recompiles the review cut

Usage:
  python3 skills/make/logo/scripts/logo.py <book>/youtube/<slug> [brand]
          [--reroll] [--no-render] [--no-compile] [--handle @NikBearBrown]

Free/local except the render. ffmpeg/ffprobe + stdlib.
"""
import argparse, json, random, re, shutil, subprocess, sys
from pathlib import Path
from xml.etree import ElementTree

FFPROBE = shutil.which("ffprobe") or "ffprobe"
FFMPEG = shutil.which("ffmpeg") or "ffmpeg"

# skills/make/logo/scripts/logo.py -> ART_HOME
ART_HOME = Path(__file__).resolve().parents[4]

ALIASES = {
    "nbb": "bear-brown", "bear-brown": "bear-brown", "bearbrown": "bear-brown",
    "hai": "humanitarians", "humanitarians": "humanitarians",
    "medhavy": "medhavy",
    "muz": "musinique", "musinique": "musinique",
}

# per-brand ground + accent (sources: tokens/claude.ts, tokens/humanitarians.ts,
# tokens/medhavy.ts, tokens/musinique.ts)
BRAND_LOOK = {
    "bear-brown":    {"bg": "#FAF9F5", "accent": "#D97757", "fill": "#000000"},
    "humanitarians": {"bg": "#F3EBDD", "accent": "#1F4E5F", "fill": "#2F2A26"},
    "medhavy":       {"bg": "#F0EAD6", "accent": "#D55E00", "fill": "#000000"},
    "musinique":     {"bg": "#ffffff", "accent": "#2563eb", "fill": "#111827"},
}

ANIMATIONS = ["springEntrance", "drawOn", "rotation", "kineticGrid",
              "elasticPhysics", "noiseWobble", "trailEcho", "glitchSlices"]

PATTERN = "LogoOutro"


def probe_dur(path: Path) -> float:
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        return round(float(r.stdout.strip()), 3)
    except ValueError:
        sys.exit(f"[logo] ffprobe could not measure {path}")


def log_build(folder: Path, line: str):
    log = folder / "BUILD-LOG.md"
    with log.open("a") as f:
        f.write(line.rstrip() + "\n")


def missing(folder: Path, brand: str, what: str):
    msg = (f"MISSING: logos/{brand}/ has no {what} — the logo skill needs at least "
           f"one .svg and one .mp3 in {ART_HOME / 'logos' / brand}. Drop a brand "
           f"jingle/sonic-logo mp3 (its length becomes the outro length) and rerun.")
    log_build(folder, msg)
    sys.exit(f"[logo] {msg}")


def extract_paths(svg: Path):
    """Merged <path d> + viewBox + aspect ratio, or (None, None, ratio).

    Path extraction only succeeds on 'clean' svgs: every VISIBLE drawable is a
    filled <path> and there is no <text>/<image>/gradient paint. Invisible
    fill:none shapes (the Illustrator artboard <rect>) are ignored. Otherwise
    the scene renders the svg file itself (Img) and drawOn is ineligible.
    """
    try:
        root = ElementTree.parse(svg).getroot()
    except ElementTree.ParseError:
        return None, None, 1.5
    ns = "{http://www.w3.org/2000/svg}"
    vb = root.get("viewBox")
    if vb:
        parts = [float(x) for x in re.split(r"[\s,]+", vb.strip())]
        w, h = parts[2], parts[3]
    else:
        def num(v): return float(re.sub(r"[a-z%]+$", "", v or "0") or 0)
        w, h = num(root.get("width")), num(root.get("height"))
        vb = f"0 0 {w or 1000} {h or 1000}"
    ratio = (w / h) if (w and h) else 1.5

    # class -> fill map from embedded <style> blocks (the Illustrator pattern)
    css = {}
    for st in root.iter(f"{ns}style"):
        for m in re.finditer(r"\.([\w-]+)\s*\{([^}]*)\}", st.text or ""):
            fm = re.search(r"fill\s*:\s*([^;}]+)", m.group(2))
            if fm:
                css[m.group(1)] = fm.group(1).strip()

    def fill_of(el):
        if el.get("fill") is not None:
            return el.get("fill").strip()
        sm = re.search(r"fill\s*:\s*([^;]+)", el.get("style") or "")
        if sm:
            return sm.group(1).strip()
        for c in (el.get("class") or "").split():
            if c in css:
                return css[c]
        return None   # inherits — effectively painted

    drawable = ("rect", "circle", "ellipse", "line", "polyline", "polygon")
    paths, clean = [], True
    for el in root.iter():
        tag = el.tag.replace(ns, "")
        if tag == "path":
            d = el.get("d")
            if not d:
                continue
            if (fill_of(el) or "").lower() == "none":
                clean = False   # outline-only path: our fill-flood would lie
            else:
                paths.append(d.strip())
        elif tag in drawable:
            if (fill_of(el) or "").lower() != "none":
                clean = False   # a visible non-path shape
        elif tag in ("text", "image", "use",
                     "linearGradient", "radialGradient", "mask", "filter"):
            clean = False
    if clean and paths:
        return " ".join(paths), vb, ratio
    return None, None, ratio


def next_beat_id(beats) -> str:
    nums = []
    for b in beats:
        m = re.fullmatch(r"B(\d+)", b.get("beat_id", ""))
        if m:
            nums.append(int(m.group(1)))
    n = (max(nums) + 1) if nums else len(beats) + 1
    bid = f"B{n:02d}"
    taken = {b.get("beat_id") for b in beats}
    while bid in taken:
        n += 1
        bid = f"B{n:02d}"
    return bid


def find_logo_beat(beats):
    for b in beats:
        rem = (b.get("shot") or {}).get("remotion") or {}
        if rem.get("pattern") == PATTERN:
            return b
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", type=Path, help="<book>/youtube/<slug>")
    ap.add_argument("brand", nargs="?", default="nbb",
                    help="nbb|bear-brown | hai|humanitarians | medhavy | muz|musinique")
    ap.add_argument("--reroll", action="store_true",
                    help="discard the locked pick and pick fresh")
    ap.add_argument("--handle", default="",
                    help="optional handle line under the mark (default: none)")
    ap.add_argument("--tail", type=float, default=1.0,
                    help="silence appended after the jingle so its ring-out is "
                         "never cut (the silence is IN the clock; default 1.0s)")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--no-compile", action="store_true")
    a = ap.parse_args()

    brand = ALIASES.get(a.brand.lower())
    if not brand:
        sys.exit(f"[logo] unknown brand '{a.brand}' (know: {', '.join(sorted(set(ALIASES)))})")

    folder = a.folder.resolve()
    sheet_path = folder / "beat_sheet.json"
    if not sheet_path.exists():
        sys.exit(f"[logo] no beat_sheet.json in {folder}")
    sheet = json.loads(sheet_path.read_text())
    beats = sheet["beats"]

    pool_dir = ART_HOME / "logos" / brand
    svgs = sorted(pool_dir.glob("*.svg"))
    mp3s = sorted(pool_dir.glob("*.mp3"))
    if not svgs:
        missing(folder, brand, "svgs")
    if not mp3s:
        missing(folder, brand, "mp3s")

    # ---- random once, then locked -------------------------------------------
    beat = find_logo_beat(beats)
    prev_dur = (beat or {}).get("shot", {}).get("remotion", {}) \
        .get("props", {}).get("durationS")
    pick = None
    if beat and not a.reroll:
        pick = (beat["shot"]["remotion"].get("picked") or {})
        # a locked pick whose assets vanished falls through to a fresh pick
        if not (pool_dir / pick.get("svg", "@")).exists() or \
           not (pool_dir / pick.get("mp3", "@")).exists():
            pick = None
    if pick is None:
        rng = random.SystemRandom()
        svg = rng.choice(svgs)
        mp3 = rng.choice(mp3s)
        merged, viewbox, ratio = extract_paths(svg)
        anims = ANIMATIONS if merged else [x for x in ANIMATIONS if x != "drawOn"]
        pick = {"brand": brand, "animation": rng.choice(anims),
                "svg": svg.name, "mp3": mp3.name, "locked": True}
    else:
        merged, viewbox, ratio = extract_paths(pool_dir / pick["svg"])
        print(f"[logo] reusing locked pick (use --reroll to re-randomize)")

    svg_src = pool_dir / pick["svg"]
    mp3_src = pool_dir / pick["mp3"]

    # ---- beat id + audio (the clock) -----------------------------------------
    bid = beat["beat_id"] if beat else next_beat_id(beats)
    mp3_dir = folder / "mp3"
    mp3_dir.mkdir(exist_ok=True)
    mp3_dst = mp3_dir / f"beat-{bid}.mp3"
    # THE FULL-JINGLE LAW: never let the sting's sound be cut. Pad the copy
    # with a trailing silence (--tail) so the audible jingle ends strictly
    # inside the beat — frame rounding, clip conform, and mux -shortest can
    # then only ever trim silence, never sound. Always pad from the pristine
    # pool mp3 (fresh copy each run), never re-pad a padded file.
    jingle_dur = probe_dur(mp3_src)
    target = round(jingle_dur + max(0.0, a.tail), 3)
    r = subprocess.run([FFMPEG, "-y", "-i", str(mp3_src),
                        "-af", f"apad=whole_dur={target:.3f}",
                        "-c:a", "libmp3lame", "-q:a", "2", str(mp3_dst)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"[logo] ffmpeg pad failed:\n{r.stderr[-800:]}")
    dur = probe_dur(mp3_dst)
    if dur < jingle_dur:
        sys.exit(f"[logo] padded clock ({dur}s) shorter than the jingle "
                 f"({jingle_dur}s) — refusing to cut sound")

    # ---- svg into the remotion public tree -----------------------------------
    pub_rel = Path("logo-outro") / brand / pick["svg"]
    pub_dst = ART_HOME / "runtime" / "remotion" / "public" / pub_rel
    pub_dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(svg_src, pub_dst)

    aspect = "9:16" if sheet.get("metadata", {}).get("aspect_ratio") == "9:16" else "16:9"
    look = BRAND_LOOK[brand]
    props = {
        "svgFile": str(pub_rel),
        "animation": pick["animation"],
        "durationS": dur,
        "aspect": aspect,
        "aspectRatio": round(ratio, 4),
        "bg": look["bg"], "accent": look["accent"], "fill": look["fill"],
        "paths": merged or "", "viewBox": viewbox or "",
        "handle": a.handle,
    }

    new_beat = {
        "beat_id": bid,
        "act": "outro",
        "narration_text": "",
        "reuse_audio": f"mp3/beat-{bid}.mp3",   # generate_audio: measure, never TTS
        "audio_file": f"mp3/beat-{bid}.mp3",
        "actual_duration_s": dur,
        "new_visual_element": f"{brand} logo sting — {pick['animation']}",
        "shot": {"type": "REMOTION", "source": "own",
                 "remotion": {"pattern": PATTERN, "props": props, "picked": pick}},
    }
    if beat:
        beat.clear()
        beat.update(new_beat)
    else:
        beats.append(new_beat)
    sheet_path.write_text(json.dumps(sheet, indent=1, ensure_ascii=False))

    out_mp4 = folder / "media" / f"{bid}.mp4"
    rerender = a.reroll or (prev_dur is not None and abs(prev_dur - dur) > 0.01)
    if rerender and out_mp4.exists():
        out_mp4.unlink()   # new pick OR new clock — the old render is stale

    log_build(folder, f"logo: {bid} {brand} sting — {pick['animation']} + "
                      f"{pick['svg']} + {pick['mp3']} (jingle {jingle_dur}s + "
                      f"{a.tail}s tail = clock {dur}s, {aspect})"
                      f"{' [reroll]' if a.reroll else ''}")
    print(f"[logo] {bid}: {brand}  anim={pick['animation']}  svg={pick['svg']}  "
          f"mp3={pick['mp3']}  jingle={jingle_dur}s  clock={dur}s  aspect={aspect}")

    # ---- render (the one lawful Remotion path) + compile ----------------------
    scripts = ART_HOME / "runtime" / "scripts"
    if not a.no_render:
        cmd = [sys.executable, str(scripts / "remotion_scenes.py"), str(folder),
               "--only", bid] + (["--force"] if rerender else [])
        r = subprocess.run(cmd)   # foreground, inherits stdout — never background
        if r.returncode != 0:
            sys.exit(f"[logo] remotion_scenes.py failed for {bid}")
    if not a.no_compile:
        r = subprocess.run([sys.executable, str(scripts / "compile.py"),
                            str(folder), "--review"])
        if r.returncode != 0:
            sys.exit("[logo] compile failed")
    if a.no_render or a.no_compile:
        print(f"[logo] next: python3 runtime/scripts/remotion_scenes.py {folder} --only {bid}")
        print(f"[logo]       python3 runtime/scripts/compile.py {folder} --review")


if __name__ == "__main__":
    main()
