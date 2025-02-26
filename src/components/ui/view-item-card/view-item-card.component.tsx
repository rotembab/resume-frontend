import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { CallMadeOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useState } from 'react';
interface ViewItemCardProps {
  title: string;
  description: string;
  thumbnail: string;
  link: string;
  footer?: React.ReactNode;
}

export const ViewItemCard = ({
  title,
  description,
  thumbnail,
  link,
  footer,
}: ViewItemCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Card
      onClick={() => navigate(link)}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: isHovered ? 'hoverColor.main' : 'background.main',
        borderRadius: '16px',
        height: 'min-content',
        padding: '20px 8px',
        display: 'flex',
      }}
      title={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardMedia
        component={'img'}
        image={thumbnail}
        sx={{
          borderRadius: '16px',
          width: '135px',
          height: '135px',
          padding: '4px',
        }}
      />
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
      {footer && footer}
    </Card>
  );
};
