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
import { getProjects } from '../src/data/projects';
import type { Resume } from '../src/data/resume.schema';
import { buildToolCards } from '../src/components/portfolio/use-tool-cards';
import { getSkillIcon } from '../src/components/pages/tools/skill-icons';
import { PROFILE_PORTRAIT_PATH } from '../src/config/profile';
import { SocialPreview } from '../src/components/portfolio/social-preview';

// Renders the homepage introduction (name, role, description, portrait and the
// tool globe) from the same data and theme tokens the site uses, so the link
// preview in WhatsApp, Slack, LinkedIn etc. follows every site change on deploy.
// No live browser, network access, or duplicated biography is required.
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
const original = (await read('dist/index.html')).toString();
const canonical = original.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (!canonical) throw new Error('index.html needs a canonical URL.');
const site = new URL(canonical).host;
const inline = async (file: string, size: number) =>
  'data:image/png;base64,' +
  (
    await sharp(await read('public' + file), { density: 300 })
      .resize(size, size, { fit: 'inside' })
      .png()
      .toBuffer()
  ).toString('base64');
const portrait = await inline(PROFILE_PORTRAIT_PATH, 440);
const tools = await Promise.all(
  buildToolCards(copy, getProjects('en'), resume as Resume).map(
    async (card) => {
      const icon = getSkillIcon(card.iconKey);
      return { name: card.name, icon: icon && (await inline(icon, 96)) };
    }
  )
);
const fonts = await Promise.all(
  ([400, 500, 600] as const).map(async (weight) => ({
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
  location: resume.profile.location,
  site,
  portrait,
  tools,
  colors: {
    canvas: color('canvas'),
    raised: color('raised'),
    text: color('text'),
    muted: color('muted'),
    accent: color('accent'),
    focus: color('focus'),
  },
});
const svg = await satori(element, { width: 1200, height: 630, fonts });
// JPEG keeps the photo and glow well under WhatsApp's ~300 KB preview limit.
const image = await sharp(Buffer.from(svg))
  .flatten({ background: color('canvas') })
  .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toBuffer();
if (image.length > 300_000)
  throw new Error(
    `Share image is ${image.length} bytes; WhatsApp needs < 300 KB.`
  );
// The content hash in the name changes whenever the image does, so chat apps
// that cache by image URL fetch the new one.
const filename =
  'social-preview.' +
  createHash('sha256').update(image).digest('hex').slice(0, 12) +
  '.jpg';
const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const html = original
  .replaceAll('__SOCIAL_IMAGE__', filename)
  .replace(/social-preview\.[a-f0-9]{12}\.(png|jpg)/g, filename)
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
  writeFile(path.join(root, 'dist', filename), image),
  writeFile(path.join(root, 'dist/social-preview.html'), preview),
  writeFile(path.join(root, 'dist/index.html'), html),
]);
console.log(
  `Generated ${filename} (${Math.round(image.length / 1024)} KB) and social-preview.html from the current homepage introduction.`
);
