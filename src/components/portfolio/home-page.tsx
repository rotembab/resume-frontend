import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { getStudioCopy } from '../../data/studio-copy';
import { getHomeCopy } from '../../data/home-copy';
import { useResume } from '../../data/use-resume';
import { usePortfolio } from './use-portfolio';
import { useEffects } from './effects-context';
import { StudioHero } from './studio-hero';
import { ProjectCarousel } from './project-carousel';
import { CatalogStatus } from './project-catalog';
import { useProjectCatalog } from './use-project-catalog';
import { ContactSection } from './shared-sections';
import { ToolDeck } from './tool-deck';
import { useToolCards } from './use-tool-cards';
import { getToolDeckCopy } from '../../data/tool-deck-copy';

const HomePage = () => {
  const location = useLocation();
  const { copy, i18n } = usePortfolio();
  const catalog = useProjectCatalog();
  const tools = useToolCards();
  const studio = getStudioCopy(i18n.language);
  const home = getHomeCopy(i18n.language);
  const resume = useResume();
  const { motionAllowed } = useEffects();
  const studies = resume.experience.filter(
    (entry) => entry.id === 'ono-bsc' || entry.id === 'kernelios'
  );
  useEffect(() => {
    document.title = 'Rotem Babani — Full Stack Developer';
  }, []);
  if (location.hash === '#all-projects')
    return <Navigate to='/projects' replace />;
  return (
    <div className='portfolio-home' data-effects={motionAllowed ? 'on' : 'off'}>
      <StudioHero />
      <section
        id='experience'
        className='professional-proof page-container'
        aria-labelledby='production-title'
      >
        <h2 className='sr-only' id='production-title' tabIndex={-1}>
          {copy.professionalTitle}
        </h2>
        {(['voyager-labs', 'izer'] as const).map((jobId) => {
          const job = resume.experience.find((entry) => entry.id === jobId);
          if (!job) return null;
          return (
            <article key={jobId}>
              <div className='proof-heading'>
                <h3>{job.organization}</h3>
                <p>{job.period.durationLabel}</p>
              </div>
              <p>{studio.proof[jobId]}</p>
              <Link className='text-link' to={'/experience#' + jobId}>
                {studio.seeExperience}
              </Link>
            </article>
          );
        })}
      </section>
      <section
        id='work'
        className='featured-work page-container'
        aria-labelledby='featured-title'
      >
        <div className='section-heading'>
          <div>
            <h2 id='featured-title' tabIndex={-1}>
              {home.featuredTitle}
            </h2>
            <p>{home.featuredDescription}</p>
          </div>
          <Link className='text-link' to='/projects'>
            {home.allProjects}
          </Link>
        </div>
        <ProjectCarousel projects={catalog.projects} />
        {catalog.isError && <CatalogStatus catalog={catalog} />}
      </section>
      <section
        id='tools'
        className='home-tools page-container'
        aria-labelledby='tools-title'
      >
        <div className='section-heading'>
          <div>
            <h2 id='tools-title' tabIndex={-1}>
              {copy.skillsTitle}
            </h2>
            <p>{copy.skillsDescription}</p>
          </div>
          <Link className='text-link' to='/tools'>
            {getToolDeckCopy(i18n.language).fullPage}
          </Link>
        </div>
        <ToolDeck cards={tools} />
      </section>
      <section
        className='home-capabilities page-container'
        aria-labelledby='capabilities-title'
      >
        <div className='section-heading'>
          <h2 id='capabilities-title'>{home.capabilities}</h2>
        </div>
        <div className='home-capability-grid'>
          {(['interfaces', 'systems', 'delivery'] as const).map(
            (capability) => (
              <article key={capability}>
                <h3>{studio.capabilities[capability].title}</h3>
                <p>{studio.capabilities[capability].description}</p>
                <Link
                  className='text-link'
                  to={
                    capability === 'systems'
                      ? '/projects/esp32-claude-remote'
                      : '/experience'
                  }
                >
                  {capability === 'systems'
                    ? studio.seeSystems
                    : studio.seeExperience}
                </Link>
              </article>
            )
          )}
        </div>
      </section>
      <section
        id='about'
        className='home-about page-container'
        aria-labelledby='about-title'
      >
        <div className='home-about-copy'>
          <h2 id='about-title' tabIndex={-1}>
            {home.aboutTitle}
          </h2>
          <p>{copy.aboutDescription}</p>
          <Link className='text-link' to='/experience'>
            {home.experience}
          </Link>
        </div>
        <div className='home-education'>
          <h3>{home.education}</h3>
          {studies.map((entry) => (
            <article key={entry.id}>
              <h4>{entry.role}</h4>
              <p>{entry.organization}</p>
              <p>{entry.period.durationLabel}</p>
            </article>
          ))}
        </div>
      </section>
      <ContactSection />
    </div>
  );
};
export default HomePage;
