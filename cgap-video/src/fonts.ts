import { continueRender, delayRender, staticFile } from 'remotion';

const FACES: Array<[string, string, string]> = [
  ['DM Sans', 'fonts/dm-sans-latin-400-normal.woff2', '400'],
  ['DM Sans', 'fonts/dm-sans-latin-500-normal.woff2', '500'],
  ['DM Sans', 'fonts/dm-sans-latin-700-normal.woff2', '700'],
  ['DM Sans', 'fonts/dm-sans-latin-900-normal.woff2', '900'],
  ['JetBrains Mono', 'fonts/jetbrains-mono-latin-400-normal.woff2', '400'],
  ['JetBrains Mono', 'fonts/jetbrains-mono-latin-500-normal.woff2', '500'],
  ['JetBrains Mono', 'fonts/jetbrains-mono-latin-700-normal.woff2', '700'],
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('fonts');
  Promise.all(
    FACES.map(([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { weight });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('font load failed', err);
      continueRender(handle);
    });
};
