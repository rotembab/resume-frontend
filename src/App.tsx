import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './components/ui/layout/layout.component';
import { EffectsProvider } from './components/portfolio/effects-provider';
import HomePage from './components/portfolio/home-page';
const Pages = lazy(() => import('./components/portfolio/portfolio-pages'));
export const App = () => (
  <EffectsProvider>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path='/projects' element={<Pages page='projects' />} />
        <Route path='/projects/:slug' element={<Pages page='project' />} />
        <Route path='/experience' element={<Pages page='experience' />} />
        <Route path='/tools' element={<Pages page='tools' />} />
        <Route path='/lab' element={<Pages page='lab' />} />
        <Route path='/contact' element={<Pages page='contact' />} />
        <Route path='*' element={<Pages page='not-found' />} />
      </Route>
    </Routes>
  </EffectsProvider>
);
