import Grid from '@mui/material/Grid2';
import { TabLinkCard } from '../../../ui/tab-link-card/tab-link-card.component';
import { useTranslation } from 'react-i18next';
import { LayersOutlined } from '@mui/icons-material';
export const HomeTabLinks = () => {
  const { t } = useTranslation();
  return (
    <Grid spacing={4} container size={12}>
      <Grid size={{ xs: 12, md: 5 }}>
        <TabLinkCard
          link={'/'}
          title={'DYNAMIC ANIMATION, MOTION DESIGN'}
          icon={<LayersOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <TabLinkCard
          link={'/'}
          title={t('Home.tabLinkCard.title')}
          icon={
            //put layout like a grid icon here
            <></>
          }
        />
      </Grid>
    </Grid>
  );
};
