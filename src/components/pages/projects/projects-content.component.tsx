import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import Grid from '@mui/material/Grid2';
import { Stack, Typography } from '@mui/material';

import { ViewItemCard } from '../../ui/view-item-card/view-item-card.component';
import { useGithubReposFetchAPI } from '../../../hooks/github-fetchAPI.hook';
import { GITHUB_USERNAME } from '../../../config/env';
import { useEffect, useState } from 'react';

type ProjectsContentProps = {
  limit?: number;
};

export const ProjectsContent = ({ limit }: ProjectsContentProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const getGithubReposQuery = useGithubReposFetchAPI();

  const [validThumbnails, setValidThumbnails] = useState<
    Record<number, string | undefined>
  >({});

  useEffect(() => {
    if (!getGithubReposQuery.data) return;

    const controller = new AbortController();
    const { signal } = controller;

    const validateImages = async () => {
      const checks = await Promise.all(
        getGithubReposQuery.data.map(async (project) => {
          const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${project.name}/main/preview.webp`;
          try {
            const response = await fetch(url, { method: 'HEAD', signal });
            return { [project.id]: response.ok ? url : undefined };
          } catch {
            return { [project.id]: undefined };
          }
        })
      );
      if (signal.aborted) return;
      setValidThumbnails(Object.assign({}, ...checks));
    };

    validateImages();

    return () => controller.abort();
  }, [getGithubReposQuery.data]);

  return (
    <SlideFadeTransition transitionKey={location.pathname}>
      <Grid container rowSpacing={6}>
        <Grid size={12}>
          <Typography variant='h1'>{t('Projects.heading1')}</Typography>
          <Typography color='headingDarkColor' variant='h1'>
            {t('Projects.heading2')}
          </Typography>
        </Grid>

        <Grid size={12}>
          <Stack>
            {getGithubReposQuery.data
              ?.slice(0, limit)
              .map((project) => (
                <ViewItemCard
                  key={project.id}
                  title={project.name}
                  description={project.description}
                  link={project.html_url}
                  thumbnail={validThumbnails[project.id]}
                  isExternal={true}
                />
              ))}
          </Stack>
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
