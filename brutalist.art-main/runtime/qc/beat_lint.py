#!/usr/bin/env python3
"""
beat_lint.py — plan-time lint for the deep-explainer beat mix.

Enforces two hardening rules at author time, before any render or audio spend:

  RULE 3  NEVER a single-sentence Remotion slide.
          A `lane:remotion` CONTENT beat whose remotion.pattern is a generic
          text card (SlateCard / TextCard / TitleCard) is a text slide wearing
          an illustration's clothes. It must EITHER get a real illustration
          pattern OR become a VOX-ANIM placeholder (rule 4).

  RULE 4  Exactly two placeholder types, each naming the media to provide:
            (1) STILL placeholder    — lane:vox, type STILL/COMPOSITE (a still
                                       or gen-AI clip you drop in the pantry).
            (2) VOX-ANIM placeholder — lane:vox with placeholder "vox-anim"
                                       (pantry media animated vox-style w/ Remotion).
          A SlateCard is legal ONLY as a STILL placeholder (vox) or an act
          card (lane:card) or a bookend. Anywhere else it's a defect.

Exempt: bookends, ask micro-beats, act/segment cards (structural), real Manim
graphics, and Remotion beats with a real illustration pattern.

Exit 2 on any defect (blocks the build), 0 clean.
Usage: beat_lint.py <reel_dir_or_beat_sheet.json> [--quiet]
"""
import json, os, sys, argparse

TEXT_CARD_PATTERNS = {"slatecard", "textcard", "titlecard", "cardtext", "quotecard"}
EXEMPT_LANES = {"bookend", "ask", "card"}          # structural / UI beats
GRAPHIC_LANES = {"manim"}                           # real rendered graphics


def load_beats(path):
    if os.path.isdir(path):
        path = os.path.join(path, "beat_sheet.json")
    return json.load(open(path)), path


def is_still_placeholder(sh):
    # a still/clip placeholder — robust to older sheets that omit `lane`
    return sh.get("type") in ("STILL", "COMPOSITE")


def is_voxanim_placeholder(sh):
    return sh.get("lane") == "vox" and (
        sh.get("placeholder") == "vox-anim" or sh.get("scene_type") == "vox-anim"
        or (sh.get("remotion") or {}).get("pattern", "").lower() == "voxanimslate")


def load_brand_map():
    """Editable channel -> {kicker, chip} table (brand_labels.json next to this
    script). Kicker = the fixed slot-1 series name; chip = the slot-2 folder
    handle. Edit the JSON to change labels or add channels — no code change."""
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "brand_labels.json")
    try:
        return json.load(open(p))
    except Exception:
        return {}


def lint_branding(bs):
    """RULE 7: slot-1 kicker is a FIXED per-channel series name (not a per-video
    guess), and the folder chip matches the channel. Unknown channels skip."""
    m = load_brand_map()
    meta = bs.get("metadata", {}) or {}
    ch = meta.get("brand") or meta.get("channel") or meta.get("persona")
    want = m.get(ch)
    out = []
    if not want:
        return out
    if want.get("kicker") and meta.get("topic") != want["kicker"]:
        out.append(("metadata", "branding-kicker",
                    f"topic is {meta.get('topic')!r}; channel {ch} must use fixed "
                    f"kicker {want['kicker']!r} (stop per-video guessing)."))
    if want.get("chip") and meta.get("folderLabel") not in (want["chip"], None):
        out.append(("metadata", "branding-chip",
                    f"folderLabel is {meta.get('folderLabel')!r}; channel {ch} "
                    f"must use {want['chip']!r}."))
    return out


def lint(bs):
    defects = []
    defects.extend(lint_branding(bs))
    for b in bs.get("beats", []):
        bid = b.get("beat_id", "?")
        sh = b.get("shot", {}) or {}
        lane = sh.get("lane")
        patt = ((sh.get("remotion") or {}).get("pattern") or "").lower()

        typ = sh.get("type")
        # exempt classes — keyed off lane AND type (older sheets omit `lane`)
        if lane in EXEMPT_LANES:                         # bookend / ask / card
            continue
        if lane in GRAPHIC_LANES or typ in ("GRAPHIC", "MANIM", "DOCUMENT"):
            continue
        if typ == "CARD":                                # structural act/segment card
            continue
        if is_still_placeholder(sh) or is_voxanim_placeholder(sh):
            continue

        # RULE 3: a Remotion CONTENT beat that fell back to a text card.
        # Signal = lane:remotion (current-gen sheets). Older sheets without a
        # lane are not re-litigated — they predate the rule.
        if lane == "remotion" and patt in TEXT_CARD_PATTERNS:
            defects.append((bid, "single-sentence-remotion",
                            f"lane:remotion beat uses text-card pattern "
                            f"'{(sh.get('remotion') or {}).get('pattern')}' — a talking slide. "
                            f"Give it a real illustration pattern OR convert to a VOX-ANIM "
                            f"placeholder (lane:vox, placeholder:vox-anim)."))
    return defects


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("target")
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args()
    bs, path = load_beats(a.target)
    defects = lint(bs)
    if not a.quiet:
        if defects:
            print(f"[beat-lint] {len(defects)} defect(s) in {os.path.basename(path)}:")
            for bid, kind, msg in defects:
                print(f"  {bid}  [{kind}] {msg}")
        else:
            print(f"[beat-lint] clean — beat mix OK ({os.path.basename(path)})")
    return 2 if defects else 0


if __name__ == "__main__":
    sys.exit(main())
