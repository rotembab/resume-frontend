import { useQuery } from '@tanstack/react-query';
import { fetchGithubRepos } from '../services/github-repo-fetch';
import { IGithubRepo } from '../interfaces/github/github-fetch-repos-query';

export const useGithubReposFetchAPI = () => {
  return useQuery<IGithubRepo[]>({
    queryKey: ['github-repos'],
    queryFn: fetchGithubRepos,
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60 * 60 * 24,
  });
};
