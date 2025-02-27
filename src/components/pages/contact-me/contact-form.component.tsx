import { Box, Button, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';

export const ContactForm = () => {
  const { t } = useTranslation();
  return (
    <Box component={'form'}>
      <Grid spacing={4} container>
        <Grid size={6}>
          <TextField
            type='text'
            size='small'
            required
            label={t('Contact.Form.name')}
            sx={{
              borderRadius: '10px',
              width: '100%',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '10px',
              },
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            size='small'
            type='email'
            required
            label={t('Contact.Form.email')}
            sx={{
              borderRadius: '10px',
              width: '100%',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '10px',
              },
            }}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            required
            label={t('Contact.Form.message')}
            rows={4}
            multiline
            sx={{
              borderRadius: '10px',
              width: '100%',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '10px',
              },
            }}
          />
        </Grid>
        <Grid size={12}>
          <Button
            sx={{
              width: '100%',
            }}
            variant='contained'
            color='primary'
          >
            {t('Contact.Form.submit')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
