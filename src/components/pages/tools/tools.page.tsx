import Grid from '@mui/material/Grid2';
import { ContactMe } from '../contact-me/contact-me.component';
import { ToolsContent } from './tools-content.component';

export const ToolsPage = () => {
  return (
    <Grid container spacing={12}>
      <Grid size={12}>
        <ToolsContent />
      </Grid>
      <Grid size={12}>
        <ContactMe />
      </Grid>
    </Grid>
  );
};
