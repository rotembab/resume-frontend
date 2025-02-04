import { Card, Slide } from '@mui/material';
import { useLocation } from 'react-router';
import { SlideFadeTransition } from '../slide-fade-transition/slide-fade-transition-component';

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
          height: 100,
        }}
      >
        card
      </Card>
    </SlideFadeTransition>
  );
};
