# Film as code: the fellows' weekly handoff

GitHub holds the recipe. Google Drive holds the rendered film. The fellow does
the work, records the evidence, and makes the human and AI contributions clear.
Publishing is a separate human decision; Brutalist does not upload or publish.

This guide records Professor Brown's supplied weekly-review and browser-upload
briefings. It applies to Humanitarians AI fellows, not every Brutalist user.
The briefings' “9×6” is interpreted here as **9:16**. A GitHub branch is a
separate working version, **not a private copy** of a public repository.

## Two videos, four files

Each week, produce two distinct videos, each in both 16:9 landscape and 9:16
vertical. Normally these are a STEM/AI topic and an update on your assigned
project. A passion-project topic may substitute, but at least one of the four
distinct videos across any two-week window must be a genuine research/project
update. Aspect-ratio exports do not count as additional distinct videos.

Use the current week's Brutalist version. Record its commit/release and the
version check in your README. Render landscape at **3840×2160** and vertical at
**2160×3840**. Generated graphics need native layouts in both ratios, not a crop
of the landscape master. Preserve a supplied report's content, sound and timing;
contain its framing when needed. Padding or upscaling an old low-resolution
recording does not prove native 4K. Flag that source limitation to your PM.

Every video opens with:

> Hi, I am [your name] and this video is about [summary of the topic].

Keep the required introduction at the start, including when adding branded
bookends. Disclose AI narration and whose work it presents; do not pass off an
AI narrator as a recording of the fellow or Professor Brown. Show evidence and
finish with a concrete takeaway: something the viewer can now do or understand.
No caption-generation or caption-delivery requirement is added by this workflow.

## GitHub for source; Drive for media

| Artifact | Destination |
|---|---|
| Beat sheet, script, README, code, prompts, source notes, checks, documents under 25 MB | GitHub |
| MP4, MOV, MP3 and other rendered video/audio, even when small | Drive |
| Any file 25 MB or larger, including a text document | Drive; link it from the README |
| Credentials, tokens, private participant data | Neither a public repository nor a public Drive link |

Size takes precedence over type. A 30 MB README belongs on Drive, with a small
README in GitHub linking it. For this workflow use the conservative **under
25 MB** rule. GitHub's documented browser limits are 25 MiB per file and 100
files per upload. Split larger batches. [GitHub upload documentation](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

Do not drag the entire generated reel directory into GitHub: prepare a source-only
folder. Exclude `mp3/`, `mp4/`, rendered `media/`, `clips/`, caches, models and
dependencies. Keep the beat sheet, required source assets or Drive references,
custom scene code and reproduction instructions. A `.gitignore` cannot enforce
a file-size limit and is not a substitute for checking a browser upload's list.

## Browser-only upload: no terminal required

1. Open the assigned repository. In the branch selector, start from `main` and
   create a branch named for you, such as `maya-r`. Confirm your branch is selected.
   If you lack permission, ask the maintainer for the correct contribution route.
2. Open `fellows/`. Choose **Add file → Upload files**.
3. In Finder or Explorer, locate your prepared source-only folder from its parent
   directory. Drag the folder into the upload area. Check that GitHub shows the
   intended folder prefix and no video, large media, secrets or other fellows' work.
4. Commit directly to your branch with a meaningful message. If folder dragging
   fails in your browser, try Chrome or Edge or upload smaller batches.
5. Open a pull request with **base: main** and **compare: your branch**. Explain
   what changed and include the source and Drive links. A maintainer reviews and
   merges; committing a branch does not itself change `main`.
6. Commit any README link corrections to that same branch. Notify your PM with
   both the GitHub/PR URL and the Drive folder URL.

No first-pass video approval is needed to submit source to your branch. That is
not permission to merge without review or publish a video. GitHub documents the
branch-and-pull-request workflow in [Hello World](https://docs.github.com/en/get-started/start-your-journey/hello-world).

## Drive layout and names

Use `ProjectName_VolunteerName.mp4`: no spaces, dates, `v2` or `final` in the
filename. Each topic needs a distinct project/title identifier. Both aspect
exports of a topic share the same basename. Put them in separate aspect folders
to prevent one from replacing the other:

```text
weekly-submission/
  landscape/
    TopicDemo_MayaR.mp4
    ProjectUpdate_MayaR.mp4
  vertical/
    TopicDemo_MayaR.mp4
    ProjectUpdate_MayaR.mp4
```

These are handoff names, not instructions to rename internal beat IDs or source
folders. Keep version history in GitHub. Record each exported file's SHA-256 and
source commit so the reviewed media can be matched to its recipe; preserve that
record when copying/renaming a verified export.

Upload the four files to the shared Drive folder. Confirm your PM can open the
links. For material cleared for link sharing, use “Anyone with the link” with
Viewer access; otherwise use the approved restricted sharing arrangement.
Never make confidential material public just to bypass an access problem.

## README to include with each source project

```markdown
# [Project] — [Fellow]

## This week's contribution
Question, prediction, what I built/tried, observed result, next experiment.

## Human and AI work
My decisions, implementation and verification:
AI tools/voices used and what they generated:
What I rejected or corrected:
What remains unverified or failed:

## Reproduce
Brutalist version/commit and date checked:
Source commit used for this export:
Beat sheet and custom scene files:
Commands or browser steps, dependencies, input/source links:
Approvals and checks (link the records, do not invent sign-offs):

## Watch and review
Landscape Drive link — 3840×2160 — duration — SHA-256:
Vertical Drive link — 2160×3840 — duration — SHA-256:
Sources/large assets Drive link:
PM review status: pending
YouTube 4K processing check: pending upload
Professors' publication decision: pending
```

Use commits to record learning, not just “upload files.” Example:
`Test alternate retrieval ranking; keep baseline after lower recall`.
In the commit body or linked build log, record the attempted change, evidence,
failure or friction, your decision, and the AI contribution. Do not fabricate
struggle, runtime evidence, review or progress.

## Review and publishing responsibilities

The fellow uploads to Drive and notifies the PM with GitHub and Drive links.
If no PM is assigned, contact Sanjana. The PM review covers six gates:

1. Current Brutalist format is followed.
2. Native 4K source/export is checked; after upload, verify the actual YouTube
   4K playback option once processing completes. Local export alone cannot prove it.
3. Both landscape and vertical are supplied for each video.
4. Images render correctly and text is legible on desktop and mobile.
5. The required intro line is present.
6. The viewer gains a specific, useful takeaway.

The pre-upload checks happen first; the YouTube-transcode check is completed by
the review/publishing team after upload and before publication. Record it as
pending until observed, not as a local automated pass. Approved review uploads
go to the Humanitarians AI **Q** playlist without a public-publishing action by
the fellow or this toolkit. Professors Brown and Nina give the final feedback:
publish or send back. Queue placement is not final publication approval.

At scheduling time, the authorized publisher spaces Shorts by **at least one
hour channel-wide**, checking both scheduled and already-published Shorts. Each
Short links to the most popular existing Humanitarians AI video on a related
subject, selected from current channel information at that time. Record the
choice and evidence. It need not be the Short's parent film, and the renderer
must not require an already-published parent URL.

The required full-length vertical companion is not automatically a ≤180-second
Short. Use `art vertical` to preserve the whole report, and a separately reviewed
Short plan if a shorter derivative is wanted. See [pipeline safety and commands](PIPELINE-SAFETY.md).
