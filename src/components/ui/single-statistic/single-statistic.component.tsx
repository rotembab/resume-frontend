import { Box, Typography } from '@mui/material';

type SingleStatisticProps = {
  value: number;
};

export const SingleStatistic = ({ value }: SingleStatisticProps) => {
  return (
    <Box>
      <Typography variant='h2'>+{value}</Typography>
      <Typography
        color='paragraphColor'
        textTransform={'uppercase'}
        fontWeight={400}
        fontSize={{
          xs: '16px',
          sm: '16px',
          md: '16px',
          lg: '16px',
          xl: '16px',
        }}
        variant='caption'
      >
        Years Of Experience
      </Typography>
    </Box>
  );
};
