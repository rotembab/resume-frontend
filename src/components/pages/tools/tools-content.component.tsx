import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { ViewItemCard } from '../../ui/view-item-card/view-item-card.component';
import { toolsConfig } from './tools-config';
import { ToolItemViewCard } from '../../ui/tool-item-view-card/tool-item-view-card.component';

type ToolsContentProps = {
  limit?: number;
};

export const ToolsContent = ({ limit }: ToolsContentProps) => {
  const { t } = useTranslation();
  return (
    <SlideFadeTransition transitionKey={location.pathname}>
      <Grid container spacing={12}>
        <Grid size={12}>
          <Typography variant='h1'>{t('Tools.heading1')}</Typography>
          <Typography color='headingDarkColor' variant='h1'>
            {t('Tools.heading2')}
          </Typography>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={2}>
            {toolsConfig.slice(0, limit).map((tool) => (
              <Grid size={6} key={tool.title}>
                <ToolItemViewCard
                  title={tool.title}
                  description={tool.description}
                  link={tool.link ?? ''}
                  thumbnail={tool.thumbnail}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
