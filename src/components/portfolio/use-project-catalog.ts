import { useMemo } from 'react';
import { getProjectCatalog } from '../../data/project-catalog';
import { getCatalogCopy } from '../../data/catalog-copy';
import { repositorySnapshotCapturedAt } from '../../data/repository-snapshot';
import { useGithubReposFetchAPI } from '../../hooks/github-fetchAPI.hook';
import { usePortfolio } from './use-portfolio';

/** One query key supplies the home catalog, work index and detail routes. */
export const useProjectCatalog = () => {
  const { i18n } = usePortfolio();
  const query = useGithubReposFetchAPI();
  const projects = useMemo(
    () => getProjectCatalog(i18n.language, query.data),
    [i18n.language, query.data]
  );
  return {
    projects,
    copy: getCatalogCopy(i18n.language),
    language: i18n.language,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSnapshot: query.data === undefined,
    refreshedAt:
      query.dataUpdatedAt || new Date(repositorySnapshotCapturedAt).getTime(),
    refetch: query.refetch,
  };
};
