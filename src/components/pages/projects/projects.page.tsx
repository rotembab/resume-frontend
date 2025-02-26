import Grid from '@mui/material/Grid2';
import { ContactMe } from '../contact-me/contact-me.component';
import { ProjectsContent } from './projects-content.component';

export const ProjectsPage = () => {
  return (
    <Grid container spacing={24}>
      <Grid size={12}>
        <ProjectsContent />
      </Grid>
      <Grid size={12}>
        <ContactMe />
      </Grid>
    </Grid>
  );
};
