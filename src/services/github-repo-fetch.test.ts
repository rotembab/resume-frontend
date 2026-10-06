import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGithubRepo } from '../interfaces/github/github-fetch-repos-query';
import { fetchGithubRepos } from './github-repo-fetch';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));

function repository(id: number, updated = '2026-10-01T00:00:00Z'): IGithubRepo {
  return {
    id,
    name: `project-${id}`,
    description: null,
    html_url: `https://github.com/rotembab/project-${id}`,
    created_at: updated,
    updated_at: updated,
    pushed_at: updated,
  };
}

const get = vi.mocked(axios.get);
const nextLink =
  '<https://api.github.com/users/rotembab/repos?page=2>; rel="next"';

beforeEach(() => get.mockReset());

describe('complete public GitHub repository fetching', () => {
  it('follows pagination, deduplicates IDs, and returns a sorted complete feed', async () => {
    const first = repository(1);
    const newest = repository(3, '2026-10-06T00:00:00Z');
    get
      .mockResolvedValueOnce({
        data: [first, repository(2)],
        headers: { link: nextLink },
      })
      .mockResolvedValueOnce({ data: [first, newest], headers: {} });

    const result = await fetchGithubRepos();
    expect(result.map((entry) => entry.id)).toEqual([3, 1, 2]);
    expect(get).toHaveBeenCalledTimes(2);
    for (const [index, call] of get.mock.calls.entries()) {
      expect(call[0]).toMatch(/\/users\/[^/]+\/repos$/);
      expect(call[1]?.params).toEqual({
        type: 'owner',
        per_page: 100,
        sort: 'created',
        direction: 'desc',
        page: index + 1,
      });
    }
  });

  it('keeps an older project below newer projects after recent updates', async () => {
    const old = {
      ...repository(1, '2024-01-01T00:00:00Z'),
      updated_at: '2026-10-06T00:00:00Z',
    };
    const recent = repository(2, '2026-01-01T00:00:00Z');
    get.mockResolvedValueOnce({ data: [old, recent], headers: {} });
    expect((await fetchGithubRepos()).map((entry) => entry.id)).toEqual([2, 1]);
  });

  it('does not stop at the API default page size or a full hundred-item page', async () => {
    get
      .mockResolvedValueOnce({
        data: Array.from({ length: 100 }, (_, index) => repository(index + 1)),
        headers: {},
      })
      .mockResolvedValueOnce({ data: [repository(101)], headers: {} });
    expect(await fetchGithubRepos()).toHaveLength(101);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('rejects a later-page failure instead of returning a partial catalog', async () => {
    get
      .mockResolvedValueOnce({
        data: [repository(1)],
        headers: { link: nextLink },
      })
      .mockRejectedValueOnce(new Error('GitHub rate limit'));
    await expect(fetchGithubRepos()).rejects.toThrow('GitHub rate limit');
  });

  it('rejects malformed responses and repeated pages instead of silently truncating', async () => {
    get.mockResolvedValueOnce({ data: { message: 'Unexpected response' } });
    await expect(fetchGithubRepos()).rejects.toThrow('invalid repository page');

    get.mockResolvedValue({
      data: [repository(1)],
      headers: { link: nextLink },
    });
    await expect(fetchGithubRepos()).rejects.toThrow(
      'repeated repository page'
    );
  });

  it('accepts a complete empty account response', async () => {
    get.mockResolvedValueOnce({ data: [], headers: {} });
    await expect(fetchGithubRepos()).resolves.toEqual([]);
  });
});
