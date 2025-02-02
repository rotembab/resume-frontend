import { BrowserRouter, Route, Routes } from 'react-router';
import { NavMenu } from './components/ui/nav-menu/nav-menu.component';
import { HomePage } from './components/pages/home/home.page';

import { ProjectsPage } from './components/pages/projects/projects.page';
import { ExperiencePage } from './components/pages/experience/experience.page';
import { ToolsPage } from './components/pages/tools/tools.page';
import { DetailsCard } from './components/ui/details-card/details-card.component';
import Grid from '@mui/material/Grid2';
import { Container } from '@mui/material';

export default function App() {
  return (
    <Container
      sx={{
        height: '100%',
      }}
    >
      <BrowserRouter>
        <NavMenu />

        <Grid container>
          <Grid size={4}>
            <DetailsCard />
          </Grid>
          <Grid size={8}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/projects' element={<ProjectsPage />} />
              <Route path='/experience' element={<ExperiencePage />} />
              <Route path='/tools' element={<ToolsPage />} />
            </Routes>
          </Grid>
        </Grid>
      </BrowserRouter>
    </Container>
  );
}
