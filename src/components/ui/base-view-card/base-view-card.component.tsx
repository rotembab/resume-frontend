import { CallMadeOutlined } from '@mui/icons-material';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  SxProps,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { customColors } from '../../../themes/custom-colors';

type BaseViewCardProps = {
  title: string;
  subtitle?: string;
  description: string;
  bullets?: string[];
  isInteractive?: boolean;
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
  subtitle,
  description,
  bullets,
  isInteractive = true,
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
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  useEffect(() => {
    setThumbnailFailed(false);
  }, [thumbnail]);

  const showThumbnail = Boolean(thumbnail) && !thumbnailFailed;
  return (
    <Card
      onClick={onClick}
      elevation={0}
      sx={{
        transition: 'background-color 0.7s',
        position: 'relative',
        cursor: isInteractive ? 'pointer' : 'default',
        backgroundColor:
          isInteractive && isHovered
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
      {showThumbnail && (
        <CardMedia
          component='img'
          image={thumbnail}
          alt={title}
          onError={() => setThumbnailFailed(true)}
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
        {subtitle && (
          <Typography
            variant='body2'
            color='descriptionColor'
            sx={{ marginBottom: '4px' }}
          >
            {subtitle}
          </Typography>
        )}
        <Typography variant='body1'>{description}</Typography>
        {bullets && bullets.length > 0 && (
          <Box
            component='ul'
            sx={{ margin: '8px 0 0', paddingInlineStart: '20px' }}
          >
            {bullets.map((bullet) => (
              <Typography
                key={bullet}
                component='li'
                variant='body2'
                color='paragraphColor'
                sx={{ marginBottom: '4px' }}
              >
                {bullet}
              </Typography>
            ))}
          </Box>
        )}
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
