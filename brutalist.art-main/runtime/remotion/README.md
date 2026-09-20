# vox-remotion — the proven-core Remotion project

The Remotion project the `remotion-pass` skill renders from. `src/tokens/vox.ts` is the
single palette/motion token source; every scene is a `Composition` in `src/Root.tsx`
with a Zod schema, reading its timing off the frame clock so it fills any beat length.

## Prerequisites — what installs are needed

This is the only vox lane that needs **Node.js** (everything else in the workshop is
Python). Check with `node -v`; if it fails, install it once:

```bash
# Homebrew:
brew install node
# or nvm (no admin needed):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && nvm install --lts
```

`npm` (and `npx`) ship with Node. The Remotion packages themselves (`remotion`,
`@remotion/cli`, `react`) install locally into this project via `npm install` below —
nothing global. Rendering needs a Chrome/Chromium; on the Mac Remotion fetches its own
headless shell on first render (no action needed).

## Setup (once, on the Mac)
```bash
cd $ART_HOME/runtime/remotion
npm install
# load the bundled house fonts so the family names in tokens/vox.ts resolve:
cp $ART_HOME/runtime/fonts/*/static/*.ttf \
   $ART_HOME/runtime/fonts/PT_Mono/*.ttf ~/Library/Fonts/
```

## Render a scene
```bash
# default props (BarChart demo):
npx remotion render src/index.ts BarChart out/barchart.mp4
# with per-beat content:
npx remotion render src/index.ts BarChart out/b04.mp4 --props=./b04.props.json
```

## Browser note (proven)
On the Mac, Remotion's default browser handling works. In a constrained/allowlisted
environment (no access to remotion.media, only a full Chrome available), the proven
invocation is:
```bash
VOX_CHROME=/path/to/chrome
npx remotion render src/index.ts BarChart out.mp4 \
  --browser-executable="$VOX_CHROME" --chrome-mode=chrome-for-testing --concurrency=1
```
`chrome-for-testing` mode uses new headless (the full Chrome binary dropped old
headless mode); the `vox_remotion.py` driver reads `VOX_CHROME` / `VOX_CHROME_MODE`.

## Adding a scene (promotion only)
Scenes enter `src/scenes/` by **promotion** through Bear's vet, never by bulk import
from the 367-keeper bench (`../../remotion/_bench/`, the quarry). Generalize the
approved pattern into props, lock it to the tokens, add its `Composition` to
`Root.tsx`, and add an `index.json` row under its `scene_type`.
