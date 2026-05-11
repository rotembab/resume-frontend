import { Route, Routes } from 'react-router';
import { Layout } from './components/ui/layout/layout.component';
import { HomePage } from './components/pages/home/home.page';
import { ProjectsPage } from './components/pages/projects/projects.page';
import { ExperiencePage } from './components/pages/experience/experience.page';
import { ToolsPage } from './components/pages/tools/tools.page';
import { ContactMe } from './components/pages/contact-me/contact-me.component';

export const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path='/' element={<HomePage />} />
      <Route path='/projects' element={<ProjectsPage />} />
      <Route path='/experience' element={<ExperiencePage />} />
      <Route path='/tools' element={<ToolsPage />} />
      <Route path='/contact' element={<ContactMe />} />
    </Route>
  </Routes>
);
