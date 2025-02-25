import Grid from '@mui/material/Grid2';
import { TabLinkCard } from '../../../ui/tab-link-card/tab-link-card.component';
import { GridViewOutlined, LayersOutlined } from '@mui/icons-material';
import { customColors } from '../../../../themes/custom-colors';
export const HomeTabLinks = () => {
  return (
    <Grid spacing={4} container size={12}>
      <Grid size={{ xs: 12, md: 5 }}>
        <TabLinkCard
          link={'/experience'}
          title={'DYNAMIC ANIMATION, MOTION DESIGN'}
          Icon={LayersOutlined}
          color={customColors.tabLinkCard1}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <TabLinkCard
          link={'/projects'}
          title={'FRAMER, FIGMA, WORDPRESS, REACTJS'}
          Icon={GridViewOutlined}
          color={customColors.tabLinkCard2}
        />
      </Grid>
    </Grid>
  );
};
