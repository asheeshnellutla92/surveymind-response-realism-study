"""
sources/nasa.py — NASA Image and Video Library adapter
=======================================================
Search: images-api.nasa.gov/search (no key required)
Full-res: images-api.nasa.gov/asset/<nasa_id> — picks largest image link.
License: all NASA media is public domain (US government work).
"""
from __future__ import annotations

import json
import re

ADAPTER_ID = "nasa"
SEARCH_URL = "https://images-api.nasa.gov/search"
ASSET_URL  = "https://images-api.nasa.gov/asset"

STOP_WORDS = {
    "the", "a", "an", "of", "to", "and", "with", "in", "on", "at", "as",
    "is", "it", "its", "for", "into", "that", "this", "from", "or", "by",
    "nasa", "image", "photo", "photograph", "view",
}


def _words(text: str) -> list[str]:
    ws = [w.lower() for w in re.split(r"[^a-zA-Z]+", text) if w]
    return [w for w in ws if len(w) >= 3 and w not in STOP_WORDS]


def search(query: str, top: int = 10) -> list[dict]:
    """Query NASA IVLA search API. Returns [] on network failure."""
    try:
        import requests
    except ImportError:
        raise RuntimeError("'requests' not installed — pip install requests")
    words = _words(query)
    if not words:
        return []
    params = {
        "q":          query,
        "media_type": "image",
        "page_size":  min(top * 3, 100),
    }
    try:
        r = requests.get(SEARCH_URL, params=params, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as exc:
        print(f"[nasa-adapter] search failed: {exc}")
        return []

    items = (data.get("collection", {})
                 .get("items", []))
    results = []
    for item in items:
        if len(results) >= top:
            break
        links = item.get("links", [])
        data_list = item.get("data", [])
        if not data_list:
            continue
        meta = data_list[0]
        nasa_id = meta.get("nasa_id", "")
        if not nasa_id:
            continue
        title = meta.get("title", nasa_id)
        desc = meta.get("description", "")
        # thumbnail is the first "preview" link
        thumb = ""
        for lk in links:
            if lk.get("rel") == "preview" and lk.get("href", "").lower().endswith(
                    (".jpg", ".jpeg", ".png", ".gif")):
                thumb = lk["href"]
                break
        results.append({
            "id":            nasa_id,
            "title":         title,
            "license":       "public-domain",
            "credit":        meta.get("photographer", "NASA"),
            "source":        "NASA Image and Video Library",
            "adapter":       ADAPTER_ID,
            "thumbnail_url": thumb,
            "object_type":   meta.get("media_type", "image"),
            "date":          (meta.get("date_created", "") or "")[:10],
            "unit":          meta.get("center", ""),
            "source_url":    f"https://images.nasa.gov/details/{nasa_id}",
            "description":   desc[:300],
            "_raw":          {"nasa_id": nasa_id, "meta": meta},
        })
    return results


def resolve(record: dict) -> dict | None:
    """
    Resolve full-res image URL via asset collection endpoint.
    Picks the largest image link (orig > large > ~orig in the collection).
    """
    try:
        import requests
    except ImportError:
        raise RuntimeError("'requests' not installed")
    raw = record.get("_raw", record)
    nasa_id = raw.get("nasa_id") or record.get("id", "")
    if not nasa_id:
        return None
    url = f"{ASSET_URL}/{nasa_id}"
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as exc:
        print(f"[nasa-adapter] asset fetch failed for {nasa_id}: {exc}")
        return None

    items = data.get("collection", {}).get("items", [])
    # collect all image hrefs; prefer ~orig then largest by guessed size
    hrefs = [it["href"] for it in items if "href" in it]
    image_hrefs = [h for h in hrefs if re.search(r"\.(jpg|jpeg|png|tif|tiff)$", h, re.I)]
    if not image_hrefs:
        return None
    # rank: ~orig > _large > anything else; fallback to first
    def _rank(h: str) -> int:
        hl = h.lower()
        if "~orig" in hl:
            return 0
        if "_large" in hl:
            return 1
        if "_medium" in hl:
            return 2
        return 3
    image_hrefs.sort(key=_rank)
    return {
        "full_res_url": image_hrefs[0],
        "license":      "public-domain",
        "credit":       record.get("credit", "NASA"),
    }
