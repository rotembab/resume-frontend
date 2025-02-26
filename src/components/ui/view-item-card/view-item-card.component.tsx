import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { CallMadeOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { customColors } from '../../../themes/custom-colors';
import {
  customSizes,
  customSizesMediaQuery,
} from '../../../themes/custom-sizes-query';
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

  const isBelowSm = useMediaQuery(customSizesMediaQuery.sm);
  return (
    <Card
      onClick={() => navigate(link)}
      elevation={0}
      sx={{
        transition: 'background-color 0.7s',
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: isHovered
          ? customColors.hoverColor.main
          : 'transparent',
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

          padding: '4px',
          height: isBelowSm ? '90px' : '135px',
          width: isBelowSm ? '90px' : '135px',
        }}
      />
      <CardContent>
        <Typography variant='h6'>{title}</Typography>
        <Typography variant='body1'>{description}</Typography>
      </CardContent>

      {!isBelowSm && (
        <CallMadeOutlined
          color='primary'
          sx={{
            position: 'absolute',
            top: isHovered ? '10px' : '20px',
            right: isHovered ? '10px' : '20px',
            transition: 'top 0.3s ease-in-out, right 0.3s ease-in-out',
          }}
        />
      )}

      {footer && footer}
    </Card>
  );
};
