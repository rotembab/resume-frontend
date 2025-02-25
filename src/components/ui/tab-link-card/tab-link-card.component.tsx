import { Card, Typography, CardContent, Box } from '@mui/material';
import { useNavigate } from 'react-router';
import { useMediaQuery } from '@mui/material';
import { customSizesMediaQuery } from '../../../themes/custom-sizes-query';

type TabLinkCardProps = {
  link: string;
  title: string;
  icon: React.ReactNode;
};

export const TabLinkCard = ({ link, title, icon }: TabLinkCardProps) => {
  const navigate = useNavigate();
  const isBelowMd = useMediaQuery(customSizesMediaQuery.md);
  return (
    <Card
      sx={{
        borderRadius: '10px',
        width: isBelowMd ? '50%' : '100%',
        margin: isBelowMd ? 'auto' : '0',
      }}
      onClick={() => navigate(link)}
    >
      <CardContent>
        <Box display={'flex'} justifyContent={'center'}>
          {icon}
        </Box>
        <Typography variant='h6'>{title}</Typography>
      </CardContent>
    </Card>
  );
};
