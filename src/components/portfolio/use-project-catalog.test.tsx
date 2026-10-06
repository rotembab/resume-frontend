import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGithubRepo } from '../../interfaces/github/github-fetch-repos-query';
import { useProjectCatalog } from './use-project-catalog';

const fetchRepos = vi.hoisted(() => vi.fn());
vi.mock('../../services/github-repo-fetch', () => ({
  fetchGithubRepos: fetchRepos,
}));
vi.mock('./use-portfolio', () => ({
  usePortfolio: () => ({ i18n: { language: 'en' } }),
}));

const Consumer = ({ label }: { label: string }) => {
  const catalog = useProjectCatalog();
  return (
    <div aria-label={label}>
      <p>{catalog.projects.length} repositories</p>
      <span>
        {catalog.isError ? 'error' : catalog.isSnapshot ? 'saved' : 'live'}
      </span>
      {catalog.projects.map((project) => (
        <span key={project.slug}>{project.title}</span>
      ))}
    </div>
  );
};

const clients: QueryClient[] = [];
const renderConsumers = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <Consumer label='home catalog' />
      <Consumer label='detail catalog' />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  fetchRepos.mockReset();
});
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
});

describe('shared project catalog query', () => {
  it('shares one request across consumers and displays the full snapshot while pending', async () => {
    let resolve!: (repositories: IGithubRepo[]) => void;
    fetchRepos.mockImplementation(
      () =>
        new Promise<IGithubRepo[]>((done) => {
          resolve = done;
        })
    );
    renderConsumers();
    expect(screen.getAllByText('11 repositories')).toHaveLength(2);
    expect(screen.getAllByText('saved')).toHaveLength(2);
    expect(fetchRepos).toHaveBeenCalledTimes(1);
    resolve([
      {
        id: 999,
        name: 'new-public-repository',
        html_url: 'https://github.com/rotembab/new-public-repository',
        description: null,
        created_at: '2026-10-06T00:00:00Z',
        updated_at: '2026-10-06T00:00:00Z',
        pushed_at: '2026-10-06T00:00:00Z',
      },
    ]);
    await waitFor(() =>
      expect(screen.getAllByText('1 repositories')).toHaveLength(2)
    );
    expect(screen.getAllByText('new-public-repository')).toHaveLength(2);
    expect(screen.getAllByText('live')).toHaveLength(2);
    expect(fetchRepos).toHaveBeenCalledTimes(1);
  });

  it('retains the snapshot in every consumer when the full fetch fails', async () => {
    fetchRepos.mockRejectedValue(new Error('Later GitHub page failed'));
    renderConsumers();
    await waitFor(() => expect(screen.getAllByText('error')).toHaveLength(2));
    expect(screen.getAllByText('11 repositories')).toHaveLength(2);
  });
});
