import { Box, Typography } from '@mui/material';
import { translations } from '../../../lang/en';
import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';

export const HomePage = () => {
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
        <Typography variant='h1'>{translations.Home.heading1}</Typography>
        <Typography color='headingDarkColor' variant='h1'>
          {translations.Home.heading2}
        </Typography>
        <Typography
          display={'block'}
          sx={{ width: '85%', wordBreak: 'break-word' }}
          color='paragraphColor'
          variant='caption'
        >
          {translations.Home.description}
        </Typography>
      </Box>
    </SlideFadeTransition>
  );
};
