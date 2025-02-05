import { Box, Typography } from '@mui/material';

type SingleStatisticProps = {
  number: number;
  description: string;
};

export const SingleStatistic = ({
  number,
  description,
}: SingleStatisticProps) => {
  return (
    <Box
      sx={{
        '@media (max-width: 900px)': {
          margin: 'auto',
        },
      }}
      width={'200px'}
    >
      <Typography variant='h2'>+{number}</Typography>
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
