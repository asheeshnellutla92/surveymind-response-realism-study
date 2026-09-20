// handFont.ts — load the bundled handwriting face (Shadows Into Light, OFL)
// from public/fonts/ so doodle renders are deterministic on any machine,
// installed system font or not. Follows the Remotion font-loading contract:
// delayRender until the FontFace resolves.
//
// The TTF twin lives in runtime/fonts/Shadows_Into_Light/ for Manim parity
// (install to ~/Library/Fonts on the Mac like the other bundled families).

import {continueRender, delayRender, staticFile} from 'remotion';

export const HAND_FONT =
  '"Shadows Into Light", "Bradley Hand", "Comic Sans MS", cursive';

let loaded = false;

export const loadHandFont = (): void => {
  if (loaded || typeof document === 'undefined') {
    return;
  }
  loaded = true;
  const handle = delayRender('loading Shadows Into Light');
  const face = new FontFace(
    'Shadows Into Light',
    `url(${staticFile('fonts/shadows-into-light-latin-400-normal.woff2')}) format('woff2')`,
  );
  face
    .load()
    .then((f) => {
      // cast: some TS DOM lib versions omit FontFaceSet.add
      (document.fonts as unknown as {add: (font: FontFace) => void}).add(f);
      continueRender(handle);
    })
    .catch(() => {
      // Fall back to the cursive stack rather than hanging the render.
      continueRender(handle);
    });
};
