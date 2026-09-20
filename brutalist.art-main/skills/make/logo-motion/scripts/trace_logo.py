#!/usr/bin/env python3
"""trace_logo.py — turn a raster logo into an animatable part list.

A logo sting needs the mark broken into PIECES. One flat path can only fade or
scale; separate parts can converge, stagger, and take an accent independently.
This script does that decomposition once, offline, and emits a TS module that
`scenes/LogoMotion.tsx` imports.

    python3 trace_logo.py mark.png --name medhavy \
        --out ../../../runtime/remotion/src/logos/medhavy.ts

Input: any raster where the mark is dark ink on a light ground — a PNG export, or
a frame grabbed from an existing sting with ffmpeg. It does NOT need to be large:
everything downstream is vector, so a 500px crop traces fine.

Requires `potrace` (brew install potrace) plus numpy/scipy/Pillow.

What it does:
  1. crops to the ink, so the emitted viewBox is tight and predictable
  2. upsamples 4x (LANCZOS) — potrace fits smoother curves on a bigger bitmap
  3. labels 8-connected components and drops specks under --min-area
  4. traces each component separately, so each becomes its own <path>
  5. classifies: largest = 'letter', second = 'book', rest = 'circuit'
  6. records each part's centroid, angle from centre, and normalised radius —
     the three numbers LogoMotion needs to stagger and fly parts into place

The role names are Medhavy's vocabulary. For a different mark, pass
--roles to rename them; the scene only cares that 'circuit' marks the parts that
should take the accent during the wash.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


def collapse(d: str) -> str:
    """potrace hard-wraps `d`; a raw newline in a TS string literal is a syntax error."""
    return re.sub(r"\s+", " ", d).strip()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("image", type=Path)
    ap.add_argument("--name", required=True, help="export prefix, e.g. medhavy -> MEDHAVY_PARTS")
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--threshold", type=int, default=140, help="ink is darker than this (0-255)")
    ap.add_argument("--scale", type=int, default=4, help="upsample before tracing")
    ap.add_argument("--min-area", type=int, default=60, help="drop components smaller than this")
    ap.add_argument("--pad", type=int, default=6, help="padding around the ink, pre-upsample")
    ap.add_argument("--roles", default="letter,book,circuit",
                    help="names for largest, second-largest, and the rest")
    a = ap.parse_args()

    roles = a.roles.split(",")
    if len(roles) != 3:
        sys.exit("--roles needs exactly three comma-separated names")

    src = Image.open(a.image).convert("L")
    ink = np.asarray(src) < a.threshold
    if not ink.any():
        sys.exit(f"no ink found under threshold {a.threshold} — is the mark dark on light?")
    ys, xs = np.nonzero(ink)
    box = (max(0, xs.min() - a.pad), max(0, ys.min() - a.pad),
           min(src.width, xs.max() + 1 + a.pad), min(src.height, ys.max() + 1 + a.pad))
    crop = src.crop(box)

    big = crop.resize((crop.width * a.scale, crop.height * a.scale), Image.LANCZOS)
    mask = np.asarray(big) < a.threshold
    lab, n = ndimage.label(mask, structure=np.ones((3, 3), int))
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    kept = sorted((i + 1 for i in range(n) if sizes[i] >= a.min_area), key=lambda i: -sizes[i - 1])
    if not kept:
        sys.exit("every component fell under --min-area")

    H, W = mask.shape
    cx0, cy0 = W / 2, H / 2
    diag = math.hypot(cx0, cy0)
    tmp = Path(a.out).parent / f"_{a.name}_trace.pbm"

    parts, transform = [], None
    for k, i in enumerate(kept):
        m = lab == i
        Image.fromarray(np.where(m, 0, 255).astype(np.uint8)).convert("1").save(tmp)
        svg = subprocess.run(["potrace", "-s", "--flat", "-O", "0.4", "-o", "-", str(tmp)],
                             capture_output=True, text=True).stdout
        d = re.search(r'<path d="([^"]+)"', svg)
        if not d:
            continue
        if transform is None:
            t = re.search(r'<g transform="([^"]+)"', svg)
            transform = t.group(1) if t else ""
        py, px = np.nonzero(m)
        cx, cy = float(px.mean()), float(py.mean())
        parts.append(dict(
            id=f"p{k:02d}",
            role=roles[0] if k == 0 else roles[1] if k == 1 else roles[2],
            d=collapse(d.group(1)),
            cx=round(cx, 1), cy=round(cy, 1),
            ang=round(math.degrees(math.atan2(cy - cy0, cx - cx0)), 1),
            rad=round(math.hypot(cx - cx0, cy - cy0) / diag, 4),
            area=int(m.sum()),
        ))
    tmp.unlink(missing_ok=True)

    bad = [p["id"] for p in parts if "'" in p["d"] or "\n" in p["d"]]
    if bad:
        sys.exit(f"path data contains a quote or newline in {bad} — would break the TS literal")

    up = a.name.upper()
    L = [f"// GENERATED — potrace trace of the {a.name} lockup, {len(parts)} connected components.",
         f"// Regenerate with skills/make/logo-motion/scripts/trace_logo.py. Do not hand-edit.",
         "// Path data is whitespace-collapsed: potrace hard-wraps `d`, and a raw newline",
         "// inside a TS string literal is a syntax error, not a cosmetic issue.", "",
         "export type LogoPart = {", "  id: string;",
         f"  /** {roles[0]} | {roles[1]} drive the core; {roles[2]} parts stagger and take the accent. */",
         f"  role: '{roles[0]}' | '{roles[1]}' | '{roles[2]}';", "  d: string;",
         "  /** centroid in viewBox space (post potrace transform) */",
         "  cx: number;", "  cy: number;",
         "  /** degrees from centre — the direction the part flies in from */", "  ang: number;",
         "  /** 0 at centre, 1 at the far corner — drives the assembly stagger */",
         "  rad: number;", "  area: number;", "};", "",
         f"export const {up}_VIEWBOX = '0 0 {W} {H}';",
         f"export const {up}_TRANSFORM = '{transform}';", "",
         f"export const {up}_PARTS: LogoPart[] = ["]
    for p in parts:
        L.append("  {" + f"id:'{p['id']}',role:'{p['role']}',cx:{p['cx']},cy:{p['cy']},"
                 f"ang:{p['ang']},rad:{p['rad']},area:{p['area']},d:'{p['d']}'" + "},")
    L.append("];")
    a.out.parent.mkdir(parents=True, exist_ok=True)
    a.out.write_text("\n".join(L) + "\n")

    roll = {r: sum(1 for p in parts if p["role"] == r) for r in roles}
    print(f"[trace] {a.image.name} -> {a.out}")
    print(f"[trace] viewBox 0 0 {W} {H} · {len(parts)} parts · {roll}")
    print(f"[trace] next: add '{a.name}' to the LOGOS registry in scenes/LogoMotion.tsx")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
