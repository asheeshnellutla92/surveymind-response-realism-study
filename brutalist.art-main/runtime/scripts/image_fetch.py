#!/usr/bin/env python3
"""
image_fetch.py — multi-source archival image fetch tool
========================================================
Fetches, Topaz-upscales, shelves, and optionally drops into a reel pantry.
Replaces the SI-specific smithsonian_fetch.py for multi-source use.

Usage:
    python3 image_fetch.py --source <adapter_id> --id <record_id> [options]
    python3 image_fetch.py --source smithsonian --id npg_NPG.78.164 \\
                           --copy cancer-biology/youtube/my-reel --beat B04

Adapters: smithsonian, nasa, wellcome, nlm_ihm

The adapter's search() index must already know the record (Smithsonian: index.jsonl).
For non-indexed adapters (nasa, wellcome, nlm_ihm), --url may be supplied directly
to bypass resolve() and shelve a known image URL.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Make sure the scripts/ dir is on the path when run directly
_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))

from sources import REGISTRY
import source_core as core

ART_HOME = Path(__file__).resolve().parents[2]  # brutalist-art/


def _find_record(adapter, record_id: str) -> dict | None:
    """Search the adapter for a specific ID."""
    # For Smithsonian: scan the index directly
    if hasattr(adapter, "INDEX"):
        import json
        idx = adapter.INDEX
        if idx.exists():
            with idx.open(encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        rec = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if rec.get("id") == record_id:
                        return {
                            "id":          rec["id"],
                            "title":       rec["title"],
                            "license":     "CC0",
                            "credit":      rec.get("credit", "Smithsonian Institution"),
                            "source":      "Smithsonian Open Access",
                            "adapter":     adapter.ADAPTER_ID,
                            "thumbnail_url": rec.get("thumbnail_url", ""),
                            "object_type": rec.get("object_type", ""),
                            "date":        rec.get("date", ""),
                            "unit":        rec.get("unit", ""),
                            "source_url":  f"https://si.edu/object/{rec['id']}",
                            "_raw":        rec,
                        }
    # Generic fallback: search by ID as query, match exactly
    hits = adapter.search(record_id, top=20)
    for h in hits:
        if h.get("id") == record_id:
            return h
    return None


def main() -> None:
    ap = argparse.ArgumentParser(description="Fetch + shelve an archival image")
    ap.add_argument("--source", required=True,
                    help="Adapter ID: smithsonian | nasa | wellcome | nlm_ihm")
    ap.add_argument("--id", required=True, dest="record_id",
                    help="Source-internal record ID")
    ap.add_argument("--url", default="",
                    help="Override: use this URL directly (skips resolve())")
    ap.add_argument("--title", default="",
                    help="Override title (used in filename)")
    ap.add_argument("--copy", default="",
                    help="Path to reel dir — copy shelved image into reel/pantry/")
    ap.add_argument("--beat", default="B04",
                    help="Beat ID for pantry filename (default B04)")
    ap.add_argument("--slug", default="",
                    help="Slug for pantry filename (default: derived from title)")
    args = ap.parse_args()

    adapter = REGISTRY.get(args.source)
    if adapter is None:
        print(f"[image-fetch] Unknown source '{args.source}'. "
              f"Available: {', '.join(REGISTRY)}")
        sys.exit(1)

    # Build a minimal record if we have a direct URL
    if args.url:
        record: dict = {
            "id":         args.record_id,
            "title":      args.title or args.record_id,
            "license":    "public-domain",
            "credit":     args.source.upper(),
            "source":     args.source,
            "adapter":    args.source,
            "source_url": args.url,
        }
        full_res_url = args.url
    else:
        print(f"[image-fetch] Looking up {args.record_id} in {args.source} ...")
        record = _find_record(adapter, args.record_id)
        if record is None:
            print(f"[image-fetch] Record '{args.record_id}' not found in {args.source}.")
            sys.exit(1)
        if args.title:
            record["title"] = args.title
        print(f"[image-fetch] Found: {record['title']}")
        print(f"[image-fetch] Resolving full-res URL ...")
        resolved = adapter.resolve(record)
        if resolved is None:
            print(f"[image-fetch] Could not resolve a full-res image URL.")
            sys.exit(1)
        full_res_url = resolved["full_res_url"]
        record["license"] = resolved.get("license", record.get("license", "?"))
        record["credit"]  = resolved.get("credit",  record.get("credit",  ""))
        print(f"[image-fetch] Full-res: {full_res_url[:100]}")

    # Shelve
    lib_jpg = core.shelve_image(args.source, record, full_res_url)
    if lib_jpg is None:
        print("[image-fetch] Shelve failed.")
        sys.exit(1)

    # Pantry copy
    if args.copy:
        reel = Path(args.copy)
        if not reel.is_absolute():
            reel = ART_HOME.parent / reel  # relative to books/
        slug = args.slug or core._slugify(record["title"], 30)
        core.copy_to_pantry(lib_jpg, reel, args.beat, slug)


if __name__ == "__main__":
    main()
