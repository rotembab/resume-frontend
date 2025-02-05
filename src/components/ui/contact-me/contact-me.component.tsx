import Grid from '@mui/material/Grid2';
import { SlideFadeTransition } from '../slide-fade-transition/slide-fade-transition-component';
import { Typography } from '@mui/material';
import { useInView } from 'react-intersection-observer';

export const ContactMe = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Ensures the component only loads once when in view
    threshold: 1, // Adjust based on when you consider the component "visible"
  });

  return (
    <div ref={ref}>
      {inView && (
        <SlideFadeTransition
          fadeAppear
          fadeIn
          slideAppear
          slideIn
          slideKey={'slide'}
          fadeKey={'fade'}
          slideTimeout={{ enter: 500 }}
          fadeStyle={{
            transitionDuration: '1s',
          }}
        >
          <Grid container>
            <Typography variant='h1'>Contact me</Typography>
            <Typography variant='h2'>Email: </Typography>
            <Typography variant='h3'> </Typography>
          </Grid>
        </SlideFadeTransition>
      )}
    </div>
  );
};
