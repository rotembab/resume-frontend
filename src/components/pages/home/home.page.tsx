import { Slide, Typography } from '@mui/material';
import { translations } from '../../../lang/en';

export const HomePage = () => {
  return (
    <Slide
      timeout={{ enter: 500 }}
      key={location.pathname}
      in
      appear
      direction='down'
    >
      <div>
        <Typography variant='h1'>{translations.Home.heading1}</Typography>
        <Typography color='headingDarkColor' variant='h1'>
          {translations.Home.heading2}
        </Typography>
      </div>
    </Slide>
  );
};
