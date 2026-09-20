#!/usr/bin/env python3
"""
source_core.py — shared fetch tail for all archive adapters
============================================================
Implements: download → Topaz upscale → shelve → provenance sidecar.
All per-source adapters call into this; they never duplicate the tail.

Callers (adapters) must call shelve_image() with a record dict containing:
    id          str   source-internal record id (unique within adapter)
    title       str   human-readable title
    license     str   license id (e.g. "CC0", "cc-by", "public-domain")
    credit      str   attribution line
    source      str   adapter id (e.g. "smithsonian", "nasa")
    source_url  str   permalink to the object on its source site

shelve_image() returns the Path to the shelved .jpg, or None on failure.
The sidecar is a JSON file at the same stem as the jpg.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ART_HOME = Path(__file__).resolve().parents[2]  # brutalist-art/
TPAI = (shutil.which("tpai") or
        "/Applications/Topaz Photo AI.app/Contents/Resources/bin/tpai")

OPEN_LICENSES = frozenset({
    "CC0", "cc-0", "cc-zero", "public-domain", "pd", "pddl",
    "cc-by", "cc-by-2.0", "cc-by-4.0",
    "cc-by-sa", "cc-by-nc",                 # usable with attribution
})


# ─── Path helpers ──────────────────────────────────────────────────────────────

def _slugify(text: str, max_len: int = 40) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower())
    return s.strip("-")[:max_len].rstrip("-")


def library_dir(adapter_id: str) -> Path:
    return ART_HOME / "library" / adapter_id / "images"


def library_paths(adapter_id: str, record_id: str, title: str) -> tuple[Path, Path]:
    """Return (jpg_path, sidecar_path) in library/<adapter_id>/images/."""
    stem = f"{adapter_id}-{_slugify(record_id, 28)}-{_slugify(title, 30)}"
    lib = library_dir(adapter_id)
    return lib / f"{stem}.jpg", lib / f"{stem}.source.json"


def already_shelved(adapter_id: str, record_id: str, title: str) -> Path | None:
    jpg, _ = library_paths(adapter_id, record_id, title)
    return jpg if jpg.exists() else None


# ─── Download ─────────────────────────────────────────────────────────────────

def download(url: str, dest: Path) -> bool:
    try:
        import requests
    except ImportError:
        raise RuntimeError("'requests' not installed — pip install requests")
    try:
        print(f"[fetch-core] Downloading {url[:90]} ...")
        r = requests.get(url, stream=True, timeout=90,
                         headers={"User-Agent": "bear-textbooks-image-pantry/1.0"})
        r.raise_for_status()
        with dest.open("wb") as f:
            for chunk in r.iter_content(65536):
                f.write(chunk)
        size_kb = dest.stat().st_size // 1024
        print(f"[fetch-core] Downloaded {size_kb} KB")
        return True
    except Exception as exc:
        print(f"[fetch-core] Download failed: {exc}")
        return False


# ─── Topaz upscale ────────────────────────────────────────────────────────────

def topaz_upscale(src: Path, out_dir: Path) -> Path | None:
    """
    Run Topaz Photo AI on src.
    Topaz writes <src.stem>.jpg into out_dir (it treats --output as a directory).
    Returns the output path, or None on failure/unavailability.
    """
    if not Path(TPAI).exists():
        print("[fetch-core] tpai not found — shelving original (no upscale)")
        return None
    out_dir.mkdir(parents=True, exist_ok=True)
    cmd = [TPAI, "--cli", str(src), "--output", str(out_dir),
           "--format", "jpg", "--upscale"]
    print("[fetch-core] Upscaling with Topaz Photo AI ...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[fetch-core] tpai rc={result.returncode}: "
              f"{(result.stderr or '').strip()[:200]}")
        return None
    # Topaz writes the file using the INPUT filename inside out_dir
    expected = out_dir / (src.stem + ".jpg")
    if expected.exists():
        out = expected
    else:
        jpgs = list(out_dir.glob("*.jpg"))
        out = jpgs[0] if jpgs else None
    if out:
        try:
            from PIL import Image as _PIL
            sw, sh = _PIL.open(src).size
            ow, oh = _PIL.open(out).size
            ratio = ow / sw if sw else 0
            flag = "OK" if ow > sw else "WARN — not larger than source"
            print(f"[fetch-core] tpai  {sw}×{sh} → {ow}×{oh}  ({ratio:.2f}×)  {flag}")
        except Exception:
            pass
    return out


# ─── Sidecar ─────────────────────────────────────────────────────────────────

def write_sidecar(sidecar: Path, record: dict, full_res_url: str) -> None:
    data = {
        "source":      record.get("source", "?"),
        "license":     record.get("license", "?"),
        "credit":      record.get("credit", ""),
        "id":          record.get("id", ""),
        "title":       record.get("title", ""),
        "url":         full_res_url,
        "source_url":  record.get("source_url", ""),
    }
    sidecar.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


# ─── Shelve ───────────────────────────────────────────────────────────────────

def shelve_image(adapter_id: str, record: dict, full_res_url: str) -> Path | None:
    """
    Fetch, Topaz-upscale, shelve, and sidecar one image.
    Returns the shelved .jpg path, or None on failure.
    Cached: already-shelved images return immediately.

    record dict fields used:
        id, title, license, credit, source, source_url
    """
    existing = already_shelved(adapter_id, record["id"], record["title"])
    if existing:
        print(f"[fetch-core] Already shelved: {existing}")
        return existing

    lib_jpg, lib_sidecar = library_paths(adapter_id, record["id"], record["title"])
    lib_jpg.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp_str:
        tmp = Path(tmp_str)
        dl = tmp / "image.jpg"
        if not download(full_res_url, dl):
            return None
        upscaled = topaz_upscale(dl, tmp / "topaz-out")
        shutil.copy2(upscaled if upscaled else dl, lib_jpg)

    write_sidecar(lib_sidecar, record, full_res_url)
    print(f"[fetch-core] Shelved:  {lib_jpg}")
    print(f"[fetch-core] Sidecar:  {lib_sidecar}")
    return lib_jpg


# ─── Pantry copy ─────────────────────────────────────────────────────────────

def copy_to_pantry(lib_jpg: Path, reel: Path, bid: str, slug: str) -> Path:
    pantry = reel / "pantry"
    pantry.mkdir(parents=True, exist_ok=True)
    dst = pantry / f"{bid}-{slug}.png"
    if lib_jpg.suffix.lower() == ".png":
        shutil.copy2(lib_jpg, dst)
    else:
        try:
            from PIL import Image
            Image.open(lib_jpg).convert("RGB").save(dst)
        except ImportError:
            dst = pantry / f"{bid}-{slug}.jpg"
            shutil.copy2(lib_jpg, dst)
    print(f"[fetch-core] Pantry:   {dst}")
    print("  LOOK at the file — if it holds, run pantry.py <reel> to intake.")
    return dst
