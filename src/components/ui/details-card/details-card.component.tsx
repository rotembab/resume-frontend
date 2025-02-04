import { Card } from '@mui/material';
import { useLocation } from 'react-router';
import { SlideFadeTransition } from '../slide-fade-transition/slide-fade-transition-component';
import { Image } from '@mui/icons-material';

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
          height: 100,
        }}
      >
        <Image />
      </Card>
    </SlideFadeTransition>
  );
};
