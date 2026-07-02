import { Box, Button, Card, CardMedia, Typography } from '@mui/material';
import { useLocation } from 'react-router';
import { SlideFadeTransition } from '../slide-fade-transition/slide-fade-transition-component';
import Grid from '@mui/material/Grid2';
import { buildDetailsCardLinks } from './details-card-links.config';
import { useResume } from '../../../data/use-resume';
import { customSizesMediaQuery } from '../../../themes/custom-sizes-query';
import useMediaQuery from '@mui/material/useMediaQuery';

export const DetailsCard = () => {
  const location = useLocation();
  const isBelowMd = useMediaQuery(customSizesMediaQuery.md);
  const resume = useResume();
  const links = buildDetailsCardLinks(resume.profile.social);
  return (
    <Box sx={{ position: isBelowMd ? 'relative' : 'sticky', top: '50px' }}>
      <SlideFadeTransition transitionKey={location.pathname}>
        <Card
          sx={{
            backgroundColor: 'secondary.main',
            color: 'secondary.contrastText',
            width: isBelowMd ? '80%' : '100%',
            marginX: isBelowMd ? 'auto ' : '0',
            borderRadius: '1rem',
            textAlign: 'center',
            padding: '1rem',
          }}
        >
          <Grid container rowSpacing={2}>
            <Grid size={12}>
              <CardMedia
                component='img'
                image={'/images/profilePic.png'}
                style={{ borderRadius: '1rem' }}
                alt={resume.profile.name}
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
              <Typography variant='h3'>{resume.profile.name}</Typography>
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
                {resume.profile.description}
              </Typography>
            </Grid>
            <Grid size={12}>
              <Grid container>
                {links.map((item) => (
                  <Grid key={item.link + '_grid'} size={4}>
                    <Button
                      key={item.link}
                      href={item.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={item.label}
                    >
                      {item.icon}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </SlideFadeTransition>
    </Box>
  );
};
