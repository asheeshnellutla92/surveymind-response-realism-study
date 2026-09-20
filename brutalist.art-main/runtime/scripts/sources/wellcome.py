"""
sources/wellcome.py — Wellcome Collection adapter
==================================================
Search: api.wellcomecollection.org/catalogue/v2/images
Full-res: IIIF Image API (convert info.json URL → /full/max/0/default.jpg).
License: per-item — reads locations[].license.id.
         Only returns items whose license is in OPEN_LICENSES.

API response shape (v2 images endpoint):
    {id, source:{id, title}, locations:[{url, license:{id}, credit}],
     thumbnail:{url, license:{id}, credit}}
"""
from __future__ import annotations

import re

ADAPTER_ID = "wellcome"
SEARCH_URL = "https://api.wellcomecollection.org/catalogue/v2/images"

OPEN_LICENSES = {
    "cc-by", "cc-by-2.0", "cc-by-4.0",
    "cc-by-sa", "cc-by-sa-2.0", "cc-by-sa-4.0",
    "cc0", "pdm",  # public domain mark
    "ogl",         # Open Government Licence
}


def _license_open(license_id: str) -> bool:
    return license_id.lower() in OPEN_LICENSES


def _iiif_to_thumbnail(info_url: str, width: int = 320) -> str:
    """Convert a IIIF info.json URL to a fixed-width image URL."""
    base = info_url.replace("/info.json", "")
    return f"{base}/full/{width},/0/default.jpg"


def _iiif_to_full(info_url: str) -> str:
    """Convert a IIIF info.json URL to a full-res image URL."""
    base = info_url.replace("/info.json", "")
    return f"{base}/full/max/0/default.jpg"


def search(query: str, top: int = 10) -> list[dict]:
    """Query Wellcome images API. Returns only open-licensed results."""
    try:
        import requests
    except ImportError:
        raise RuntimeError("'requests' not installed — pip install requests")
    if not query.strip():
        return []
    params = {
        "query":    query,
        "pageSize": min(top * 4, 100),  # fetch more to account for license filtering
    }
    try:
        r = requests.get(SEARCH_URL, params=params, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as exc:
        print(f"[wellcome-adapter] search failed: {exc}")
        return []

    results_raw = data.get("results", [])
    results = []
    for item in results_raw:
        if len(results) >= top:
            break
        item_id   = item.get("id", "")
        source    = item.get("source", {})
        work_id   = source.get("id", "")
        title     = source.get("title", item_id)

        # license from locations[] — take first open one
        license_id = ""
        iiif_url   = ""
        credit_str = "Wellcome Collection"
        for loc in item.get("locations", []):
            lid = (loc.get("license") or {}).get("id", "")
            if lid and _license_open(lid):
                license_id = lid
                iiif_url   = loc.get("url", "")
                credit_str = loc.get("credit", "Wellcome Collection")
                break

        if not license_id:
            # also check thumbnail.license as fallback
            thumb_loc = item.get("thumbnail") or {}
            thumb_lid = (thumb_loc.get("license") or {}).get("id", "")
            if thumb_lid and _license_open(thumb_lid):
                license_id = thumb_lid
                iiif_url   = thumb_loc.get("url", "")
                credit_str = thumb_loc.get("credit", "Wellcome Collection")

        if not license_id:
            continue  # skip non-open

        # thumbnail: prefer locations' IIIF URL, fall back to thumbnail field
        if not iiif_url:
            iiif_url = (item.get("thumbnail") or {}).get("url", "")

        thumb = _iiif_to_thumbnail(iiif_url) if iiif_url else ""

        results.append({
            "id":            item_id,
            "title":         title,
            "license":       license_id,
            "credit":        f"{credit_str}. Wellcome Collection.",
            "source":        "Wellcome Collection",
            "adapter":       ADAPTER_ID,
            "thumbnail_url": thumb,
            "object_type":   "",
            "date":          "",
            "unit":          "Wellcome",
            "source_url":    f"https://wellcomecollection.org/works/{work_id}",
            "_raw":          {"id": item_id, "work_id": work_id,
                              "iiif_url": iiif_url, "license": license_id},
        })
    return results


def resolve(record: dict) -> dict | None:
    """
    Resolve full-res image via Wellcome IIIF Image API.
    Converts the stored IIIF info.json URL to /full/max/0/default.jpg.
    Falls back to the works API to find an image IIIF endpoint.
    """
    raw = record.get("_raw", record)
    iiif_url = raw.get("iiif_url", "")

    if iiif_url:
        full_url = _iiif_to_full(iiif_url)
        return {
            "full_res_url": full_url,
            "license":      raw.get("license", record.get("license", "pdm")),
            "credit":       record.get("credit", "Wellcome Collection."),
        }

    # Fallback: fetch image record from the API to get IIIF URL
    try:
        import requests
    except ImportError:
        raise RuntimeError("'requests' not installed")
    item_id = raw.get("id") or record.get("id", "")
    if not item_id:
        return None
    img_url = f"https://api.wellcomecollection.org/catalogue/v2/images/{item_id}"
    try:
        r = requests.get(img_url, timeout=20)
        r.raise_for_status()
        idata = r.json()
    except Exception as exc:
        print(f"[wellcome-adapter] image fetch failed for {item_id}: {exc}")
        return None

    for loc in idata.get("locations", []):
        lid = (loc.get("license") or {}).get("id", "")
        if not _license_open(lid):
            continue
        url = loc.get("url", "")
        if not url:
            continue
        return {
            "full_res_url": _iiif_to_full(url),
            "license":      lid,
            "credit":       record.get("credit", "Wellcome Collection."),
        }
    return None
