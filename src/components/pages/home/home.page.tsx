import { ContactMe } from '../contact-me/contact-me.component';
import { ProjectsContent } from '../projects/projects-content.component';
import { HomeContent } from './home-content.component';
import Grid from '@mui/material/Grid2';
import { ExperienceContent } from '../experience/experience-content.component';
export const HomePage = () => {
  return (
    <Grid container spacing={12}>
      <Grid size={12}>
        <HomeContent />
      </Grid>
      <Grid size={12}>
        <ProjectsContent limit={3} />
      </Grid>
      <Grid size={12}>
        <ExperienceContent limit={3} />
      </Grid>
      <Grid size={12}>
        <ContactMe />
      </Grid>
    </Grid>
  );
};
