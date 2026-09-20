"""
sources/nlm_ihm.py — NLM Digital Collections adapter
=====================================================
Search: collections.nlm.nih.gov/catalog.json?q=<query>&per_page=N
Full-res: iiif.nlm.nih.gov/iiif/2/{encoded_uid}/full/max/0/default.jpg
License: reads drep.rights text; only returns items with public-domain language.
Collection: Images from the History of Medicine (IHM) — portraits, instruments.

IIIF URL pattern:
    uid  = "nlm:nlmuid-101674763-img"
    IIIF = "https://iiif.nlm.nih.gov/iiif/2/nlm%3Anlmuid-101674763-img/full/max/0/default.jpg"
"""
from __future__ import annotations

import re
from urllib.parse import quote

ADAPTER_ID  = "nlm_ihm"
CATALOG_URL = "https://collections.nlm.nih.gov/catalog.json"
IIIF_BASE   = "https://iiif.nlm.nih.gov/iiif/2"

_OPEN_PHRASES = [
    "no known restrictions",
    "public domain",
    "no copyright",
    "unrestricted",
    "believes this item to be in the public domain",
    "nlm does not hold copyright",
]


def _rights_open(rights_text: str) -> bool:
    rt = (rights_text or "").lower()
    return any(phrase in rt for phrase in _OPEN_PHRASES)


def _iiif_url(uid: str) -> str:
    """Build full-res IIIF URL from the NLM catalog uid."""
    return f"{IIIF_BASE}/{quote(uid, safe='')}/full/max/0/default.jpg"


def _thumb_url(uid: str, width: int = 320) -> str:
    return f"{IIIF_BASE}/{quote(uid, safe='')}/full/{width},/0/default.jpg"


def _attr_value(attrs: dict, key: str) -> str:
    """Extract the plain-text value from an NLM JSON:API attribute field."""
    field = attrs.get(key)
    if not field:
        return ""
    if isinstance(field, dict):
        v = field.get("attributes", {}).get("value", "")
        # strip HTML tags
        return re.sub(r"<[^>]+>", "", v).strip()
    return str(field).strip()


def search(query: str, top: int = 10) -> list[dict]:
    """
    Query NLM Digital Collections catalog. Returns items with open/PD rights only.
    Filters to Still image format and IHM collection when possible.
    """
    try:
        import requests
    except ImportError:
        raise RuntimeError("'requests' not installed — pip install requests")
    if not query.strip():
        return []
    params = {
        "q":                               query,
        "f[drep2.format][]":               "Still image",
        "f[drep2.isMemberOfCollection][]": "DREPIHM",
        "per_page":                        min(top * 4, 50),
    }
    try:
        r = requests.get(CATALOG_URL, params=params, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as exc:
        print(f"[nlm-adapter] search failed: {exc}")
        return []

    items_raw = data.get("data", [])
    # If IHM filter returns nothing, retry without it
    if not items_raw:
        params2 = {k: v for k, v in params.items()
                   if k != "f[drep2.isMemberOfCollection][]"}
        try:
            r2 = requests.get(CATALOG_URL, params=params2, timeout=20)
            r2.raise_for_status()
            data = r2.json()
            items_raw = data.get("data", [])
        except Exception:
            pass

    results = []
    for item in items_raw:
        if len(results) >= top:
            break
        uid   = item.get("id", "")
        attrs = item.get("attributes", {})
        title = attrs.get("title", uid)
        if isinstance(title, dict):
            title = title.get("attributes", {}).get("value", uid)

        # Fetch full item record to check rights (the listing has minimal attrs)
        full = _fetch_item(uid)
        if full is None:
            continue
        rights = _attr_value(full, "drep.rights")
        if not _rights_open(rights):
            continue

        date_raw  = _attr_value(full, "drep.pubConcat") or _attr_value(full, "drep2.pubConcat")
        thumb_url = _thumb_url(uid)

        results.append({
            "id":            uid,
            "title":         title,
            "license":       "public-domain",
            "credit":        "National Library of Medicine",
            "source":        "NLM Digital Collections",
            "adapter":       ADAPTER_ID,
            "thumbnail_url": thumb_url,
            "object_type":   "still image",
            "date":          date_raw[:10] if date_raw else "",
            "unit":          "NLM",
            "source_url":    f"https://collections.nlm.nih.gov/catalog/{uid}",
            "_raw":          {"uid": uid},
        })
    return results


def _fetch_item(uid: str) -> dict | None:
    """Fetch full item record from catalog."""
    try:
        import requests
        r = requests.get(f"https://collections.nlm.nih.gov/catalog/{uid}.json",
                         timeout=15)
        if r.status_code == 200:
            return r.json().get("data", {}).get("attributes", {})
    except Exception:
        pass
    return None


def resolve(record: dict) -> dict | None:
    """
    Resolve full-res image URL via NLM IIIF.
    The IIIF URL is constructed directly from the catalog uid.
    """
    raw = record.get("_raw", record)
    uid = raw.get("uid") or record.get("id", "")
    if not uid:
        return None
    return {
        "full_res_url": _iiif_url(uid),
        "license":      "public-domain",
        "credit":       "National Library of Medicine",
    }
