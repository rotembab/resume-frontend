import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';
import { experienceConfig } from './experience-config';
import { ViewItemCard } from '../../ui/view-item-card/view-item-card.component';

type ExperienceContentProps = {
  limit?: number;
};

export const ExperienceContent = ({ limit }: ExperienceContentProps) => {
  const { t } = useTranslation();
  return (
    <SlideFadeTransition transitionKey={location.pathname}>
      <Grid container>
        <Grid size={12}>
          <Typography variant='h1'>{t('Experience.heading1')}</Typography>
          <Typography color='headingDarkColor' variant='h1'>
            {t('Experience.heading2')}
          </Typography>
        </Grid>

        <Grid size={12}>
          <Stack>
            {experienceConfig.slice(0, limit).map((experience) => (
              <ViewItemCard
                key={experience.title}
                title={experience.title}
                description={experience.description}
                link={experience.link}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
