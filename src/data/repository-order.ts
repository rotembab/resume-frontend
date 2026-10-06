import type { IGithubRepo } from '../interfaces/github/github-fetch-repos-query';

const creationTime = (repository: IGithubRepo) => {
  const timestamp = Date.parse(repository.created_at);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

/** Chronological project order, independent of commits and repository edits. */
export const newestRepositoryFirst = (a: IGithubRepo, b: IGithubRepo) =>
  creationTime(b) - creationTime(a) ||
  a.name.localeCompare(b.name) ||
  a.id - b.id;
