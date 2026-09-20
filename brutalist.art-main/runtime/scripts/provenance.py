#!/usr/bin/env python3
"""provenance.py — who made each file in a reel: Brutalist (the machine) or you (human)?

AUDIO  — engine from the mp3 fingerprint (authoritative):
           sample_rate 44100 (+128k)  -> legacy (not Kokoro; may be old audio file)
           sample_rate 24000          -> Kokoro (free local TTS)
         cross-checked against beat_sheet metadata.engine.
VIDEO  — outputs (final [slug].mp4 / -slate.mp4, clips/, manim/) are ALWAYS Brutalist.
         per-beat SLOT media/<BID>.mp4 is classified from the beat sheet:
           shot.remotion.pattern or build.filled_by remotion:/manim:  -> Brutalist
           shot.type gen/AI-VIDEO/archival/capture/screen/user         -> YOU (human-supplied)
           else falls back to beat_plan.fill_plan responsibility.

Usage: python3 provenance.py <reel-dir> [--json]
"""
import json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
try:
    from beat_plan import fill_plan
except Exception:
    fill_plan = None

def sr(path):
    r = subprocess.run(["ffprobe","-v","error","-show_entries","stream=sample_rate",
                        "-of","default=nk=1:nw=1",str(path)],capture_output=True,text=True)
    try: return int(r.stdout.strip().splitlines()[0])
    except Exception: return None

def audio_engine(path):
    s = sr(path)
    if s is None: return "?", None
    if s >= 44100: return "legacy-44k", s
    if s <= 24000: return "Kokoro", s
    return f"?({s})", s

def slot_provenance(beat, folder):
    shot = beat.get("shot") or {}
    rem = (shot.get("remotion") or {}).get("pattern")
    bld = (beat.get("build") or {}).get("filled_by") or ""
    typ = str(shot.get("type") or "").upper().replace("_","-")
    src = str(shot.get("source") or "").lower()
    if rem or bld.startswith("remotion") or bld.startswith("manim") or src=="manim" or shot.get("manim"):
        return "Brutalist"                       # rendered by the pipeline
    if typ in ("AI-VIDEO","T2V","I2V","GEN-VIDEO","ARCHIVAL","HISTORICAL-IMAGE") \
       or src in ("gen","genai","ai","t2v","i2v","archive","archival","historical"):
        return "YOU"                             # explicitly human/gen-AI/archival
    # a video sitting in a beat slot that is neither a render nor explicitly gen:
    # a pipeline AUTO-CAPTURE (D3 sim via capture_sim.py) OR a clip you dropped.
    # The old sheets do not record which; the new build stamp does.
    return "Capture?"

def analyze(reel):
    reel = Path(reel); slug = reel.name
    sheet = json.loads((reel/"beat_sheet.json").read_text()) if (reel/"beat_sheet.json").exists() else {"beats":[],"metadata":{}}
    meta = sheet.get("metadata",{})
    # audio
    mp3s = sorted(list(reel.glob("mp3/*.mp3")) + list(reel.glob("audio/*.mp3")))
    eng = {}
    for m in mp3s:
        e,_ = audio_engine(m); eng[e] = eng.get(e,0)+1
    # video outputs (always Brutalist)
    outputs = list(reel.glob(f"{slug}.mp4")) + list(reel.glob("*-slate.mp4")) \
              + list(reel.glob("clips/*.mp4")) + list(reel.glob("manim/*.mp4")) + list(reel.glob("mp4/*.mp4"))
    # per-beat slot media
    slots = {"Brutalist":[], "YOU":[], "Capture?":[]}
    for b in sheet.get("beats",[]):
        bid = b["beat_id"]; f = reel/"media"/f"{bid}.mp4"
        if f.exists():
            slots[slot_provenance(b, reel)].append(bid)
    return {"slug":slug, "meta_engine":meta.get("engine"), "audio":eng,
            "n_outputs":len(outputs), "slots":slots}

def main():
    args=[a for a in sys.argv[1:] if not a.startswith("--")]
    r = analyze(args[0])
    print(f"\n■ {r['slug']}")
    ae = " · ".join(f"{k}:{v}" for k,v in r['audio'].items()) or "no mp3"
    print(f"  AUDIO   engine(fingerprint): {ae}   [beat_sheet says: {r['meta_engine']}]")
    print(f"  VIDEO   Brutalist outputs (final/clips/manim/mp4): {r['n_outputs']} files — all machine-made")
    s=r['slots']
    print(f"  SLOTS   Brutalist-rendered:      {len(s['Brutalist'])} {s['Brutalist']}")
    print(f"          YOU (gen-AI/archival):   {len(s['YOU'])} {s['YOU']}")
    print(f"          Capture? (auto or yours):{len(s['Capture?'])} {s['Capture?']}  <- pipeline sim-capture OR your clip; sheet doesn't say")

if __name__=="__main__": main()
