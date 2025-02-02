import { BrowserRouter, Route, Routes } from 'react-router';
import { NavMenu } from './components/ui/nav-menu/nav-menu.component';
import { HomePage } from './components/pages/home/home.page';

import { ProjectsPage } from './components/pages/projects/projects.page';
import { ExperiencePage } from './components/pages/experience/experience.page';
import { ToolsPage } from './components/pages/tools/tools.page';

export default function App() {
  return (
    <BrowserRouter>
      <NavMenu />

      {/* <DetailsCard /> */}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/projects' element={<ProjectsPage />} />
        <Route path='/experience' element={<ExperiencePage />} />
        <Route path='/tools' element={<ToolsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
