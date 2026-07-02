import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { ExperienceItemCard } from '../../ui/experience-item-card/experience-item-card.component';
import { useResume } from '../../../data/use-resume';
import { STAT_ANCHORS, yearsSince } from '../../../config/stats';
import { splitExperience } from './experience-sections';

type ExperienceContentProps = {
  limit?: number;
  variant?: 'preview' | 'full';
};

export const ExperienceContent = ({
  limit,
  variant = 'full',
}: ExperienceContentProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const resume = useResume();
  const fullStackYears = yearsSince(STAT_ANCHORS.fullStackStart);
  const { jobs, education } = splitExperience(resume.experience);
  const isPreview = variant === 'preview';
  return (
    <SlideFadeTransition transitionKey={location.pathname}>
      <Grid container>
        <Grid size={12}>
          <Typography variant='h1'>
            {t('Experience.heading1', { years: fullStackYears })}
          </Typography>
          <Typography color='headingDarkColor' variant='h1'>
            {t('Experience.heading2')}
          </Typography>
        </Grid>

        <Grid size={12}>
          <Stack>
            {jobs.slice(0, limit).map((entry) => (
              <ExperienceItemCard
                key={entry.id}
                title={`${entry.role} - ${entry.organization}`}
                subtitle={entry.period.durationLabel}
                description={entry.summary}
                bullets={isPreview ? undefined : entry.highlights}
              />
            ))}
          </Stack>
        </Grid>

        {!isPreview && (
          <>
            <Grid size={12}>
              <Typography variant='h1' sx={{ marginTop: '48px' }}>
                {t('Experience.educationHeading')}
              </Typography>
            </Grid>
            <Grid size={12}>
              <Stack>
                {education.map((entry) => (
                  <ExperienceItemCard
                    key={entry.id}
                    title={`${entry.role} - ${entry.organization}`}
                    subtitle={entry.period.durationLabel}
                    description={entry.summary}
                    bullets={entry.highlights}
                  />
                ))}
              </Stack>
            </Grid>
          </>
        )}
      </Grid>
    </SlideFadeTransition>
  );
};
