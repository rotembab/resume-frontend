# Rotem Babani’s portfolio

A React/TypeScript portfolio for hiring teams, with an Apple-inspired dark visual
system and scroll-telling project chapters. Black and graphite surfaces, spacious
typography, soft project tiles and deep crimson pill actions connect the entire site.
[DESIGN.md](./DESIGN.md) records the adaptations from
[VoltAgent’s Apple analysis](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/apple/DESIGN.md).

## Development

```sh
npm ci
npm run dev
```

Open the Vite URL (normally http://localhost:5173). For a production preview:

```sh
npm run build
npm run preview
```

## Content and navigation

- The homepage leads with Rotem’s identity, portrait and full-stack role, then
  employment proof, all eleven project chapters, scrolling tool icons, capabilities, personal context,
  education and contact.
- “View all projects” opens `/projects`, where search and technology filters
  default to showing every project. Each card has an internal detail page and a
  source link. The homepage and index share their project data; the searchable
  grid appears only on the index.
- The catalog includes all 11 public repositories in the checked-in snapshot.
  Four existing case studies retain their detailed walkthroughs; seven additional
  repositories have concise, source-grounded technical pages.
- Both the homepage chapters and project index sort newest to oldest by
  repository creation date. Recent commits do not change that order.
- New public repositories appear automatically with factual metadata and an
  immutable repository-ID route that survives name changes. Curated descriptions
  are not inferred for newly discovered code.
- GitHub pagination is complete before a result replaces the catalog. The
  snapshot remains visible during initial loading/failure; a failed refresh keeps
  the previous complete response. Known repository IDs preserve authored content
  and slugs after renames. Known detail URLs remain available through the snapshot.
- `/experience`, `/tools`, `/lab` and `/contact` provide deeper information.
  Existing project slugs, homepage section fragments and the CV at
  `/rotem-babani-cv.pdf` are preserved.
- The former `/#all-projects` bookmark redirects to `/projects`.
- The published download is an unchanged copy of `cv-tailor`’s approved Full Stack
  export, version `2026-09-06.6` (`output/pdf/Rotem_Babani_CV.pdf`). Its SHA-256 is
  `c6f1b710ba8abdce763e30bd1120707367f06e6a932e422c2550cd5f1c4f2fae`.
- The main menu follows homepage order: Experience, Work, Tools, About, Contact. Links
  scroll to those sections from every route, including repeated selections.
- Tools in the main navigation scrolls to `/#tools`, immediately below Work.
  Its dedicated `/tools` page uses the same 24 technologies and precise evidence.
  Regular 64px technology icons form a compact scrolling stack without arrow controls, with direct
  selection when motion is disabled or the stage cannot fit. Pickers keep a stable
  width across different project and tool names. The wordmark uses **RB.**.
  Lab retains its existing route but is removed from header and footer navigation.
- `resume.json` and its translations remain professional-history truth.
  `projects.ts` contains the four rich case studies; `project-catalog.ts` merges
  those with reviewed repository details and the complete GitHub feed.
- English, Hebrew RTL and Japanese retain localized interface content, fonts,
  persistent language preferences and consistent focus/scroll behavior.

## Motion and accessibility

The scroll-telling stage presents every catalog project as a product-style story:
short headlines, large uncropped imagery and factual technical highlights.
Normal page scrolling brings the media forward and reveals each story in one
shared stage. A compact native project picker follows the same sequence, with
crossfades and red progress feedback; taller screens also show chapter buttons.
It pins on phones, tablets and desktops when the complete stage fits below the
header. Mobile chapters use compact copy and viewport-sized imagery. Headings and
actions remain readable while media crossfades. A direct “View all
projects” link skips to the ordinary catalog. Live updates preserve the selected
project by its stable slug when the repository order changes.

Short viewports, reduced motion, effects-off and save-data use manual
selection without a long scroll spacer. There is no automatic cycling or wheel
interception. Stable small-viewport geometry prevents Safari browser-bar changes
from restarting touch scrolling. Tool icons move continuously across chapter
boundaries using GPU transforms. The site uses HTML/CSS and Motion. Unused WebGL scenes, earlier
homepage components, legacy styles, scene assets and their dependencies have been
removed.

Screenshots retain their contents; illustrations are labeled. Media failures have
usable fallbacks. Blaster playback is user initiated with native controls.
Contact forms preserve failed drafts, expose nearby validation and focus the first
invalid field. Important controls use 44px targets. WCAG 2.2 AA is the target,
not an assertion established solely by automated checks.

## Contact configuration

Copy `.env.example` to `.env.local` and supply the existing EmailJS service,
owner-message template, public key and optional reply-template values. Owner
email delivery determines success; a failed optional acknowledgment does not
ask a visitor to resend an already delivered message.

## Validation

```sh
npm test
npm run lint
npm run format:check
npm run build
```

The browser runner uses an existing Playwright installation:

```sh
node scripts/qa-apple.mjs --base-url http://127.0.0.1:5173 --playwright-module /absolute/path/to/playwright --out-dir /absolute/path/to/qa-output --channels chrome
```

Start the test preview with dummy EmailJS variables. The runner intercepts
EmailJS and GitHub and blocks other external requests, so no email is sent.
It covers all routes at 360/390/768/1024/1440px in all three locales, project
discovery and failures, filtering, chapter selection, motion fallbacks,
media recovery, CV bytes, menu/focus behavior and contact delivery.

Use `--scenarios routes,stage,tools,catalog,contacts,media,navigation,walkthrough`
to select groups. Use a production preview with `--performance-only` for
throttled loading diagnostics. Reports and screenshots are written outside the
repository. Superseded browser runners for the previous designs have been removed.

Lab LCP/CLS and interaction checks do not establish field INP, field p75 Core
Web Vitals or complete accessibility conformance. Physical devices, screen-reader
review and actual browser zoom require separate checks.

## Link previews

Every production build renders the homepage's current name, role, description
and portrait into a 1200×630 PNG and an HTML preview at `/social-preview.html`.
The renderer reads `resume.json`, `portfolio-copy.ts`, the portrait file and the
active theme tokens. `SocialPreview` provides the shared HTML/image composition;
no second biography or screenshot requires manual updating.

`scripts/build-social-preview.ts` renders React HTML with Satori and Sharp, then
writes static Open Graph and large-image card metadata into `dist/index.html`.
Crawlers receive those tags without running React. Image filenames include their
content hash, so a changed introduction gets a new image URL automatically.
Run `npm run build` and publish through the existing host to refresh everything.
The preview is for `https://rotembabani.com/`; external crawlers cannot access
localhost. Sharing apps choose the surrounding card layout and may cache the
page metadata. The SPA currently shares its portfolio-wide preview on every
route. Per-project social cards would require prerendered or server-generated
route metadata.
