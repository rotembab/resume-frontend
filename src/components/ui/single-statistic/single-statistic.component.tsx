import { Box, Skeleton, Typography } from '@mui/material';

type SingleStatisticProps = {
  number: number;
  description: string;
  loading?: boolean;
};

export const SingleStatistic = ({
  number,
  description,
  loading = false,
}: SingleStatisticProps) => {
  return (
    <Box
      sx={{
        '@media (max-width: 1200px)': {
          margin: 'auto',
          textAlign: 'center',
        },
      }}
    >
      <Typography variant='h2'>
        {loading ? (
          <Skeleton
            variant='text'
            width='3.5ch'
            sx={{ display: 'inline-block' }}
          />
        ) : (
          `+${number}`
        )}
      </Typography>
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
        {description}
      </Typography>
    </Box>
  );
};
