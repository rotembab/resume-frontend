import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { ViewItemCard } from '../../ui/view-item-card/view-item-card.component';
import { Stack } from '@mui/material';
import { toolsConfig } from './tools-config';

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
          <Stack>
            {toolsConfig.slice(0, limit).map((tool) => (
              <ViewItemCard
                key={tool.title}
                title={tool.title}
                description={tool.description}
                link={tool.link ?? ''}
                thumbnail={tool.thumbnail}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
