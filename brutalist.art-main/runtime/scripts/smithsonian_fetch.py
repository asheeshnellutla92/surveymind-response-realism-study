#!/usr/bin/env python3
"""
smithsonian_fetch.py — fetch, Topaz-upscale, and shelve one SI CC0 image
=========================================================================
METADATA-FIRST: the index must already be built before you fetch.
Images are downloaded one at a time, on explicit accept, never in bulk.

Architecture
------------
The index stores record_id (not image_url) for API-indexed records.
Full-res image URL is resolved at fetch time by calling the SI content-detail
endpoint:  GET https://api.si.edu/openaccess/api/v1.0/content/{id}?api_key=KEY

S3-indexed records (built with smithsonian_index.py --s3) have image_url stored
directly — those skip the resolve step.

Workflow:
  1. Resolve the object — by SI record id or by text query against the index.
  2. Resolve the full-res CC0 image URL via content-detail endpoint (if needed).
  3. Download the full-res CC0 image.
  4. Upscale with Topaz Photo AI (tpai).
  5. Shelve into library/smithsonian/images/ with a mandatory provenance sidecar.
  6. Optionally copy into <reel>/pantry/<BID>-<slug>.png for pantry intake.

Usage (from brutalist-art/ or books/):
    # Lookup, download, upscale, shelve (no pantry copy):
    python3 runtime/scripts/smithsonian_fetch.py --id nmah_12345

    # Same but also drop into a reel's pantry:
    python3 runtime/scripts/smithsonian_fetch.py --id nmah_12345 \\
        --copy ../physics-qm/youtube/my-reel --beat B07

    # Search by terms (shows candidates; prompts before fetch):
    python3 runtime/scripts/smithsonian_fetch.py "UNIVAC computer console"

    # Non-interactive: auto-accept the top hit (careful):
    python3 runtime/scripts/smithsonian_fetch.py "UNIVAC" --yes

    # Show what's already shelved:
    python3 runtime/scripts/smithsonian_fetch.py --list

SI_API_KEY is read from .env or the environment.  Without a key the content-detail
call is still attempted (SI allows limited anonymous use), but rate limits are tighter.
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ART_HOME = Path(__file__).resolve().parents[2]  # brutalist-art/
LIBRARY  = ART_HOME / "library" / "smithsonian"
INDEX    = LIBRARY / "index.jsonl"
IMAGES   = LIBRARY / "images"

SI_API_BASE = "https://api.si.edu/openaccess/api/v1.0"

TPAI = (shutil.which("tpai") or
        "/Applications/Topaz Photo AI.app/Contents/Resources/bin/tpai")

STOP_WORDS = {
    "the", "a", "an", "of", "to", "and", "with", "in", "on", "at", "as",
    "is", "it", "its", "for", "into", "that", "this", "from", "or", "by",
    "not", "was", "are", "has", "had", "but", "one", "two", "three",
    "national", "museum", "collection", "smithsonian", "institution",
}

# object_type pre-ranking: apparatus → prefer; ephemera → penalise
APPARATUS_TYPES = {
    "computer", "mainframe", "console", "instrument", "apparatus",
    "device", "machine", "equipment", "calculator", "terminal",
    "processor", "component", "circuit", "hardware", "unit",
    "system", "workstation", "printer", "display", "monitor",
}
EPHEMERA_TYPES = {
    "documentation", "pamphlet", "manual", "publication", "brochure",
    "report", "catalog", "catalogue", "document", "paper", "book",
    "booklet", "journal", "newsletter", "flyer", "advertisement",
    "photograph", "postcard", "poster", "press release",
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _slugify(text: str, max_len: int = 40) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower())
    return s.strip("-")[:max_len].rstrip("-")


def _term_words(terms: str) -> list[str]:
    words = [w.lower() for w in re.split(r"[^a-zA-Z]+", terms) if w]
    return [w for w in words if len(w) >= 3 and w not in STOP_WORDS]


def _object_type_bonus(rec: dict) -> float:
    ot = rec.get("object_type", "").lower()
    if not ot:
        return 0.0
    for atype in APPARATUS_TYPES:
        if atype in ot:
            return 1.5
    for etype in EPHEMERA_TYPES:
        if etype in ot:
            return -1.0
    return 0.0


def _score(rec: dict, words: list[str]) -> float:
    toks = set(rec.get("tokens", []))
    title_words = set(w.lower() for w in re.split(r"[^a-zA-Z]+", rec.get("title", "")) if w)
    s = 0.0
    for w in words:
        if w in title_words:
            s += 4.0
        elif w in toks:
            s += 2.0
        elif any(t.startswith(w) or w.startswith(t) for t in toks if len(t) > 3 and len(w) > 3):
            s += 0.5
    s += _object_type_bonus(rec)
    return s


def _load_env_key() -> str:
    """Read SI_API_KEY or SMITHSONIAN_API_KEY from .env or environment."""
    for name in ("SI_API_KEY", "SMITHSONIAN_API_KEY"):
        if os.environ.get(name):
            return os.environ[name]
    env_file = ART_HOME / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("#"):
                continue
            for prefix in ("SI_API_KEY=", "SMITHSONIAN_API_KEY="):
                if line.startswith(prefix):
                    val = line[len(prefix):].strip().strip('"').strip("'")
                    if val:
                        return val
    return ""


def _load_index() -> list[dict]:
    if not INDEX.exists():
        sys.exit(f"[si-fetch] No index at {INDEX}\n"
                 "  Build it first: python3 runtime/scripts/smithsonian_index.py\n"
                 "  (or --s3 for keyless streaming)")
    import json
    recs: list[dict] = []
    with INDEX.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                recs.append(json.loads(line))
            except Exception:
                pass
    return recs


def _search(terms: str, top: int = 10) -> list[dict]:
    recs = _load_index()
    words = _term_words(terms)
    if not words:
        return []
    ranked = sorted(recs, key=lambda r: _score(r, words), reverse=True)
    return [r for r in ranked if _score(r, words) > 0][:top]


def _get_by_id(oid: str) -> dict | None:
    import json
    if not INDEX.exists():
        return None
    with INDEX.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                if rec.get("id") == oid:
                    return rec
            except Exception:
                pass
    return None


def _library_path(rec: dict) -> tuple[Path, Path]:
    """Return (jpg_path, sidecar_path) in library/smithsonian/images/."""
    slug = _slugify(rec["title"])
    stem = f"si-{rec['id']}-{slug}"
    return IMAGES / f"{stem}.jpg", IMAGES / f"{stem}.source.txt"


def _already_shelved(rec: dict) -> Path | None:
    lib, _ = _library_path(rec)
    return lib if lib.exists() else None


# ─── URL resolution ────────────────────────────────────────────────────────────

def _resolve_image_url(record_id: str, api_key: str) -> str | None:
    """
    Call GET /content/{record_id} to find the CC0 full-res image URL.
    Parses response.content.descriptiveNonRepeating.online_media.media[]
    Returns the first CC0 Images 'content' field, or None if not found.
    """
    try:
        import requests
    except ImportError:
        sys.exit("[si-fetch] 'requests' not installed — pip install requests")

    url = f"{SI_API_BASE}/content/{record_id}"
    params: dict = {}
    if api_key:
        params["api_key"] = api_key

    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as exc:
        print(f"[si-fetch] content-detail request failed for {record_id}: {exc}")
        return None

    # Navigate: response → content → descriptiveNonRepeating → online_media → media[]
    resp = data.get("response", {})
    content = resp.get("content", {})
    dnr = content.get("descriptiveNonRepeating", {})
    online_media = dnr.get("online_media", {})
    media_list = online_media.get("media", [])

    if not media_list:
        # Some records nest media differently — try top-level content.online_media
        media_list = content.get("online_media", {}).get("media", [])

    for item in media_list:
        if not isinstance(item, dict):
            continue
        media_type = item.get("type", "")
        usage = item.get("usage", {})
        access = usage.get("access", "") if isinstance(usage, dict) else ""
        if "Images" in media_type and access == "CC0":
            img_url = item.get("content", "")
            if img_url:
                return img_url

    # Fallback: any CC0 media content
    for item in media_list:
        if not isinstance(item, dict):
            continue
        usage = item.get("usage", {})
        access = usage.get("access", "") if isinstance(usage, dict) else ""
        if access == "CC0":
            img_url = item.get("content", "")
            if img_url:
                return img_url

    return None


# ─── Core operations ──────────────────────────────────────────────────────────

def _download(url: str, dest: Path) -> bool:
    try:
        import requests
    except ImportError:
        sys.exit("[si-fetch] 'requests' not installed — pip install requests")
    try:
        print(f"[si-fetch] Downloading {url[:80]} ...")
        r = requests.get(url, stream=True, timeout=60)
        r.raise_for_status()
        with dest.open("wb") as fout:
            for chunk in r.iter_content(65536):
                fout.write(chunk)
        return True
    except Exception as exc:
        print(f"[si-fetch] Download failed: {exc}")
        return False


def _upscale(src: Path, out_dir: Path) -> Path | None:
    """Run tpai on src, return the output file path or None on failure."""
    if not Path(TPAI).exists():
        print(f"[si-fetch] tpai not found at {TPAI} — shelving original (no upscale)")
        return None

    out_dir.mkdir(parents=True, exist_ok=True)
    cmd = [TPAI, "--cli", str(src), "--output", str(out_dir), "--format", "jpg", "--upscale"]
    print(f"[si-fetch] Upscaling with Topaz Photo AI ...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        stderr = (result.stderr or "").strip()
        print(f"[si-fetch] tpai returned rc={result.returncode}: {stderr[:300]}")
        return None

    # Topaz writes <stem>.jpg into out_dir
    expected = out_dir / (src.stem + ".jpg")
    if expected.exists():
        out = expected
    else:
        jpgs = list(out_dir.glob("*.jpg"))
        out = jpgs[0] if jpgs else None

    if out:
        try:
            from PIL import Image as _PIL
            src_w, src_h = _PIL.open(src).size
            out_w, out_h = _PIL.open(out).size
            ratio = out_w / src_w if src_w else 0
            status = "OK" if out_w > src_w else "WARN — not larger than source"
            print(f"[si-fetch] tpai  {src_w}x{src_h} -> {out_w}x{out_h}  "
                  f"({ratio:.2f}x)  {status}")
        except Exception:
            pass

    return out


def _write_sidecar(sidecar: Path, rec: dict, image_url: str) -> None:
    sidecar.write_text(
        f"CC0\n"
        f"SI_ID: {rec['id']}\n"
        f"Title: {rec['title']}\n"
        f"Unit: {rec['unit']}\n"
        f"Credit: {rec['credit']}\n"
        f"Source URL: {image_url}\n"
        f"License: CC0 — Smithsonian Open Access https://www.si.edu/openaccess\n",
        encoding="utf-8",
    )


def _fetch_and_shelve(rec: dict, api_key: str) -> Path | None:
    """
    Resolve image URL, download, upscale, shelve the CC0 image for a given index record.
    Returns the shelved .jpg path, or None on failure.
    Already-shelved images are returned immediately (no re-download).
    """
    existing = _already_shelved(rec)
    if existing:
        print(f"[si-fetch] Already shelved: {existing}")
        return existing

    # Resolve image URL: S3-indexed records include it; API-indexed records need a content call
    image_url = rec.get("image_url", "")
    if not image_url:
        print(f"[si-fetch] Resolving full-res URL via content-detail endpoint ...")
        image_url = _resolve_image_url(rec["id"], api_key)
        if not image_url:
            print(f"[si-fetch] Could not resolve image URL for {rec['id']} — skipping")
            return None

    IMAGES.mkdir(parents=True, exist_ok=True)
    lib_jpg, lib_sidecar = _library_path(rec)

    with tempfile.TemporaryDirectory() as tmp_str:
        tmp = Path(tmp_str)
        dl_path = tmp / f"dl-{rec['id']}.jpg"

        if not _download(image_url, dl_path):
            return None

        topaz_dir = tmp / "topaz-out"
        upscaled = _upscale(dl_path, topaz_dir)

        if upscaled:
            shutil.copy2(upscaled, lib_jpg)
            print(f"[si-fetch] Shelved (Topaz-upscaled): {lib_jpg}")
        else:
            shutil.copy2(dl_path, lib_jpg)
            print(f"[si-fetch] Shelved (original, no Topaz): {lib_jpg}")

    _write_sidecar(lib_sidecar, rec, image_url)
    print(f"[si-fetch] Sidecar: {lib_sidecar}")
    return lib_jpg


def _copy_to_pantry(lib_jpg: Path, reel: Path, bid: str, slug: str) -> Path:
    pantry = reel / "pantry"
    pantry.mkdir(parents=True, exist_ok=True)
    dst = pantry / f"{bid}-{slug}.png"
    # pantry.py expects PNG; convert if needed
    if lib_jpg.suffix.lower() == ".png":
        shutil.copy2(lib_jpg, dst)
    else:
        try:
            from PIL import Image
            Image.open(lib_jpg).convert("RGB").save(dst)
        except ImportError:
            # fallback: copy as .jpg with .png extension — pantry will ingest by BID prefix
            dst = pantry / f"{bid}-{slug}.jpg"
            shutil.copy2(lib_jpg, dst)
    print(f"[si-fetch] Copied to pantry: {dst}")
    print("  next: LOOK at it; if it holds, run  python3 runtime/scripts/pantry.py <reel>")
    print("  Set shot.focus per the subject; sidecar is pre-filled (CC0).")
    return dst


def _list_shelved() -> None:
    if not IMAGES.exists() or not any(IMAGES.glob("si-*.jpg")):
        print("[si-fetch] No shelved images yet.")
        return
    jpgs = sorted(IMAGES.glob("si-*.jpg"))
    print(f"[si-fetch] {len(jpgs)} image(s) in library:")
    for p in jpgs:
        sc = IMAGES / (p.stem + ".source.txt")
        cred = ""
        if sc.exists():
            for line in sc.read_text().splitlines():
                if line.startswith("Title:"):
                    cred = line[6:].strip()
                    break
        print(f"  {p.stem:<60} {cred[:50]}")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("query", nargs="?", default="",
                    help="text search terms (ignored when --id is given)")
    ap.add_argument("--id", default="",
                    help="fetch a specific SI object id directly")
    ap.add_argument("--api-key", default="",
                    help="SI API key (default: SI_API_KEY from .env or environment)")
    ap.add_argument("--copy", type=Path, default=None, metavar="REEL",
                    help="reel folder — copy the shelved image into REEL/pantry/")
    ap.add_argument("--beat", default="", metavar="BID",
                    help="beat id prefix for pantry file (required with --copy)")
    ap.add_argument("--top", type=int, default=10,
                    help="number of search candidates to show (default 10)")
    ap.add_argument("--yes", action="store_true",
                    help="non-interactive: auto-accept top search hit")
    ap.add_argument("--list", action="store_true",
                    help="list shelved images and exit")
    a = ap.parse_args()

    if a.list:
        _list_shelved()
        return 0

    if a.copy and not a.beat:
        sys.exit("[si-fetch] --copy requires --beat BID")

    api_key = a.api_key or _load_env_key()

    # Resolve the target record
    rec: dict | None = None

    if a.id:
        rec = _get_by_id(a.id)
        if rec is None:
            sys.exit(f"[si-fetch] id '{a.id}' not found in index. "
                     "Run smithsonian_index.py if the index is empty.")
    elif a.query:
        hits = _search(a.query, top=a.top)
        if not hits:
            print(f"[si-fetch] No index hits for '{a.query}'.")
            print("  Build/update the index:  python3 runtime/scripts/smithsonian_index.py")
            return 1

        print(f"[si-fetch] Top {len(hits)} match(es) for '{a.query}':\n")
        for i, h in enumerate(hits):
            ot = f"  [{h['object_type']}]" if h.get("object_type") else ""
            date = f"  {h['date']}" if h.get("date") else ""
            print(f"  [{i+1}]  {h['id']:<30}  {h['unit']:<8}  {h['title'][:55]}{ot}{date}")
            if h.get("thumbnail_url"):
                print(f"         thumbnail: {h['thumbnail_url']}")
        print()

        if a.yes:
            rec = hits[0]
            print(f"[si-fetch] --yes: auto-accepting [{1}] {rec['title'][:60]}")
        else:
            choice_str = input(
                "Enter number to fetch (or 0 to abort, or an SI object id): "
            ).strip()
            if choice_str == "0" or not choice_str:
                print("[si-fetch] Aborted.")
                return 0
            if choice_str.isdigit():
                idx = int(choice_str) - 1
                if 0 <= idx < len(hits):
                    rec = hits[idx]
                else:
                    sys.exit(f"[si-fetch] Choice {choice_str} out of range.")
            else:
                # Treat as explicit id
                rec = _get_by_id(choice_str)
                if rec is None:
                    sys.exit(f"[si-fetch] id '{choice_str}' not found in index.")
    else:
        ap.print_help()
        return 1

    # Fetch, upscale, shelve
    print(f"\n[si-fetch] Fetching: {rec['id']} — {rec['title'][:60]}")
    print(f"           Unit: {rec['unit']}  |  Credit: {rec['credit'][:60]}")
    if rec.get("object_type"):
        print(f"           Type: {rec['object_type']}")
    lib_jpg = _fetch_and_shelve(rec, api_key)
    if lib_jpg is None:
        return 1

    # Optionally copy to reel pantry
    if a.copy:
        slug = _slugify(rec["title"])
        _copy_to_pantry(lib_jpg, a.copy, a.beat, slug)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
