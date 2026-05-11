import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './components/ui/layout/layout.component';

const HomePage = lazy(() =>
  import('./components/pages/home/home.page').then((m) => ({
    default: m.HomePage,
  }))
);
const ProjectsPage = lazy(() =>
  import('./components/pages/projects/projects.page').then((m) => ({
    default: m.ProjectsPage,
  }))
);
const ExperiencePage = lazy(() =>
  import('./components/pages/experience/experience.page').then((m) => ({
    default: m.ExperiencePage,
  }))
);
const ToolsPage = lazy(() =>
  import('./components/pages/tools/tools.page').then((m) => ({
    default: m.ToolsPage,
  }))
);
const ContactMe = lazy(() =>
  import('./components/pages/contact-me/contact-me.component').then((m) => ({
    default: m.ContactMe,
  }))
);

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
