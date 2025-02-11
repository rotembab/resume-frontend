import { Box, Typography } from '@mui/material';
import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid2';
import { Statistics } from './statistics/statistics.component';

export const HomeContent = () => {
  const { t } = useTranslation();
  return (
    <SlideFadeTransition key={location.pathname}>
      <Grid container rowSpacing={5}>
        <Grid size={12}>
          <Typography variant='h1'>{t('Home.heading1')}</Typography>
          <Typography color='headingDarkColor' variant='h1'>
            {t('Home.heading2')}
          </Typography>
          <Typography
            display={'block'}
            sx={{ width: '85%', wordBreak: 'break-word' }}
            color='paragraphColor'
            variant='caption'
          >
            {t('Home.description')}
          </Typography>
        </Grid>
        <Grid size={12}>
          <Statistics />
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
