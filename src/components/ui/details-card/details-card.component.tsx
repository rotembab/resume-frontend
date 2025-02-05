import { Box, Button, Card, Typography } from '@mui/material';
import { useLocation } from 'react-router';
import { SlideFadeTransition } from '../slide-fade-transition/slide-fade-transition-component';
import { translations } from '../../../lang/en';
import { detailsCardLinks } from './details-card-links.config';

export const DetailsCard = () => {
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
        <img
          style={{ borderRadius: '1rem' }}
          width={200}
          height={300}
          src='https://placehold.co/400x600'
          alt='placeholder'
        />
        <Typography variant='h3'>{translations.Card.name}</Typography>
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
          {translations.Card.description}
        </Typography>
        <Box>
          {detailsCardLinks.map((item, index) => (
            <Button key={item.link} href={item.link} target='_blank'>
              {item.icon}
            </Button>
          ))}
        </Box>
      </Card>
    </SlideFadeTransition>
  );
};
