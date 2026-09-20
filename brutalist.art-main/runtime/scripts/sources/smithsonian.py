"""
sources/smithsonian.py — Smithsonian Open Access adapter
=========================================================
Wraps the pre-built JSONL index (library/smithsonian/index.jsonl).
The index is built by smithsonian_index.py.

search() returns index records directly — they already have token scores.
resolve() uses the SI content-detail endpoint to get the full-res image URL
for API-indexed records; S3-indexed records have image_url stored directly.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ADAPTER_ID = "smithsonian"

ART_HOME = Path(__file__).resolve().parents[3]  # brutalist-art/
INDEX     = ART_HOME / "library" / "smithsonian" / "index.jsonl"
SI_API    = "https://api.si.edu/openaccess/api/v1.0"

STOP_WORDS = {
    "the", "a", "an", "of", "to", "and", "with", "in", "on", "at", "as",
    "is", "it", "its", "for", "into", "that", "this", "from", "or", "by",
    "national", "museum", "collection", "smithsonian", "institution",
}
_APPARATUS = {
    "computer", "mainframe", "console", "instrument", "apparatus", "device",
    "machine", "equipment", "calculator", "terminal", "processor", "component",
    "circuit", "hardware", "unit", "system", "workstation",
}
_EPHEMERA = {
    "documentation", "pamphlet", "manual", "publication", "brochure", "report",
    "catalog", "catalogue", "document", "paper", "book", "booklet", "journal",
    "newsletter", "flyer", "advertisement", "postcard", "poster",
}


def _words(text: str) -> list[str]:
    ws = [w.lower() for w in re.split(r"[^a-zA-Z]+", text) if w]
    return [w for w in ws if len(w) >= 3 and w not in STOP_WORDS]


def _score(rec: dict, words: list[str]) -> float:
    toks = set(rec.get("tokens", []))
    title_ws = set(w.lower() for w in re.split(r"[^a-zA-Z]+", rec.get("title", "")) if w)
    s = 0.0
    for w in words:
        if w in title_ws:
            s += 4.0
        elif w in toks:
            s += 2.0
        elif any(t.startswith(w) or w.startswith(t)
                 for t in toks if len(t) > 3 and len(w) > 3):
            s += 0.5
    ot = rec.get("object_type", "").lower()
    if any(a in ot for a in _APPARATUS):
        s += 1.5
    elif any(e in ot for e in _EPHEMERA):
        s -= 1.0
    return s


def search(query: str, top: int = 10) -> list[dict]:
    """Return scored index records. Returns [] if index doesn't exist."""
    if not INDEX.exists():
        return []
    words = _words(query)
    if not words:
        return []
    hits: list[tuple[float, dict]] = []
    with INDEX.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            s = _score(rec, words)
            if s > 0:
                hits.append((s, rec))
    hits.sort(key=lambda t: t[0], reverse=True)
    results = []
    for _, rec in hits[:top]:
        results.append({
            "id":            rec["id"],
            "title":         rec["title"],
            "license":       "CC0",
            "credit":        rec.get("credit", "Smithsonian Institution"),
            "source":        "Smithsonian Open Access",
            "adapter":       ADAPTER_ID,
            "thumbnail_url": rec.get("thumbnail_url", ""),
            "object_type":   rec.get("object_type", ""),
            "date":          rec.get("date", ""),
            "unit":          rec.get("unit", ""),
            "source_url":    f"https://si.edu/object/{rec['id']}",
            "_raw":          rec,  # for resolve()
        })
    return results


def resolve(record: dict) -> dict | None:
    """
    Resolve the full-res image URL for a search hit.
    Tries image_url from S3-indexed records first; then content-detail endpoint.
    Returns {full_res_url, license, credit} or None.
    """
    raw = record.get("_raw", record)
    # S3-indexed records store image_url directly
    if raw.get("image_url"):
        return {
            "full_res_url": raw["image_url"],
            "license":      "CC0",
            "credit":       raw.get("credit", "Smithsonian Institution"),
        }
    # API-indexed: resolve via content-detail endpoint
    api_key = _load_key()
    url = f"{SI_API}/content/{raw['id']}"
    params: dict = {}
    if api_key:
        params["api_key"] = api_key
    try:
        import requests
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as exc:
        print(f"[si-adapter] content-detail failed: {exc}")
        return None
    media_list = (data.get("response", {})
                      .get("content", {})
                      .get("descriptiveNonRepeating", {})
                      .get("online_media", {})
                      .get("media", []))
    for m in media_list:
        if not isinstance(m, dict):
            continue
        usage = m.get("usage", {})
        if isinstance(usage, dict) and usage.get("access") == "CC0":
            img_url = m.get("content", "")
            if img_url:
                return {
                    "full_res_url": img_url,
                    "license":      "CC0",
                    "credit":       raw.get("credit", "Smithsonian Institution"),
                }
    return None


def _load_key() -> str:
    import os
    for name in ("SI_API_KEY", "SMITHSONIAN_API_KEY"):
        if os.environ.get(name):
            return os.environ[name]
    env = ART_HOME / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("#"):
                continue
            for prefix in ("SI_API_KEY=", "SMITHSONIAN_API_KEY="):
                if line.startswith(prefix):
                    return line[len(prefix):].strip().strip('"').strip("'")
    return ""
