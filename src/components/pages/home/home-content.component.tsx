import { Box, Typography } from '@mui/material';
import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { useTranslation } from 'react-i18next';

export const HomeContent = () => {
  const { t } = useTranslation();
  return (
    <SlideFadeTransition
      fadeAppear
      fadeIn
      slideAppear
      slideIn
      slideKey={location.pathname + '_slide'}
      fadeKey={location.pathname + '_fade'}
      slideTimeout={{ enter: 500 }}
      fadeStyle={{
        transitionDuration: '1s',
      }}
    >
      <Box>
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
      </Box>
    </SlideFadeTransition>
  );
};
