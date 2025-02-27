import Grid from '@mui/material/Grid2';
import { TabLinkCard } from '../../../ui/tab-link-card/tab-link-card.component';
import { GridViewOutlined, LayersOutlined } from '@mui/icons-material';
import { customColors } from '../../../../themes/custom-colors';
import { toolsConfig } from '../../tools/tools-config';

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
      <Grid size={{ xs: 12, md: 6 }}>
        <TabLinkCard
          link={'/projects'}
          title={toolsConfig
            .slice(0, 4)
            .map((tool) => tool.title.toUpperCase())
            .join(',')}
          Icon={GridViewOutlined}
          color={customColors.tabLinkCard2}
        />
      </Grid>
    </Grid>
  );
};
