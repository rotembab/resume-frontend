import { Card, Fade, Slide } from '@mui/material';
import { useLocation } from 'react-router';

export const DetailsCard = () => {
  const location = useLocation();
  return (
    <Slide
      timeout={{ enter: 400 }}
      key={location.pathname}
      in
      appear
      direction='down'
    >
      <Fade
        style={{
          transitionDuration: '1s',
        }}
        key={location.pathname + 'fade'}
        in
        appear
      >
        <Card
          sx={{
            height: 100,
          }}
        >
          card
        </Card>
      </Fade>
    </Slide>
  );
};
