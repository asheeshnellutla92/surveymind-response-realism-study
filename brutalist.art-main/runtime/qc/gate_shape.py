#!/usr/bin/env python3
"""
gate_shape.py — GATE SHAPE: enforce chart-shape declarations on finance reels.

The finance skill spec (SKILL.md §Shape logic, locked) is deterministic:
  INCOME_STMT  → sankey       (flow)
  CASH_FLOW    → sankey       (flow)
  BALANCE_SHEET → mirrored-bar (snapshot — NEVER a Sankey)
  SEGMENTS     → stacked-bar  (composition × time)
  SECTOR       → dot-plot     (distribution)

A bar chart where the spec calls for a Sankey is not a near-miss.
It is the failure mode. This gate prevents it from building.

Rules enforced:
  1. If the reel has any FINANCE beat (act in FINANCE_ACTS) OR metadata.ticker
     is set → it is a finance reel and all finance Manim beats must declare
     `shape` in the beat (top-level `shape`) or in `shot.manim.shape`.
  2. Missing shape on a finance Manim beat → UNSPECIFIED (exit 2).
  3. Shape present but mismatching REQUIRED_SHAPES[act] → MISMATCH (exit 2).
  4. Non-finance reels skip all checks (shape is optional elsewhere).
  5. Finance Manim beats where `shape` is correct → PASS.

The shape field goes on the beat itself:
    { "beat_id": "B04", "act": "INCOME_STMT", "shape": "sankey", ... }
or inside shot.manim:
    { "shot": { "manim": { "shape": "sankey", ... } } }
Beat-level wins over shot.manim if both are present.

Exit 2 on any FAIL (blocks the build). Exit 0 clean.
Usage: gate_shape.py <reel_dir_or_beat_sheet.json> [--quiet]
"""
import json, os, sys, argparse

# Act identifiers that require a chart shape
FINANCE_ACTS = {
    "INCOME_STMT",
    "CASH_FLOW",
    "BALANCE_SHEET",
    "SEGMENTS",
    "SECTOR",
}

# The one correct shape for each finance act — no substitutions.
# SKILL.md §Shape logic, locked:
#   "A bar chart where the spec calls for a Sankey is not a near-miss.
#    It is the failure mode."
REQUIRED_SHAPES = {
    "INCOME_STMT":   "sankey",
    "CASH_FLOW":     "sankey",
    "BALANCE_SHEET": "mirrored-bar",
    "SEGMENTS":      "stacked-bar",
    "SECTOR":        "dot-plot",
}

VALID_SHAPES = set(REQUIRED_SHAPES.values())

# Remotion pattern → shape (the component encodes the chart type)
REMOTION_PATTERN_SHAPES = {
    "FinanceSankey":      "sankey",
    "FinanceMirroredBar": "mirrored-bar",
    "FinanceStackedBar":  "stacked-bar",
    "FinanceDotPlot":     "dot-plot",
}


def load_beat_sheet(path):
    if os.path.isdir(path):
        path = os.path.join(path, "beat_sheet.json")
    with open(path) as f:
        return json.load(f), path


def get_shape(beat):
    """Return the declared shape for a beat, checking beat-level first."""
    s = beat.get("shape")
    if s:
        return str(s).strip().lower()
    manim = (beat.get("shot") or {}).get("manim") or {}
    s = manim.get("shape")
    if s:
        return str(s).strip().lower()
    return None


def is_manim_beat(beat):
    sh = beat.get("shot") or {}
    return (
        sh.get("source") == "manim"
        or sh.get("type") in ("GRAPHIC", "MANIM")
        and bool(sh.get("manim"))
    )


def get_remotion_pattern(beat):
    """Return the Remotion pattern name if this is a Remotion finance chart beat."""
    sh = beat.get("shot") or {}
    if sh.get("source") != "remotion":
        return None
    pattern = ((sh.get("remotion") or {}).get("pattern") or "")
    return pattern if pattern in REMOTION_PATTERN_SHAPES else None


def is_finance_reel(bs):
    if (bs.get("metadata") or {}).get("ticker"):
        return True
    for b in bs.get("beats") or []:
        if b.get("act") in FINANCE_ACTS:
            return True
    return False


def check(bs):
    defects = []
    if not is_finance_reel(bs):
        return defects  # GATE SHAPE only applies to finance reels

    for b in bs.get("beats") or []:
        bid = b.get("beat_id", "?")
        act = b.get("act", "")
        if act not in FINANCE_ACTS:
            continue

        required = REQUIRED_SHAPES[act]

        if is_manim_beat(b):
            # Manim beats: check explicit `shape` field
            shape = get_shape(b)
            if shape is None:
                defects.append((bid, "UNSPECIFIED",
                    f"act={act} has no `shape` field. Must be {required!r}. "
                    f"Add to beat or shot.manim. "
                    f"A missing shape is treated as an unknown chart type — "
                    f"the series is defined against boilerplate bar charts."))
            elif shape != required:
                defects.append((bid, "MISMATCH",
                    f"act={act} declares shape={shape!r} but requires {required!r}. "
                    f"SKILL.md §Shape logic is locked: "
                    f"{'Flow → Sankey' if required == 'sankey' else ''}"
                    f"{'Snapshot → mirrored bar' if required == 'mirrored-bar' else ''}"
                    f"{'Composition × time → stacked bar' if required == 'stacked-bar' else ''}"
                    f"{'Distribution → dot-plot' if required == 'dot-plot' else ''}"
                    f". A {shape!r} here is not a near-miss — it is the failure mode."))
            # else: PASS

        else:
            # Remotion finance chart beats: verify the pattern encodes the right shape
            pattern = get_remotion_pattern(b)
            if pattern is not None:
                effective_shape = REMOTION_PATTERN_SHAPES[pattern]
                if effective_shape != required:
                    defects.append((bid, "MISMATCH",
                        f"act={act} uses Remotion pattern {pattern!r} "
                        f"(shape={effective_shape!r}) but requires {required!r}. "
                        f"SKILL.md §Shape logic is locked — "
                        f"use the correct component for this act."))
                # else: PASS (correct Remotion component)
            # Non-chart Remotion beats (FormACard, etc.) → skip

    return defects


def main():
    ap = argparse.ArgumentParser(description="GATE SHAPE: finance chart-type enforcement")
    ap.add_argument("target", help="reel directory or path to beat_sheet.json")
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args()

    try:
        bs, path = load_beat_sheet(a.target)
    except FileNotFoundError:
        print(f"[gate-shape] ERROR: {a.target} not found")
        sys.exit(2)
    except json.JSONDecodeError as e:
        print(f"[gate-shape] ERROR: invalid JSON in {a.target}: {e}")
        sys.exit(2)

    defects = check(bs)

    if not a.quiet:
        name = os.path.basename(path)
        if defects:
            print(f"[gate-shape] {len(defects)} FAIL(s) in {name}:")
            for bid, kind, msg in defects:
                print(f"  {bid}  [{kind}] {msg}")
        elif is_finance_reel(bs):
            manim_ok = [b for b in bs.get("beats", [])
                        if b.get("act") in FINANCE_ACTS and is_manim_beat(b)]
            remotion_ok = [b for b in bs.get("beats", [])
                           if b.get("act") in FINANCE_ACTS and get_remotion_pattern(b)]
            parts = []
            if manim_ok:
                parts.append(f"{len(manim_ok)} Manim beat(s) with correct shape")
            if remotion_ok:
                parts.append(f"{len(remotion_ok)} Remotion beat(s) with correct component")
            if parts:
                print(f"[gate-shape] PASS — {', '.join(parts)} ({name})")
            else:
                print(f"[gate-shape] PASS — finance reel, no chart beats to check ({name})")
        else:
            print(f"[gate-shape] skip — not a finance reel ({name})")

    return 2 if defects else 0


if __name__ == "__main__":
    sys.exit(main())
