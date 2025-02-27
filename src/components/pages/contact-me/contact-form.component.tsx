import { Box, Button, Select, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';

export const ContactForm = () => {
  return (
    <Box component={'form'}>
      <Grid spacing={4} container>
        <Grid size={6}>
          <TextField
            sx={{
              width: '100%',
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField sx={{ width: '100%' }} />
        </Grid>
        <Grid size={12}>
          <Select sx={{ width: '100%' }} />
        </Grid>
        <Grid size={12}>
          <TextField rows={4} multiline sx={{ width: '100%' }} />
        </Grid>
        <Grid size={12}>
          <Button
            sx={{
              width: '100%',
            }}
            variant='contained'
            color='primary'
          >
            submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
