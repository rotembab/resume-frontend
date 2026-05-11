import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import Grid from '@mui/material/Grid2';
import { Stack, Typography } from '@mui/material';

import { ViewItemCard } from '../../ui/view-item-card/view-item-card.component';
import { useGithubReposFetchAPI } from '../../../hooks/github-fetchAPI.hook';
import { GITHUB_USERNAME } from '../../../config/env';

type ProjectsContentProps = {
  limit?: number;
};

const buildPreviewUrl = (repoName: string) =>
  `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/main/preview.webp`;

export const ProjectsContent = ({ limit }: ProjectsContentProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const getGithubReposQuery = useGithubReposFetchAPI();

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
                  thumbnail={buildPreviewUrl(project.name)}
                  isExternal={true}
                />
              ))}
          </Stack>
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
