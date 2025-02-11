import { Button, Card, CardMedia, Typography } from '@mui/material';
import { useLocation } from 'react-router';
import { SlideFadeTransition } from '../slide-fade-transition/slide-fade-transition-component';
import Grid from '@mui/material/Grid2';
import { detailsCardLinks } from './details-card-links.config';
import { useTranslation } from 'react-i18next';
import TempProfilePic from '../../../assets/TempProfilePic.jpeg';

export const DetailsCard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  return (
    <SlideFadeTransition key={location.pathname}>
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
            <CardMedia
              component='img'
              image={TempProfilePic}
              style={{ borderRadius: '1rem' }}
              alt='Profile'
              width={'200px'}
              height={'300px'}
              sx={{
                maxHeight: '300px',
                maxWidth: '200px',
                margin: 'auto',
              }}
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
            <Grid container>
              {detailsCardLinks.map((item, index) => (
                <Grid size={4}>
                  <Button key={item.link} href={item.link} target='_blank'>
                    {item.icon}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </SlideFadeTransition>
  );
};
