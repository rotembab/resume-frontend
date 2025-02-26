import Grid from '@mui/material/Grid2';
import { ContactMe } from '../contact-me/contact-me.component';
import { ExperienceContent } from './experience-content.component';
export const ExperiencePage = () => {
  return (
    <Grid container spacing={12}>
      <Grid size={12}>
        <ExperienceContent />
      </Grid>
      <Grid size={12}>
        <ContactMe />
      </Grid>
    </Grid>
  );
};
