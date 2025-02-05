import { Box, Button, Card, Typography } from '@mui/material';
import { useLocation } from 'react-router';
import { SlideFadeTransition } from '../slide-fade-transition/slide-fade-transition-component';
import Grid from '@mui/material/Grid2';
import { detailsCardLinks } from './details-card-links.config';
import { useTranslation } from 'react-i18next';

export const DetailsCard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  return (
    <SlideFadeTransition
      fadeAppear
      fadeIn
      slideAppear
      slideIn
      slideKey={location.pathname + '_slide'}
      fadeKey={location.pathname + '_fade'}
      slideTimeout={{ enter: 400 }}
      fadeStyle={{
        transitionDuration: '1s',
      }}
    >
      <Card
        sx={{
          backgroundColor: 'secondary.main',
          color: 'secondary.contrastText',
          width: '100%',
          borderRadius: '1rem',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <Grid container rowSpacing={2}>
          <Grid size={12}>
            <img
              style={{ borderRadius: '1rem' }}
              width={200}
              height={300}
              src='https://placehold.co/400x600'
              alt='placeholder'
            />
          </Grid>
          <Grid size={12}>
            <Typography variant='h3'>{t('Card.name')}</Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              color='descriptionColor'
              variant='caption'
              sx={{
                fontWeight: 500,
                fontSize: {
                  xs: '18px',
                },
              }}
            >
              {t('Card.description')}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Box>
              {detailsCardLinks.map((item, index) => (
                <Button key={item.link} href={item.link} target='_blank'>
                  {item.icon}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Card>
    </SlideFadeTransition>
  );
};
