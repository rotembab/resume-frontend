import {
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
import { customSizesMediaQuery } from '../../../themes/custom-sizes-query';
import { ViewCardItemProps } from '../../../interfaces/ui/view-card-item/view-card-item-props.interface';
import { BaseViewCard } from '../base-view-card/base-view-card.component';

export const ViewItemCard = ({
  title,
  description,
  thumbnail,
  link,
  footer,
  isExternal = false,
}: ViewCardItemProps) => {
  const navigate = useNavigate();
  const isBelowSm = useMediaQuery(customSizesMediaQuery.sm);
  return (
    <BaseViewCard
      title={title}
      description={description}
      thumbnail={thumbnail}
      onClick={() =>
        isExternal ? window.open(link, '_blank') : navigate(link)
      }
      height='min-content'
      width='100%'
      imgHeight={isBelowSm ? '90px' : '135px'}
      imgWidth={isBelowSm ? '90px' : '135px'}
      isShowArrow={!isBelowSm}
      footer={footer}
      objectFitOverride='contain'
      imgBackground={customColors.hoverColor.main}
    />
  );
};
