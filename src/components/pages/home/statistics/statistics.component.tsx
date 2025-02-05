import { Box } from '@mui/material';
import { SingleStatistic } from '../../../ui/single-statistic/single-statistic.component';

export const Statistics = () => {
  return (
    <Box display={'flex'} gap={10}>
      <SingleStatistic value={12} />
      <SingleStatistic value={24} />
      <SingleStatistic value={23} />
      <SingleStatistic value={100} />
    </Box>
  );
};
