import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import satori from 'satori';
import sharp from 'sharp';
import resume from '../src/data/resume.json';
import { getPortfolioCopy } from '../src/data/portfolio-copy';
import { PROFILE_PORTRAIT_PATH } from '../src/config/profile';
import { SocialPreview } from '../src/components/portfolio/social-preview';

// No live browser, network access, or duplicated biography is required at build.
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file: string) => readFile(path.join(root, file));
const stylesheet = (await read('src/styles/studio-foundation.css')).toString();
const color = (name: string) => {
  const match = stylesheet.match(
    new RegExp(`--color-${name}:\\s*(#[a-f0-9]+)`, 'i')
  );
  if (!match) throw new Error(`Missing share-image theme token: ${name}`);
  return match[1];
};
const copy = getPortfolioCopy('en');
const description = copy.introDescription;
const title = resume.profile.name + ' — ' + copy.introRole;
const portrait = await sharp(await read('public' + PROFILE_PORTRAIT_PATH))
  .png()
  .toBuffer();
const fonts = await Promise.all(
  ([400, 600] as const).map(async (weight) => ({
    name: 'Inter',
    weight,
    style: 'normal' as const,
    data: await read(
      `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`
    ),
  }))
);
const element = createElement(SocialPreview, {
  name: resume.profile.name,
  role: copy.introRole,
  description,
  portrait: 'data:image/png;base64,' + portrait.toString('base64'),
  colors: {
    canvas: color('canvas'),
    text: color('text'),
    muted: color('muted'),
  },
});
const svg = await satori(element, { width: 1200, height: 630, fonts });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
const filename =
  'social-preview.' +
  createHash('sha256').update(png).digest('hex').slice(0, 12) +
  '.png';
const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const original = (await read('dist/index.html')).toString();
const html = original
  .replaceAll('__SOCIAL_IMAGE__', filename)
  .replace(/social-preview\.[a-f0-9]{12}\.png/g, filename)
  .replaceAll('__SOCIAL_TITLE__', escape(title))
  .replaceAll('__INTRO_DESCRIPTION__', escape(description));
if (html.includes('__SOCIAL_') || html.includes('__INTRO_'))
  throw new Error('Share metadata placeholders were not completely replaced.');
const fontCSS = fonts
  .map(
    (font) =>
      `@font-face{font-family:Inter;font-weight:${font.weight};src:url(data:font/woff;base64,${Buffer.from(font.data).toString('base64')}) format('woff');}`
  )
  .join('');
const preview =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>' +
  escape(title) +
  ' — share preview</title><style>' +
  fontCSS +
  'body{margin:0;background:' +
  color('canvas') +
  '}*{box-sizing:border-box}</style></head><body>' +
  renderToStaticMarkup(element) +
  '</body></html>';
await Promise.all([
  writeFile(path.join(root, 'dist', filename), png),
  writeFile(path.join(root, 'dist/social-preview.html'), preview),
  writeFile(path.join(root, 'dist/index.html'), html),
]);
console.log(
  `Generated ${filename} and social-preview.html from the current homepage introduction.`
);
