"""beat_plan.py — derive each beat's fill plan from its beat-sheet annotations.

The beat sheet is the heart: every beat carries shot.type × shot.source (and
optionally graphic.manim / remotion / prompt fields). This module turns those
annotations into a FILL PLAN — who fills the beat and how:

    method       one of: manim | remotion | ai-video-prompt | historical-image | user-capture
    responsible  'pipeline' (the CLI renders it) or 'human' (a request card is shown)
    prompt       for ai-video-prompt: a suggested generation prompt (5–10 s clip);
                 for historical-image: suggested search terms; else None
    slot         the filename the pantry expects (media/<BID>.mp4|.png or manim/<BID>.mp4)

Used by compile.py (to render slates as human-readable request cards) and by
todo.py (to write the per-video ledger todo.json + STATUS.md). Shared so the
slate on screen and the todo entry can never disagree.
"""
from __future__ import annotations


PIPELINE_METHODS = {"manim", "remotion"}


def _prompt_from(beat: dict) -> str:
    """Best available seed for a generation prompt / search terms."""
    g = beat.get("graphic") or {}
    pv = g.get("production_viz") or {}
    for key in ("prompt", "video_prompt", "ai_prompt"):
        if beat.get(key):
            return str(beat[key]).strip()
        if (beat.get("shot") or {}).get(key):
            return str(beat["shot"][key]).strip()
    if pv.get("mechanic"):
        return str(pv["mechanic"]).strip()
    if pv.get("label"):
        return str(pv["label"]).strip()
    if beat.get("new_visual_element"):
        return str(beat["new_visual_element"]).strip()
    return (beat.get("narration_text") or "").strip()[:160]


def fill_plan(beat: dict) -> dict:
    """Decide how this beat should be filled, from its own annotations."""
    bid = beat.get("beat_id", "B??")
    shot = beat.get("shot") or {}
    typ = str(shot.get("type") or "").strip().upper().replace("_", "-")
    src = str(shot.get("source") or "").strip().lower()
    g = beat.get("graphic") or {}
    engine = str(g.get("engine") or beat.get("engine") or "").strip().lower()

    # 1. explicit archival / historical material → the human finds the real thing
    if src in ("archive", "archival", "historical") or typ in ("ARCHIVAL", "HISTORICAL-IMAGE", "ARCHIVE"):
        return {"method": "historical-image", "responsible": "human",
                "prompt": f"find: {_prompt_from(beat)}",
                "slot": f"media/{bid}.png (or .mp4)"}

    # 2. explicit capture the CLI can't fake (screen recording, performance, real footage)
    if src in ("capture", "screen", "user", "live") or typ in ("CAPTURE", "USER-CAPTURE", "SCREEN"):
        return {"method": "user-capture", "responsible": "human",
                "prompt": None, "slot": f"media/{bid}.mp4"}

    # 3. explicit AI-video beat → request card with a suggested prompt
    if typ in ("AI-VIDEO", "T2V", "I2V", "GEN-VIDEO") or src in ("gen", "genai", "ai", "t2v", "i2v"):
        return {"method": "ai-video-prompt", "responsible": "human",
                "prompt": _prompt_from(beat),
                "slot": f"media/{bid}.mp4"}

    # 4. a named Manim scene, or a drawable spec → the pipeline animates it
    if g.get("manim") or shot.get("manim") or engine == "manim" or src == "manim":
        return {"method": "manim", "responsible": "pipeline",
                "prompt": None, "slot": f"manim/{bid}.mp4"}
    # canonical location first: shot.remotion.pattern is what remotion_scenes.py reads
    if ((shot.get("remotion") or {}).get("pattern")
            or engine == "remotion" or typ in ("REMOTION", "MOTION-GRAPHIC")
            or beat.get("remotion")):
        return {"method": "remotion", "responsible": "pipeline",
                "prompt": None, "slot": f"media/{bid}.mp4"}

    # 5. drawable spec but no scene yet → pipeline (animated_graphics decides Manim vs Remotion)
    if g.get("production_viz"):
        return {"method": "manim", "responsible": "pipeline",
                "prompt": None, "slot": f"manim/{bid}.mp4"}

    # 6. nothing the pipeline can animate → ask the human for a 5–10 s gen-AI clip
    return {"method": "ai-video-prompt", "responsible": "human",
            "prompt": _prompt_from(beat),
            "slot": f"media/{bid}.mp4"}


def owner_line(beat: dict) -> tuple[str, str | None]:
    """The slate card's action line + optional suggested-prompt line."""
    bid = beat.get("beat_id", "B??")
    plan = fill_plan(beat)
    m = plan["method"]
    if m == "manim":
        return (f"PIPELINE → render animated_graphics.py scene {bid}_*", None)
    if m == "remotion":
        return (f"PIPELINE → fill_slates/remotion_scenes for {bid}", None)
    if m == "historical-image":
        return (f"YOU → drop a historical image at {plan['slot']}", plan["prompt"])
    if m == "user-capture":
        return (f"YOU → record and drop {plan['slot']}", None)
    return (f"YOU → 5–10s gen-AI clip → pantry (as {bid}.mp4)",
            f"suggested prompt: {plan['prompt']}" if plan["prompt"] else None)
