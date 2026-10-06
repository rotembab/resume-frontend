/**
 * Local browser QA for the Apple-inspired portfolio. Run against a preview:
 * node scripts/qa-apple.mjs --base-url http://127.0.0.1:5173
 *   --playwright-module /existing/playwright --out-dir /outside/repository
 *   --channels chrome [--performance] [--scenarios routes,stage,catalog]
 * Use dummy EmailJS service/public/owner/reply settings on the preview server.
 * GitHub and EmailJS are intercepted; all other remote requests are blocked.
 * --performance-only measures cold local-preview lab LCP/CLS, not field INP.
 */
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const name = process.argv[index].replace(/^--/, '');
  const next = process.argv[index + 1];
  args.set(name, next && !next.startsWith('--') ? process.argv[++index] : true);
}
const baseUrl = String(args.get('base-url') || 'http://127.0.0.1:5173');
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
if (!localHosts.has(new URL(baseUrl).hostname))
  throw new Error('Browser QA accepts a local preview URL only.');
const modulePath =
  args.get('playwright-module') || process.env.QA_PLAYWRIGHT_MODULE;
if (!modulePath || !args.get('out-dir'))
  throw new Error('--playwright-module and --out-dir are required.');
const output = path.resolve(String(args.get('out-dir')));
const repo = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const relativeOutput = path.relative(repo, output);
if (
  !relativeOutput ||
  (!(relativeOutput === '..' || relativeOutput.startsWith('..' + path.sep)) &&
    !path.isAbsolute(relativeOutput))
)
  throw new Error('QA screenshots and reports must be outside the repository.');
await mkdir(output, { recursive: true });
const require = createRequire(import.meta.url);
const pw = require(String(modulePath));
// Read the checked-in complete fixture through the installed TypeScript
// compiler. The type-only import disappears; no application API is contacted.
const ts = require('typescript');
const snapshotSource = await readFile(
  path.join(repo, 'src/data/repository-snapshot.ts'),
  'utf8'
);
const snapshotExports = {};
const snapshotJS = ts.transpileModule(snapshotSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
new Function('exports', snapshotJS)(snapshotExports);
const fixture = snapshotExports.repositorySnapshot;
if (!Array.isArray(fixture) || fixture.length !== 11)
  throw new Error(
    'Update the route matrix when the complete repository snapshot changes.'
  );
const slugs = [
  'hebrew-subtitle-studio',
  'developer-portfolio',
  'esp32-claude-remote',
  'flappy-bird-clone',
  'blaster',
  'kitchen-chaos',
  'cinema-rest-api',
  'tic-tac-toe-ai',
  'multi-agent-search',
  'maze-search',
  'cinema',
];
const routes = [
  '/',
  '/projects',
  ...slugs.map((slug) => '/projects/' + slug),
  '/experience',
  '/tools',
  '/lab',
  '/contact',
  '/unknown',
];
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];
const futureRepository = {
  id: 987654321,
  name: 'future-live-project',
  description:
    'A future repository supplied only by the intercepted live response.',
  html_url: 'https://github.com/rotembab/future-live-project',
  created_at: '2026-10-06T10:00:00Z',
  updated_at: '2026-10-06T10:00:00Z',
  pushed_at: '2026-10-06T10:00:00Z',
  language: 'TypeScript',
  homepage: null,
  archived: false,
  fork: false,
  topics: [],
};
const futureSlug = 'repository-' + futureRepository.id;
const requested = args.get('scenarios')
  ? String(args.get('scenarios')).split(',')
  : null;
const selected = (name) =>
  !requested ||
  requested.some((value) => name === value || name.startsWith(value + '-'));
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const safeName = (value) => value.replace(/[^a-z0-9-]/gi, '-');
const report = {
  baseUrl,
  startedAt: new Date().toISOString(),
  engines: [],
  scenarios: [],
  performance: [],
  notes: [
    'EmailJS and GitHub responses are intercepted local fixtures. No email is sent. Other external browser requests are blocked.',
    'The route matrix uses one page/context per viewport and locale. Every public project has an internal route.',
    'Desktop browser emulation complements visual review; physical devices, screen readers, actual 400% zoom and field p75 Core Web Vitals require separate verification.',
    'Only loaded/failed font faces and font network errors are checked. Unused hidden language fonts are not considered failures.',
  ],
};

async function scenario(browser, engine, name, options, action) {
  if (!selected(name)) return;
  const result = {
    name: engine + '-' + name,
    checks: [],
    errors: [],
    consoleErrors: [],
    fontErrors: [],
    canceledFontRequests: [],
    screenshots: [],
    blockedExternalRequests: [],
    githubRequests: [],
  };
  report.scenarios.push(result);
  const mark = (label, passed, details, severity = 'blocker') => {
    result.checks.push({
      name: label,
      passed: Boolean(passed),
      details,
      severity,
    });
    if (!passed)
      console.log(
        result.name + ' failed: ' + label + ' ' + JSON.stringify(details)
      );
  };
  const state = {
    archive: options.archive || 'success',
    email: 'success',
    emails: [],
    ownerTemplate: null,
  };
  const context = await browser.newContext({
    viewport: options.viewport || viewports[4],
    hasTouch: (options.viewport?.width || 1440) < 768,
    reducedMotion: options.reduced ? 'reduce' : 'no-preference',
    serviceWorkers: 'block',
  });
  await context.addInitScript(
    ({ locale, effects, saveData, performance: measure }) => {
      if (!localStorage.getItem('portfolio-language'))
        localStorage.setItem('portfolio-language', locale || 'en');
      if (effects === false) localStorage.setItem('portfolio-effects', 'off');
      if (saveData)
        Object.defineProperty(navigator, 'connection', {
          value: { saveData: true },
          configurable: true,
        });
      if (measure) {
        window.__qaVitals = { lcp: null, cls: 0 };
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              window.__qaVitals.lcp = entry.startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {
          /* Optional browser measurement support. */
        }
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              if (!entry.hadRecentInput) window.__qaVitals.cls += entry.value;
          }).observe({ type: 'layout-shift', buffered: true });
        } catch {
          /* Optional browser measurement support. */
        }
      }
    },
    options
  );
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === 'api.github.com') {
      const page = Number(url.searchParams.get('page') || 1);
      result.githubRequests.push({
        page,
        mode: state.archive,
        url: request.url(),
      });
      const paginated = ['paginated', 'later-error'].includes(state.archive);
      const failed =
        state.archive === 'error' ||
        (state.archive === 'later-error' && page > 1);
      const source =
        state.archive === 'reordered'
          ? [...fixture, futureRepository].map((repository, index) => ({
              ...repository,
              updated_at: new Date(
                Date.UTC(2026, 9, 6, 11, index)
              ).toISOString(),
              created_at: new Date(
                Date.UTC(2026, 9, 6, 11, index)
              ).toISOString(),
            }))
          : state.archive === 'future' || state.archive === 'later-error'
            ? [...fixture, futureRepository]
            : fixture;
      const body = failed
        ? { message: 'Intercepted QA GitHub failure' }
        : state.archive === 'empty'
          ? []
          : paginated
            ? page === 1
              ? source.slice(0, 6)
              : source.slice(6)
            : source;
      const headers =
        paginated && page === 1 && !failed
          ? {
              link: `<${url.origin}${url.pathname}?type=owner&per_page=100&sort=created&direction=desc&page=2>; rel="next"`,
              'access-control-expose-headers': 'Link',
            }
          : {};
      await route.fulfill({
        status: failed ? 503 : 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify(body),
      });
    } else if (url.hostname === 'api.emailjs.com') {
      const data = request.postDataJSON();
      state.ownerTemplate ||= data.template_id;
      const failed =
        state.email === 'owner-failure' ||
        (state.email === 'reply-failure' &&
          data.template_id !== state.ownerTemplate);
      state.emails.push({ template: data.template_id, failed });
      await pause(200);
      await route.fulfill({
        status: failed ? 503 : 200,
        contentType: 'text/plain',
        body: failed ? 'Intercepted QA failure' : 'OK',
      });
    } else if (!localHosts.has(url.hostname)) {
      result.blockedExternalRequests.push(url.origin + url.pathname);
      await route.abort('blockedbyclient');
    } else if (
      options.imageFailure &&
      /\/(subtitle-studio|flappy-bird)\.webp$/.test(url.pathname)
    ) {
      await route.abort('failed');
    } else if (options.videoFailure && url.pathname.endsWith('.mp4')) {
      await route.abort('failed');
    } else await route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(45000);
  page.on('pageerror', (error) => result.errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') result.consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    if (!/\.(woff2?|ttf|otf)(?:\?|$)/i.test(request.url())) return;
    const error =
      request.failure()?.errorText || 'Unknown font request failure';
    const failure = { url: request.url(), error };
    // Navigation/HMR can cancel unused preload requests after the actual face
    // has loaded. Ignore only this explicit cancellation, not network failures.
    if (/^(?:net::)?ERR_ABORTED$/.test(error))
      result.canceledFontRequests.push(failure);
    else result.fontErrors.push(failure);
  });
  page.on('response', (response) => {
    if (!response.ok() && /\.(woff2?|ttf|otf)(?:\?|$)/i.test(response.url()))
      result.fontErrors.push({
        url: response.url(),
        status: response.status(),
      });
  });
  const throttling = {
    applied: false,
    cpuRate: 4,
    latencyMs: 150,
    downloadMbps: 1.6,
    uploadMbps: 0.75,
  };
  if (options.performance) {
    try {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', {
        rate: throttling.cpuRate,
      });
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: throttling.latencyMs,
        downloadThroughput: (throttling.downloadMbps * 1024 * 1024) / 8,
        uploadThroughput: (throttling.uploadMbps * 1024 * 1024) / 8,
      });
      throttling.applied = true;
    } catch (error) {
      throttling.reason = error.message;
    }
  }
  const screenshot = async (label, fullPage = false) => {
    const file = path.join(
      output,
      result.name + '-' + safeName(label) + '.png'
    );
    const position = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
    const settleVisibleMedia = async () => {
      await page.evaluate(async () => {
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
        const visible = [...document.images].filter((image) => {
          const bounds = image.getBoundingClientRect();
          return (
            getComputedStyle(image).visibility !== 'hidden' &&
            bounds.width > 0 &&
            bounds.bottom > 0 &&
            bounds.top < innerHeight &&
            bounds.right > 0 &&
            bounds.left < innerWidth
          );
        });
        await Promise.race([
          Promise.all(visible.map((image) => image.decode().catch(() => {}))),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });
    };
    if (fullPage) {
      // Full-page capture alone does not trigger offscreen loading='lazy'
      // images. Visit each viewport naturally, await visible image decoding,
      // then restore the original page/stage position before taking the shot.
      const step = Math.max(
        300,
        Math.floor((options.viewport?.height || 900) * 0.75)
      );
      for (
        let top = 0;
        top <
        (await page.evaluate(() => document.documentElement.scrollHeight));
        top += step
      ) {
        await page.evaluate(
          (top) => window.scrollTo({ top, behavior: 'instant' }),
          top
        );
        await settleVisibleMedia();
      }
      await page.evaluate(
        (position) =>
          window.scrollTo({
            left: position.x,
            top: position.y,
            behavior: 'instant',
          }),
        position
      );
    }
    await settleVisibleMedia();
    await page.screenshot({ path: file, animations: 'disabled', fullPage });
    result.screenshots.push(file);
  };
  const catalogCheck = async (expected = slugs) => {
    const cards = await page.locator('.catalog-card').evaluateAll((elements) =>
      elements.map((element) => ({
        slug: element.dataset.project,
        destinations: [
          ...element.querySelectorAll('a[href^="/projects/"]'),
        ].map((link) => link.getAttribute('href')),
        source: element.querySelector('.catalog-source')?.getAttribute('href'),
      }))
    );
    mark(
      'complete catalog has every unique project and internal destination',
      cards.length === expected.length &&
        new Set(cards.map((card) => card.slug)).size === expected.length &&
        expected.every((slug) =>
          cards.some(
            (card) =>
              card.slug === slug &&
              card.destinations.every((href) => href === '/projects/' + slug) &&
              Boolean(card.source)
          )
        ),
      cards
    );
    if (state.archive !== 'reordered') {
      const timestamps = cards.map((card) =>
        Date.parse(
          [...fixture, futureRepository].find(
            (repository) => repository.html_url === card.source
          )?.created_at || ''
        )
      );
      mark(
        'public projects are ordered newest to oldest by creation date',
        timestamps.every(
          (timestamp, index) =>
            Number.isFinite(timestamp) &&
            (index === 0 || timestamp <= timestamps[index - 1])
        ),
        cards.map((card) => card.slug)
      );
    }
  };
  const inspect = async (route) => {
    const layout = await page.evaluate(() => {
      const visible = (element) =>
        element.getClientRects().length &&
        getComputedStyle(element).visibility !== 'hidden';
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflowing: [...document.querySelectorAll('main *, .site-header *')]
          .filter(
            (element) =>
              visible(element) &&
              element.getBoundingClientRect().right > innerWidth + 1
          )
          .slice(0, 10)
          .map((element) => ({
            tag: element.tagName,
            class: element.className,
            right: element.getBoundingClientRect().right,
          })),
        headings: document.querySelectorAll('main h1').length,
        nestedLinks: document.querySelectorAll('a a').length,
        language: document.documentElement.lang,
        direction: document.documentElement.dir,
        shortControls: [
          ...document.querySelectorAll(
            '.button,.menu-button,.cv-link,.tool-deck-field select,.carousel-project-picker select,.carousel-chapters button,.catalog-controls input,.catalog-controls select,.catalog-reset,.catalog-freshness button'
          ),
        ]
          .filter(
            (element) =>
              visible(element) && element.getBoundingClientRect().height < 43.5
          )
          .map((element) => ({
            text: element.textContent.trim().slice(0, 80),
            height: element.getBoundingClientRect().height,
          })),
        loadedFonts: [...document.fonts]
          .filter((font) => font.status === 'loaded')
          .map((font) => font.family),
        failedFonts: [...document.fonts]
          .filter((font) => font.status === 'error')
          .map((font) => font.family),
      };
    });
    mark(
      route + ' no horizontal overflow',
      layout.scrollWidth <= layout.width + 1,
      layout
    );
    mark(
      route + ' one main heading and no nested links',
      layout.headings === 1 && layout.nestedLinks === 0,
      layout
    );
    mark(
      route + ' important controls have 44px targets',
      layout.shortControls.length === 0,
      layout.shortControls
    );
    const locale = options.locale || 'en';
    mark(
      route + ' correct locale and direction',
      layout.language === (locale === 'jp' ? 'ja' : locale) &&
        layout.direction === (locale === 'he' ? 'rtl' : 'ltr'),
      { language: layout.language, direction: layout.direction }
    );
    const family =
      locale === 'he'
        ? 'Noto Sans Hebrew'
        : locale === 'jp'
          ? 'Noto Sans JP'
          : 'Inter';
    mark(
      route + ' language font loaded without font errors',
      layout.loadedFonts.some((font) => font.includes(family)) &&
        layout.failedFonts.length === 0 &&
        result.fontErrors.length === 0,
      {
        family,
        loaded: [...new Set(layout.loadedFonts)],
        failed: layout.failedFonts,
        network: result.fontErrors,
      }
    );
  };
  const visit = async (route, check = true) => {
    await page.goto(baseUrl + route, { waitUntil: 'networkidle' });
    await page.locator('main h1').waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    if (check) await inspect(route);
  };
  try {
    await action({
      page,
      context,
      result,
      state,
      mark,
      screenshot,
      catalogCheck,
      inspect,
      visit,
      throttling,
    });
  } catch (error) {
    mark('scenario completed', false, error.stack || error.message);
  }
  mark('no runtime exceptions', result.errors.length === 0, result.errors);
  const applicationErrors = result.consoleErrors.filter(
    (message) =>
      !/Failed to load resource|net::ERR|503 \(Service Unavailable\)/.test(
        message
      )
  );
  mark(
    'no application console errors',
    applicationErrors.length === 0,
    applicationErrors
  );
  await context.close();
  console.log(
    result.name +
      ': ' +
      result.checks.filter((check) => !check.passed).length +
      ' failed checks'
  );
}

async function storyVisualState(region) {
  return region.evaluate((element) => {
    const styles = (target) => {
      if (!target) return null;
      const style = getComputedStyle(target);
      return {
        opacity: Number(style.opacity),
        transform: style.transform,
        visibility: style.visibility,
      };
    };
    const panels = [...element.querySelectorAll('.carousel-slide')].map(
      (panel, index) => {
        const image = panel.querySelector('.carousel-media img');
        const bounds = image?.getBoundingClientRect();
        const media = panel.querySelector('.carousel-media');
        const mediaBounds = media.getBoundingClientRect();
        const illustration = media.querySelector('.catalog-illustration svg');
        return {
          index,
          destination: panel
            .querySelector('.carousel-actions a[href^="/projects/"]')
            ?.getAttribute('href'),
          active: panel.dataset.active === 'true',
          hidden: panel.getAttribute('aria-hidden') === 'true',
          opacity: Number(getComputedStyle(panel).opacity),
          actionTabStops: [
            ...panel.querySelectorAll('.carousel-actions a'),
          ].filter((action) => action.tabIndex >= 0).length,
          purpose:
            panel.querySelector('.carousel-summary')?.textContent.trim() || '',
          features: [
            ...panel.querySelectorAll('.carousel-story-features > p'),
          ].map((feature) => feature.textContent.trim()),
          captionStyles: [
            ...panel.querySelectorAll(
              '.carousel-copy,.carousel-copy h3,.carousel-copy p'
            ),
          ].map(styles),
          featureStyles: [
            ...panel.querySelectorAll(
              '.carousel-story-footer,.carousel-story-features,.carousel-story-features > p'
            ),
          ].map(styles),
          media: styles(media),
          mediaBounds: {
            top: mediaBounds.top,
            bottom: mediaBounds.bottom,
            left: mediaBounds.left,
            right: mediaBounds.right,
          },
          illustration: illustration
            ? {
                label: illustration.getAttribute('aria-label'),
                caption: media.querySelector('.catalog-illustration span')
                  ?.textContent,
              }
            : null,
          image: image
            ? {
                loaded: image.complete && image.naturalWidth > 0,
                source: image.currentSrc || image.src,
                fit: getComputedStyle(image).objectFit,
                bounds: {
                  top: bounds.top,
                  bottom: bounds.bottom,
                  left: bounds.left,
                  right: bounds.right,
                },
              }
            : null,
        };
      }
    );
    return {
      panels,
      active: panels.find((panel) => panel.active),
      viewportHeight: innerHeight,
      viewportWidth: innerWidth,
      headerBottom: document
        .querySelector('.site-header')
        .getBoundingClientRect().bottom,
    };
  });
}

async function waitForStageIndex(page, index) {
  await page.waitForFunction((index) => {
    const region = document.querySelector('.project-carousel');
    return (
      Number(region?.dataset.currentIndex) === index &&
      Number(
        region?.querySelector('.carousel-slide[data-active="true"]')?.dataset
          .slideIndex
      ) === index
    );
  }, index);
}

async function selectStageProject(page, region, index) {
  const picker = region.locator('.carousel-project-picker select');
  if ((await picker.count()) && (await picker.isVisible()))
    await picker.selectOption({ index });
  else await region.locator('.carousel-chapters button').nth(index).click();
  await waitForStageIndex(page, index);
}

async function stage(qa) {
  const { page, mark, visit, catalogCheck, screenshot } = qa;
  await visit('/');
  const region = page.locator('.project-carousel');
  const buttons = region.locator('.carousel-chapters button');
  const picker = region.locator('.carousel-project-picker select');
  await region.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector('.project-carousel')?.dataset.layout
  );
  const layout = await region.getAttribute('data-layout');
  const projects = await region
    .locator('.carousel-slide')
    .evaluateAll((panels) =>
      panels.map((panel) =>
        panel
          .querySelector('.carousel-actions a[href^="/projects/"]')
          ?.getAttribute('href')
          .replace('/projects/', '')
      )
    );
  const last = projects.length - 1;
  const hasPicker = (await picker.count()) > 0 && (await picker.isVisible());
  const buttonCount = await buttons.count();
  const pickerWidth = hasPicker
    ? await picker.evaluate((element) => element.getBoundingClientRect().width)
    : 0;
  if (hasPicker) {
    const pickerSpacing = await picker.evaluate((element) => {
      const arrow = getComputedStyle(element.parentElement, '::after');
      return {
        width: element.getBoundingClientRect().width,
        fieldWidth: element.parentElement.getBoundingClientRect().width,
        arrowInset: parseFloat(arrow.insetInlineEnd),
        decorativeArrow: arrow.pointerEvents === 'none',
      };
    });
    mark(
      'project picker uses a compact fixed field with an inset arrow',
      pickerSpacing.arrowInset === 17 &&
        pickerSpacing.decorativeArrow &&
        pickerSpacing.fieldWidth <= 301 &&
        pickerSpacing.width <= 301,
      pickerSpacing
    );
  }
  mark(
    'story contains all eleven unique catalog projects and detail routes',
    projects.length === slugs.length &&
      new Set(projects).size === slugs.length &&
      slugs.every((slug) => projects.includes(slug)),
    projects
  );
  mark(
    'native project selector exposes all eleven projects',
    hasPicker && (await picker.locator('option').count()) === slugs.length,
    { hasPicker, buttonCount, projects }
  );
  mark(
    'optional chapter buttons match the complete story',
    buttonCount === 0 || buttonCount === projects.length,
    { buttonCount, projects: projects.length }
  );
  if (hasPicker && buttonCount) {
    const showsChapterStrip = await page.evaluate(
      () => matchMedia('(min-width: 1024px) and (min-height: 960px)').matches
    );
    mark(
      showsChapterStrip
        ? 'tall desktop shows the chapter strip alongside its native selector'
        : 'compact native selector replaces hidden chapter buttons',
      (await buttons.first().isVisible()) === showsChapterStrip,
      { showsChapterStrip }
    );
  }
  mark(
    'homepage keeps the complete story without a duplicated catalog or search',
    (await page.locator('.carousel-slide').count()) === 11 &&
      (await page.locator('.catalog-card,.catalog-search').count()) === 0
  );
  const stageGeometry = await region.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    top: parseFloat(getComputedStyle(element).top),
    viewportHeight: innerHeight,
    viewportWidth: innerWidth,
  }));
  mark(
    'scroll story pins only when the entire stage fits',
    layout !== 'scroll' ||
      stageGeometry.height <=
        stageGeometry.viewportHeight - stageGeometry.top - 16,
    stageGeometry
  );
  const requiredPinnedViewport =
    [
      [775, 846],
      [360, 800],
      [390, 844],
      [1280, 720],
      [1024, 768],
      [1440, 900],
    ].some(
      ([width, height]) =>
        stageGeometry.viewportWidth === width &&
        stageGeometry.viewportHeight === height
    ) ||
    (stageGeometry.viewportWidth >= 1440 &&
      stageGeometry.viewportHeight >= 1100);
  if (
    requiredPinnedViewport &&
    (await region.getAttribute('data-motion')) === 'full'
  )
    mark(
      'ordinary desktop motion pins all eleven compact project stories',
      layout === 'scroll',
      stageGeometry
    );
  const controlMatches = async (index) =>
    hasPicker
      ? picker.evaluate(
          (element, index) => element.selectedIndex === index,
          index
        )
      : (await buttons.nth(index).getAttribute('aria-pressed')) === 'true';
  for (let index = 0; index < projects.length; index += 1) {
    await selectStageProject(page, region, index);
    if (hasPicker)
      mark(
        'project selection preserves picker width for ' + projects[index],
        Math.abs(
          (await picker.evaluate(
            (element) => element.getBoundingClientRect().width
          )) - pickerWidth
        ) < 1
      );
    const story = await storyVisualState(region);
    mark(
      'direct selection reaches project ' + projects[index],
      (await controlMatches(index)) &&
        story.active.destination === '/projects/' + projects[index],
      { index, active: story.active.destination }
    );
    mark(
      'project has a compact purpose and two authored feature statements: ' +
        projects[index],
      story.active.purpose.length > 0 &&
        story.active.features.length === 2 &&
        story.active.features.every((feature) => feature.length > 0),
      { purpose: story.active.purpose, features: story.active.features }
    );
  }
  const keyboardControl = hasPicker ? picker : buttons.first();
  await keyboardControl.evaluate((element) =>
    element.focus({ preventScroll: true })
  );
  await page.keyboard.press('Home');
  if (hasPicker) await page.keyboard.press('Enter');
  await waitForStageIndex(page, 0);
  const direction = await page.locator('html').getAttribute('dir');
  await page.keyboard.press(
    hasPicker ? 'ArrowDown' : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  );
  if (hasPicker) await page.keyboard.press('Enter');
  await waitForStageIndex(page, 1);
  mark(
    'keyboard chooses the next project and preserves control focus',
    (await controlMatches(1)) &&
      (await (hasPicker ? picker : buttons.nth(1)).evaluate(
        (element) => document.activeElement === element
      )),
    { direction, nativeSelector: hasPicker }
  );
  await page.keyboard.press('End');
  if (hasPicker) {
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
  }
  await waitForStageIndex(page, last);
  mark(
    'keyboard End selects the eleventh project',
    (await controlMatches(last)) &&
      (await (hasPicker ? picker : buttons.last()).evaluate(
        (element) => document.activeElement === element
      ))
  );
  if (layout === 'scroll') {
    const geometry = await region.evaluate((element) => ({
      storyTop: element.parentElement.getBoundingClientRect().top + scrollY,
      stageHeight: element.getBoundingClientRect().height,
      storyHeight: element.parentElement.getBoundingClientRect().height,
      stickyTop: parseFloat(getComputedStyle(element).top),
    }));
    const start = geometry.storyTop - geometry.stickyTop;
    const span = geometry.storyHeight - geometry.stageHeight;
    for (let index = 0; index < projects.length; index += 1) {
      await page.evaluate(
        (top) => window.scrollTo({ top, behavior: 'instant' }),
        start + (span * index) / last
      );
      await waitForStageIndex(page, index);
      mark(
        'native page position selects chapter ' + index,
        await controlMatches(index)
      );
      const visualProgress = await region.evaluate((element) => {
        const indicator = getComputedStyle(
          element.querySelector('.carousel-toolbar'),
          '::after'
        );
        return {
          scale: new DOMMatrix(indicator.transform).a,
          origin: indicator.transformOrigin,
          width: parseFloat(indicator.width),
        };
      });
      mark(
        'scroll telling visibly advances progress at chapter ' + index,
        Math.abs(visualProgress.scale - index / last) < 0.03,
        { visualProgress, chapter: index }
      );
      if (index === 0)
        mark(
          'progress grows from the locale reading direction',
          direction === 'rtl'
            ? Math.abs(
                parseFloat(visualProgress.origin) - visualProgress.width
              ) < 1
            : Math.abs(parseFloat(visualProgress.origin)) < 1,
          { direction, ...visualProgress }
        );
      {
        const image = region.locator(
          '.carousel-slide[data-active="true"] .carousel-media img'
        );
        if (await image.count())
          await image.evaluate((image) => image.decode());
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            )
        );
        const centered = await storyVisualState(region);
        mark(
          'centered chapter presents one fully visible story panel',
          centered.active.media.opacity >= 0.98 &&
            centered.active.captionStyles.every(
              (style) => style.visibility === 'visible'
            ) &&
            centered.panels
              .filter((panel) => !panel.active)
              .every(
                (panel) =>
                  panel.media.opacity <= 0.02 &&
                  panel.captionStyles.every(
                    (style) => style.visibility === 'hidden'
                  )
              ),
          centered.panels.map((panel) => ({
            index: panel.index,
            active: panel.active,
            mediaOpacity: panel.media.opacity,
            captionVisibility: panel.captionStyles[0].visibility,
          }))
        );
        mark(
          'chapter displays uncropped screenshot or labelled technical illustration: ' +
            projects[index],
          (centered.active.image
            ? centered.active.image.loaded &&
              centered.active.image.fit === 'contain'
            : Boolean(
                centered.active.illustration?.label &&
                  centered.active.illustration?.caption
              )) &&
            centered.active.mediaBounds.top >= centered.headerBottom - 1 &&
            centered.active.mediaBounds.bottom <= centered.viewportHeight + 1 &&
            centered.active.mediaBounds.left >= -1 &&
            centered.active.mediaBounds.right <= centered.viewportWidth + 1,
          {
            image: centered.active.image,
            illustration: centered.active.illustration,
            bounds: centered.active.mediaBounds,
          }
        );
        mark(
          'chapter tells its purpose and two factual feature statements',
          centered.active.purpose.length > 0 &&
            centered.active.features.length === 2 &&
            centered.active.features.every((feature) => feature.length > 0),
          {
            purpose: centered.active.purpose,
            features: centered.active.features,
          }
        );
        mark(
          'inactive story actions are removed from keyboard and accessibility navigation',
          centered.panels
            .filter((panel) => !panel.active)
            .every((panel) => panel.hidden && panel.actionTabStops === 0),
          centered.panels
        );
        if (index === Math.min(4, last - 1)) {
          const fractional = (index + 0.25) / last;
          await page.evaluate(
            (top) => window.scrollTo({ top, behavior: 'instant' }),
            start + span * fractional
          );
          await page.waitForFunction(
            (expected) =>
              Math.abs(
                Number(
                  document.querySelector('.project-carousel-scroll-story')
                    ?.dataset.scrollProgress
                ) - expected
              ) < 0.01,
            fractional
          );
          await page.evaluate(
            () =>
              new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve))
              )
          );
          const moving = await storyVisualState(region);
          mark(
            'fractional native scrolling animates the media within the chosen chapter',
            moving.active.index === centered.active.index &&
              moving.active.media.transform !== centered.active.media.transform,
            {
              centered: centered.active.media,
              moving: moving.active.media,
            }
          );
          mark(
            'fractional native scrolling keeps the selected story readable while feature beats move',
            moving.active.captionStyles.every(
              (style) => style.opacity === 1 && style.visibility === 'visible'
            ) &&
              JSON.stringify(moving.active.featureStyles) !==
                JSON.stringify(centered.active.featureStyles),
            {
              centeredCaption: centered.active.captionStyles,
              movingCaption: moving.active.captionStyles,
              centeredFeatures: centered.active.featureStyles,
              movingFeatures: moving.active.featureStyles,
            }
          );
          const midpoint = (index + 0.5) / last;
          await page.evaluate(
            (top) => window.scrollTo({ top, behavior: 'instant' }),
            start + span * midpoint
          );
          await page.waitForFunction(
            (expected) =>
              Math.abs(
                Number(
                  document.querySelector('.project-carousel-scroll-story')
                    ?.dataset.scrollProgress
                ) - expected
              ) < 0.005,
            midpoint
          );
          const transition = await storyVisualState(region);
          mark(
            'chapter midpoint has one readable heading and visible project actions',
            transition.active.captionStyles.every(
              (style) => style.opacity === 1 && style.visibility === 'visible'
            ) &&
              transition.active.featureStyles[0].opacity === 1 &&
              transition.active.featureStyles[0].visibility === 'visible' &&
              transition.panels
                .filter((panel) => !panel.active)
                .every(
                  (panel) => panel.captionStyles[0].visibility === 'hidden'
                ),
            transition.panels
          );
        }
      }
    }
    if (
      stageGeometry.viewportWidth === 775 &&
      stageGeometry.viewportHeight === 846
    ) {
      await page.evaluate(
        (top) => window.scrollTo({ top, behavior: 'instant' }),
        start
      );
      await page.waitForFunction(
        () =>
          document.querySelector('.project-carousel')?.dataset.currentIndex ===
          '0'
      );
      await page.mouse.move(380, 500);
      for (let index = 1; index <= last; index++) {
        await page.mouse.wheel(0, span / last);
        await page.waitForFunction(
          (index) =>
            Number(
              document.querySelector('.project-carousel')?.dataset.currentIndex
            ) === index,
          index
        );
        mark(
          'ordinary wheel scrolling reaches project ' +
            (index + 1) +
            ' in the in-app pane',
          Number(await region.getAttribute('data-current-index')) === index
        );
      }
      await page.mouse.wheel(0, -span / last);
      await page.waitForFunction(
        (index) =>
          Number(
            document.querySelector('.project-carousel')?.dataset.currentIndex
          ) === index,
        last - 1
      );
      mark(
        'ordinary wheel scrolling reverses the in-app project sequence',
        Number(await region.getAttribute('data-current-index')) === last - 1
      );
      await screenshot('in-app-pane-wheel-scrolling');
    }
    await page
      .locator('main')
      .evaluate((element) => element.focus({ preventScroll: true }));
    await page.keyboard.press('Home');
    await page.waitForFunction(() => scrollY < 5);
    mark(
      'native page Home is not intercepted',
      await page.evaluate(() => scrollY < 5)
    );
  } else {
    mark(
      'manual stage removes the tall story spacer',
      await region.evaluate((element) => !element.parentElement.style.height)
    );
    await selectStageProject(page, region, 2);
    await page.evaluate(() =>
      window.scrollBy({ top: 120, behavior: 'instant' })
    );
    await pause(250);
    mark(
      'ordinary scrolling does not change manual selection',
      (await region.getAttribute('data-current-index')) === '2'
    );
    mark(
      'only selected manual project actions are exposed',
      (await region
        .locator(
          '.carousel-slide:not([aria-hidden="true"]) .carousel-actions a'
        )
        .count()) === 2
    );
  }
  await region.locator('.carousel-bypass').click();
  await page.waitForURL('**/projects');
  await page.waitForFunction(
    () => document.activeElement === document.querySelector('.projects-page h1')
  );
  mark(
    'bypass clears the sticky header and focuses the full catalog',
    await page.evaluate(
      () =>
        document.querySelector('.projects-page h1').getBoundingClientRect()
          .top >=
        document.querySelector('.site-header').getBoundingClientRect().bottom -
          2
    )
  );
  await catalogCheck();
  mark(
    'bypass opens searchable project index',
    await page.locator('.catalog-search input').isVisible()
  );
  mark('no active WebGL scenes', (await page.locator('canvas').count()) === 0);
}

async function catalogs({ page, mark, visit, catalogCheck }) {
  await visit('/projects');
  await catalogCheck();
  const search = page.locator('.catalog-search input');
  const filter = page.locator('.catalog-filter select');
  await search.fill('KitchenChaos');
  mark(
    'search finds a repository by its exact source name',
    (await page.locator('.catalog-card').count()) === 1 &&
      (await page.locator('.catalog-card').getAttribute('data-project')) ===
        'kitchen-chaos'
  );
  await page.locator('.catalog-reset').click();
  await filter.selectOption('Java');
  mark(
    'technology filtering narrows to all Java learning projects',
    (await page.locator('.catalog-card').count()) === 3
  );
  await search.fill('there-is-no-such-project-qa');
  mark(
    'unmatched search exposes an empty state with recovery',
    (await page.locator('.catalog-card').count()) === 0 &&
      (await page.locator('.catalog-empty').isVisible())
  );
  await page.locator('.catalog-empty button').click();
  await catalogCheck();
  mark(
    'reset clears both controls',
    (await search.inputValue()) === '' && (await filter.inputValue()) === ''
  );
}

async function settledStageMeasurement(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  });
  await pause(120);
  return page.locator('.project-carousel').evaluate((element) => ({
    mode: element.dataset.layout,
    stageHeight: element.getBoundingClientRect().height,
    minimumViewport:
      element.getBoundingClientRect().height +
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--header-height'
        )
      ) +
      24 +
      16,
    viewportHeight: innerHeight,
  }));
}

async function findStageFitLimit(page, width, geometryOnly = false) {
  const samples = [];
  const fits = async (height) => {
    const measurement = await settledStageMeasurement(page, width, height);
    samples.push(measurement);
    return geometryOnly
      ? measurement.minimumViewport <= height
      : measurement.mode === 'scroll';
  };
  let lower = 400;
  let upper = 1600;
  if (await fits(lower))
    throw new Error('The lower stage-fit search bound must be manual.');
  while (!(await fits(upper))) {
    upper += 400;
    if (upper > 3200)
      throw new Error(
        'The complete desktop story never reaches a fitting viewport.'
      );
  }
  while (upper - lower > 2) {
    const middle = Math.floor((lower + upper) / 2);
    if (await fits(middle)) upper = middle;
    else lower = middle;
  }
  return { minimumHeight: upper, maximumManualHeight: lower, samples };
}

async function stageFitBoundary({ page, mark, visit }) {
  await visit('/');
  const region = page.locator('.project-carousel');
  const boundary = await findStageFitLimit(page, 1440);
  // The media uses vh, so every candidate must settle at its own viewport
  // height rather than reusing a stage measurement from a taller screen.
  for (const [height, expected] of [
    [boundary.minimumHeight - 8, 'manual'],
    [boundary.minimumHeight + 8, 'scroll'],
    [boundary.minimumHeight - 8, 'manual'],
  ]) {
    await page.setViewportSize({ width: 1440, height });
    await page.waitForFunction(
      (expected) =>
        document.querySelector('.project-carousel')?.dataset.layout ===
        expected,
      expected
    );
    await pause(500);
    mark(
      'complete stage remains stable at viewport height ' + height,
      (await region.getAttribute('data-layout')) === expected,
      { height, boundary, expected }
    );
  }
  mark(
    'near-limit manual stage has no scroll spacer',
    await region.evaluate((element) => !element.parentElement.style.height)
  );
}

async function stageLanguageTransition({ page, mark, visit }) {
  await visit('/');
  const region = page.locator('.project-carousel');
  const width = 1024;
  const openMenu = async () => {
    const button = page.locator('.menu-button');
    if ((await button.getAttribute('aria-expanded')) === 'true') return;
    const bounds = await button.boundingBox();
    const viewport = page.viewportSize();
    if (!bounds || bounds.y < 0 || bounds.y + bounds.height > viewport.height)
      throw new Error('Visible sticky menu control is missing.');
    await page.mouse.click(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2
    );
  };
  const changeLanguage = async (language) => {
    await openMenu();
    await page
      .locator('#site-language')
      .evaluate((element) => element.focus({ preventScroll: true }));
    await page.keyboard.press('Home');
    if (language === 'he') await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForFunction(
      (language) => document.documentElement.lang === language,
      language
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
    });
    await pause(150);
  };
  const setEffects = async (enabled) => {
    await openMenu();
    const toggle = page.locator('.effects-toggle');
    if ((await toggle.getAttribute('aria-pressed')) !== String(enabled))
      await toggle.click();
    await page.waitForFunction(
      (enabled) =>
        document.querySelector('.project-carousel')?.dataset.motion ===
        (enabled ? 'full' : 'reduced'),
      enabled
    );
  };
  const measureManual = async (language) => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await changeLanguage(language);
    await page.waitForFunction(
      () =>
        document.querySelector('.project-carousel')?.dataset.layout === 'manual'
    );
    return settledStageMeasurement(page, width, page.viewportSize().height);
  };
  // Disable animation temporarily to measure both localized manual stages at
  // an identical width. The transition follows the shorter locale into the
  // taller one when their actual fit limits allow a language-induced unpin.
  await page.setViewportSize({ width, height: 1200 });
  await setEffects(false);
  await measureManual('he');
  const hebrewBoundary = await findStageFitLimit(page, width, true);
  await measureManual('en');
  const englishBoundary = await findStageFitLimit(page, width, true);
  const boundaries = {
    he: hebrewBoundary.minimumHeight,
    en: englishBoundary.minimumHeight,
  };
  const shorter = boundaries.he <= boundaries.en ? 'he' : 'en';
  const taller = shorter === 'he' ? 'en' : 'he';
  let height = Math.floor((boundaries.he + boundaries.en) / 2);
  await page.setViewportSize({ width, height });
  const measurements = {
    he: await measureManual('he'),
    en: await measureManual('en'),
  };
  const languageUnpins =
    height >= measurements[shorter].minimumViewport &&
    height < measurements[taller].minimumViewport &&
    boundaries[taller] - boundaries[shorter] >= 8;
  if (!languageUnpins) {
    height = Math.max(boundaries.he, boundaries.en) + 96;
    await page.setViewportSize({ width, height });
  }
  await changeLanguage(shorter);
  await setEffects(true);
  await page.waitForFunction(
    () =>
      document.querySelector('.project-carousel')?.dataset.layout === 'scroll'
  );
  await selectStageProject(page, region, 2);
  await changeLanguage(taller);
  await page.waitForFunction(
    (expected) =>
      document.querySelector('.project-carousel')?.dataset.layout === expected,
    languageUnpins ? 'manual' : 'scroll'
  );
  mark(
    'language change retains the chosen project across measured locale fit limits',
    (await region.getAttribute('data-current-index')) === '2',
    { measurements, boundaries, height, shorter, taller, languageUnpins }
  );
  if (!languageUnpins) {
    // Equally fitting locales still exercise the same coordination: preserve
    // the chapter through translation, then unpin across its measured limit.
    await page.setViewportSize({
      width,
      height: boundaries[taller] - 8,
    });
    await page.waitForFunction(
      () =>
        document.querySelector('.project-carousel')?.dataset.layout === 'manual'
    );
  }
  await pause(500);
  mark(
    'localized unpin retains the chosen project',
    (await region.getAttribute('data-current-index')) === '2'
  );
  const destination = await region
    .locator('.carousel-slide[data-active="true"] .carousel-actions a')
    .first()
    .boundingBox();
  const viewport = page.viewportSize();
  mark(
    'localized unpin keeps the chosen project action in view',
    destination &&
      destination.y >= 64 &&
      destination.y + destination.height <= viewport.height - 16,
    { destination, viewport }
  );
  mark(
    'language selector keeps keyboard focus through unpinning',
    await page
      .locator('#site-language')
      .evaluate((element) => document.activeElement === element)
  );
}

async function stageHistory({ page, mark, visit, state, result }) {
  await visit('/');
  const region = page.locator('.project-carousel');
  const picker = region.locator('.carousel-project-picker select');
  const expected = [...slugs, futureSlug];
  const projectIndex = async (slug) =>
    picker
      .locator('option')
      .evaluateAll(
        (options, slug) => options.findIndex((option) => option.value === slug),
        slug
      );
  mark(
    'future public repository also joins the shared story catalog',
    (await picker.locator('option').count()) === expected.length,
    { expected: expected.length }
  );
  const returnToStory = async (slug, label) => {
    await page.goBack({ waitUntil: 'networkidle' });
    await region.waitFor({ state: 'visible' });
    await page.waitForFunction(
      (slug) =>
        document
          .querySelector(
            '.carousel-slide[data-active="true"] .carousel-actions a[href^="/projects/"]'
          )
          ?.getAttribute('href') ===
        '/projects/' + slug,
      slug
    );
    const action = region.locator(
      '.carousel-slide[data-active="true"] .carousel-actions a[href^="/projects/"]'
    );
    const bounds = await action.boundingBox();
    const headerBottom = await page
      .locator('.site-header')
      .evaluate((element) => element.getBoundingClientRect().bottom);
    const viewport = page.viewportSize();
    mark(
      label + ' restores selected project identity and keyboard focus',
      (await picker.inputValue()) === slug &&
        (await action.evaluate(
          (element) => document.activeElement === element
        )),
      { slug, selection: await picker.inputValue() }
    );
    mark(
      label + ' returns its project action into the viewport',
      bounds &&
        bounds.y >= headerBottom - 1 &&
        bounds.y + bounds.height <= viewport.height + 1,
      { slug, bounds, headerBottom, viewport }
    );
  };
  for (const slug of expected) {
    const index = await projectIndex(slug);
    if (index < 0) throw new Error('Story selector is missing ' + slug);
    await selectStageProject(page, region, index);
    await region
      .locator('.carousel-slide[data-active="true"] .carousel-actions a')
      .first()
      .click();
    await page.waitForURL('**/projects/' + slug);
    await page.locator('main h1').waitFor({ state: 'visible' });
    await returnToStory(slug, 'POP from ' + slug);
  }
  const reorderedSlug = 'blaster';
  const beforeIndex = await projectIndex(reorderedSlug);
  await selectStageProject(page, region, beforeIndex);
  await region
    .locator('.carousel-slide[data-active="true"] .carousel-actions a')
    .first()
    .click();
  await page.waitForURL('**/projects/' + reorderedSlug);
  state.archive = 'reordered';
  const refreshed = page.waitForResponse(
    (response) =>
      new URL(response.url()).hostname === 'api.github.com' && response.ok()
  );
  // Expire only this isolated page's query cache, then exercise its actual
  // reconnect refresh. The reordered intercepted feed retains repository IDs.
  await page.evaluate(() => {
    const realNow = Date.now.bind(Date);
    Date.now = () => realNow() + 60 * 60 * 1000 + 1000;
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));
  });
  await refreshed;
  await pause(250);
  await returnToStory(reorderedSlug, 'POP after live catalog reorder');
  const afterIndex = await projectIndex(reorderedSlug);
  mark(
    'changed repository order restores a project by slug rather than old index',
    beforeIndex !== afterIndex &&
      Number(await region.getAttribute('data-current-index')) === afterIndex &&
      result.githubRequests.some((request) => request.mode === 'reordered'),
    { beforeIndex, afterIndex, requests: result.githubRequests }
  );
}

async function contacts({ page, state, mark, visit }) {
  await visit('/contact');
  const submit = page.locator('.contact-form button[type="submit"]');
  await submit.click();
  await page.waitForFunction(
    () => document.activeElement?.id === 'contact-name'
  );
  mark(
    'empty submission focuses required field without sending',
    state.emails.length === 0
  );
  const fill = async () => {
    await page.locator('#contact-name').fill('QA Visitor');
    await page.locator('#contact-email').fill('qa@example.com');
    await page
      .locator('#contact-message')
      .fill('Intercepted local QA message.');
  };
  await fill();
  await submit.click();
  mark('delivery locks duplicate submission', await submit.isDisabled());
  await page.locator('.MuiAlert-filledSuccess').waitFor();
  mark(
    'owner delivery clears the sent draft',
    (await page.locator('#contact-message').inputValue()) === '' &&
      state.emails.some((email) => !email.failed)
  );
  await page.reload({ waitUntil: 'networkidle' });
  state.email = 'owner-failure';
  await fill();
  await submit.click();
  await page.locator('.MuiAlert-filledError').waitFor();
  mark(
    'owner failure preserves draft for retry',
    (await page.locator('#contact-message').inputValue()) ===
      'Intercepted local QA message.' && (await submit.isEnabled())
  );
  state.email = 'success';
  await submit.click();
  await page.locator('.MuiAlert-filledSuccess').waitFor();
  mark(
    'retry sends the retained draft',
    (await page.locator('#contact-message').inputValue()) === ''
  );
  await page.reload({ waitUntil: 'networkidle' });
  state.email = 'reply-failure';
  await fill();
  await submit.click();
  await page.locator('.MuiAlert-filledSuccess').waitFor();
  mark(
    'optional reply failure does not undo owner success',
    (await page.locator('#contact-message').inputValue()) === ''
  );
  mark(
    'optional acknowledgment failure exercised when configured',
    state.emails.some(
      (email) => email.failed && email.template !== state.ownerTemplate
    ),
    undefined,
    'diagnostic'
  );
}

async function toolDeck(qa, route = '/tools') {
  const { page, mark, visit, screenshot } = qa;
  await visit(route);
  const story = page.locator('.tool-deck-story');
  const region = page.locator('.tool-deck-stage');
  const picker = region.locator('select');
  mark(
    'tool animation has no previous/next arrow controls',
    (await region.locator('button').count()) === 0
  );
  await region.scrollIntoViewIfNeeded();
  const layout = await story.getAttribute('data-layout');
  const entries = await picker
    .locator('option')
    .evaluateAll((options) =>
      options.map((option) => ({ id: option.value, name: option.textContent }))
    );
  const geometry = await story.evaluate((element) => {
    const stage = element.querySelector('.tool-deck-stage');
    return {
      start:
        element.getBoundingClientRect().top +
        scrollY -
        parseFloat(getComputedStyle(stage).top || '88'),
      span:
        parseFloat(element.style.height) - stage.getBoundingClientRect().height,
      height: stage.getBoundingClientRect().height,
      viewport: innerHeight,
      top: parseFloat(getComputedStyle(stage).top || '88'),
    };
  });
  const width = await picker.evaluate(
    (element) => element.getBoundingClientRect().width
  );
  mark(
    'all 24 tools have unique regular icon entries',
    entries.length === 24 &&
      new Set(entries.map((entry) => entry.id)).size === 24 &&
      (await region.locator('.tool-icon img').count()) === 24,
    entries
  );
  mark(
    'tool stage only pins when complete stage fits',
    layout !== 'scroll' ||
      geometry.height <= geometry.viewport - geometry.top - 20,
    geometry
  );
  mark(
    'manual tool stage has no long spacer',
    layout !== 'manual' ||
      (await story.evaluate((element) => element.style.height)) === ''
  );
  for (let index = 0; index < entries.length; index++) {
    await picker.selectOption(entries[index].id);
    await page.waitForFunction(
      (index) =>
        Number(
          document.querySelector('.tool-deck-stage')?.dataset.currentIndex
        ) === index,
      index
    );
    await region
      .locator('.tool-icon-token[data-state="active"] img')
      .scrollIntoViewIfNeeded();
    await region
      .locator('.tool-icon-token[data-state="active"] img')
      .evaluate((image) => image.decode());
    const active = region.locator('.tool-card[data-state="active"]');
    mark(
      'direct tool selection ' + entries[index].name,
      (await active.locator('h2').innerText()) === entries[index].name &&
        (await active.isVisible()) &&
        Math.abs(
          (await picker.evaluate(
            (element) => element.getBoundingClientRect().width
          )) - width
        ) < 1 &&
        (await region
          .locator('.tool-icon-token[data-state="active"] img')
          .evaluate((image) => image.complete && image.naturalWidth > 0)),
      { index }
    );
    const targets = await active
      .locator('a')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute('tabindex'))
      );
    mark(
      entries[index].name + ' exposes only active actions to keyboard users',
      targets.every((tab) => tab === '0') &&
        (await region
          .locator('.tool-card[data-state="hidden"] a[tabindex="0"]')
          .count()) === 0
    );
  }
  await picker.selectOption(entries[0].id);
  if (layout === 'scroll') {
    await page.mouse.move(400, 400);
    const chapter = geometry.span / (entries.length - 1);
    for (let index = 1; index < entries.length; index++) {
      await page.mouse.wheel(0, chapter);
      await page.waitForFunction(
        (index) =>
          Number(
            document.querySelector('.tool-deck-stage')?.dataset.currentIndex
          ) === index,
        index
      );
      mark(
        'native scroll advances tool ' + entries[index].name,
        (await picker.inputValue()) === entries[index].id
      );
    }
    await page.mouse.wheel(0, -chapter);
    await page.waitForFunction(
      () =>
        Number(
          document.querySelector('.tool-deck-stage')?.dataset.currentIndex
        ) === 22
    );
    mark(
      'reverse native scroll returns to previous tool',
      (await picker.inputValue()) === entries[22].id
    );
  } else {
    await page.mouse.wheel(0, 500);
    mark(
      'manual scrolling retains tool selection',
      (await picker.inputValue()) === entries[0].id
    );
  }
  await picker.selectOption('next-js');
  await screenshot(route === '/' ? 'home-tools-icon-pack' : 'tools-icon-pack');
  const action = region
    .locator('.tool-card[data-state="active"] .tool-card-evidence a')
    .first();
  const actionId = await action.getAttribute('id');
  await action.click();
  await page.waitForURL('**/experience#izer');
  await page.goBack();
  await region.waitFor();
  await page.evaluate(() => document.fonts.ready);
  await pause(200);
  await page.waitForFunction(
    () => document.querySelector('.tool-deck-stage select')?.value === 'next-js'
  );
  mark(
    'tool and related-work keyboard focus restore after Back',
    await page
      .locator('#' + actionId)
      .evaluate((element) => document.activeElement === element)
  );
  if (route === '/') {
    await picker.selectOption('node-js');
    await page.locator('.primary-nav a[href="/#contact"]').click();
    await page.waitForFunction(() => {
      const target = document.querySelector('#contact');
      return (
        document.activeElement === target.querySelector('h2') &&
        Math.abs(
          target.getBoundingClientRect().top -
            document.querySelector('.site-header').getBoundingClientRect()
              .bottom -
            24
        ) < 5
      );
    });
    mark(
      'Contact navigation exits a selected Tools chapter and focuses its section',
      true
    );
  }
}

async function navigation({ page, mark, visit }) {
  await visit('/');
  const menu = page.locator('.menu-button');
  const expectedNavigation = [
    { section: 'experience', title: 'Experience' },
    { section: 'work', title: 'Work' },
    { section: 'tools', title: 'Tools' },
    { section: 'about', title: 'About' },
    { section: 'contact', title: 'Contact' },
  ];
  const navLinks = async (locator) =>
    locator.evaluateAll((links) =>
      links.map((link) => ({
        href: link.getAttribute('href'),
        title: link.textContent.trim(),
      }))
    );
  const matchesNavigation = (links) =>
    links.length === expectedNavigation.length &&
    expectedNavigation.every(
      (item, index) =>
        links[index].href === '/#' + item.section &&
        links[index].title === item.title
    );
  const primary = await navLinks(page.locator('.primary-nav a[href^="/#"]'));
  mark(
    'primary navigation follows Experience, Work, Tools, About, Contact home anchors',
    matchesNavigation(primary),
    primary
  );
  const sections = await page.evaluate(
    (expected) =>
      expected.map(({ section }) => {
        const element = document.getElementById(section);
        return {
          id: section,
          top: element ? element.getBoundingClientRect().top + scrollY : null,
          heading: element?.querySelector('h2')?.id,
        };
      }),
    expectedNavigation
  );
  mark(
    'home sections appear in the same order as the header navigation',
    sections.every(
      (section, index) =>
        section.top !== null &&
        Boolean(section.heading) &&
        (index === 0 || section.top > sections[index - 1].top)
    ),
    sections
  );
  await menu.click();
  const expanded = await navLinks(page.locator('#site-menu nav a[href^="/#"]'));
  mark(
    'menu begins with the same five ordered home anchors',
    matchesNavigation(expanded),
    expanded
  );
  mark(
    'Tools is available in primary and expanded navigation',
    (await page.locator('.primary-nav a[href="/#tools"]').count()) === 1 &&
      (await page.locator('#site-menu nav a[href="/#tools"]').count()) === 1
  );
  mark(
    'Lab is removed from visible navigation',
    (await page
      .locator('.site-header a[href="/lab"],.footer-nav a[href="/lab"]')
      .count()) === 0
  );
  await page.keyboard.press('Escape');
  mark(
    'Escape closes menu and restores focus',
    (await page.locator('#site-menu').count()) === 0 &&
      (await menu.evaluate((element) => document.activeElement === element))
  );
  for (const surface of ['primary', 'menu'])
    for (const { section } of expectedNavigation) {
      if (surface === 'menu') await menu.click();
      await page
        .locator(
          `${surface === 'menu' ? '#site-menu' : '.primary-nav'} a[href="/#${section}"]`
        )
        .click();
      await page.waitForURL('**/#' + section);
      // Long travel across eleven chapters takes native smooth scrolling
      // time. Wait for its final clearance and focus, never a fixed delay.
      await page.waitForFunction((id) => {
        const section = document.getElementById(id);
        const header = document.querySelector('.site-header');
        return (
          section &&
          header &&
          document.activeElement === section.querySelector('h2') &&
          Math.abs(
            section.getBoundingClientRect().top -
              header.getBoundingClientRect().bottom -
              24
          ) <= 4
        );
      }, section);
      const position = await page
        .locator('#' + section)
        .evaluate((element) => ({
          top: element.getBoundingClientRect().top,
          focusedHeading:
            document.activeElement === element.querySelector('h2'),
        }));
      mark(
        surface + ' navigation positions and focuses #' + section,
        position.focusedHeading &&
          (await page.locator('#site-menu').count()) === 0,
        position
      );
    }
  await visit('/projects/maze-search');
  await menu.click();
  await page.locator('#site-menu a[href="/#experience"]').click();
  await page.waitForURL('**/#experience');
  await page.waitForFunction(() => {
    const section = document.querySelector('#experience');
    return (
      section &&
      document.activeElement === section.querySelector('h2') &&
      Math.abs(
        section.getBoundingClientRect().top -
          document.querySelector('.site-header').getBoundingClientRect()
            .bottom -
          24
      ) <= 4
    );
  });
  mark(
    'menu anchor from a project detail returns to the matching home section',
    await page.evaluate(
      () =>
        location.pathname === '/' &&
        document.activeElement === document.querySelector('#experience h2')
    )
  );
  await menu.click();
  await page.locator('#site-menu a[href="/#about"]').click();
  await page.waitForURL('**/#about');
  await page.waitForFunction(
    () =>
      document.activeElement === document.querySelector('#about h2') &&
      Math.abs(
        document.querySelector('#about').getBoundingClientRect().top -
          document.querySelector('.site-header').getBoundingClientRect()
            .bottom -
          24
      ) <= 1
  );
  const beforeMenu = await page
    .locator('#about')
    .evaluate((element) => element.getBoundingClientRect().top);
  // The sticky control is already visible. Locator.click() may first call
  // scrollIntoView on its offscreen original position, unlike a real click.
  const bounds = await menu.boundingBox();
  const viewport = page.viewportSize();
  if (
    !bounds ||
    bounds.x < 0 ||
    bounds.y < 0 ||
    bounds.x + bounds.width > viewport.width ||
    bounds.y + bounds.height > viewport.height
  )
    throw new Error(
      'The sticky menu control must be fully visible before its coordinate click.'
    );
  await page.mouse.click(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2
  );
  await page.locator('#site-menu').waitFor();
  const before = await page
    .locator('#about')
    .evaluate((element) => element.getBoundingClientRect().top);
  mark(
    'opening the visible sticky menu preserves section position',
    Math.abs(before - beforeMenu) <= 2,
    { beforeMenu, afterMenu: before }
  );
  await page
    .locator('#site-language')
    .evaluate((element) => element.focus({ preventScroll: true }));
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.documentElement.dir === 'rtl');
  await page.evaluate(() => document.fonts.ready);
  await pause(300);
  const after = await page
    .locator('#about')
    .evaluate((element) => element.getBoundingClientRect().top);
  mark(
    'language change preserves current section position',
    Math.abs(after - before) <= 12,
    { before, after }
  );
  mark(
    'language preference persists with correct RTL',
    await page.evaluate(
      () =>
        localStorage.getItem('portfolio-language') === 'he' &&
        document.documentElement.dir === 'rtl'
    )
  );
  await page.locator('.effects-toggle').click();
  await page.reload({ waitUntil: 'networkidle' });
  mark(
    'effects preference survives reload without tall stage',
    (await page.locator('.project-carousel').getAttribute('data-layout')) ===
      'manual' &&
      (await page.evaluate(
        () => localStorage.getItem('portfolio-effects') === 'off'
      ))
  );
}

for (const engine of String(args.get('channels') || 'chrome').split(',')) {
  let browser;
  try {
    browser =
      engine === 'webkit'
        ? await pw.webkit.launch({ headless: true })
        : await pw.chromium.launch({
            headless: true,
            ...(engine === 'chromium' ? {} : { channel: engine }),
            args: ['--autoplay-policy=user-gesture-required'],
          });
    report.engines.push({ engine, available: true });
    if (!args.get('performance-only')) {
      for (const locale of ['en', 'he', 'jp'])
        for (const viewport of viewports)
          await scenario(
            browser,
            engine,
            `routes-${locale}-${viewport.width}`,
            { viewport, locale },
            async (qa) => {
              for (const route of routes) {
                await qa.visit(route);
                if (route === '/projects') await qa.catalogCheck();
                if (route === '/')
                  qa.mark(
                    'homepage shows all chapters without a catalog grid',
                    (await qa.page.locator('.carousel-slide').count()) === 11 &&
                      (await qa.page
                        .locator('.catalog-card,.catalog-search')
                        .count()) === 0
                  );
                if (route.startsWith('/projects/'))
                  qa.mark(
                    route + ' resolves a real internal detail',
                    (await qa.page.locator('main .detail-page').count()) ===
                      1 &&
                      (await qa.page
                        .locator('main a[href*="github.com/"]')
                        .count()) > 0
                  );
                if (locale === 'en' && viewport.width === 1440) {
                  if (route === '/') {
                    await qa.screenshot('identity-hero');
                    await qa.screenshot('homepage-full', true);
                  } else if (route === '/projects')
                    await qa.screenshot('project-index', true);
                  else if (
                    [
                      '/projects/flappy-bird-clone',
                      '/projects/kitchen-chaos',
                      '/projects/maze-search',
                    ].includes(route)
                  )
                    await qa.screenshot(route.slice(10), true);
                }
              }
              const cv = await qa.context.request.get(
                baseUrl + '/rotem-babani-cv.pdf'
              );
              const bytes = await cv.body();
              qa.mark(
                'CV is a real downloadable PDF',
                cv.ok() && bytes.subarray(0, 5).toString() === '%PDF-',
                { status: cv.status(), bytes: bytes.length }
              );
              await qa.visit('/lab', false);
              qa.mark(
                'lab video has native controls without autoplay',
                await qa.page
                  .locator('video')
                  .evaluate(
                    (video) =>
                      video.controls &&
                      !video.autoplay &&
                      video.paused &&
                      video.preload === 'none'
                  )
              );
            }
          );
      for (const viewport of [
        viewports[0],
        viewports[1],
        { width: 775, height: 846 },
        { width: 1280, height: 720 },
        { width: 1024, height: 768 },
        { width: 1440, height: 900 },
        { width: 1440, height: 1200 },
        { width: 1440, height: 500 },
      ])
        await scenario(
          browser,
          engine,
          'stage-' + viewport.width + 'x' + viewport.height,
          { viewport },
          stage
        );
      for (const locale of ['he', 'jp'])
        for (const viewport of [
          viewports[0],
          viewports[1],
          { width: 775, height: 846 },
          { width: 1280, height: 720 },
          { width: 1024, height: 768 },
          { width: 1440, height: 900 },
        ])
          await scenario(
            browser,
            engine,
            `stage-${locale}-${viewport.width}x${viewport.height}`,
            { viewport, locale },
            stage
          );
      for (const [name, viewport] of [
        ['native-mobile', viewports[0]],
        ['native-wide', { width: 1280, height: 720 }],
      ])
        await scenario(
          browser,
          engine,
          'stage-history-' + name,
          { viewport, archive: 'future' },
          stageHistory
        );
      for (const [name, options] of [
        ['reduced', { reduced: true }],
        ['effects-off', { effects: false }],
        ['save-data', { saveData: true }],
      ])
        await scenario(
          browser,
          engine,
          'stage-' + name,
          options,
          async (qa) => {
            await stage(qa);
            await qa.visit('/');
            qa.mark(
              'disabled motion produces a manual static stage',
              (await qa.page
                .locator('.project-carousel')
                .getAttribute('data-layout')) === 'manual' &&
                (await qa.page
                  .locator('.project-carousel')
                  .getAttribute('data-motion')) === 'reduced'
            );
          }
        );
      await scenario(
        browser,
        engine,
        'stage-fit-boundary',
        { viewport: { width: 1440, height: 1200 } },
        stageFitBoundary
      );
      await scenario(
        browser,
        engine,
        'stage-language-transition',
        { viewport: { width: 1024, height: 1200 }, locale: 'he' },
        stageLanguageTransition
      );
      for (const [name, route, options] of [
        ['home', '/', { viewport: { width: 775, height: 846 } }],
        ['page', '/tools', { viewport: { width: 775, height: 846 } }],
        ['mobile', '/tools', { viewport: viewports[1] }],
        ['rtl', '/tools', { locale: 'he' }],
        ['japanese', '/tools', { locale: 'jp' }],
        ['short', '/tools', { viewport: { width: 1440, height: 500 } }],
        ['reduced', '/tools', { reduced: true }],
        ['effects-off', '/tools', { effects: false }],
        ['save-data', '/tools', { saveData: true }],
      ])
        await scenario(browser, engine, 'tools-' + name, options, (qa) =>
          toolDeck(qa, route)
        );
      await scenario(
        browser,
        engine,
        'tools-home-layout-language',
        { viewport: { width: 775, height: 846 } },
        async (qa) => {
          await qa.visit('/');
          const picker = qa.page.locator('.tool-deck-stage select');
          await picker.selectOption('node-js');
          await qa.page.setViewportSize({ width: 390, height: 844 });
          await pause(200);
          qa.mark(
            'tool survives viewport width changes on mobile',
            (await picker.inputValue()) === 'node-js'
          );
          await qa.page.setViewportSize({ width: 775, height: 846 });
          await picker.selectOption('node-js');
          // Click the visible sticky control without scrolling its original
          // document position into view first.
          const menuBounds = await qa.page
            .locator('.menu-button')
            .boundingBox();
          await qa.page.mouse.click(
            menuBounds.x + menuBounds.width / 2,
            menuBounds.y + menuBounds.height / 2
          );
          qa.mark(
            'menu preserves tool chapter',
            (await picker.inputValue()) === 'node-js'
          );
          await qa.page
            .locator('#site-language')
            .evaluate((element) => element.focus({ preventScroll: true }));
          await qa.page.keyboard.press('Home');
          await qa.page.keyboard.press('ArrowDown');
          await qa.page.keyboard.press('Enter');
          await qa.page.waitForFunction(
            () => document.documentElement.dir === 'rtl'
          );
          await qa.page.evaluate(() => document.fonts.ready);
          await pause(200);
          qa.mark(
            'home tool chapter survives RTL localization',
            (await picker.inputValue()) === 'node-js',
            await qa.page.locator('.tool-deck-story').evaluate((element) => ({
              value: element.querySelector('select').value,
              y: scrollY,
            }))
          );
          await qa.page.keyboard.press('Escape');
          await qa.screenshot('home-tools-rtl');
        }
      );
      await scenario(browser, engine, 'sharing', {}, async (qa) => {
        const response = await qa.context.request.get(baseUrl + '/', {
          headers: { 'User-Agent': 'facebookexternalhit/1.1' },
        });
        const html = await response.text();
        const og = (key) =>
          html.match(
            new RegExp('property="' + key + '"\\s+content="([^"]+)"')
          )?.[1];
        const imageURL = og('og:image');
        const image = await qa.context.request.get(
          baseUrl + new URL(imageURL).pathname
        );
        const bytes = await image.body();
        qa.mark(
          'share metadata is delivered in static HTML without JavaScript',
          og('og:url') === 'https://rotembabani.com/' &&
            og('og:title') === 'Rotem Babani — Full-stack developer' &&
            og('og:description')?.includes('I build React and TypeScript') &&
            !html.includes('__SOCIAL_') &&
            !html.includes('__INTRO_'),
          { imageURL, title: og('og:title'), description: og('og:description') }
        );
        qa.mark(
          'share image has a content-hash URL and decodes as a 1200×630 PNG',
          /^https:\/\/rotembabani.com\/social-preview\.[a-f0-9]{12}\.png$/.test(
            imageURL
          ) &&
            image.ok() &&
            bytes.readUInt32BE(16) === 1200 &&
            bytes.readUInt32BE(20) === 630,
          { bytes: bytes.length }
        );
        await qa.page.goto(baseUrl + '/social-preview.html');
        await qa.page.evaluate(() => document.fonts.ready);
        qa.mark(
          'HTML preview uses the current homepage introduction and portrait',
          (await qa.page.locator('h1').innerText()) === 'Rotem Babani' &&
            (await qa.page
              .locator('img')
              .evaluate((image) => image.complete && image.naturalWidth > 0)) &&
            (await qa.page.locator('main').innerText()).includes(
              'I build React and TypeScript'
            )
        );
        await qa.screenshot('homepage-share-preview');
      });
      await scenario(browser, engine, 'catalog-filters', {}, catalogs);
      await scenario(browser, engine, 'navigation', {}, navigation);
      await scenario(
        browser,
        engine,
        'mobile-toolbar',
        { viewport: { width: 390, height: 664 } },
        async (qa) => {
          const { page, mark } = qa;
          await qa.visit('/');
          await page.evaluate(() =>
            document.documentElement.style.setProperty(
              '--story-viewport-height',
              '664px'
            )
          );
          const project = page.locator('.carousel-project-picker select');
          await project.selectOption('blaster');
          await pause(200);
          mark(
            'projects scroll on a compact Safari viewport',
            (await page
              .locator('.project-carousel')
              .getAttribute('data-layout')) === 'scroll'
          );
          const stableProjectY = await page.evaluate(() => scrollY);
          await page.setViewportSize({ width: 390, height: 844 });
          await pause(200);
          mark(
            'Safari toolbar expansion retains the project and scroll position',
            (await project.inputValue()) === 'blaster' &&
              Math.abs((await page.evaluate(() => scrollY)) - stableProjectY) <
                2
          );
          const tool = page.locator('.tool-deck-stage select');
          await tool.selectOption('node-js');
          await pause(200);
          const stableToolY = await page.evaluate(() => scrollY);
          await page.evaluate(() => {
            window.__qaResizeScrolls = 0;
            const original = window.scrollTo.bind(window);
            window.scrollTo = (...args) => {
              window.__qaResizeScrolls++;
              original(...args);
            };
          });
          await page.setViewportSize({ width: 390, height: 744 });
          await pause(200);
          mark(
            'Safari browser-bar resizing leaves native Tools scrolling alone',
            (await tool.inputValue()) === 'node-js' &&
              Math.abs((await page.evaluate(() => scrollY)) - stableToolY) <
                2 &&
              (await page.evaluate(() => window.__qaResizeScrolls)) === 0
          );
          const sample = async (chapter) => {
            await page.evaluate((position) => {
              const story = document.querySelector('.tool-deck-story');
              const stage = story.querySelector('.tool-deck-stage');
              const start =
                story.getBoundingClientRect().top +
                scrollY -
                parseFloat(getComputedStyle(stage).top);
              const span =
                parseFloat(story.style.height) -
                stage.getBoundingClientRect().height;
              window.scrollTo({
                top: start + (position * span) / 23,
                behavior: 'instant',
              });
            }, chapter);
            await pause(100);
            return page
              .locator('.tool-icon-token')
              .first()
              .evaluate((element) => ({
                x: new DOMMatrixReadOnly(getComputedStyle(element).transform)
                  .m41,
                opacity: parseFloat(getComputedStyle(element).opacity),
              }));
          };
          const before = await sample(0.49);
          const after = await sample(0.51);
          mark(
            'tool icons move continuously across the chapter boundary',
            Math.abs(before.x - after.x) < 3 &&
              before.opacity > 0 &&
              after.opacity > 0 &&
              Math.abs(before.opacity - after.opacity) < 0.05,
            { before, after }
          );
          await qa.screenshot('smooth-mobile-tools');
        }
      );
      await scenario(browser, engine, 'contacts', {}, contacts);
      await scenario(
        browser,
        engine,
        'catalog-pagination',
        { archive: 'paginated' },
        async (qa) => {
          await qa.visit('/projects');
          await qa.catalogCheck();
          qa.mark(
            'every pagination page is requested',
            qa.result.githubRequests.some((request) => request.page === 2),
            qa.result.githubRequests
          );
        }
      );
      for (const archive of ['error', 'later-error'])
        await scenario(
          browser,
          engine,
          'catalog-' + archive,
          { archive },
          async (qa) => {
            await qa.visit('/projects');
            await qa.page
              .locator('.catalog-freshness[data-state="error"]')
              .waitFor();
            await qa.catalogCheck();
            qa.mark(
              'failed refresh keeps complete saved catalog and retry',
              await qa.page.locator('.catalog-freshness button').isVisible()
            );
            qa.mark(
              'incomplete live pages never replace the snapshot',
              (await qa.page
                .locator(`.catalog-card[data-project="${futureSlug}"]`)
                .count()) === 0
            );
            qa.state.archive = 'future';
            await qa.page.locator('.catalog-freshness button').click();
            await qa.page
              .locator('.catalog-freshness[data-state="ready"]')
              .waitFor();
            await qa.catalogCheck([...slugs, futureSlug]);
            await qa.page
              .locator(`.catalog-card[data-project="${futureSlug}"] h2 a`)
              .click();
            await qa.page.waitForURL('**/projects/' + futureSlug);
            await qa.page
              .getByRole('heading', {
                name: futureRepository.name,
                exact: true,
              })
              .waitFor();
            qa.mark(
              'new live repository immediately gains a factual internal page',
              (await qa.page.locator('main h1').innerText()) ===
                futureRepository.name &&
                (await qa.page
                  .locator('main')
                  .innerText()
                  .then((text) => text.includes(futureRepository.description)))
            );
          }
        );
      await scenario(
        browser,
        engine,
        'media-recovery',
        { imageFailure: true },
        async (qa) => {
          await qa.visit('/projects/hebrew-subtitle-studio');
          await qa.page
            .locator('.detail-image .project-image-placeholder')
            .waitFor();
          qa.mark(
            'failed curated image retains source recovery and project context',
            (await qa.page
              .locator('.detail-image a[href*="github.com"]')
              .isVisible()) &&
              (await qa.page.locator('main h1').innerText()) ===
                'Hebrew Subtitle Studio'
          );
          await qa.visit('/projects/flappy-bird-clone');
          await qa.page
            .locator('.repository-image .catalog-illustration')
            .waitFor();
          qa.mark(
            'failed repository image uses an explicitly labelled technical illustration',
            (await qa.page
              .locator('.repository-image svg')
              .getAttribute('aria-label')
              .then((text) => text.includes('Technical illustration'))) &&
              (await qa.page
                .locator('.repository-image .catalog-illustration span')
                .isVisible()) &&
              (await qa.page
                .locator('.repository-image .catalog-illustration span')
                .innerText()) === 'Technical illustration'
          );
        }
      );
      await scenario(
        browser,
        engine,
        'media-video',
        { videoFailure: true },
        async (qa) => {
          await qa.visit('/lab');
          await qa.page.locator('video').evaluate((video) => {
            video.preload = 'auto';
            video.load();
          });
          await qa.page.locator('.video-unavailable').waitFor();
          qa.mark(
            'failed playback retains text alternative and source recovery',
            (await qa.page.locator('.lab-video-alternative').isVisible()) &&
              (await qa.page.locator('.video-unavailable a').isVisible())
          );
        }
      );
      await scenario(browser, engine, 'walkthrough', {}, async (qa) => {
        await qa.visit('/projects/hebrew-subtitle-studio');
        const region = qa.page.locator('.subtitle-walkthrough');
        await region.locator('.walkthrough-views [role="tab"]').nth(1).click();
        const steps = region.locator(
          '.walkthrough-view:not([hidden]) .walkthrough-steps [role="tab"]'
        );
        await steps.first().focus();
        await qa.page.keyboard.press('End');
        qa.mark(
          'walkthrough keyboard reaches export and preserves chosen view',
          (await region
            .locator('.walkthrough-visual')
            .getAttribute('data-step')) === 'export'
        );
        await region.locator('.walkthrough-views [role="tab"]').first().click();
        qa.mark(
          'walkthrough selection survives view change',
          (await region
            .locator('.walkthrough-visual')
            .getAttribute('data-step')) === 'export'
        );
      });
    }
    if (args.get('performance') || args.get('performance-only'))
      for (const viewport of [viewports[0], viewports[4]])
        await scenario(
          browser,
          engine,
          'performance-' + viewport.width,
          { viewport, performance: true },
          async (qa) => {
            await qa.visit('/');
            await pause(1200);
            const metrics = await qa.page.evaluate(() => ({
              ...window.__qaVitals,
              transferredBytes: performance
                .getEntriesByType('resource')
                .reduce((sum, entry) => sum + entry.transferSize, 0),
              requestCount: performance.getEntriesByType('resource').length,
              buildMode: performance
                .getEntriesByType('resource')
                .some((entry) => entry.name.includes('/@vite/client'))
                ? 'development'
                : 'production preview',
            }));
            report.performance.push({
              engine,
              viewport,
              ...metrics,
              throttling: qa.throttling,
            });
            qa.mark(
              'lab LCP target <=2500ms',
              metrics.lcp !== null && metrics.lcp <= 2500,
              metrics,
              'diagnostic'
            );
            qa.mark(
              'lab CLS target <=0.1',
              metrics.cls <= 0.1,
              metrics,
              'diagnostic'
            );
            qa.mark(
              'performance measured on production preview',
              metrics.buildMode === 'production preview',
              metrics,
              'diagnostic'
            );
          }
        );
  } catch (error) {
    report.engines.push({
      engine,
      available: false,
      reason: error.stack || error.message,
    });
  } finally {
    await browser?.close();
  }
}
report.completedAt = new Date().toISOString();
report.summary = {
  scenarios: report.scenarios.length,
  checks: report.scenarios.flatMap((item) => item.checks).length,
  failures: report.scenarios.flatMap((scenario) =>
    scenario.checks
      .filter((check) => !check.passed)
      .map((check) => ({ scenario: scenario.name, ...check }))
  ),
};
await writeFile(
  path.join(output, 'report.json'),
  JSON.stringify(report, null, 2)
);
console.log(
  JSON.stringify(
    { output, engines: report.engines, ...report.summary },
    null,
    2
  )
);
if (
  !report.scenarios.length ||
  report.summary.failures.some((check) => check.severity === 'blocker') ||
  report.engines.some((engine) => !engine.available)
)
  process.exitCode = 1;
