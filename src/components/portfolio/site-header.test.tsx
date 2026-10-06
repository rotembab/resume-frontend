import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPortfolioCopy } from '../../data/portfolio-copy';
import { SiteHeader } from './site-header';

const mocks = vi.hoisted(() => ({ changeLanguage: vi.fn() }));
vi.mock('./use-portfolio', () => ({
  usePortfolio: () => ({
    copy: getPortfolioCopy('en'),
    i18n: { language: 'en', changeLanguage: mocks.changeLanguage },
  }),
}));
vi.mock('./effects-context', () => ({
  useEffects: () => ({ enabled: true, toggle: vi.fn() }),
}));

let pageY: number;
let aboutY: number;
let contactY: number;
const clients = new Map<string, number>();
const clientHeights = new Map<string, number>();
const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts');

const LocationProbe = () => {
  const location = useLocation();
  return (
    <output data-testid='location'>{location.pathname + location.hash}</output>
  );
};

const renderHeader = (fragment = '#about', withStage = false) =>
  render(
    <MemoryRouter initialEntries={['/' + fragment]}>
      <SiteHeader />
      <main>
        <section id='work'>
          Work
          {withStage && (
            <div
              id='project-story'
              className='project-carousel-scroll-story'
              data-layout='scroll'
            />
          )}
        </section>
        <section id='about'>About</section>
        <section id='contact'>Contact</section>
      </main>
    </MemoryRouter>
  );

beforeEach(() => {
  pageY = 1000;
  aboutY = 1200;
  contactY = 1550;
  clients.clear();
  clientHeights.clear();
  mocks.changeLanguage.mockReset();
  mocks.changeLanguage.mockImplementation(async () => {
    aboutY += 50;
    contactY += 400;
  });
  vi.stubGlobal('innerHeight', 900);
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => pageY,
  });
  document.documentElement.style.setProperty('--header-height', '72px');
  vi.spyOn(window, 'scrollTo').mockImplementation(((
    options: ScrollToOptions
  ) => {
    pageY = options.top ?? pageY;
  }) as typeof window.scrollTo);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      const top =
        (this.id === 'about'
          ? aboutY
          : this.id === 'contact'
            ? contactY
            : (clients.get(this.id) ?? 100)) - pageY;
      const height = clientHeights.get(this.id) ?? 300;
      return {
        top,
        bottom: top + height,
        left: 0,
        right: 700,
        x: 0,
        y: top,
        width: 700,
        height,
        toJSON: () => ({}),
      };
    }
  );
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.style.removeProperty('--header-height');
  if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts);
  else Reflect.deleteProperty(document, 'fonts');
});

describe('homepage section navigation', () => {
  const copy = getPortfolioCopy('en');
  const destinations = [
    [copy.experienceTitle, 'experience'],
    [copy.navWork, 'work'],
    [copy.navTools, 'tools'],
    [copy.navAbout, 'about'],
    [copy.navContact, 'contact'],
  ] as const;

  it.each(['primary', 'menu'] as const)(
    'matches the homepage section order in the %s navigation',
    async (surface) => {
      const { container } = render(
        <MemoryRouter initialEntries={['/projects/blaster']}>
          <SiteHeader />
          <LocationProbe />
        </MemoryRouter>
      );
      if (surface === 'menu')
        await userEvent.click(screen.getByRole('button', { name: copy.menu }));
      const navigation = container.querySelector<HTMLElement>(
        surface === 'primary' ? '.primary-nav' : '.menu-panel nav'
      )!;
      expect(
        within(navigation)
          .getAllByRole('link')
          .filter((link) => link.getAttribute('href')?.startsWith('/#'))
          .map((link) => [link.textContent, link.getAttribute('href')])
      ).toEqual(destinations.map(([label, id]) => [label, '/#' + id]));
      expect(
        within(navigation).getByRole('link', { name: copy.navTools })
      ).toHaveAttribute('href', '/#tools');
      expect(
        within(navigation).queryByRole('link', { name: copy.navLab })
      ).not.toBeInTheDocument();
    }
  );

  it.each(
    (['primary', 'menu'] as const).flatMap((surface) =>
      destinations.map(([label, id]) => ({ surface, label, id }))
    )
  )(
    'returns from an interior page to $id through $surface navigation',
    async ({ surface, label, id }) => {
      const { container } = render(
        <MemoryRouter initialEntries={['/projects/blaster']}>
          <SiteHeader />
          <LocationProbe />
        </MemoryRouter>
      );
      if (surface === 'menu')
        await userEvent.click(screen.getByRole('button', { name: copy.menu }));
      const navigation = container.querySelector<HTMLElement>(
        surface === 'primary' ? '.primary-nav' : '.menu-panel nav'
      )!;
      const link = within(navigation).getByRole('link', {
        name: label,
      });
      expect(link).toHaveAttribute('href', '/#' + id);
      await userEvent.click(link);
      expect(screen.getByTestId('location')).toHaveTextContent('/#' + id);
      expect(container.querySelector('.menu-button')).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    }
  );

  it('marks Tools as current when its dedicated page is open', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/tools']}>
        <SiteHeader />
        <LocationProbe />
      </MemoryRouter>
    );
    const link = within(
      container.querySelector('.primary-nav') as HTMLElement
    ).getByRole('link', { name: copy.navTools });
    expect(screen.getByTestId('location')).toHaveTextContent('/tools');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('is-current');
  });
});

describe('language position preservation', () => {
  it('does not overwrite chapter restoration when localization unpins the project story', async () => {
    pageY = 1600;
    aboutY = 3900;
    contactY = 4300;
    clients.set('project-story', 300);
    clientHeights.set('project-story', 3600);
    let finishFonts!: () => void;
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        ready: new Promise<void>((resolve) => {
          finishFonts = resolve;
        }),
      },
    });
    mocks.changeLanguage.mockImplementation(async () => {
      // The carousel owns this scroll after its localized caption no longer
      // fits the viewport and its multi-viewport spacer collapses.
      document.getElementById('project-story')!.dataset.layout = 'manual';
      clients.set('project-story', 350);
      clientHeights.set('project-story', 700);
      aboutY = 1200;
      contactY = 2000;
      window.scrollTo({ top: 420, behavior: 'instant' });
    });
    renderHeader('#work', true);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: getPortfolioCopy('en').menu })
    );
    const select = screen.getByRole('combobox', {
      name: getPortfolioCopy('en').language,
    });
    await user.selectOptions(select, 'he');
    await act(async () => {
      finishFonts();
    });
    expect(mocks.changeLanguage).toHaveBeenCalledWith('he');
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(pageY).toBe(420);
    expect(select).toHaveFocus();
  });

  it('keeps ordinary section restoration when the story is only visible below the header', async () => {
    clients.set('project-story', 1500);
    clientHeights.set('project-story', 3600);
    renderHeader('#about', true);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: getPortfolioCopy('en').menu })
    );
    const select = screen.getByRole('combobox', {
      name: getPortfolioCopy('en').language,
    });
    await user.selectOptions(select, 'he');
    await waitFor(() =>
      expect(window.scrollTo).toHaveBeenLastCalledWith({
        top: 1050,
        behavior: 'instant',
      })
    );
    expect(aboutY - pageY).toBe(200);
    expect(select).toHaveFocus();
  });

  it('preserves the visible fragment instead of a lower section in the viewport', async () => {
    renderHeader();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: getPortfolioCopy('en').menu })
    );
    const select = screen.getByRole('combobox', {
      name: getPortfolioCopy('en').language,
    });
    await user.selectOptions(select, 'he');
    await waitFor(() =>
      expect(window.scrollTo).toHaveBeenLastCalledWith({
        top: 1050,
        behavior: 'instant',
      })
    );
    expect(aboutY - pageY).toBe(200);
    expect(select).toHaveFocus();
  });

  it('waits for fonts requested by localized text before measuring the final anchor', async () => {
    let finishFonts!: () => void;
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        ready: new Promise<void>((resolve) => {
          finishFonts = resolve;
        }),
      },
    });
    renderHeader();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: getPortfolioCopy('en').menu })
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: getPortfolioCopy('en').language }),
      'he'
    );
    expect(window.scrollTo).not.toHaveBeenCalled();
    aboutY += 200;
    await act(async () => {
      finishFonts();
    });
    await waitFor(() =>
      expect(window.scrollTo).toHaveBeenLastCalledWith({
        top: 1250,
        behavior: 'instant',
      })
    );
    expect(aboutY - pageY).toBe(200);
  });

  it('uses the section closest to the header when the fragment has scrolled out of view', async () => {
    pageY = 1600;
    clients.set('work', 100);
    renderHeader();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: getPortfolioCopy('en').menu })
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: getPortfolioCopy('en').language }),
      'he'
    );
    await waitFor(() =>
      expect(window.scrollTo).toHaveBeenLastCalledWith({
        top: 2000,
        behavior: 'instant',
      })
    );
    expect(contactY - pageY).toBe(-50);
  });
});
