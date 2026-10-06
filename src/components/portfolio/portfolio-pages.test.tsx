import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPortfolioCopy } from '../../data/portfolio-copy';
import { getCatalogCopy } from '../../data/catalog-copy';
import { getHomeCopy } from '../../data/home-copy';
import { getCarouselCopy } from '../../data/project-carousel-copy';
import '../../lang/i18n';
import { getProjectCatalog } from '../../data/project-catalog';
import { getProjects } from '../../data/projects';
import { repositorySnapshot } from '../../data/repository-snapshot';
import type { IGithubRepo } from '../../interfaces/github/github-fetch-repos-query';
import PortfolioPages from './portfolio-pages';
import HomePage from './home-page';
import { SnackbarProvider } from '../ui/snackbar/snackbar-provider';

const mocks = vi.hoisted(() => ({
  requested: vi.fn(),
  refetch: vi.fn(),
  language: 'en',
  query: {
    data: undefined as IGithubRepo[] | undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
  },
}));

vi.mock('./use-portfolio', () => ({
  usePortfolio: () => ({
    copy: getPortfolioCopy(mocks.language),
    projects: getProjects(mocks.language),
    i18n: {
      language: mocks.language,
      dir: () => (mocks.language === 'he' ? 'rtl' : 'ltr'),
    },
  }),
}));
vi.mock('../../hooks/github-fetchAPI.hook', () => ({
  useGithubReposFetchAPI: () => {
    mocks.requested();
    return { ...mocks.query, refetch: mocks.refetch };
  },
}));

const copy = getCatalogCopy('en');
const renderWork = () =>
  render(
    <MemoryRouter>
      <PortfolioPages page='projects' />
    </MemoryRouter>
  );
const detail = (slug: string) => (
  <MemoryRouter initialEntries={['/projects/' + slug]}>
    <Routes>
      <Route
        path='/projects/:slug'
        element={<PortfolioPages page='project' />}
      />
    </Routes>
  </MemoryRouter>
);
const repository = (name: string, id = 100): IGithubRepo => ({
  id,
  name,
  description: null,
  html_url: 'https://github.com/rotembab/' + name,
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-10-06T12:00:00Z',
  pushed_at: '2026-10-06T12:00:00Z',
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.language = 'en';
  mocks.query = {
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
  };
});
afterEach(cleanup);

describe('homepage project showcase', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  it.each(['en', 'he', 'jp'])(
    'shows all project chapters with a separate catalog in %s',
    (language) => {
      mocks.language = language;
      render(
        <MemoryRouter>
          <SnackbarProvider>
            <HomePage />
          </SnackbarProvider>
        </MemoryRouter>
      );
      expect(document.querySelectorAll('.carousel-slide')).toHaveLength(11);
      expect(document.querySelectorAll('.catalog-card')).toHaveLength(0);
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
      const toolsSection = document.querySelector('#tools') as HTMLElement;
      expect(toolsSection).toBeInTheDocument();
      expect(toolsSection.querySelectorAll('.tool-card')).toHaveLength(24);
      expect(
        document.querySelector('#work')!.compareDocumentPosition(toolsSection) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      const links = screen.getAllByRole('link', {
        name: getHomeCopy(language).allProjects,
      });
      expect(links).toHaveLength(language === 'jp' ? 2 : 3);
      const bypass = within(
        document.querySelector('.project-carousel') as HTMLElement
      ).getByRole('link', {
        name: getCarouselCopy(language).viewAll,
      });
      for (const link of [...links, bypass])
        expect(link).toHaveAttribute('href', '/projects');
    }
  );

  it('redirects the previous catalog bookmark to the searchable index', () => {
    render(
      <MemoryRouter initialEntries={['/#all-projects']}>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route
            path='/projects'
            element={<PortfolioPages page='projects' />}
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('searchbox', { name: copy.search })).toBeVisible();
    expect(document.querySelectorAll('.catalog-card')).toHaveLength(11);
    expect(document.querySelector('.project-carousel')).not.toBeInTheDocument();
  });

  it('keeps the complete showcase and retry feedback when discovery fails', async () => {
    mocks.query.isError = true;
    render(
      <MemoryRouter>
        <SnackbarProvider>
          <HomePage />
        </SnackbarProvider>
      </MemoryRouter>
    );
    expect(document.querySelectorAll('.carousel-slide')).toHaveLength(11);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: copy.retry }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});

describe('complete project catalog', () => {
  it('shows all eleven projects immediately with internal pages and source links', () => {
    mocks.query.isLoading = true;
    renderWork();
    const projects = getProjectCatalog('en');
    expect(projects).toHaveLength(11);
    expect(screen.getAllByRole('article')).toHaveLength(11);
    for (const project of projects) {
      const card = document.querySelector(
        '[data-project="' + project.slug + '"]'
      )!;
      const entry = within(card as HTMLElement);
      expect(entry.getByRole('link', { name: project.title })).toHaveAttribute(
        'href',
        '/projects/' + project.slug
      );
      expect(entry.getByRole('link', { name: copy.source })).toHaveAttribute(
        'href',
        project.github
      );
    }
    expect(screen.getByText(copy.loading)).toBeVisible();
    expect(mocks.requested).toHaveBeenCalled();
  });

  it('searches repositories and technologies, combines filters and resets all entries', async () => {
    renderWork();
    const user = userEvent.setup();
    await user.type(
      screen.getByRole('searchbox', { name: copy.search }),
      'cinema'
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
    await user.selectOptions(
      screen.getByRole('combobox', { name: copy.technology }),
      'MongoDB'
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
    await user.clear(screen.getByRole('searchbox', { name: copy.search }));
    await user.type(
      screen.getByRole('searchbox', { name: copy.search }),
      'impossible-project-name'
    );
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByText(copy.noResults)).toBeVisible();
    await user.click(screen.getAllByRole('button', { name: copy.reset })[0]);
    expect(screen.getAllByRole('article')).toHaveLength(11);
    expect(screen.getByRole('combobox', { name: copy.technology })).toHaveValue(
      ''
    );
  });

  it.each([0, 1])(
    'returns keyboard focus to search after activating reset control %s',
    async (controlIndex) => {
      renderWork();
      const user = userEvent.setup();
      const search = screen.getByRole('searchbox', { name: copy.search });
      await user.type(search, 'impossible-project-name');
      await user.selectOptions(
        screen.getByRole('combobox', { name: copy.technology }),
        'MongoDB'
      );
      search.focus();
      await user.tab();
      await user.tab();
      if (controlIndex === 1) await user.tab();
      expect(
        screen.getAllByRole('button', { name: copy.reset })[controlIndex]
      ).toHaveFocus();
      await user.keyboard('[Enter]');
      expect(search).toHaveFocus();
      expect(search).toHaveValue('');
      expect(
        screen.getByRole('combobox', { name: copy.technology })
      ).toHaveValue('');
      expect(screen.getAllByRole('article')).toHaveLength(11);
    }
  );

  it('keeps the complete saved catalog visible on failure and offers a single retry', async () => {
    mocks.query.isError = true;
    const { rerender } = renderWork();
    expect(screen.getAllByRole('article')).toHaveLength(11);
    expect(screen.getByText(copy.error)).toBeVisible();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: copy.retry }));
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
    mocks.query.isFetching = true;
    rerender(
      <MemoryRouter>
        <PortfolioPages page='projects' />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: copy.loading })).toBeDisabled();
    expect(screen.getAllByRole('article')).toHaveLength(11);
  });

  it('uses the fetched public membership, including future repositories with null metadata', () => {
    mocks.query.data = [repository('future-repository')];
    mocks.query.dataUpdatedAt = Date.parse('2026-10-06T12:00:00Z');
    renderWork();
    const project = getProjectCatalog('en', mocks.query.data)[0];
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('link', { name: project.title })).toHaveAttribute(
      'href',
      '/projects/' + project.slug
    );
    expect(screen.getByText(copy.current)).toBeVisible();
  });

  it('shows an empty fetched catalog without restoring removed repositories', () => {
    mocks.query.data = [];
    renderWork();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByText(copy.noResults)).toBeVisible();
  });

  it('retains a focused project link when live repository metadata is renamed', () => {
    const original = repositorySnapshot.find(
      (entry) => entry.name === 'resume-frontend'
    )!;
    mocks.query.data = [original];
    const project = getProjectCatalog('en', mocks.query.data)[0];
    const { rerender } = renderWork();
    const link = screen.getByRole('link', { name: project.title });
    link.focus();
    mocks.query.data = [
      {
        ...original,
        name: 'renamed-portfolio',
        html_url: 'https://github.com/rotembab/renamed-portfolio',
      },
    ];
    rerender(
      <MemoryRouter>
        <PortfolioPages page='projects' />
      </MemoryRouter>
    );
    expect(link).toHaveFocus();
    expect(screen.getByRole('link', { name: project.title })).toBe(link);
    expect(screen.getByRole('link', { name: copy.source })).toHaveAttribute(
      'href',
      'https://github.com/rotembab/renamed-portfolio'
    );
  });

  it('labels technical diagrams and recovers gracefully from failed real images', () => {
    renderWork();
    const api = getProjectCatalog('en').find(
      (project) => project.slug === 'cinema-rest-api'
    )!;
    expect(
      screen.getByRole('img', {
        name: copy.technicalIllustration + ': ' + api.title,
      })
    ).toBeVisible();
    const subtitle = getProjectCatalog('en').find(
      (project) => project.slug === 'hebrew-subtitle-studio'
    )!;
    fireEvent.error(screen.getByRole('img', { name: subtitle.imageAlt! }));
    expect(
      screen.getByRole('img', {
        name: copy.technicalIllustration + ': ' + subtitle.title,
      })
    ).toBeVisible();
  });

  it.each(['he', 'jp'])(
    'localizes controls and summaries in %s',
    (language) => {
      mocks.language = language;
      renderWork();
      const localized = getCatalogCopy(language);
      expect(
        screen.getByRole('heading', { level: 1, name: localized.title })
      ).toBeVisible();
      expect(
        screen.getByRole('searchbox', { name: localized.search })
      ).toBeVisible();
      expect(screen.getAllByRole('article')).toHaveLength(11);
    }
  );
});

describe('complete project routes', () => {
  it.each(
    getProjectCatalog('en').map((project) => [
      project.slug,
      project.title,
      project.github,
    ])
  )('renders the saved %s route during loading', (slug, title, github) => {
    mocks.query.isLoading = true;
    render(detail(slug));
    expect(
      screen.getByRole('heading', { level: 1, name: title })
    ).toBeVisible();
    expect(
      screen
        .getAllByRole('link')
        .some((link) => link.getAttribute('href') === github)
    ).toBe(true);
    expect(
      screen.queryByText(getPortfolioCopy('en').notFoundTitle)
    ).not.toBeInTheDocument();
  });

  it('retains the four rich case studies and their documented limitations', () => {
    render(detail('blaster'));
    expect(
      screen.getByRole('heading', {
        name: getPortfolioCopy('en').projectProblem,
      })
    ).toBeVisible();
    expect(
      screen.getByRole('heading', {
        name: getPortfolioCopy('en').projectLimitations,
      })
    ).toBeVisible();
  });

  it.each(['blaster', 'developer-portfolio'])(
    'preserves the established %s detail route after a successful empty live feed',
    (slug) => {
      mocks.query.data = [];
      const project = getProjectCatalog('en').find(
        (entry) => entry.slug === slug
      )!;
      render(detail(slug));
      expect(
        screen.getByRole('heading', { level: 1, name: project.title })
      ).toBeVisible();
      expect(
        screen
          .getAllByRole('link')
          .some((link) => link.getAttribute('href') === project.github)
      ).toBe(true);
      expect(
        screen.queryByText(getPortfolioCopy('en').notFoundTitle)
      ).not.toBeInTheDocument();
      expect(document.querySelector('.next-project')).toHaveAttribute(
        'href',
        expect.stringMatching(/^\/projects\//)
      );
    }
  );

  it('gives learning projects concise technical details and clear status', () => {
    render(detail('maze-search'));
    expect(screen.getByRole('heading', { name: copy.overview })).toBeVisible();
    expect(screen.getByRole('heading', { name: copy.features })).toBeVisible();
    expect(screen.getByRole('heading', { name: copy.notes })).toBeVisible();
    expect(screen.getByText(copy.statuses['learning-project'])).toBeVisible();
  });

  it('waits for remote discovery before declaring a future route missing', () => {
    const future = repository('future-repository');
    const project = getProjectCatalog('en', [future])[0];
    mocks.query.isLoading = true;
    const { rerender } = render(detail(project.slug));
    expect(
      screen.queryByText(getPortfolioCopy('en').notFoundTitle)
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: copy.loading })).toBeVisible();
    mocks.query.isLoading = false;
    mocks.query.data = [future];
    rerender(detail(project.slug));
    expect(screen.getByRole('heading', { name: project.title })).toBeVisible();
    expect(screen.getByRole('heading', { name: copy.overview })).toBeVisible();
    expect(
      screen.queryByRole('heading', {
        name: getPortfolioCopy('en').projectProblem,
      })
    ).not.toBeInTheDocument();
  });

  it('offers retry for an unknown remote route when discovery fails', () => {
    mocks.query.isError = true;
    render(detail('future-repository'));
    expect(screen.getByRole('button', { name: copy.retry })).toBeVisible();
    expect(
      screen.queryByText(getPortfolioCopy('en').notFoundTitle)
    ).not.toBeInTheDocument();
  });

  it('shows the not-found page only after successful discovery settles', () => {
    mocks.query.data = [];
    render(detail('missing-repository'));
    expect(
      screen.getByRole('heading', {
        name: getPortfolioCopy('en').notFoundTitle,
      })
    ).toBeVisible();
  });
});
