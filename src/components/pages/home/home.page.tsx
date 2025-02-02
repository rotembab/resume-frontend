import { Slide } from '@mui/material';

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
        <h1>Home Page</h1>
      </div>
    </Slide>
  );
};
