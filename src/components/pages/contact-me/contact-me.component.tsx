import Grid from '@mui/material/Grid2';
import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { Typography } from '@mui/material';

import { useTranslation } from 'react-i18next';
import { ContactForm } from './contact-form.component';

export const ContactMe = () => {
  const { t } = useTranslation();
  return (
    <SlideFadeTransition
      fadeAppear
      fadeIn
      slideAppear
      slideIn
      slideKey={'slide'}
      fadeKey={'fade'}
      slideTimeout={{ enter: 700 }}
      fadeStyle={{
        transitionDuration: '1.5s',
      }}
    >
      <Grid container>
        <Grid size={12}>
          <Typography variant='h1'>{t('Contact.heading1')}</Typography>
          <Typography color='headingDarkColor' variant='h1'>
            {t('Contact.heading2')}
          </Typography>
        </Grid>
        <Grid size={12}>
          <ContactForm />
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
