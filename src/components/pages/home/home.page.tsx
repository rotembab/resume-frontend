import { ContactMe } from '../contact-me/contact-me.component';
import { HomeContent } from './home-content.component';
import Grid from '@mui/material/Grid2';

export const HomePage = () => {
  return (
    <Grid container spacing={12}>
      <Grid size={12}>
        <HomeContent />
      </Grid>

      <Grid size={12}>
        <ContactMe />
      </Grid>
    </Grid>
  );
};
