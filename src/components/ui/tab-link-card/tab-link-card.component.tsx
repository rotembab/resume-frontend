import {
  Card,
  Typography,
  CardContent,
  Box,
  Button,
  SvgIconTypeMap,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { useMediaQuery } from '@mui/material';
import { customSizesMediaQuery } from '../../../themes/custom-sizes-query';
import { ArrowRightAlt } from '@mui/icons-material';
import { useState } from 'react';
import { OverridableComponent } from '@mui/material/OverridableComponent';

type TabLinkCardProps = {
  link: string;
  title: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  };
  color: {
    main: string;
    contrastText: string;
  };
};

export const TabLinkCard = ({ link, title, Icon, color }: TabLinkCardProps) => {
  const navigate = useNavigate();
  const isBelowMd = useMediaQuery(customSizesMediaQuery.md);
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      sx={{
        borderRadius: '10px',
        width: isBelowMd ? '75%' : '100%',
        margin: isBelowMd ? 'auto' : '0',
        height: '100%',
        position: 'relative',
        backgroundColor: color.main,
        padding: '10px',
      }}
    >
      <CardContent sx={{ padding: '15px', backgroundColor: color.main }}>
        <Box sx={{ paddingY: '10px' }} display={'flex'} justifyContent={'left'}>
          <Icon sx={{ fontSize: '40px', color: color.contrastText }} />
        </Box>
        <Typography
          color={color.contrastText}
          sx={{
            paddingY: '20px',
          }}
          variant='h6'
        >
          {title}
        </Typography>
        <Button
          onClick={() => navigate(link)}
          sx={{
            position: 'absolute',
            right: '15px',
            bottom: '15px',
            minWidth: '32px',
            minHeight: '32px',
            padding: '1px',
            borderRadius: '10px',
            backgroundColor: hovered ? color.contrastText : 'transparent',
            borderColor: color.contrastText,
          }}
          variant={hovered ? 'contained' : 'outlined'}
          onMouseEnter={() => {
            setHovered(true);
          }}
          onMouseLeave={() => {
            setHovered(false);
          }}
        >
          <ArrowRightAlt
            sx={{
              color: hovered ? color.main : color.contrastText,
              fontSize: '24px',
            }}
          />
        </Button>
      </CardContent>
    </Card>
  );
};
