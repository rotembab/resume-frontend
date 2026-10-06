import axios from 'axios';
import { IGithubRepo } from '../interfaces/github/github-fetch-repos-query';
import { GITHUB_USERNAME } from '../config/env';
import { newestRepositoryFirst } from '../data/repository-order';

export const fetchGithubRepos = async (): Promise<IGithubRepo[]> => {
  const apiUrl = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
  const repositories = new Map<number, IGithubRepo>();
  let page = 1;

  while (true) {
    // Return only after every page succeeds, so a partial catalog never replaces
    // the last complete query result or the checked-in offline snapshot.
    const response = await axios.get<IGithubRepo[]>(apiUrl, {
      params: {
        type: 'owner',
        per_page: 100,
        sort: 'created',
        direction: 'desc',
        page,
      },
    });
    if (!Array.isArray(response.data)) {
      throw new Error('GitHub returned an invalid repository page.');
    }

    const previousSize = repositories.size;
    for (const repository of response.data) {
      if (!repositories.has(repository.id)) {
        repositories.set(repository.id, repository);
      }
    }

    const link = String(response.headers?.link ?? '');
    const hasNextPage = /<[^>]+>;\s*rel="next"/.test(link);
    if (!hasNextPage && response.data.length < 100) break;
    if (repositories.size === previousSize) {
      throw new Error('GitHub returned a repeated repository page.');
    }
    page += 1;
  }

  return [...repositories.values()].sort(newestRepositoryFirst);
};
