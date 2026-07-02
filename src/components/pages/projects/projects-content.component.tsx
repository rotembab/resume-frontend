import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import Grid from '@mui/material/Grid2';
import { Alert, Skeleton, Stack, Typography } from '@mui/material';

import { ViewItemCard } from '../../ui/view-item-card/view-item-card.component';
import { useGithubReposFetchAPI } from '../../../hooks/github-fetchAPI.hook';
import { GITHUB_USERNAME } from '../../../config/env';

type ProjectsContentProps = {
  limit?: number;
  variant?: 'preview' | 'full';
};

const buildPreviewUrl = (repoName: string) =>
  `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/main/preview.webp`;

export const ProjectsContent = ({
  limit,
  variant = 'full',
}: ProjectsContentProps) => {
  const isPreview = variant === 'preview';
  const { t } = useTranslation();
  const location = useLocation();
  const getGithubReposQuery = useGithubReposFetchAPI();

  const skeletonCount = limit ?? 6;
  const projects = getGithubReposQuery.data?.slice(0, limit) ?? [];

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
          {getGithubReposQuery.isError ? (
            <Alert severity='warning' variant='outlined'>
              {t('Projects.loadError', {
                defaultValue: 'Failed to load projects from GitHub.',
              })}
            </Alert>
          ) : getGithubReposQuery.isLoading ? (
            <Stack spacing={2}>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant='rounded'
                  height={160}
                  sx={{ borderRadius: '16px' }}
                />
              ))}
            </Stack>
          ) : (
            <Stack>
              {projects.map((project) => (
                <ViewItemCard
                  key={project.id}
                  title={project.name}
                  description={project.description}
                  link={isPreview ? '/projects' : project.html_url}
                  thumbnail={buildPreviewUrl(project.name)}
                  isExternal={!isPreview}
                />
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
