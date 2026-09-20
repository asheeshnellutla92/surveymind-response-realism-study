# Report audio, human approval and safe exports

This is the runtime contract for the fellows safety fixes. No caption generation,
uploading, scheduling or publication is part of these commands. The
[fellows submission guide](FELLOWS-SUBMISSION.md) covers the human handoff.

## The source report owns its clock and sound

Mark the supplied report explicitly:

```json
{
  "beat_id": "B04",
  "kind": "source_report",
  "clock": "source",
  "audio_policy": "preserve",
  "shot": {"type": "SOURCE_REPORT", "source": "own"}
}
```

Place it in `media/B04.mp4`, or use the pantry intake with a beat-prefixed source
recording. The pantry preserves report audio (AAC transcode for MP4 compatibility)
while ordinary b-roll remains silent under narration. Do not pre-strip the report's
audio. Existing fellows sheets using `profile: "fellows"`, `"fellow-report"`, or
`voice_policy: "persistent-fellow-selected"` also recognize legacy B04 as the report.
New projects should always declare the kind, rather than rely on a beat number.

The compiler measures the report file, contains its full frame, and preserves its
sequence and duration. It does not center-seek, crop, slow, trim or voice over the
report. Frame-rate alignment may add less than one frame of final-frame/silence
padding at a boundary; it never removes the final source interval. Narration beats
use their measured audio durations. The shared PCM timeline prevents MP3 segment
padding from accumulating between beats.

Missing audio, absent streams or effectively silent required audio fail the build.
One missing narration file cannot silently mute the entire film. Intentional silence
must be explicit (`audio_policy: "silence"` or `silent: true`); a source report still
requires its own sound. A global `--audio` mix cannot override a source-report beat.
Sound-quality repair remains an explicit, logged preprocessing decision, not an
automatic rewrite of a fellow's recording.

## Human approval: voice choice and Professor Bear's notes

Fellows metadata must explicitly choose one persistent Kokoro voice. Both
`metadata.voice` and `metadata.voice_kokoro` are accepted, but conflicting choices
are rejected. Narration must use that choice. Do not infer approval from a suggested
voice, an old `voice_approval` string, file existence, or an AI-generated name.

Feedback beats must declare `requires_approval: "professor_notes"` or
`act: "FEEDBACK"`. The fellows B05/B06 legacy notes spine is also recognized.
Keep the reviewed text in a nonempty `NOTES.md`.

```bash
./art approvals /path/to/reel --fingerprints
```

This prints review subjects, **not approvals**. The voice subject includes the
engine and voice. The notes subjects hash `NOTES.md` and the exact feedback
narration/voice. After the fellow approves the voice and Professor Bear approves
the attributed notes and their spoken wording, record their actual sign-offs in
`metadata.approvals`. Start with pending records, never invented signatures:

```json
{
  "approvals": {
    "voice": {
      "status": "pending",
      "reviewer_type": "human",
      "reviewed_by": "",
      "reviewed_at": "",
      "subject_sha256": "paste the fingerprint reviewed by the fellow"
    },
    "professor_notes": {
      "status": "pending",
      "reviewer_type": "human",
      "reviewed_by": "",
      "reviewed_at": "",
      "notes_sha256": "paste the reviewed NOTES.md fingerprint",
      "narration_sha256": "paste the reviewed spoken-notes fingerprint"
    }
  }
}
```

On a genuine sign-off, the responsible human supplies `status: "approved"`,
their name, a timezone-aware ISO timestamp, and the exact reviewed fingerprints.
Record the review evidence in `BUILD-LOG.md` or the reviewed GitHub PR. These local
records are attestations, **not authenticated digital signatures**: someone with
write access can forge them. Human review and repository permissions remain the
trust boundary; the code never signs for a human or proves the reviewer's identity.

Pending, missing or stale records block Kokoro generation, Remotion rendering,
review assembly and direct final export. Changing the voice, notes or spoken
feedback invalidates the corresponding approval. `--no-gate` cannot bypass it.
Regenerate changed narration after the new approval; listen to the result during
review. The final export rechecks approvals and detects sheet/media edits during
encoding. Do not run concurrent writers against the same reel.

## Reviews are not finals

```bash
./art run /path/to/reel --height 1080       # review beside the reel
./art final /path/to/reel --height 2160 --out /path/to/landscape
```

`run` builds a review only. Final export requires nonempty `FACTCHECK.md`,
`SHOTLIST.md` and `PROMPTS.md`, approval checks, beat/shape gates, complete visuals
(no slates), sound checks, duration checks, full decoding and final-frame inspection
of the actual candidate export. Missing checks, zero sampled frames and checker
errors are failures, not passes. `ART_QC=0`, `ART_FACTS=0`, lenient review settings
and `--allow-slates` cannot authorize a final.

Renderer failures return nonzero. A failed forced render does not replace the
previous media slot. A candidate final is encoded and checked before it replaces
the destination. A failed export leaves the previous file in place; **that older
file is not the new result**. Check `build-state.json` for `failed` or `blocked`.
Successful finals have a sibling `.verified.json` receipt with output SHA-256,
input hashes, duration and timestamp. Match the hash to the media, not merely the
filename. `ready` means the automated export checks passed, not human approval
to publish. Previous receipts can remain after a failed attempt and describe only
their matching older export.

The frame checker does not judge the truth of a research claim or certify source
footage by flat-card layout heuristics. It verifies source-report sample decoding
and leaves report content/framing to human inspection. Review the contact sheet,
watch both complete exports and listen across every narration/report transition.
4K output dimensions do not certify native source quality or YouTube processing.

## Isolated portrait companions and Shorts

```bash
./art vertical /path/to/reel               # plans /path/to/reel/vertical/
./art shorts /path/to/reel                 # plans /path/to/reel/short/
```

`vertical` keeps all beats, the full report, and the existing outro; it adds no
endcard and applies no Short duration cap. `shorts` can plan cuts to ordinary
middle beats, but cannot silently drop the source report to meet its cap. A report
too long for that plan blocks it: use the full-length companion or author a
separately human-reviewed excerpt. Neither command publishes.

Derivatives copy audio and media into independent files. They reject linked output
directories. Regeneration and `--recut` cannot write through legacy file symlinks
to the parent's media. Replaced stale derivative assets move to `_stale/` for
recovery. A rewritten Short outro invalidates its old audio and the printed TTS
command includes `--only <outro-id>` for the derivative, never the parent.

Generated graphics require native portrait compositions. Missing portrait support
returns nonzero and a blocked plan; fill the named slot with a genuine portrait
asset or add its native composition. Mapped Remotion beats still need rendering:

```bash
python3 runtime/scripts/remotion_scenes.py /path/to/reel/vertical
./art run /path/to/reel/vertical --height 1920
./art final /path/to/reel/vertical --height 3840 --out /path/to/vertical
```

`--height` is the output height: 3840 is required for a **2160×3840** vertical
master. For a Short, substitute the `short/` folder. Read any required portrait
schema changes before rendering. Supplied recordings retain full framing in a
full-length companion; ordinary captured media may be cropped in a Short, inside
its own media directory only. A portrait master may not satisfy the fellows'
native-layout requirement just because it has the correct dimensions: PM review
still checks the underlying visuals.

## Offline regression checks

With Python, Pillow, NumPy, FFmpeg and FFprobe installed:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v
```

These use tiny synthetic recordings and test-only approval records. They do not
download models, invoke paid generation, upload media or generate captions.
