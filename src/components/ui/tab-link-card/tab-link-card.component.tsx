import { Card, Typography, CardContent, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useMediaQuery } from '@mui/material';

type TabLinkCardProps = {
  link: string;
  title: string;
  icon: React.ReactNode;
};

export const TabLinkCard = ({ link, title, icon }: TabLinkCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');
  return (
    <Card
      sx={{
        borderRadius: '10px',
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
