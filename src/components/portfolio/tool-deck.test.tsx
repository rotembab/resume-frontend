import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { MemoryRouter, Link, useLocation, useNavigate } from 'react-router';
import type { ReactNode } from 'react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { ToolDeck, type ToolCard } from './tool-deck';
import { getPortfolioCopy } from '../../data/portfolio-copy';
import { getToolDeckCopy } from '../../data/tool-deck-copy';
import { ScrollManager } from './scroll-manager';

const state = vi.hoisted(() => ({ language: 'en', motionAllowed: true }));
vi.mock('./use-portfolio', () => ({
  usePortfolio: () => ({
    copy: getPortfolioCopy(state.language),
    i18n: {
      language: state.language,
      dir: () => (state.language === 'he' ? 'rtl' : 'ltr'),
    },
  }),
}));
vi.mock('./effects-context', () => ({
  useEffects: () => ({ motionAllowed: state.motionAllowed }),
}));
const cards: ToolCard[] = [
  {
    id: 'react',
    name: 'React',
    summary: 'Interfaces',
    category: 'Product',
    iconKey: 'react',
    link: 'https://react.dev',
    evidence: [{ to: '/projects/example', title: 'Example' }],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    summary: 'Typed JavaScript',
    category: 'Product',
    iconKey: 'typescript',
    evidence: [{ to: '/experience#example', title: 'Company' }],
  },
  {
    id: 'python',
    name: 'Python',
    summary: 'Programming language',
    category: 'Systems',
    iconKey: 'python',
    evidence: [],
  },
];
let entryId = 0;
const TestRouter = ({ children }: { children: ReactNode }) => (
  <MemoryRouter
    initialEntries={[{ pathname: '/tools', key: 'tool-test-' + ++entryId }]}
  >
    {children}
  </MemoryRouter>
);
let pageY = 0;
let stageHeight = 460;
let frames = new Map<number, FrameRequestCallback>();
let frameId = 0;
let top = 600;
const stickyTop = 88;
const scrollTo = vi.fn((options: ScrollToOptions) => {
  pageY = options.top ?? pageY;
});
const rect = (y: number, height: number): DOMRect => ({
  left: 0,
  right: 500,
  width: 500,
  x: 0,
  top: y,
  y,
  bottom: y + height,
  height,
  toJSON: () => ({}),
});
const current = () =>
  screen.getByRole('region', { name: getToolDeckCopy(state.language).label });
const story = () => current().parentElement!;
const picker = () =>
  screen.getByRole('combobox', { name: getToolDeckCopy(state.language).tool });
const flush = () =>
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
const scroll = (value: number) => {
  pageY = value;
  fireEvent.scroll(window);
  flush();
};
const renderDeck = () =>
  render(
    <TestRouter>
      <ToolDeck cards={cards} />
    </TestRouter>
  );
const span = () => Number.parseFloat(story().style.height) - stageHeight;

beforeEach(() => {
  top = 600;
  state.language = 'en';
  state.motionAllowed = true;
  pageY = 0;
  stageHeight = 460;
  frames = new Map();
  scrollTo.mockClear();
  vi.stubGlobal('innerHeight', 900);
  vi.stubGlobal('innerWidth', 775);
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
      if (this.classList.contains('site-header')) return rect(0, 64);
      if (this.classList.contains('tool-deck-story'))
        return rect(
          top - pageY,
          Number.parseFloat(this.style.height) || stageHeight
        );
      if (this.classList.contains('tool-deck-stage'))
        return rect(Math.max(stickyTop, top - pageY), stageHeight);
      if (this.tagName === 'A') return rect(350, 44);
      return rect(0, 0);
    }
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('scroll-driven tool icons', () => {
  it('advances every tool and reverses using ordinary page scrolling', () => {
    renderDeck();
    expect(story()).toHaveAttribute('data-layout', 'scroll');
    const chapterSpan = span() / 2;
    for (const index of [0, 1, 2, 1, 0]) {
      scroll(top - stickyTop + chapterSpan * index);
      expect(picker()).toHaveValue(cards[index].id);
      expect(
        screen.getByRole('heading', { name: cards[index].name })
      ).toBeInTheDocument();
      expect(
        document.querySelectorAll('.tool-card[aria-hidden="false"]')
      ).toHaveLength(1);
    }
  });
  it('leaves offscreen tool styles untouched while the viewer scrolls earlier sections', async () => {
    renderDeck();
    flush();
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver((records) =>
      mutations.push(...records)
    );
    observer.observe(story(), { attributes: true, subtree: true });
    scroll(100);
    scroll(200);
    await act(async () => {});
    observer.disconnect();
    expect(mutations).toHaveLength(0);
    expect(picker()).toHaveValue('react');
  });

  it('direct selection moves to the same measured scroll chapter', () => {
    renderDeck();
    fireEvent.change(picker(), { target: { value: 'python' } });
    expect(pageY).toBeCloseTo(top - stickyTop + span());
    expect(screen.getByRole('status')).toHaveTextContent('Tool 3 / 3: Python');
    fireEvent.change(picker(), { target: { value: 'typescript' } });
    expect(picker()).toHaveValue('typescript');
    expect(pageY).toBeCloseTo(top - stickyTop + span() / 2);
  });

  it('keeps keyboard focus visible when scrolling past a focused related-work link', () => {
    renderDeck();
    screen.getByRole('link', { name: 'Example' }).focus();
    scroll(top - stickyTop + span());
    expect(picker()).toHaveValue('python');
    expect(document.activeElement).toBe(picker());
  });
  it.each(['short', 'reduced'] as const)(
    'uses a spacer-free manual layout for %s viewports/preferences',
    (mode) => {
      if (mode === 'short') vi.stubGlobal('innerHeight', 500);
      else state.motionAllowed = false;
      renderDeck();
      expect(story()).toHaveAttribute('data-layout', 'manual');
      expect(story().style.height).toBe('');
      fireEvent.change(picker(), { target: { value: 'python' } });
      scroll(1800);
      expect(picker()).toHaveValue('python');
      expect(scrollTo).not.toHaveBeenCalled();
    }
  );
  it('keeps scrolling enabled on mobile when the complete stage fits', () => {
    vi.stubGlobal('innerWidth', 360);
    renderDeck();
    expect(story()).toHaveAttribute('data-layout', 'scroll');
    scroll(top - stickyTop + span());
    expect(picker()).toHaveValue('python');
  });
  it('does not restart native scrolling when Safari browser bars change height', () => {
    document.documentElement.style.setProperty(
      '--story-viewport-height',
      '664px'
    );
    vi.stubGlobal('innerHeight', 664);
    renderDeck();
    flush();
    fireEvent.change(picker(), { target: { value: 'typescript' } });
    const chosenY = pageY;
    scrollTo.mockClear();
    vi.stubGlobal('innerHeight', 844);
    fireEvent.resize(window);
    flush();
    expect(picker()).toHaveValue('typescript');
    expect(pageY).toBe(chosenY);
    expect(scrollTo).not.toHaveBeenCalled();
    document.documentElement.style.removeProperty('--story-viewport-height');
  });
  it('retains selected identity and keyboard focus through RTL, resizing and effects changes', () => {
    const view = renderDeck();
    fireEvent.change(picker(), { target: { value: 'typescript' } });
    picker().focus();
    state.language = 'he';
    view.rerender(
      <TestRouter>
        <ToolDeck cards={[...cards]} />
      </TestRouter>
    );
    expect(picker()).toHaveValue('typescript');
    expect(document.activeElement).toBe(picker());
    expect(current().querySelector('.tool-deck-buttons')).toBeNull();
    state.motionAllowed = false;
    view.rerender(
      <TestRouter>
        <ToolDeck cards={cards} />
      </TestRouter>
    );
    flush();
    expect(story()).toHaveAttribute('data-layout', 'manual');
    expect(picker()).toHaveValue('typescript');
    expect(document.activeElement).toBe(picker());
    state.motionAllowed = true;
    view.rerender(
      <TestRouter>
        <ToolDeck cards={cards} />
      </TestRouter>
    );
    expect(story()).toHaveAttribute('data-layout', 'scroll');
    expect(picker()).toHaveValue('typescript');
  });
  it('provides readable fallback initials when an icon fails', () => {
    renderDeck();
    const img = document.querySelector('.tool-icon[data-icon="react"] img')!;
    fireEvent.error(img);
    expect(
      document.querySelector('.tool-icon[data-icon="react"]')
    ).toHaveTextContent('Re');
    expect(screen.getByRole('heading', { name: 'React' })).toBeInTheDocument();
  });
  it('does not move Back restoration to Tools when the visitor was above that section', () => {
    top = 3000;
    const Page = () => {
      const location = useLocation();
      const navigate = useNavigate();
      return (
        <>
          <ScrollManager />
          <header className='site-header' />
          <button onClick={() => navigate(-1)}>Back</button>
          <main>
            <h1 tabIndex={-1}>Portfolio</h1>
            {location.pathname === '/tools' && (
              <>
                <Link id='other-project' to='/projects/other'>
                  Other project
                </Link>
                <ToolDeck cards={cards} />
              </>
            )}
          </main>
        </>
      );
    };
    render(
      <div id='root'>
        <TestRouter>
          <Page />
        </TestRouter>
      </div>
    );
    flush();
    scroll(1100);
    const link = screen.getByRole('link', { name: 'Other project' });
    link.focus();
    fireEvent.click(link);
    flush();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    flush();
    flush();
    expect(pageY).toBe(1100);
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: 'Other project' })
    );
  });

  it('restores selected tool and evidence-link focus when returning from related work', () => {
    const HistoryPage = () => {
      const location = useLocation();
      const navigate = useNavigate();
      return (
        <>
          <ScrollManager />
          <header className='site-header' />
          <button onClick={() => navigate(-1)}>Back</button>
          <main>
            <h1 tabIndex={-1}>Tools</h1>
            {location.pathname === '/tools' ? (
              <ToolDeck cards={cards} />
            ) : (
              <Link to='/tools'>Tools</Link>
            )}
          </main>
        </>
      );
    };
    render(
      <div id='root'>
        <TestRouter>
          <HistoryPage />
        </TestRouter>
      </div>
    );
    flush();
    fireEvent.change(picker(), { target: { value: 'typescript' } });
    scroll(pageY);
    const link = screen.getByRole('link', { name: 'Company' });
    link.focus();
    fireEvent.click(link);
    flush();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    flush();
    expect(picker()).toHaveValue('typescript');
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: 'Company' })
    );
    expect(pageY).toBeCloseTo(top - stickyTop + span() / 2);
  });
});
