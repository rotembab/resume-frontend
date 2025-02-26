import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { CallMadeOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router';
interface ViewItemCardProps {
  title: string;
  description: string;
  thumbnail: string;
  link: string;
}

export const ViewItemCard = ({
  title,
  description,
  thumbnail,
  link,
}: ViewItemCardProps) => {
  const navigate = useNavigate();
  return (
    <Card sx={{ position: 'relative' }} title={title}>
      <CardMedia image={thumbnail} />
      <CardContent>
        <Typography variant='h6'>{title}</Typography>
        <Typography variant='body1'>{description}</Typography>
      </CardContent>
      <Button
        onClick={() => navigate(link)}
        sx={{
          position: 'absolute',
          top: '10px',
          right: '10px',
        }}
      >
        <CallMadeOutlined />
      </Button>
    </Card>
  );
};
