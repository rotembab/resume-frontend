import axios from 'axios';
import { IGithubRepo } from '../interfaces/github/github-fetch-repos-query';
import { GITHUB_USERNAME } from '../config/env';

export const fetchGithubRepos = async () => {
  const apiUrl = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
  const response = await axios.get(apiUrl);

  return response.data.sort((a: IGithubRepo, b: IGithubRepo) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
};
