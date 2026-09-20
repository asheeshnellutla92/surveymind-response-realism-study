#!/usr/bin/env bash
# smoke_test.sh — the ONE real end-to-end proof the package works.
#
#   ./art smoke
#
# Every other check in ./setup verifies a dependency in isolation (imports,
# ffmpeg on PATH, one synthesized phrase). None of them proves the actual
# pipeline — generate_audio_kokoro.py -> run.sh -> compile.py -- produces a
# watchable video. This script does: it builds the tiny fixture reel at
# examples/_smoke/ all the way to a compiled slate cut, in a throwaway copy
# so repeated runs never dirty the tracked fixture, then verifies the result
# from the DECODED OUTPUT of the mp4 that actually landed on disk:
#
#   GATE AUDIO  ffmpeg volumedetect on the compiled mp4's own audio track,
#               mean_volume > -40 dB (same floor as setup_smoke_kokoro.py)
#   GATE TYPE   ffprobe shows a real video stream + a real audio stream
#   GATE SIZE   the mp4 exists and is not a truncated/empty file
#
# FAILS LOUDLY: any broken step prints why and this script exits non-zero.
# A green "SMOKE PASS" means a render actually happened, not that a command
# returned 0.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"   # toolkit home (runtime/)
REPO="$(dirname "$ROOT")"                  # brutalist.art root
FIXTURE="$REPO/examples/_smoke"
SIZE_FLOOR_BYTES=20000                     # a real few-second mp4 clears this easily

fail(){ printf '\033[31m[smoke] FAIL: %s\033[0m\n' "$1"; exit 1; }
ok(){   printf '\033[32m[smoke] %s\033[0m\n' "$1"; }

[ -d "$FIXTURE" ] || fail "fixture missing: $FIXTURE (examples/_smoke/ must ship with this toolkit)"
[ -f "$FIXTURE/beat_sheet.json" ] || fail "fixture has no beat_sheet.json"

WORK="$(mktemp -d 2>/dev/null || mktemp -d -t art-smoke)"
trap 'rm -rf "$WORK"' EXIT
cp -R "$FIXTURE/." "$WORK/" || fail "could not copy fixture into scratch dir $WORK"

echo "[smoke] building examples/_smoke in $WORK"

echo "[smoke] --- GATE 0: Kokoro narration ---"
if ! python3 "$ROOT/scripts/generate_audio_kokoro.py" "$WORK" 2>&1 | tee "$WORK/.audio.log"; then
  fail "generate_audio_kokoro.py failed — see $WORK/.audio.log"
fi
for f in "$WORK"/mp3/beat-*.mp3; do
  [ -f "$f" ] || fail "no narration mp3s were written to $WORK/mp3/"
done

echo "[smoke] --- render + compile (run.sh) ---"
# ART_STRICT=0: the fixture is two deliberately bare narration slates (no
# Manim/Remotion beats — that's the point, it proves the zero-Manim skip
# path), so GATE V's canvas-fill/negative-space content check always flags
# them MAJOR; that check is about production-content polish, not pipeline
# health, and this script verifies the real signals (audio, streams, size)
# itself below. GATE L and every render/compile step still run for real.
if ! ART_FACTS=0 ART_QC=1 ART_STRICT=0 bash "$ROOT/scripts/run.sh" "$WORK" 2>&1 | tee "$WORK/.run.log"; then
  fail "run.sh exited non-zero — see $WORK/.run.log"
fi

OUT="$WORK/smoke-slate.mp4"
[ -f "$OUT" ] || fail "no compiled slate cut at $OUT — run.sh reported success but produced nothing"

echo "[smoke] --- GATE SIZE: non-zero, non-truncated mp4 on disk ---"
SIZE=$(wc -c < "$OUT" | tr -d ' ')
[ "$SIZE" -gt "$SIZE_FLOOR_BYTES" ] || fail "$OUT is only $SIZE bytes (floor: $SIZE_FLOOR_BYTES) — looks truncated/empty"
ok "GATE SIZE passed — $OUT is $SIZE bytes"

echo "[smoke] --- GATE TYPE: decode real video + audio streams ---"
STREAMS=$(ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "$OUT" 2>/dev/null)
echo "$STREAMS" | grep -q '^video$' || fail "$OUT has no decodable video stream (ffprobe: $STREAMS)"
echo "$STREAMS" | grep -q '^audio$' || fail "$OUT has no decodable audio stream (ffprobe: $STREAMS)"
ok "GATE TYPE passed — video + audio streams both decode"

echo "[smoke] --- GATE AUDIO: decode + measure the compiled mp4's own track ---"
VOLDETECT=$(ffmpeg -i "$OUT" -af volumedetect -f null - 2>&1)
MEAN_DB=$(printf '%s\n' "$VOLDETECT" | grep -o 'mean_volume: *-\?[0-9.]* dB' | grep -o '\-\?[0-9.]*' | head -1)
[ -n "$MEAN_DB" ] || fail "ffmpeg volumedetect produced no mean_volume reading for $OUT"
awk -v v="$MEAN_DB" 'BEGIN { exit !(v > -40) }' || fail "compiled mp4 audio too quiet: mean_volume ${MEAN_DB} dB (floor: -40 dB) — narration may not have actually rendered"
ok "GATE AUDIO passed — mean_volume ${MEAN_DB} dB (floor -40 dB)"

echo
ok "SMOKE PASS — examples/_smoke built a real, watchable slate cut end to end."
exit 0
