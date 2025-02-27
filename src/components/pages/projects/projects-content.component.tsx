import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid2';
import { Stack, Typography } from '@mui/material';

import { ViewItemCard } from '../../ui/view-item-card/view-item-card.component';
import { useGithubReposFetchAPI } from '../../../hooks/github-fetchAPI.hook';
import { useEffect, useState } from 'react';

interface ThumbnailMap {
  [key: number]: string | undefined;
}

type ProjectsContentProps = {
  limit?: number;
};

export const ProjectsContent = ({ limit }: ProjectsContentProps) => {
  const { t } = useTranslation();
  const getGithubReposQuery = useGithubReposFetchAPI();

  const checkImageExists = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const [validThumbnails, setValidThumbnails] = useState<
    Record<number, string | undefined>
  >({});

  useEffect(() => {
    const validateImages = async () => {
      const checks = await Promise.all(
        getGithubReposQuery.data?.map(async (project) => {
          const url = `https://raw.githubusercontent.com/rotembab/${project.name}/main/preview.webp`;
          const exists = await checkImageExists(url);
          return { [project.id]: exists ? url : undefined };
        }) ?? []
      );
      setValidThumbnails(Object.assign({}, ...checks));
    };

    if (getGithubReposQuery.data) {
      validateImages();
    }
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
            {getGithubReposQuery.data?.slice(0, limit).map((project) => (
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
