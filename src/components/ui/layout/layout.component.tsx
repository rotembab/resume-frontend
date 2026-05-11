import { Container } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Outlet } from 'react-router';
import { NavMenu } from '../nav-menu/nav-menu.component';
import { DetailsCard } from '../details-card/details-card.component';

export const Layout = () => {
  return (
    <Container maxWidth='md'>
      <NavMenu />
      <Grid
        paddingTop={{
          xs: '100px',
          sm: '120px',
          md: '160px',
        }}
        spacing={12}
        container
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailsCard />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Outlet />
        </Grid>
      </Grid>
    </Container>
  );
};
