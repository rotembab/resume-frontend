import { Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import { SiteHeader } from '../../portfolio/site-header';
import { ScrollManager } from '../../portfolio/scroll-manager';
import { usePortfolio } from '../../portfolio/use-portfolio';
import { useResume } from '../../../data/use-resume';
import { useEffects } from '../../portfolio/effects-context';
export const Layout = () => {
  const { copy } = usePortfolio();
  const resume = useResume();
  const { motionAllowed } = useEffects();
  return (
    <>
      <a className='skip-link' href='#main-content'>
        {copy.skipToContent}
      </a>
      <SiteHeader />
      <ScrollManager />
      <main
        id='main-content'
        tabIndex={-1}
        data-motion={motionAllowed ? 'full' : 'reduced'}
      >
        <Suspense
          fallback={
            <div className='page-loading' role='status'>
              <span className='loading-mark' />
              Rotem Babani
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <footer className='site-footer'>
        <Link to='/' className='footer-name'>
          Rotem Babani<span aria-hidden='true'>.</span>
        </Link>
        <p>{copy.footerNote}</p>
        <nav className='footer-nav' aria-label={copy.menuPrimary}>
          <Link to='/experience'>{copy.experienceTitle}</Link>
          <Link to='/projects'>{copy.navWork}</Link>
          <Link to='/tools'>{copy.navTools}</Link>
          <Link to='/contact'>{copy.navContact}</Link>
        </nav>
        <div className='footer-socials'>
          {resume.profile.social.github && (
            <a
              href={resume.profile.social.github}
              target='_blank'
              rel='noreferrer'
            >
              GitHub
            </a>
          )}
          {resume.profile.social.linkedin && (
            <a
              href={resume.profile.social.linkedin}
              target='_blank'
              rel='noreferrer'
            >
              LinkedIn
            </a>
          )}
        </div>
        <span className='footer-year'>© {new Date().getFullYear()}</span>
      </footer>
    </>
  );
};
