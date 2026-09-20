"""
sources/ — per-source adapters for the image pantry.

Each adapter exposes:
    ADAPTER_ID  str
    search(query, top=10) -> list[dict]
    resolve(record) -> dict | None   # {full_res_url, license, credit}

REGISTRY maps adapter_id -> module.
ALL_ADAPTERS is the ordered list for multi-source search.
"""
from __future__ import annotations

from . import smithsonian, nasa, wellcome, nlm_ihm

REGISTRY: dict[str, object] = {
    smithsonian.ADAPTER_ID: smithsonian,
    nasa.ADAPTER_ID:        nasa,
    wellcome.ADAPTER_ID:    wellcome,
    nlm_ihm.ADAPTER_ID:     nlm_ihm,
}

ALL_ADAPTERS: list = [smithsonian, nasa, wellcome, nlm_ihm]


def search_all(query: str, top_per_source: int = 5) -> list[dict]:
    """Search all registered adapters and return merged results."""
    results = []
    for adapter in ALL_ADAPTERS:
        try:
            hits = adapter.search(query, top=top_per_source)
            results.extend(hits)
        except Exception as exc:
            print(f"[sources] {adapter.ADAPTER_ID} search error: {exc}")
    return results
