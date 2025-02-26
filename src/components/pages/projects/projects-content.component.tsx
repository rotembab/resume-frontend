import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid2';
import { Stack, Typography } from '@mui/material';
import { projectsConfig } from './projects-config';
import { ViewItemCard } from '../../ui/view-item-card/view-item-card.component';

type ProjectsContentProps = {
  limit?: number;
};

export const ProjectsContent = ({ limit }: ProjectsContentProps) => {
  const { t } = useTranslation();
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
          <Stack spacing={5}>
            {projectsConfig.slice(0, limit).map((project) => (
              <ViewItemCard
                key={project.title}
                title={project.title}
                description={project.description}
                thumbnail={project.thumbnail}
                link={project.link}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
