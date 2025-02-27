import { CallMadeOutlined } from '@mui/icons-material';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  SxProps,
} from '@mui/material';
import { useState } from 'react';
import { customColors } from '../../../themes/custom-colors';

type BaseViewCardProps = {
  title: string;
  description: string;
  thumbnail?: string;
  onClick: () => void;
  height: string;
  width: string;
  imgHeight: string;
  imgWidth: string;
  isShowArrow: boolean;
  footer: React.ReactNode;
  imgBackground?: string;
  cardContentStyle?: SxProps;
  cardPadding?: string;
  objectFitOverride?: 'contain' | 'cover' | 'fill' | 'none';
};
export const BaseViewCard = ({
  title,
  description,
  thumbnail,
  onClick,
  height = 'min-content',
  width = 'min-content',
  imgHeight,
  imgWidth,
  isShowArrow = true,
  footer,
  imgBackground,
  cardContentStyle,
  cardPadding = '20px 8px',
  objectFitOverride = 'contain',
}: BaseViewCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Card
      onClick={onClick}
      elevation={0}
      sx={{
        transition: 'background-color 0.7s',
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: isHovered
          ? customColors.hoverColor.main
          : 'transparent',
        borderRadius: '16px',
        height: height,
        width: width,
        padding: cardPadding,
        display: 'flex',
      }}
      title={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {thumbnail && (
        <CardMedia
          component='img'
          image={thumbnail}
          sx={{
            padding: '4px',
            height: imgHeight,
            width: imgWidth,
            backgroundColor: imgBackground,
            objectFit: objectFitOverride,
            borderRadius: '16px',
          }}
        />
      )}
      <CardContent sx={cardContentStyle}>
        <Typography variant='h6'>{title}</Typography>
        <Typography variant='body1'>{description}</Typography>
      </CardContent>

      {isShowArrow && (
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
