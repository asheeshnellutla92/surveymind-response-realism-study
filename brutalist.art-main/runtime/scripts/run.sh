#!/usr/bin/env bash
# run.sh — ONE command: QC-gate, render every pending Manim scene, slot the
# outputs, recompile the reel. Bash 3.2-safe. Free/local (Manim + ffmpeg).
#
#   bash scripts/run.sh <path/to/reel> [--height 1080]
#
# The reel may live ANYWHERE — e.g. books/<book>/youtube/<slug>. The toolkit
# assets (graphics library, QC tools, bearbrown, sub-scripts) are resolved from
# THIS script's own location, so the reel is fully decoupled from the toolkit.
#
# Skips any beat whose slot is already filled (manim/<B>.mp4 or media/<B>.mp4).
#
# QC GATES (qc/ — advisory tools, wired here as hard gates):
#   Gate A (pre-flight, render-free): static_scene_check.py per pending scene.
#   Gate B (post-render, pixel-true): manim_layout_audit.py --png per scene.
#   Skip both with ART_QC=0.
set -eo pipefail
REEL_IN="$1"; shift || true
HEIGHT=2160   # 4K-native master (was 1080). Pass --height 1080 for a faster QC pass.
if [ "$1" = "--height" ]; then HEIGHT="$2"; fi
ART_QC="${ART_QC:-1}"
ART_STRICT="${ART_STRICT:-1}"   # gates BLOCK on warnings too (BLOCKER+MAJOR stop the build). ART_STRICT=0 = legacy warn-and-slot.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"          # toolkit home — assets live here
REPO="$(dirname "$ROOT")"; [ -f "$REPO/.env" ] && set -a && . "$REPO/.env" 2>/dev/null && set +a || true   # load repo-root .env; shell wins
# resolve the reel to an absolute path wherever it lives (its parent must exist)
REEL_DIR="$(cd "$(dirname "$REEL_IN")" 2>/dev/null && pwd)/$(basename "$REEL_IN")"
if [ ! -d "$REEL_DIR" ]; then
  echo "[run] no such reel dir: $REEL_IN"; exit 1
fi
record_run_failure() {
  rc=$?
  if [ "$rc" -ne 0 ]; then
    PYTHONPATH="$ROOT/scripts" python3 - "$REEL_DIR" "$rc" <<'PY' || true
import json, sys
from pathlib import Path
from build_safety import record_failure
try:
    state = json.loads((Path(sys.argv[1]) / 'build-state.json').read_text())
except (OSError, ValueError):
    state = {}
if state.get('status') not in ('failed', 'blocked'):
    record_failure(sys.argv[1], 'Review pipeline failed (exit ' + sys.argv[2] + '); see command output')
PY
  fi
}
trap record_run_failure EXIT
PYTHONPATH="$ROOT/scripts" python3 - "$REEL_DIR" <<'PY'
import sys
from build_safety import atomic_json, writable_path
atomic_json(writable_path(sys.argv[1], 'build-state.json'), {'status': 'planned'})
for directory in ('manim', 'media', 'pantry', 'images', 'mp4', 'mp3', 'clips', '_qc'):
    writable_path(sys.argv[1], directory + '/.check')
PY
python3 "$ROOT/scripts/build_safety.py" "$REEL_DIR"

# ---- does this reel have ANY Manim beats at all? Same test beat_plan.fill_plan
# uses (method == "manim"): a pure-Remotion/other reel has none, and should
# skip the whole Manim stage cleanly rather than be forced to carry a scenes.py
# it has no use for.
HAS_MANIM=1
if [ -f "$REEL_DIR/beat_sheet.json" ]; then
  HAS_MANIM=$(PYTHONPATH="$ROOT/scripts" python3 - "$REEL_DIR/beat_sheet.json" <<'PY'
import json, beat_plan
import sys
bs = json.load(open(sys.argv[1]))
print(1 if any(beat_plan.fill_plan(b).get('method') == 'manim' for b in bs.get('beats', [])) else 0)
PY
)
fi

GFX="$ROOT/manim"
GFXFILE="animated_graphics.py"
if [ "$HAS_MANIM" = "0" ]; then
  echo "[run] no Manim beats in this reel's beat sheet — skipping Manim stage"
  GFXFILE=""
elif [ -f "$REEL_DIR/scenes.py" ]; then   # every real reel with Manim beats carries its own scenes
  GFX="$REEL_DIR"; GFXFILE="scenes.py"
elif [ "$(basename "$REEL_DIR")" != "vox-electoral-college" ]; then
  # GUARD: the shared animated_graphics.py carries only the electoral-college FIXTURE
  # scenes; rendering them into another reel slots the wrong film's graphics.
  echo "[run] REFUSED: $REEL_DIR has Manim beats (shot.type GRAPHIC/MANIM/DOCUMENT)"
  echo "[run] but no scenes.py. The shared animated_graphics.py holds only the"
  echo "[run] electoral-college fixture scenes — rendering those here would slot"
  echo "[run] another film's graphics into your beats."
  echo "[run] Write $REEL_DIR/scenes.py (one Scene per GRAPHIC/CARD/DOCUMENT beat;"
  echo "[run] see examples/deep-explainer/claude-liam-fluency-trap/scenes.py in"
  echo "[run] this toolkit for a worked example)."
  exit 2
fi
QC="$ROOT/qc"
if [ "$ART_QC" = "1" ]; then
  for gate in beat_lint.py gate_shape.py static_scene_check.py wcag_margin_check.py manim_layout_audit.py final_frame_check.py; do
    [ -f "$QC/$gate" ] || { echo "[run] missing required QC tool: $gate"; exit 2; }
  done
fi
mkdir -p "$REEL_DIR/manim" "$REEL_DIR/media" "$REEL_DIR/pantry" "$REEL_DIR/images" "$REEL_DIR/mp4"

SCENES=""
if [ -n "$GFXFILE" ]; then
  SCENES=$(python3 - "$GFX/$GFXFILE" <<'PY'
import re, sys
src = open(sys.argv[1]).read()
print(' '.join(m.group(1) for m in re.finditer(r'class ([A-Z][A-Za-z0-9]*_\w+)\(Scene\)', src)))
PY
)
fi

# ---- figure out which scenes are actually pending (slot not filled)
PENDING=""
for S in $SCENES; do
  BID="${S%%_*}"
  if [ -f "$REEL_DIR/manim/$BID.mp4" ] || [ -f "$REEL_DIR/media/$BID.mp4" ]; then
    echo "[run] skip $S — $BID already filled"
  else
    PENDING="$PENDING $S"
  fi
done
if [ -z "$PENDING" ]; then
  echo "[run] nothing to render — recompiling only"
fi

# ---- GATE F: no rendering without the paperwork set (facts + work order + prompts)
if [ "${ART_FACTS:-1}" = "1" ]; then
  for REQ in FACTCHECK.md SHOTLIST.md PROMPTS.md; do
    if [ ! -f "$REEL_DIR/$REQ" ]; then
      echo "[run] GATE F FAILED: $REEL_DIR has no $REQ — the paperwork set"
      echo "[run] (FACTCHECK.md claims · SHOTLIST.md typed work order ·"
      echo "[run] PROMPTS.md beat-prefixed prompts for open slots) is written"
      echo "[run] BEFORE rendering. ART_FACTS=0 for a previz-only exception."
      exit 2
    fi
  done
fi

# ---- GATE L: beat-mix lint (no single-sentence Remotion slide; two placeholder types)
if [ "$ART_QC" = "1" ] && [ -f "$QC/beat_lint.py" ] && [ -f "$REEL_DIR/beat_sheet.json" ]; then
  echo "[run] GATE L — beat-mix lint"
  rc=0
  python3 "$QC/beat_lint.py" "$REEL_DIR/beat_sheet.json" || rc=$?
  if [ "$rc" -ge 2 ]; then
    echo "[run] GATE L FAILED: a lane:remotion beat is a single-sentence text slide,"
    echo "[run] or a stray text card. Give it a real illustration OR convert it to a"
    echo "[run] VOX-ANIM placeholder (lane:vox, placeholder:vox-anim). Nothing rendered."
    [ "$ART_STRICT" = "1" ] && exit 2 || echo "[run] ART_STRICT=0 — continuing anyway"
  fi
fi

# ---- GATE SHAPE: finance reels must declare a chart-shape on every Manim beat
# SKILL.md §Shape logic is locked — a bar chart where the spec calls for a Sankey
# is the failure mode, not a style note. Gate runs whether or not scenes are pending.
if [ "$ART_QC" = "1" ] && [ -f "$QC/gate_shape.py" ] && [ -f "$REEL_DIR/beat_sheet.json" ]; then
  echo "[run] GATE SHAPE — finance chart-shape enforcement"
  rc=0
  python3 "$QC/gate_shape.py" "$REEL_DIR/beat_sheet.json" || rc=$?
  if [ "$rc" -ge 2 ]; then
    echo "[run] GATE SHAPE FAILED: finance beat(s) missing or wrong chart shape."
    echo "[run] See SKILL.md §Shape logic — sankey/mirrored-bar/stacked-bar/dot-plot."
    echo "[run] Add 'shape' to each finance beat before any render."
    exit 2
  fi
fi

# ---- GATE A: render-free pre-flight on every pending scene (isolated copy)
if [ "$ART_QC" = "1" ] && [ -n "$PENDING" ] && [ -f "$QC/static_scene_check.py" ]; then
  echo "[run] GATE A — static pre-flight"
  TMPQC=$(mktemp -d)
  cp "$GFX/$GFXFILE" "$TMPQC/"
  for S in $PENDING; do
    rc=0
    PYTHONPATH="$ROOT/manim" \
      python3 "$QC/static_scene_check.py" "$TMPQC/$GFXFILE" --class "$S" --quiet || rc=$?
    if [ "$rc" -ge 2 ]; then
      echo "[run] GATE A FAILED: $S has static errors — fix the scene, nothing rendered"
      exit 2
    elif [ "$rc" -eq 1 ]; then
      echo "[run] gate A warning on $S (continuing)"
    fi
  done
fi

# ---- GATE W: independent WCAG + margins + overlap pre-flight (no render, no manim)
if [ "$ART_QC" = "1" ] && [ -n "$PENDING" ] && [ -f "$QC/wcag_margin_check.py" ]; then
  echo "[run] GATE W — WCAG contrast + margins + text-overlap (independent second check)"
  for S in $PENDING; do
    rc=0
    python3 "$QC/wcag_margin_check.py" "$GFX/$GFXFILE" --class "$S" --quiet || rc=$?
    if [ "$rc" -ge 2 ]; then
      echo "[run] GATE W FAILED: $S — gold-as-text / contrast / off-frame / text-on-text."
      echo "[run] Fix the scene; nothing rendered. (Rules: SLATE-RUNNER CONVENTIONS -> Gate W)"
      exit 2
    elif [ "$rc" -eq 1 ]; then
      echo "[run] gate W warning on $S (continuing)"
    fi
  done
fi

# ---- render + GATE B per scene
cd "$GFX"
for S in $PENDING; do
  BID="${S%%_*}"
  echo "[run] rendering $S"
  RES="3840,2160"
  if grep -q '"aspect_ratio": *"9:16"' "$REEL_DIR/beat_sheet.json" 2>/dev/null; then RES="2160,3840"; fi
  manim -qk --fps 24 -r "$RES" "$GFXFILE" "$S"
  OUT=$(find media/videos -name "$S.mp4" | head -1)
  if [ -z "$OUT" ]; then echo "[run] ERROR: no output for $S"; exit 1; fi
  if [ "$ART_QC" = "1" ] && [ -f "$QC/manim_layout_audit.py" ]; then
    rc=0
    PORTRAIT=""
    if grep -q '"aspect_ratio": *"9:16"' "$REEL_DIR/beat_sheet.json" 2>/dev/null; then PORTRAIT="--portrait"; fi
    python3 "$QC/manim_layout_audit.py" "$GFXFILE" --class "$S" --png --curve-strict $PORTRAIT || rc=$?
    if [ "$rc" -ge 2 ]; then
      echo "[run] GATE B FAILED: $S has layout errors — mp4 NOT slotted."
      echo "[run] see $GFX/layout_audit.md and the annotated PNGs beside it."
      exit 2
    elif [ "$rc" -eq 1 ]; then
      if [ "$ART_STRICT" = "1" ]; then
        echo "[run] GATE B (strict): $S has a layout warning — mp4 NOT slotted."
        echo "[run] see $GFX/layout_audit.md. (ART_STRICT=0 to warn-and-slot instead.)"
        exit 2
      fi
      echo "[run] gate B warning on $S — slotting anyway, review $GFX/layout_audit.md"
    fi
  fi
  mv "$OUT" "$REEL_DIR/manim/$BID.mp4"
done

cd "$ROOT"

# ---- Remotion fill-in: render every beat that carries shot.remotion.pattern to
# media/<BID>.mp4 BEFORE compile, so annotated Remotion beats don't fall to slates.
# run.sh renders Manim above; without this pass Remotion beats never rendered.
python3 scripts/remotion_scenes.py "$REEL_DIR"

# (mascot outro stage removed in the brutalist toolkit — the outro is the
#  ClaudeTitleOutro Remotion beat, rendered by remotion_scenes.py above)

# slate cut — always ({slug}-slate.mp4: shows slates + beat labels)
python3 scripts/compile.py "$REEL_DIR" --review --height "$HEIGHT"
# Review only. A clean final requires the compiler's mandatory verification
# and atomic promotion, invoked explicitly with ./art final <reel>.

# ---- GATE V: frame-level visual QC on the COMPILED reel (every beat: Manim,
# Remotion, composer, slate). Catches edge-bleed/clipping, canvas underfill
# (negative space), and low contrast — the classes the Manim gates never see.
if [ "$ART_QC" = "1" ] && [ -f "$QC/final_frame_check.py" ]; then
  echo "[run] GATE V — frame-level visual QC on the compiled reel"
  rc=0
  LENIENT=""; [ "$ART_STRICT" = "1" ] || LENIENT="--lenient"
  SLUG=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("metadata",{}).get("slug",sys.argv[2]))' "$REEL_DIR/beat_sheet.json" "$(basename "$REEL_DIR")")
  python3 "$QC/final_frame_check.py" "$REEL_DIR" --mp4 "$REEL_DIR/$SLUG-slate.mp4" $LENIENT || rc=$?
  if [ "$rc" -ge 2 ]; then
    echo "[run] GATE V FAILED: visual defects in the compiled cut —"
    echo "[run] see $REEL_DIR/_qc/REPORT.md and _qc/contact_sheet.png."
    echo "[run] Fix the scene source and re-run. (ART_STRICT=0 downgrades MAJOR to warnings.)"
    exit 2
  fi
fi

# ToDo.md — human fill-list (what YOU still owe, pantry names, prompts, source links)
python3 scripts/todo.py "$REEL_DIR" >/dev/null 2>&1 || true

# ---- deliverables layout: finished cuts -> mp4/, filled stills -> images/
PYTHONPATH="$ROOT/scripts" python3 - "$REEL_DIR" <<'PY'
import sys
from pathlib import Path
from build_safety import copy_asset
reel = Path(sys.argv[1])
for pattern, destination in (('*.mp4', 'mp4'), ('short/*.mp4', 'mp4'), ('media/*.png', 'images')):
    for source in reel.glob(pattern):
        if source.is_file():
            copy_asset(source, reel / destination / source.name, reel)
PY
echo "[run] done → $REEL_DIR  (QC gates: $([ "$ART_QC" = "1" ] && echo on || echo OFF))"
echo "[run] REVIEW built; no final exported. Use ./art final <reel> for a verified master."
echo "[run] any remaining slates are YOUR slots — see $REEL_DIR/SHOTLIST.md"
