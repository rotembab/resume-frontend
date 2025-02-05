import { Box } from '@mui/material';
import { SingleStatistic } from '../../../ui/single-statistic/single-statistic.component';

export const Statistics = () => {
  return (
    <Box display={'flex'} gap={10}>
      <SingleStatistic />
      <SingleStatistic />
      <SingleStatistic />
      <SingleStatistic />
    </Box>
  );
};
