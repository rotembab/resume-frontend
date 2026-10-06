import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { usePortfolio } from './use-portfolio';
import { ProjectCard } from './project-card';
import { ProjectMedia } from './project-media';
import { SubtitleWalkthrough } from './subtitle-walkthrough';
import { ContactSection, ExperienceList } from './shared-sections';
import { useResume } from '../../data/use-resume';
import { CV_PUBLIC_PATH } from '../../config/cv';
import { ToolDeck } from './tool-deck';
import { useToolCards } from './use-tool-cards';
import { ProjectCatalog, CatalogStatus } from './project-catalog';
import { useProjectCatalog } from './use-project-catalog';
import { RepositoryDetail } from './repository-detail';
import { getProjectCatalog } from '../../data/project-catalog';

type Page =
  | 'projects'
  | 'project'
  | 'experience'
  | 'tools'
  | 'lab'
  | 'contact'
  | 'not-found';

const ProjectsPage = () => (
  <div
    className='page-container interior-page projects-page'
    data-studio-page='work'
  >
    <ProjectCatalog headingLevel='h1' />
  </div>
);

const ProjectPage = () => {
  const { slug } = useParams();
  const { copy, i18n } = usePortfolio();
  const catalog = useProjectCatalog();
  const savedProjects = useMemo(
    () => getProjectCatalog(i18n.language),
    [i18n.language]
  );
  const entry =
    catalog.projects.find((item) => item.slug === slug) ??
    savedProjects.find((item) => item.slug === slug);
  const project = entry?.curated;
  const waitingForRepository =
    catalog.isLoading || catalog.isFetching || catalog.isError;
  useEffect(() => {
    document.title =
      (entry
        ? entry.title
        : waitingForRepository
          ? copy.navWork
          : copy.notFoundTitle) + ' — Rotem Babani';
  }, [entry, copy.navWork, copy.notFoundTitle, waitingForRepository]);
  if (!entry) {
    if (waitingForRepository)
      return (
        <div className='page-container interior-page repository-pending'>
          <h1 tabIndex={-1}>
            {catalog.isError ? catalog.copy.error : catalog.copy.loading}
          </h1>
          <CatalogStatus catalog={catalog} />
          <Link className='text-link' to='/projects'>
            {copy.backToWork}
          </Link>
        </div>
      );
    return <NotFound />;
  }
  const navigationProjects = catalog.projects.length
    ? catalog.projects
    : savedProjects;
  const next =
    navigationProjects[
      (navigationProjects.findIndex((item) => item.slug === slug) + 1) %
        navigationProjects.length
    ];
  if (!project) return <RepositoryDetail project={entry} next={next} />;
  const currentState = {
    'hebrew-subtitle-studio': copy.projectCurrentSubtitle,
    'esp32-claude-remote': copy.projectCurrentEsp32,
    blaster: copy.projectCurrentBlaster,
    cinema: copy.projectCurrentCinema,
  }[
    project.slug as
      | 'hebrew-subtitle-studio'
      | 'esp32-claude-remote'
      | 'blaster'
      | 'cinema'
  ];
  return (
    <article
      className={'page-container detail-page project-' + project.slug}
      data-studio-page='case-study'
    >
      <div className='case-utility'>
        <Link className='text-link back-link' to='/projects'>
          <span aria-hidden='true'>←</span>
          {copy.backToWork}
        </Link>
        <span className='case-status'>
          {project.status === 'prototype'
            ? copy.prototype
            : copy.personalProject}
        </span>
      </div>
      <header className='detail-heading'>
        <h1 tabIndex={-1}>{project.title}</h1>
        <div className='case-deck'>
          <p>{project.summary}</p>
          <a
            className='button button-primary'
            href={project.github}
            target='_blank'
            rel='noreferrer'
          >
            {copy.viewSource}
            <span aria-hidden='true'>↗</span>
          </a>
        </div>
      </header>
      <figure className='detail-image'>
        <ProjectMedia key={project.slug} project={project} eager />
        <figcaption className='case-media-caption'>
          <span>{project.title}</span>
          <span>{project.technologies.slice(0, 2).join(' / ')}</span>
        </figcaption>
      </figure>
      <div className='case-study-grid'>
        <aside className='case-study-aside'>
          <p>{project.role}</p>
          <h2>{copy.projectTechnology}</h2>
          <ul className='technology-list'>
            {project.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </aside>
        <div className='case-study-body'>
          <section>
            <h2>{copy.projectProblem}</h2>
            <p>{project.problem}</p>
          </section>
          <section>
            <h2>{copy.projectContribution}</h2>
            <ul>
              {project.contributions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{copy.projectDecisions}</h2>
            <ul>
              {project.decisions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className='case-capabilities'>
            <h2>{copy.projectCapabilities}</h2>
            <p>{currentState}</p>
            {project.slug === 'hebrew-subtitle-studio' && (
              <div className='project-demonstration'>
                <SubtitleWalkthrough project={project} />
              </div>
            )}
          </section>
          <section className='case-limitations'>
            <h2>{copy.projectLimitations}</h2>
            <ul>
              {project.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <div className='case-contact'>
        <p>{copy.projectContact}</p>
        <div className='hero-actions'>
          <a
            className='button button-primary'
            href={project.github}
            target='_blank'
            rel='noreferrer'
          >
            {copy.viewSource}
            <span aria-hidden='true'>↗</span>
          </a>
          <Link className='button button-secondary' to='/contact'>
            {copy.navContact}
          </Link>
        </div>
      </div>
      <Link className='next-project' to={'/projects/' + next.slug}>
        <span>{copy.nextProject}</span>
        <strong>{next.title}</strong>
        <span aria-hidden='true'>↗</span>
      </Link>
    </article>
  );
};

const ExperiencePage = () => {
  const { copy } = usePortfolio();
  const resume = useResume();
  return (
    <div
      className='page-container interior-page experience-page'
      data-studio-page='experience'
    >
      <header className='page-heading'>
        <h1 tabIndex={-1}>{copy.experienceTitle}</h1>
        <p>{resume.profile.description}</p>
        <a className='button button-secondary' href={CV_PUBLIC_PATH} download>
          {copy.downloadCv}
        </a>
      </header>
      <ExperienceList headingLevel='h2' />
      <section className='education-section' aria-labelledby='education-title'>
        <h2 id='education-title'>{copy.educationTitle}</h2>
        <ExperienceList education />
      </section>
      <Link className='text-link' to='/contact'>
        {copy.navContact}
        <span aria-hidden='true'>↗</span>
      </Link>
    </div>
  );
};

const ToolsPage = () => {
  const { copy } = usePortfolio();
  const cards = useToolCards();
  return (
    <div
      className='page-container interior-page tools-page'
      data-studio-page='tools'
    >
      <header className='page-heading'>
        <h1 tabIndex={-1}>{copy.skillsTitle}</h1>
        <p>{copy.skillsDescription}</p>
      </header>
      <ToolDeck cards={cards} />
    </div>
  );
};

const LabPage = () => {
  const { copy, projects } = usePortfolio();
  const [videoFailed, setVideoFailed] = useState(false);
  const blaster = projects.find((project) => project.slug === 'blaster');
  const esp32 = projects.find(
    (project) => project.slug === 'esp32-claude-remote'
  );
  return (
    <div
      className='page-container interior-page lab-page'
      data-studio-page='lab'
    >
      <header className='page-heading'>
        <h1 tabIndex={-1}>{copy.labTitle}</h1>
        <p>{copy.labDescription}</p>
      </header>
      <section className='lab-video-section' aria-labelledby='lab-video-title'>
        <div className='lab-video-heading'>
          <h2 id='lab-video-title'>{copy.labVideoTitle}</h2>
          <span className='project-status'>{copy.prototype}</span>
        </div>
        <p>{copy.labVideoDescription}</p>
        <div className='lab-video-stage'>
          {videoFailed ? (
            <div
              className='project-image-placeholder video-unavailable'
              role='status'
            >
              <p>{copy.labVideoUnavailable}</p>
              {blaster && (
                <a
                  className='text-link'
                  href={blaster.github}
                  target='_blank'
                  rel='noreferrer'
                >
                  {copy.viewSource}
                  <span aria-hidden='true'>↗</span>
                </a>
              )}
            </div>
          ) : (
            <video
              className='lab-video'
              aria-label={copy.labVideoTitle}
              aria-describedby='lab-video-caption'
              controls
              playsInline
              preload='none'
              poster='/images/projects/blaster.webp'
              src='/videos/blaster-preview.mp4'
              width='1616'
              height='744'
              onError={() => setVideoFailed(true)}
            >
              {copy.labVideoUnavailable}
            </video>
          )}
        </div>
        <p className='lab-video-alternative'>{copy.labVideoAlternative}</p>
        <p id='lab-video-caption' className='lab-video-caption'>
          {copy.prototype}
          {blaster && (
            <Link className='text-link' to={'/projects/' + blaster.slug}>
              {copy.viewProject}
              <span aria-hidden='true'>↗</span>
            </Link>
          )}
        </p>
      </section>
      <div className='lab-work'>
        {blaster && <ProjectCard project={blaster} headingLevel='h2' />}
        {esp32 && <ProjectCard project={esp32} headingLevel='h2' />}
      </div>
    </div>
  );
};

const NotFound = () => {
  const { copy } = usePortfolio();
  return (
    <div
      className='page-container interior-page not-found'
      data-studio-page='not-found'
    >
      <span className='not-found-number' aria-hidden='true'>
        404
      </span>
      <h1 tabIndex={-1}>{copy.notFoundTitle}</h1>
      <p>{copy.notFoundDescription}</p>
      <div className='hero-actions'>
        <Link className='button button-primary' to='/'>
          {copy.backHome}
        </Link>
        <Link className='button button-secondary' to='/projects'>
          {copy.navWork}
        </Link>
      </div>
    </div>
  );
};

const PortfolioPages = ({ page }: { page: Page }) => {
  const { copy } = usePortfolio();
  useEffect(() => {
    if (page !== 'project')
      document.title =
        'Rotem Babani — ' +
        {
          projects: copy.navWork,
          experience: copy.experienceTitle,
          tools: copy.skillsTitle,
          lab: copy.navLab,
          contact: copy.navContact,
          'not-found': copy.notFoundTitle,
        }[page];
  }, [copy, page]);
  switch (page) {
    case 'projects':
      return <ProjectsPage />;
    case 'project':
      return <ProjectPage />;
    case 'experience':
      return <ExperiencePage />;
    case 'tools':
      return <ToolsPage />;
    case 'lab':
      return <LabPage />;
    case 'contact':
      return <ContactSection standalone />;
    default:
      return <NotFound />;
  }
};
export default PortfolioPages;
