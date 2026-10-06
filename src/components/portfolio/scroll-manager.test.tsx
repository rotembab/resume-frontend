import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  BrowserRouter,
  Link,
  MemoryRouter,
  useLocation,
  useNavigate,
} from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollManager } from './scroll-manager';

const effects = vi.hoisted(() => ({ motionAllowed: true }));
vi.mock('./effects-context', () => ({
  useEffects: () => effects,
}));

let frameId = 0;
let visitId = 0;
let root: HTMLDivElement;
const pendingFrames = new Map<number, FrameRequestCallback>();

function flushFrame() {
  act(() => {
    const frames = [...pendingFrames.values()];
    pendingFrames.clear();
    frames.forEach((callback) => callback(0));
  });
}

function scrollToPosition(top: number) {
  vi.stubGlobal('scrollY', top);
  fireEvent.scroll(window);
}

function TestPage({ showSections = true }: { showSections?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const interior = location.pathname.startsWith('/projects/');
  return (
    <>
      <ScrollManager />
      <nav>
        <Link to='/#work'>Work link</Link>
        <Link to='/#experience'>Experience link</Link>
        <Link to='/#contact'>Contact link</Link>
        <Link to='#systems'>Systems link</Link>
        <button onClick={() => navigate(-1)}>Back</button>
        <button onClick={() => navigate(1)}>Forward</button>
      </nav>
      <main>
        <h1 tabIndex={-1}>{interior ? 'Project details' : 'Workshop'}</h1>
        {!interior && showSections && (
          <>
            <section id='work'>
              <h2 tabIndex={-1}>Work</h2>
            </section>
            <section id='experience'>
              <h2 tabIndex={-1}>Experience</h2>
            </section>
            <section id='contact'>
              <h2 tabIndex={-1}>Contact</h2>
            </section>
            <section id='systems'>
              <h2 tabIndex={-1}>Systems</h2>
            </section>
          </>
        )}
      </main>
    </>
  );
}

beforeEach(() => {
  effects.motionAllowed = true;
  pendingFrames.clear();
  root = document.createElement('div');
  root.id = 'root';
  document.body.append(root);
  document.documentElement.style.setProperty('--header-height', '72px');
  vi.stubGlobal('scrollY', 0);
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      pendingFrames.set(++frameId, callback);
      return frameId;
    })
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => pendingFrames.delete(id))
  );
  vi.spyOn(window, 'scrollTo').mockImplementation(((
    options: ScrollToOptions | number,
    top?: number
  ) => {
    vi.stubGlobal(
      'scrollY',
      typeof options === 'object' ? (options.top ?? 0) : (top ?? 0)
    );
  }) as typeof window.scrollTo);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      // jsdom has no layout. Each section's document position stays fixed as
      // the page moves, so the header clearance is verified independently.
      const positions: Record<string, number> = {
        work: 496,
        experience: 896,
        contact: 2096,
        systems: 1296,
      };
      const top = (positions[this.id] ?? 0) - scrollY;
      return {
        top,
        bottom: top + 300,
        left: 0,
        right: 800,
        x: 0,
        y: top,
        width: 800,
        height: 300,
        toJSON: () => ({}),
      };
    }
  );
});

afterEach(() => {
  cleanup();
  root.remove();
  document.documentElement.style.removeProperty('--header-height');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('portfolio scroll navigation', () => {
  it('keeps a restored manual-project link visible after its page dimensions change', async () => {
    vi.stubGlobal('innerHeight', 800);
    let actionTop = 500;
    function ManualStoryPage() {
      const location = useLocation();
      const navigate = useNavigate();
      return (
        <>
          <ScrollManager />
          <button onClick={() => navigate(-1)}>Back</button>
          <main>
            <h1 tabIndex={-1}>Portfolio</h1>
            {location.pathname === '/' && (
              <div
                className='project-carousel-scroll-story'
                data-layout='manual'
              >
                <Link
                  id='restored-project-action'
                  to='/projects/cinema-rest-api'
                >
                  View project
                </Link>
              </div>
            )}
          </main>
        </>
      );
    }
    const baseBounds = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.id !== 'restored-project-action') return baseBounds.call(this);
        const top = actionTop - scrollY;
        return {
          top,
          bottom: top + 44,
          left: 0,
          right: 160,
          x: 0,
          y: top,
          width: 160,
          height: 44,
          toJSON: () => ({}),
        };
      }
    );
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/', key: `manual-size-${++visitId}` }]}
      >
        <ManualStoryPage />
      </MemoryRouter>,
      { container: root }
    );
    flushFrame();
    scrollToPosition(100);
    await userEvent.click(screen.getByRole('link', { name: 'View project' }));
    flushFrame();
    actionTop = 2500;
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    flushFrame();
    flushFrame();
    const restored = screen.getByRole('link', { name: 'View project' });
    expect(restored).toHaveFocus();
    expect(restored.getBoundingClientRect().bottom).toBeLessThanOrEqual(784);
    expect(restored.getBoundingClientRect().top).toBeGreaterThanOrEqual(24);
  });

  it.each([
    ['Work', 'work', 400],
    ['Experience', 'experience', 800],
    ['Contact', 'contact', 2000],
  ] as const)(
    'returns from an interior page to %s with smooth scrolling, one header offset, and heading focus',
    async (label, id, top) => {
      render(
        <MemoryRouter
          initialEntries={[
            { pathname: '/projects/blaster', key: `interior-${++visitId}` },
          ]}
        >
          <TestPage />
        </MemoryRouter>,
        { container: root }
      );
      flushFrame();
      scrollToPosition(580);
      await userEvent.click(
        screen.getByRole('link', { name: label + ' link' })
      );
      flushFrame();
      expect(window.scrollTo).toHaveBeenLastCalledWith({
        top,
        behavior: 'smooth',
      });
      expect(document.getElementById(id)!.getBoundingClientRect().top).toBe(96);
      expect(screen.getByRole('heading', { name: label })).toHaveFocus();
      expect(
        screen.queryByRole('heading', { name: 'Project details' })
      ).not.toBeInTheDocument();
    }
  );

  it('re-scrolls and refocuses the target when the same hash link is activated again', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/', hash: '#work', key: `repeat-${++visitId}` },
        ]}
      >
        <TestPage />
      </MemoryRouter>,
      { container: root }
    );
    flushFrame();
    vi.mocked(window.scrollTo).mockClear();
    for (const top of [900, 760]) {
      scrollToPosition(top);
      await userEvent.click(screen.getByRole('link', { name: 'Work link' }));
      flushFrame();
      expect(window.scrollY).toBe(400);
      expect(window.scrollTo).toHaveBeenLastCalledWith({
        top: 400,
        behavior: 'smooth',
      });
      expect(screen.getByRole('heading', { name: 'Work' })).toHaveFocus();
    }
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('applies a changed motion preference to the next navigation without moving the current section', async () => {
    const element = () => (
      <MemoryRouter
        initialEntries={[
          { pathname: '/', hash: '#work', key: `motion-${visitId}` },
        ]}
      >
        <TestPage />
      </MemoryRouter>
    );
    visitId++;
    const view = render(element(), { container: root });
    flushFrame();
    scrollToPosition(620);
    vi.mocked(window.scrollTo).mockClear();
    effects.motionAllowed = false;
    view.rerender(element());
    flushFrame();
    expect(window.scrollY).toBe(620);
    expect(window.scrollTo).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('link', { name: 'Work link' }));
    flushFrame();
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 400,
      behavior: 'instant',
    });
    expect(screen.getByRole('heading', { name: 'Work' })).toHaveFocus();
  });

  it('waits for the requested homepage section instead of consuming navigation when only its heading is ready', async () => {
    const element = (showSections: boolean) => (
      <MemoryRouter
        initialEntries={[
          { pathname: '/projects/blaster', key: `deferred-${visitId}` },
        ]}
      >
        <TestPage showSections={showSections} />
      </MemoryRouter>
    );
    visitId++;
    const view = render(element(false), { container: root });
    flushFrame();
    scrollToPosition(580);
    vi.mocked(window.scrollTo).mockClear();
    await userEvent.click(screen.getByRole('link', { name: 'Work link' }));
    flushFrame();
    expect(
      screen.getByRole('heading', { name: 'Workshop' })
    ).toBeInTheDocument();
    expect(window.scrollTo).not.toHaveBeenCalled();
    await act(async () => {
      view.rerender(element(true));
    });
    flushFrame();
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 400,
      behavior: 'smooth',
    });
    expect(screen.getByRole('heading', { name: 'Work' })).toHaveFocus();
  });

  it('moves from Work to Systems when native fragment navigation retains the history key', () => {
    const state = { key: `native-fragment-${++visitId}`, idx: 0 };
    window.history.replaceState(state, '', '/scroll-test#work');
    render(
      <BrowserRouter>
        <TestPage />
      </BrowserRouter>,
      { container: root }
    );
    flushFrame();
    expect(screen.getByRole('heading', { name: 'Work' })).toHaveFocus();
    scrollToPosition(540);

    act(() => {
      window.history.pushState(window.history.state, '', '#systems');
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: window.history.state })
      );
    });
    flushFrame();

    expect(window.history.state.key).toBe(state.key);
    expect(screen.getByRole('heading', { name: 'Systems' })).toHaveFocus();
    expect(window.scrollY).toBe(1200);
  });

  it('treats a malformed fragment as a normal page visit and keeps navigation working', async () => {
    window.history.replaceState(
      { key: `malformed-fragment-${++visitId}`, idx: 0 },
      '',
      '/scroll-test#%'
    );
    vi.stubGlobal('scrollY', 750);
    render(
      <BrowserRouter>
        <TestPage />
      </BrowserRouter>,
      { container: root }
    );

    expect(flushFrame).not.toThrow();
    expect(window.scrollY).toBe(0);
    expect(screen.getByRole('heading', { name: 'Workshop' })).toHaveFocus();

    await userEvent.click(screen.getByRole('link', { name: 'Systems link' }));
    flushFrame();
    expect(screen.getByRole('heading', { name: 'Systems' })).toHaveFocus();
    expect(window.scrollY).toBe(1200);
  });

  it('restores each saved scroll position when the visitor goes back and forward', async () => {
    render(
      <MemoryRouter initialEntries={['/scroll-test#work']}>
        <TestPage />
      </MemoryRouter>,
      { container: root }
    );
    flushFrame();
    scrollToPosition(620);

    await userEvent.click(screen.getByRole('link', { name: 'Systems link' }));
    flushFrame();
    scrollToPosition(1430);

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    flushFrame();
    expect(window.scrollY).toBe(620);
    expect(screen.getByRole('heading', { name: 'Work' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Forward' }));
    flushFrame();
    expect(window.scrollY).toBe(1430);
    expect(screen.getByRole('heading', { name: 'Systems' })).toHaveFocus();
  });
});
