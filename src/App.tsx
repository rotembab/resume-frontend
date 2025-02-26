import { Route, Routes } from 'react-router';
import { NavMenu } from './components/ui/nav-menu/nav-menu.component';
import { HomePage } from './components/pages/home/home.page';

import { ProjectsPage } from './components/pages/projects/projects.page';
import { ExperiencePage } from './components/pages/experience/experience.page';
import { ToolsPage } from './components/pages/tools/tools.page';
import { DetailsCard } from './components/ui/details-card/details-card.component';
import Grid from '@mui/material/Grid2';
import { Container, Box } from '@mui/material';
import { ContactMe } from './components/pages/contact-me/contact-me.component';
import { ChangeLanguageButton } from './components/ui/change-language-button/change-language-button.component';

export default function App() {
  return (
    <Container
      sx={{
        paddingTop: {
          xs: '100px',
          sm: '120px',
          md: '160px',
        },
      }}
      maxWidth='md'
    >
      <Grid spacing={12} container>
        <NavMenu />

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <DetailsCard />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/projects' element={<ProjectsPage />} />
            <Route path='/experience' element={<ExperiencePage />} />
            <Route path='/tools' element={<ToolsPage />} />
            <Route path='/contact' element={<ContactMe />} />
          </Routes>
        </Grid>
      </Grid>
    </Container>
  );
}
