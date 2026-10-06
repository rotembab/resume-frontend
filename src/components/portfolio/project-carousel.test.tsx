import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { Link, MemoryRouter, useLocation, useNavigate } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProjects } from '../../data/projects';
import { getProjectCatalog } from '../../data/project-catalog';
import type { CatalogProject } from '../../data/project-catalog';
const curatedCatalog = (language: string) =>
  getProjects(language).map(
    (project) =>
      getProjectCatalog(language).find((entry) => entry.slug === project.slug)!
  );
import { getCarouselCopy } from '../../data/project-carousel-copy';
import { getPortfolioCopy } from '../../data/portfolio-copy';
import { getProjectStoryCopy } from '../../data/project-story-copy';
import { ProjectCarousel } from './project-carousel';
import { ScrollManager } from './scroll-manager';

let testEntryId = 0;
const TestRouter = ({ children }: { children: ReactNode }) => (
  <MemoryRouter
    initialEntries={[{ pathname: '/', key: `carousel-${++testEntryId}` }]}
  >
    {children}
  </MemoryRouter>
);

const HistoryPage = ({ projects }: { projects: CatalogProject[] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <ScrollManager />
      <button onClick={() => navigate(-1)}>Back to portfolio</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <Link to='/#work'>Go to work</Link>
      <Link to='/#about'>Go to about</Link>
      <output aria-label='Current anchor'>{location.hash}</output>
      <main>
        <h1 tabIndex={-1}>
          {location.pathname === '/' ? 'Portfolio' : 'Project detail'}
        </h1>
        {location.pathname === '/' && (
          <>
            <section id='work'>
              <h2 tabIndex={-1}>Work</h2>
              <ProjectCarousel projects={projects} />
            </section>
            <section id='about'>
              <h2 tabIndex={-1}>About</h2>
            </section>
          </>
        )}
      </main>
    </>
  );
};

const state = vi.hoisted(() => ({ language: 'en', motionAllowed: true }));
vi.mock('./use-portfolio', () => ({
  usePortfolio: () => ({
    copy: getPortfolioCopy(state.language),
    i18n: {
      language: state.language,
      dir: () => (state.language.startsWith('he') ? 'rtl' : 'ltr'),
    },
  }),
}));
vi.mock('./effects-context', () => ({
  useEffects: () => ({ motionAllowed: state.motionAllowed }),
}));

let pageY = 0;
let stageHeight = 524;
let slideHeight = 450;
let toolbarHeight = 50;
let frames = new Map<number, FrameRequestCallback>();
let frameId = 0;
const sectionTop = 1000;
const stickyTop = 104;
const scrollTo = vi.fn((options: ScrollToOptions) => {
  pageY = options.top ?? pageY;
});
const rect = (top: number, width: number, height: number): DOMRect => ({
  left: 0,
  x: 0,
  right: width,
  width,
  y: top,
  top,
  bottom: top + height,
  height,
  toJSON: () => ({}),
});
const renderCarousel = () =>
  render(
    <TestRouter>
      <ProjectCarousel projects={curatedCatalog(state.language)} />
    </TestRouter>
  );
const current = () =>
  screen.getByRole('region', { name: getCarouselCopy(state.language).label });
const story = () => current().parentElement!;
const track = () =>
  screen.getByRole('list', { name: getCarouselCopy(state.language).label });
const entries = () => [
  ...track().querySelectorAll<HTMLElement>('.carousel-slide'),
];
const flushFrames = () =>
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
const scrollPage = (value: number) => {
  pageY = value;
  fireEvent.scroll(window);
  flushFrames();
};
const span = () =>
  Number.parseFloat(story().style.height) -
  Math.max(stageHeight, slideHeight + toolbarHeight + 24);
const phaseY = (index: number) => sectionTop - stickyTop + (index / 3) * span();

beforeEach(() => {
  state.language = 'en';
  state.motionAllowed = true;
  pageY = 0;
  stageHeight = 524;
  slideHeight = 450;
  toolbarHeight = 50;
  frames = new Map();
  scrollTo.mockClear();
  vi.stubGlobal('innerWidth', 1440);
  vi.stubGlobal('innerHeight', 900);
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => pageY,
  });
  vi.stubGlobal('scrollTo', scrollTo);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      if (this.classList.contains('project-carousel-scroll-story'))
        return rect(
          sectionTop - pageY,
          1000,
          Number.parseFloat(this.style.height) || 4 * (slideHeight + 24)
        );
      if (this.classList.contains('project-carousel'))
        return rect(Math.max(stickyTop, sectionTop - pageY), 1000, stageHeight);
      if (this.classList.contains('carousel-window'))
        return rect(0, 1012, slideHeight);
      if (this.classList.contains('carousel-track'))
        return rect(0, 1000, slideHeight);
      if (this.classList.contains('carousel-toolbar'))
        return rect(0, 1000, toolbarHeight);
      if (this.classList.contains('carousel-slide'))
        return rect(
          sectionTop +
            Number(this.dataset.slideIndex) * (slideHeight + 24) -
            pageY,
          1000,
          slideHeight
        );
      if (this.matches('.carousel-actions a')) {
        const parent = this.closest<HTMLElement>('.carousel-slide')!;
        return rect(
          parent.getBoundingClientRect().top + slideHeight - 60,
          160,
          48
        );
      }
      return rect(0, 0, 0);
    }
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('Page-scroll project carousel', () => {
  it.each([360, 390, 768, 775, 1023])(
    'advances all eleven projects with page scrolling in a fitting %spx viewport',
    (width) => {
      vi.stubGlobal('innerWidth', width);
      vi.stubGlobal('innerHeight', 846);
      const projects = getProjectCatalog('en');
      render(
        <TestRouter>
          <ProjectCarousel projects={projects} />
        </TestRouter>
      );
      flushFrames();
      expect(current()).toHaveAttribute('data-layout', 'scroll');
      projects.forEach((project, index) => {
        scrollPage(sectionTop - stickyTop + (index / 10) * span());
        expect(screen.getByRole('combobox')).toHaveValue(project.slug);
        expect(
          screen.getByRole('link', { name: /View project/ })
        ).toHaveAttribute('href', `/projects/${project.slug}`);
      });
      expect(scrollTo).not.toHaveBeenCalled();
    }
  );

  it('restores separate manual selections and link focus with Back and Forward between homepage anchors', async () => {
    state.motionAllowed = false;
    vi.stubGlobal('innerWidth', 390);
    const projects = getProjectCatalog('en');
    const chosenAtWork = projects.find(
      (project) => project.slug === 'kitchen-chaos'
    )!;
    const chosenAtAbout = projects[0];
    render(
      <TestRouter>
        <div id='root'>
          <HistoryPage projects={projects} />
        </div>
      </TestRouter>
    );
    flushFrames();
    await userEvent.click(screen.getByRole('link', { name: 'Go to work' }));
    flushFrames();
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: chosenAtWork.slug },
    });
    act(() => screen.getByRole('link', { name: /View project/ }).focus());
    await userEvent.click(screen.getByRole('link', { name: 'Go to about' }));
    flushFrames();
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: chosenAtAbout.slug },
    });
    act(() => screen.getByRole('link', { name: /View project/ }).focus());
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to portfolio' })
    );
    flushFrames();
    flushFrames();
    expect(screen.getByLabelText('Current anchor')).toHaveTextContent('#work');
    expect(screen.getByRole('combobox')).toHaveValue(chosenAtWork.slug);
    const restoredAtWork = screen.getByRole('link', { name: /View project/ });
    expect(restoredAtWork).toHaveAttribute(
      'href',
      '/projects/' + chosenAtWork.slug
    );
    expect(restoredAtWork).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Forward' }));
    flushFrames();
    flushFrames();
    expect(screen.getByLabelText('Current anchor')).toHaveTextContent('#about');
    expect(screen.getByRole('combobox')).toHaveValue(chosenAtAbout.slug);
    const restoredAtAbout = screen.getByRole('link', { name: /View project/ });
    expect(restoredAtAbout).toHaveAttribute(
      'href',
      '/projects/' + chosenAtAbout.slug
    );
    expect(restoredAtAbout).toHaveFocus();
  });

  it('restores a nonfirst manually selected project and its link focus after detail navigation and Back', async () => {
    state.motionAllowed = false;
    vi.stubGlobal('innerWidth', 390);
    const projects = getProjectCatalog('en');
    const chosen = projects.find(
      (project) => project.slug === 'kitchen-chaos'
    )!;
    render(
      <TestRouter>
        <div id='root'>
          <HistoryPage projects={projects} />
        </div>
      </TestRouter>
    );
    flushFrames();
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: chosen.slug },
    });
    const destination = screen.getByRole('link', { name: /View project/ });
    expect(destination).toHaveAttribute('href', '/projects/' + chosen.slug);
    await userEvent.click(destination);
    flushFrames();
    expect(
      screen.getByRole('heading', { name: 'Project detail' })
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to portfolio' })
    );
    flushFrames();
    flushFrames();
    expect(current()).toHaveAttribute('data-layout', 'manual');
    expect(screen.getByRole('combobox')).toHaveValue(chosen.slug);
    const restored = screen.getByRole('link', { name: /View project/ });
    expect(restored).toHaveAttribute('href', '/projects/' + chosen.slug);
    expect(restored).toHaveFocus();
  });

  it('maps POP restoration to the same project after the query adds and reorders chapters while away', async () => {
    const projects = getProjectCatalog('en');
    const chosen = projects[3];
    const element = (items: CatalogProject[]) => (
      <TestRouter>
        <div id='root'>
          <HistoryPage projects={items} />
        </div>
      </TestRouter>
    );
    const view = render(element(projects));
    flushFrames();
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: chosen.slug },
    });
    await userEvent.click(screen.getByRole('link', { name: /View project/ }));
    flushFrames();
    const updated = [
      {
        ...projects[0],
        slug: 'repository-new',
        title: 'New public repository',
      },
      ...[...projects].reverse(),
    ];
    view.rerender(element(updated));
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to portfolio' })
    );
    flushFrames();
    flushFrames();
    const restoredIndex = updated.findIndex(
      (project) => project.slug === chosen.slug
    );
    expect(current()).toHaveAttribute(
      'data-current-index',
      String(restoredIndex)
    );
    expect(screen.getByRole('combobox')).toHaveValue(chosen.slug);
    const restored = screen.getByRole('link', { name: /View project/ });
    expect(restored).toHaveAttribute('href', '/projects/' + chosen.slug);
    expect(restored).toHaveFocus();
    expect(pageY).toBeCloseTo(
      sectionTop - stickyTop + (restoredIndex / (updated.length - 1)) * span()
    );
  });

  it('scrolls through all eleven catalog projects with factual stories, statuses, and working destinations', () => {
    const projects = getProjectCatalog('en');
    render(
      <TestRouter>
        <ProjectCarousel projects={projects} />
      </TestRouter>
    );
    flushFrames();
    expect(entries()).toHaveLength(11);
    expect(screen.getAllByRole('option')).toHaveLength(11);
    projects.forEach((project, index) => {
      scrollPage(sectionTop - stickyTop + (index / 10) * span());
      expect(current()).toHaveAttribute('data-current-index', String(index));
      expect(screen.getByRole('combobox')).toHaveValue(project.slug);
      const item = within(entries()[index]);
      const narrative = getProjectStoryCopy('en', project.slug)!;
      expect(item.getByRole('heading', { level: 3 })).toHaveTextContent(
        narrative.headline
      );
      expect(item.getByRole('link', { name: /View project/ })).toHaveAttribute(
        'href',
        `/projects/${project.slug}`
      );
      expect(item.getByRole('link', { name: /View source/ })).toHaveAttribute(
        'href',
        project.github
      );
      expect(item.getByText(narrative.caption)).toBeInTheDocument();
      if (!project.image)
        expect(item.getByRole('img')).toHaveAccessibleName(
          `Technical illustration: ${project.title}`
        );
    });
    expect(
      new Set(
        entries().map((entry) => entry.querySelector('a')!.getAttribute('href'))
      ).size
    ).toBe(11);
    expect(current()).toHaveAttribute('data-layout', 'scroll');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('uses the native project picker to jump to exactly the same measured scroll chapter', () => {
    const projects = getProjectCatalog('en');
    render(
      <TestRouter>
        <ProjectCarousel projects={projects} />
      </TestRouter>
    );
    flushFrames();
    const picker = screen.getByRole('combobox', { name: 'Project' });
    act(() => picker.focus());
    fireEvent.change(picker, { target: { value: projects[10].slug } });
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: sectionTop - stickyTop + span(),
      behavior: 'instant',
    });
    expect(current()).toHaveAttribute('data-current-index', '10');
    expect(picker).toHaveFocus();
    expect(screen.getByRole('link', { name: /View project/ })).toHaveAttribute(
      'href',
      `/projects/${projects[10].slug}`
    );
  });

  it('preserves a focused project by slug when a refresh adds and reorders repositories', () => {
    const projects = curatedCatalog('en');
    const view = renderCarousel();
    flushFrames();
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'blaster' },
    });
    const link = screen.getByRole('link', { name: /View project/ });
    act(() => link.focus());
    const future = {
      ...projects[0],
      slug: 'repository-123',
      title: 'future-repository',
      summary: 'A public source repository.',
      status: 'repository' as const,
      image: undefined,
      curated: undefined,
      details: undefined,
      illustration: 'code' as const,
    };
    const refreshed = [future, ...[...projects].reverse()];
    view.rerender(
      <TestRouter>
        <ProjectCarousel projects={refreshed} />
      </TestRouter>
    );
    flushFrames();
    const index = refreshed.findIndex((project) => project.slug === 'blaster');
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute('href', '/projects/blaster');
    expect(current()).toHaveAttribute('data-current-index', String(index));
    expect(screen.getByRole('combobox')).toHaveValue('blaster');
    expect(pageY).toBeCloseTo(sectionTop - stickyTop + (index / 4) * span());
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: future.slug },
    });
    expect(
      screen.getByRole('heading', { name: future.title })
    ).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      `Technical illustration: ${future.title}`
    );
    expect(screen.getByRole('link', { name: /View project/ })).toHaveAttribute(
      'href',
      `/projects/${future.slug}`
    );
    expect(
      entries()[0].querySelectorAll('.carousel-story-features p')
    ).toHaveLength(0);
  });

  it('keeps manual project selection after an unfocused catalog reorder', () => {
    state.motionAllowed = false;
    const view = renderCarousel();
    flushFrames();
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'blaster' },
    });
    view.rerender(
      <TestRouter>
        <ProjectCarousel projects={curatedCatalog('en').reverse()} />
      </TestRouter>
    );
    flushFrames();
    expect(screen.getByRole('combobox')).toHaveValue('blaster');
    expect(screen.getByRole('link', { name: /View project/ })).toHaveAttribute(
      'href',
      '/projects/blaster'
    );
    expect(story().style.height).toBe('');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('removes the pinned spacer when a previously complete live catalog becomes empty', () => {
    const view = renderCarousel();
    flushFrames();
    expect(current()).toHaveAttribute('data-layout', 'scroll');
    expect(Number.parseFloat(story().style.height)).toBeGreaterThan(
      innerHeight
    );
    scrollPage(phaseY(2));
    view.rerender(
      <TestRouter>
        <ProjectCarousel projects={[]} />
      </TestRouter>
    );
    flushFrames();
    expect(current()).toHaveAttribute('data-layout', 'manual');
    expect(story().style.height).toBe('');
    expect(screen.getByText(getCarouselCopy('en').empty)).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      screen.getByRole('link', { name: getCarouselCopy('en').viewAll })
    ).toHaveAttribute('href', '/projects');
  });

  it('keeps all four factual project stories and destinations alongside direct chapter controls', () => {
    renderCarousel();
    flushFrames();
    expect(entries()).toHaveLength(4);
    getProjects('en').forEach((project, index) => {
      const item = within(entries()[index]);
      const narrative = getProjectStoryCopy('en', project.slug)!;
      expect(
        item.getByRole('heading', {
          name: narrative.headline,
          level: 3,
          hidden: true,
        })
      ).toBeInTheDocument();
      expect(entries()[index].querySelector('img')).toHaveAttribute(
        'src',
        project.image
      );
      expect(item.getByText(narrative.caption)).toBeInTheDocument();
      narrative.features.forEach((feature) =>
        expect(item.getByText(feature)).toBeInTheDocument()
      );
      expect(item.getByText(/View project/)).toHaveAttribute(
        'href',
        `/projects/${project.slug}`
      );
      expect(item.getByText(/View project/)).toHaveAttribute(
        'tabindex',
        index === 0 ? '0' : '-1'
      );
      expect(item.getByText(/View source/)).toHaveAttribute(
        'href',
        project.github
      );
      expect(item.getByText(/View source/)).toHaveAttribute(
        'tabindex',
        index === 0 ? '0' : '-1'
      );
    });
    expect(screen.getAllByRole('button')).toHaveLength(4);
    getProjects('en').forEach((project) => {
      expect(
        screen.getByRole('button', { name: project.title })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('link', { name: getCarouselCopy('en').viewAll })
    ).toHaveAttribute('href', '/projects');
    expect(current()).toHaveAttribute('data-layout', 'scroll');
    expect(
      screen.getByText(getCarouselCopy('en').instruction)
    ).toBeInTheDocument();
  });

  it('maps bounded vertical page progress to full slide positions and reverses naturally', () => {
    renderCarousel();
    flushFrames();
    expect(story()).toHaveAttribute('data-scroll-progress', '0.0000');
    for (let index = 0; index < 4; index++) {
      scrollPage(phaseY(index));
      expect(current()).toHaveAttribute('data-current-index', String(index));
      expect(
        (entries()[index].querySelector('.carousel-media') as HTMLElement).style
          .opacity
      ).toBe('1');
    }
    scrollPage(phaseY(1));
    expect(current()).toHaveAttribute('data-current-index', '1');
    scrollPage(0);
    expect(story()).toHaveAttribute('data-scroll-progress', '0.0000');
    scrollPage(10000);
    expect(story()).toHaveAttribute('data-scroll-progress', '1.0000');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('renders only the current image transition through fast skips and reverse scrolling', () => {
    const projects = getProjectCatalog('en');
    render(
      <TestRouter>
        <ProjectCarousel projects={projects} />
      </TestRouter>
    );
    flushFrames();
    const start = sectionTop - stickyTop;
    for (const position of [0.2, 8.25, 10, 4.5, 0]) {
      scrollPage(start + (position / 10) * span());
      const rendered = entries().filter(
        (entry) => entry.dataset.rendered === 'true'
      );
      expect(rendered.map((entry) => Number(entry.dataset.slideIndex))).toEqual(
        Number.isInteger(position)
          ? [position]
          : [Math.floor(position), Math.ceil(position)]
      );
      for (const entry of entries()) {
        const image = entry.querySelector('.carousel-media') as HTMLElement;
        if (!rendered.includes(entry)) expect(image.style.transform).toBe('');
      }
      expect(current()).toHaveAttribute(
        'data-current-index',
        String(Math.round(position))
      );
    }
  });

  it('leaves offscreen project styles untouched while the viewer scrolls later sections', async () => {
    renderCarousel();
    flushFrames();
    scrollPage(10000);
    await act(async () => {});
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver((records) =>
      mutations.push(...records)
    );
    observer.observe(story(), { attributes: true, subtree: true });
    scrollPage(11000);
    scrollPage(12000);
    await act(async () => {});
    observer.disconnect();
    expect(mutations).toHaveLength(0);
    expect(current()).toHaveAttribute('data-current-index', '3');
  });

  it('only announces the current project after native scrolling settles', () => {
    vi.useFakeTimers();
    renderCarousel();
    flushFrames();
    scrollPage(phaseY(2));
    expect(current()).toHaveAttribute('data-current-index', '2');
    expect(screen.getByRole('status')).toHaveTextContent('Project 1 of 4');
    act(() => vi.advanceTimersByTime(179));
    expect(screen.getByRole('status')).toHaveTextContent('Project 1 of 4');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Project 3 of 4: Blaster'
    );
  });

  it('moves pointer selection through the measured native sequence without changing the chapter ahead of actual scroll', () => {
    renderCarousel();
    flushFrames();
    fireEvent.click(screen.getByRole('button', { name: 'Blaster' }), {
      detail: 1,
    });
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: phaseY(2),
      behavior: 'smooth',
    });
    expect(current()).toHaveAttribute('data-current-index', '0');
    scrollPage(phaseY(1));
    expect(
      screen.getByRole('button', { name: 'ESP32 Claude Remote' })
    ).toHaveAttribute('aria-pressed', 'true');
    scrollPage(phaseY(2));
    expect(screen.getByRole('button', { name: 'Blaster' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('lets keyboard activation jump to a chapter while keeping its control focused', async () => {
    const user = userEvent.setup();
    renderCarousel();
    flushFrames();
    const chapter = screen.getByRole('button', { name: 'Blaster' });
    act(() => chapter.focus());
    await user.keyboard('[Enter]');
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: phaseY(2),
      behavior: 'instant',
    });
    expect(chapter).toHaveFocus();
    expect(chapter).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Project 3 of 4: Blaster'
    );
  });

  it('keeps chapter arrow and endpoint shortcuts scoped to controls and follows RTL reading direction', () => {
    state.language = 'he';
    renderCarousel();
    flushFrames();
    const projects = getProjects('he');
    const first = screen.getByRole('button', { name: projects[0].title });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(
      screen.getByRole('button', { name: projects[1].title })
    ).toHaveFocus();
    expect(current()).toHaveAttribute('data-current-index', '1');
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(
      screen.getByRole('button', { name: projects[3].title })
    ).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(first).toHaveFocus();
    expect(current()).toHaveAttribute('data-current-index', '0');
  });

  it('counts the full chapter toolbar and largest caption before enabling a pinned stage', () => {
    toolbarHeight = 360;
    renderCarousel();
    flushFrames();
    expect(current()).toHaveAttribute('data-layout', 'manual');
    expect(story().style.height).toBe('');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('preserves manual selection through language and page scroll changes with reduced motion', () => {
    state.motionAllowed = false;
    vi.stubGlobal('innerWidth', 767);
    const view = renderCarousel();
    flushFrames();
    fireEvent.click(screen.getByRole('button', { name: 'Blaster' }));
    const action = screen.getByRole('link', { name: /View project/ });
    act(() => action.focus());
    state.language = 'jp';
    view.rerender(
      <TestRouter>
        <ProjectCarousel projects={curatedCatalog('jp')} />
      </TestRouter>
    );
    flushFrames();
    scrollPage(2000);
    expect(current()).toHaveAttribute('data-layout', 'manual');
    expect(current()).toHaveAttribute('data-current-index', '2');
    expect(action).toHaveFocus();
    expect(action).toHaveAttribute('href', '/projects/blaster');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('keeps the same story order and native page keys in RTL', () => {
    state.language = 'he';
    renderCarousel();
    flushFrames();
    expect(track()).toHaveAttribute('dir', 'rtl');
    expect(current().querySelector('.carousel-position')).toHaveAttribute(
      'dir',
      'ltr'
    );
    scrollPage(phaseY(1));
    expect(current()).toHaveAttribute('data-current-index', '1');
    expect(
      (entries()[1].querySelector('.carousel-media') as HTMLElement).style
        .opacity
    ).toBe('1');
    for (const key of ['PageDown', 'ArrowDown', 'ArrowLeft', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      fireEvent(current(), event);
      expect(event.defaultPrevented).toBe(false);
    }
    const wheel = new WheelEvent('wheel', {
      deltaY: 80,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(current(), wheel);
    expect(wheel.defaultPrevented).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('exposes only the selected story actions after the chapter controls in keyboard order', async () => {
    const user = userEvent.setup();
    renderCarousel();
    flushFrames();
    act(() => screen.getAllByRole('button')[0].focus());
    await user.keyboard('{End}');
    await user.tab();
    const projectLink = screen.getByRole('link', { name: /View project/ });
    expect(projectLink).toHaveFocus();
    expect(projectLink).toHaveAttribute('href', '/projects/cinema');
    expect(current()).toHaveAttribute('data-current-index', '3');
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: phaseY(3),
      behavior: 'instant',
    });
    expect(
      entries()
        .slice(0, 3)
        .every((entry) => entry.getAttribute('aria-hidden') === 'true')
    ).toBe(true);
    expect(
      screen.getAllByRole('link', { name: /View (project|source)/ })
    ).toHaveLength(2);
  });

  it('reads restored history positions on mount and popstate without resetting the page', () => {
    pageY = sectionTop - stickyTop + (2 / 3) * (3600 - 524);
    renderCarousel();
    flushFrames();
    expect(current()).toHaveAttribute('data-current-index', '2');
    expect(scrollTo).not.toHaveBeenCalled();
    pageY = phaseY(3);
    fireEvent.popState(window);
    flushFrames();
    expect(current()).toHaveAttribute('data-current-index', '3');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('preserves progress on desktop resizing and language changes with stable focused links', () => {
    const view = renderCarousel();
    flushFrames();
    fireEvent.click(
      screen.getByRole('button', { name: getProjects('en')[2].title })
    );
    const link = screen.getByRole('link', { name: /View project/ });
    act(() => link.focus());
    state.language = 'jp';
    view.rerender(
      <TestRouter>
        <ProjectCarousel projects={curatedCatalog('jp')} />
      </TestRouter>
    );
    flushFrames();
    expect(link).toHaveFocus();
    expect(current()).toHaveAttribute('data-current-index', '2');
    vi.stubGlobal('innerHeight', 1000);
    fireEvent.resize(window);
    flushFrames();
    expect(current()).toHaveAttribute('data-current-index', '2');
    expect(pageY).toBeCloseTo(phaseY(2));
    expect(
      screen.getByText(getCarouselCopy('jp').instruction)
    ).toBeInTheDocument();
  });

  it.each([
    [780, 'scroll'],
    [790, 'manual'],
  ] as const)(
    'keeps a stable %s-pixel stage layout when the complete stage is at the viewport limit',
    (measuredHeight, expectedLayout) => {
      stageHeight = measuredHeight;
      slideHeight = 700;
      renderCarousel();
      flushFrames();
      expect(current()).toHaveAttribute('data-layout', expectedLayout);
      for (let index = 0; index < 4; index++) {
        fireEvent.resize(window);
        flushFrames();
        expect(current()).toHaveAttribute('data-layout', expectedLayout);
      }
      if (expectedLayout === 'manual') expect(story().style.height).toBe('');
    }
  );

  it.each(['short', 'effects-off'] as const)(
    'uses a flat manually selected stage for %s screens or preferences',
    (reason) => {
      if (reason === 'short') {
        stageHeight = 820;
        slideHeight = 746;
      }
      if (reason === 'effects-off') state.motionAllowed = false;
      renderCarousel();
      flushFrames();
      expect(current()).toHaveAttribute('data-layout', 'manual');
      expect(story().style.height).toBe('');
      expect(entries()).toHaveLength(4);
      expect(
        entries().filter((entry) => entry.dataset.rendered === 'true')
      ).toHaveLength(1);
      fireEvent.click(
        screen.getByRole('button', { name: getProjects('en')[2].title })
      );
      expect(current()).toHaveAttribute('data-current-index', '2');
      expect(
        screen.getByRole('link', { name: /View project/ })
      ).toHaveAttribute('href', '/projects/blaster');
      scrollPage(
        sectionTop + slideHeight + 24 + slideHeight / 2 - window.innerHeight / 2
      );
      expect(current()).toHaveAttribute('data-current-index', '2');
      expect(scrollTo).not.toHaveBeenCalled();
    }
  );

  it('keeps a focused project action visible while resizing between pinned and stacked layouts', () => {
    renderCarousel();
    flushFrames();
    fireEvent.click(
      screen.getByRole('button', { name: getProjects('en')[1].title })
    );
    const link = screen.getByRole('link', { name: /View project/ });
    act(() => link.focus());
    for (const [width, height, nextSlideHeight] of [
      [390, 600, 850],
      [720, 450, 600],
      [1440, 900, 450],
    ]) {
      vi.stubGlobal('innerWidth', width);
      vi.stubGlobal('innerHeight', height);
      slideHeight = nextSlideHeight;
      fireEvent.resize(window);
      flushFrames();
      flushFrames();
      expect(link).toHaveFocus();
      if (width < 1440) {
        expect(current()).toHaveAttribute('data-layout', 'manual');
        const bounds = link.getBoundingClientRect();
        expect(bounds.top).toBeGreaterThanOrEqual(stickyTop);
        expect(bounds.bottom).toBeLessThanOrEqual(height - 16);
      } else {
        expect(current()).toHaveAttribute('data-layout', 'scroll');
        expect(current()).toHaveAttribute('data-current-index', '1');
      }
    }
  });

  it('waits for the manual layout before restoring a scroll-selected project after unpinning', () => {
    renderCarousel();
    flushFrames();
    scrollPage(phaseY(2));
    const selected = entries()[2];
    vi.spyOn(selected, 'getBoundingClientRect').mockImplementation(() =>
      story().dataset.layout === 'manual'
        ? rect(sectionTop + toolbarHeight - pageY, 1000, slideHeight)
        : rect(stickyTop + toolbarHeight, 1000, slideHeight)
    );
    scrollTo.mockClear();
    vi.stubGlobal('innerWidth', 390);
    vi.stubGlobal('innerHeight', 500);
    fireEvent.resize(window);
    flushFrames();
    expect(current()).toHaveAttribute('data-layout', 'manual');
    flushFrames();
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: sectionTop + toolbarHeight - stickyTop,
      behavior: 'instant',
    });
    expect(current()).toHaveAttribute('data-current-index', '2');
    expect(selected.getBoundingClientRect().top).toBe(stickyTop);
  });

  it('retains a usable source recovery link after media failure without nested anchors', () => {
    renderCarousel();
    fireEvent.error(screen.getAllByRole('img')[0]);
    expect(
      within(entries()[0]).getAllByRole('link', { name: /View source/ })
    ).toHaveLength(1);
    expect(entries()[0].querySelector('a a')).toBeNull();
  });

  it('cancels pending page updates and announcements after unmount', () => {
    vi.useFakeTimers();
    const view = renderCarousel();
    flushFrames();
    scrollPage(phaseY(1));
    view.unmount();
    frames.clear();
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(500));
    expect(frames.size).toBe(0);
  });
});

describe('Carousel localized content', () => {
  it.each([
    ['he', /\p{Script=Hebrew}/u],
    ['jp', /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u],
  ] as const)(
    'translates every %s label and settled announcement',
    (language, script) => {
      const copy = getCarouselCopy(language);
      for (const value of Object.values(copy))
        if (typeof value === 'string') expect(value).toMatch(script);
      expect(copy.position(1, 4, 'Sample')).toMatch(script);
    }
  );
  it('accepts locale aliases and safely defaults unknown languages', () => {
    expect(getCarouselCopy('he-IL')).toBe(getCarouselCopy('he'));
    expect(getCarouselCopy('ja-JP')).toBe(getCarouselCopy('jp'));
    expect(getCarouselCopy('unsupported')).toBe(getCarouselCopy('en'));
  });
});
