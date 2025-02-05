import { Box } from '@mui/material';
import { ContactMe } from '../../ui/contact-me/contact-me.component';
import { HomeContent } from './home-content.component';

export const HomePage = () => {
  return (
    <>
      <HomeContent />
      <Box
        sx={{
          height: '100vh',
          width: '100%',
        }}
      />
      <ContactMe />
    </>
  );
};
