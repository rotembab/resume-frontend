import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { SlideFadeTransition } from '../../ui/slide-fade-transition/slide-fade-transition-component';
import { ToolItemViewCard } from '../../ui/tool-item-view-card/tool-item-view-card.component';
import { useResume } from '../../../data/use-resume';
import { getSkillIcon } from './skill-icons';

type ToolsContentProps = {
  limit?: number;
};

export const ToolsContent = ({ limit }: ToolsContentProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const resume = useResume();
  const skills = resume.skills.slice(0, limit);
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
            {skills.map((skill) => (
              <Grid size={6} key={skill.id}>
                <ToolItemViewCard
                  title={skill.name}
                  description={skill.summary ?? ''}
                  link={skill.link ?? ''}
                  thumbnail={getSkillIcon(skill.iconKey) ?? ''}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </SlideFadeTransition>
  );
};
