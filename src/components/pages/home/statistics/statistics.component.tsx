import { SingleStatistic } from '../../../ui/single-statistic/single-statistic.component';
import Grid from '@mui/material/Grid2';

export const Statistics = () => {
  return (
    <Grid sx={{ textAlign: 'center' }} container>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4,
        }}
      >
        <SingleStatistic
          description={'Years of experience in Full stack development'}
          number={2}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4,
        }}
      >
        <SingleStatistic
          description={'Years of experience in  game development'}
          number={1.5}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4,
        }}
      >
        <SingleStatistic description={'Git repositories'} number={14} />
      </Grid>
    </Grid>
  );
};
